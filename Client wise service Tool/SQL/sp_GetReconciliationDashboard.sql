-- =============================================
-- Author:      Puffin Reconciliation System
-- Updated:     2026
-- Description: Two stored procedures built directly from the
--              updated query logic provided by the team.
--
--   sp_GetReconciliationDetail   → record-level view with
--                                   Content_Match_Percentage
--                                   and 5-state Final_Status
--
--   sp_GetReconciliationDashboard → two result sets in one call:
--       RS1: Overall summary totals  (cards)
--       RS2: Service-wise breakdown  (table / bar chart)
-- =============================================

    --EXEC sp_GetReconciliationDashboard;
    --EXEC sp_GetReconciliationDetail;
-- ─────────────────────────────────────────────────────────────────────────────
-- 1.  DETAIL SP  (replaces sp_GetReconciliationReport)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR ALTER PROCEDURE [dbo].[sp_GetReconciliationDetail]
    @MobileNumber   NVARCHAR(50)  = NULL,
    @StatusFilter   NVARCHAR(50)  = NULL,   -- FAILED | NOT SENT | SERVICE MAPPED WRONG | MESSAGE NOT MATCHED | SUCCESS
    @DateFrom       DATETIME      = NULL,
    @DateTo         DATETIME      = NULL
AS
BEGIN
    SET NOCOUNT ON;

    WITH ServiceData AS (
        SELECT
            SSM.ServiceId,
            SSM.ServiceNameEnglish,
            DTDS.SourceName,
            DTDS.SelectQuery,
            CASE
                WHEN DTDS.SelectQuery LIKE '%journey = %''%''%' THEN
                    SUBSTRING(
                        DTDS.SelectQuery,
                        CHARINDEX('journey = ''', DTDS.SelectQuery) + LEN('journey = '''),
                        CHARINDEX('''', DTDS.SelectQuery,
                            CHARINDEX('journey = ''', DTDS.SelectQuery) + LEN('journey = '''))
                        - (CHARINDEX('journey = ''', DTDS.SelectQuery) + LEN('journey = '''))
                    )
            END AS Service_JourneyName
        FROM Service_ServiceMaster SSM
        LEFT JOIN Dictionary_TenantDatabaseSource DTDS
            ON SSM.HandlerId = DTDS.TenantDatabaseSourceId
    ),

    SourceData AS (
        SELECT
            *,
            CASE
                WHEN journey LIKE '%_[0-9]'
                THEN LEFT(journey, LEN(journey) - CHARINDEX('_', REVERSE(journey)))
                ELSE journey
            END AS Source_Journey,
            CASE
                WHEN Preferred_Language = 2 THEN 2
                ELSE 1
            END AS LanguageId
        FROM d_CX_Customer_detail
        WHERE
            (@MobileNumber IS NULL OR sms_mobile LIKE '%' + @MobileNumber + '%')
            AND (@DateFrom  IS NULL OR insert_Date >= @DateFrom)
            AND (@DateTo    IS NULL OR insert_Date <= @DateTo)
    ),

    TemplateData AS (
        SELECT
            SSDS.ServiceId,
            CAST(MTM.MasterTemplateXML AS XML)
                .value('(/xmlmessage/language[@lan="en"]/body)[1]', 'NVARCHAR(MAX)')
                AS Template_EnglishMessage,
            CAST(MTM.MasterTemplateXML AS XML)
                .value('(/xmlmessage/language[@lan="ar"]/body)[1]', 'NVARCHAR(MAX)')
                AS Template_ArabicMessage,
            ROW_NUMBER() OVER (PARTITION BY SSDS.ServiceId ORDER BY MTM.MessageTemplateMasterId) AS RN
        FROM Service_ServiceDetail_SMS SSDS
        INNER JOIN Dictionary_MessageTemplateMaster MTM
            ON SSDS.MessageTemplateMasterId = MTM.MessageTemplateMasterId
    ),

    -- Compute content-match % once so it is not repeated twice in SELECT
    Enriched AS (
        SELECT
            SD.ServiceId,
            SD.ServiceNameEnglish,
            SD.Service_JourneyName,
            SRC.Source_Journey,
            SRC.LanguageId,
            SRC.IsProcessed,
            SRC.sms_mobile,
            AR.MSISDN,
            AR.Message,
            AR.Status        AS Archive_Status,
            SRC.insert_Date AS InsertDate,
            AR.UpdatedOn,
            DATEDIFF(SECOND, SRC.insert_Date, AR.UpdatedOn) AS Processing_Time_Seconds,
            AR.LanguageId    AS Archive_LanguageId,
            TD.Template_EnglishMessage,
            TD.Template_ArabicMessage,

            -- Content match % (English path)
            CASE
                WHEN AR.Message IS NULL THEN 0
                WHEN AR.LanguageId = 2 THEN
                    ROUND((
                        CAST((
                            SELECT COUNT(DISTINCT t.value)
                            FROM STRING_SPLIT(REPLACE(TD.Template_EnglishMessage, '##LinkHere##', ''), ' ') t
                            WHERE t.value IN (
                                SELECT value FROM STRING_SPLIT(AR.Message, ' ')
                            )
                        ) AS FLOAT)
                        / NULLIF((
                            SELECT COUNT(DISTINCT value)
                            FROM STRING_SPLIT(REPLACE(TD.Template_EnglishMessage, '##LinkHere##', ''), ' ')
                        ), 0)
                    ) * 100, 2)
                WHEN AR.LanguageId = 1 THEN
                    ROUND((
                        CAST((
                            SELECT COUNT(DISTINCT t.value)
                            FROM STRING_SPLIT(REPLACE(TD.Template_ArabicMessage, '##LinkHere##', ''), ' ') t
                            WHERE t.value IN (
                                SELECT value FROM STRING_SPLIT(AR.Message, ' ')
                            )
                        ) AS FLOAT)
                        / NULLIF((
                            SELECT COUNT(DISTINCT value)
                            FROM STRING_SPLIT(REPLACE(TD.Template_ArabicMessage, '##LinkHere##', ''), ' ')
                        ), 0)
                    ) * 100, 2)
                ELSE 0
            END AS Content_Match_Percentage

        FROM SourceData SRC
        INNER JOIN ServiceData SD
            ON SRC.Source_Journey = SD.Service_JourneyName
        LEFT JOIN Archive_SMS AR
            ON SRC.sms_mobile = AR.MSISDN
            AND SRC.LanguageId = AR.LanguageId
            AND SD.ServiceId = AR.ChildSourceTypeId
        LEFT JOIN TemplateData TD
            ON SD.ServiceId = TD.ServiceId
            AND TD.RN = 1
    )

      SELECT
        ServiceId,
        ServiceNameEnglish,
        Service_JourneyName,
        Source_Journey,
        LanguageId,
        IsProcessed,
        sms_mobile              AS MobileNumber,
        MSISDN,
        Message,
        Archive_Status,
        InsertDate,              -- ✅ use the alias from Enriched CTE
        UpdatedOn,
        Processing_Time_Seconds,
        Archive_LanguageId,
        Template_EnglishMessage,
        Template_ArabicMessage,
        Content_Match_Percentage,

        CASE
            WHEN IsProcessed = 0                       THEN 'FAILED'
            WHEN MSISDN IS NULL                        THEN 'NOT SENT'
            WHEN Service_JourneyName <> Source_Journey THEN 'SERVICE MAPPED WRONG'
            WHEN Content_Match_Percentage < 90         THEN 'MESSAGE NOT MATCHED'
            ELSE                                            'SUCCESS'
        END AS Final_Status

    FROM Enriched
    WHERE
        @StatusFilter IS NULL
        OR (
            CASE
                WHEN IsProcessed = 0                       THEN 'FAILED'
                WHEN MSISDN IS NULL                        THEN 'NOT SENT'
                WHEN Service_JourneyName <> Source_Journey THEN 'SERVICE MAPPED WRONG'
                WHEN Content_Match_Percentage < 90         THEN 'MESSAGE NOT MATCHED'
                ELSE                                            'SUCCESS'
            END
        ) = @StatusFilter

    ORDER BY InsertDate DESC; 

END;
GO


-- ─────────────────────────────────────────────────────────────────────────────

--  DASHBOARD
CREATE OR ALTER PROCEDURE [dbo].[sp_GetReconciliationDashboard]
    @DateFrom  DATETIME = NULL,
    @DateTo    DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- ── Materialize FinalData into a temp table ──────────────────────────────
    ;WITH ServiceData AS (
        SELECT
            SSM.ServiceId,
            SSM.ServiceNameEnglish,
            DTDS.SelectQuery,
            CASE
                WHEN DTDS.SelectQuery LIKE '%journey = %''%''%' THEN
                    SUBSTRING(
                        DTDS.SelectQuery,
                        CHARINDEX('journey = ''', DTDS.SelectQuery) + LEN('journey = '''),
                        CHARINDEX('''', DTDS.SelectQuery,
                            CHARINDEX('journey = ''', DTDS.SelectQuery) + LEN('journey = '''))
                        - (CHARINDEX('journey = ''', DTDS.SelectQuery) + LEN('journey = '''))
                    )
            END AS Service_JourneyName
        FROM Service_ServiceMaster SSM
        LEFT JOIN Dictionary_TenantDatabaseSource DTDS
            ON SSM.HandlerId = DTDS.TenantDatabaseSourceId
    ),

    SourceData AS (
        SELECT
            *,
            CASE
                WHEN journey LIKE '%_[0-9]'
                THEN LEFT(journey, LEN(journey) - CHARINDEX('_', REVERSE(journey)))
                ELSE journey
            END AS Source_Journey,
            CASE
                WHEN Preferred_Language = 2 THEN 2
                ELSE 1
            END AS LanguageId
        FROM d_CX_Customer_detail
        WHERE
            (@DateFrom IS NULL OR insert_Date >= @DateFrom)
            AND (@DateTo   IS NULL OR insert_Date <= @DateTo)
    ),

    TemplateData AS (
        SELECT
            SSDS.ServiceId,
            CAST(MTM.MasterTemplateXML AS XML)
                .value('(/xmlmessage/language[@lan="en"]/body)[1]', 'NVARCHAR(MAX)')
                AS Template_EnglishMessage,
            CAST(MTM.MasterTemplateXML AS XML)
                .value('(/xmlmessage/language[@lan="ar"]/body)[1]', 'NVARCHAR(MAX)')
                AS Template_ArabicMessage,
            ROW_NUMBER() OVER (PARTITION BY SSDS.ServiceId ORDER BY MTM.MessageTemplateMasterId) AS RN
        FROM Service_ServiceDetail_SMS SSDS
        INNER JOIN Dictionary_MessageTemplateMaster MTM
            ON SSDS.MessageTemplateMasterId = MTM.MessageTemplateMasterId
    ),

    Enriched AS (
        SELECT
            SD.ServiceId,
            SD.ServiceNameEnglish,
            SD.Service_JourneyName,
            SRC.Source_Journey,
            SRC.IsProcessed,
            AR.MSISDN,
            SRC.insert_Date,
            AR.UpdatedOn,
            DATEDIFF(SECOND, SRC.insert_Date, AR.UpdatedOn) AS Processing_Time_Seconds,

            CASE
                WHEN AR.Message IS NULL THEN 0
                WHEN AR.LanguageId = 2 THEN
                    ROUND((
                        CAST((
                            SELECT COUNT(DISTINCT t.value)
                            FROM STRING_SPLIT(REPLACE(TD.Template_EnglishMessage, '##LinkHere##', ''), ' ') t
                            WHERE t.value IN (SELECT value FROM STRING_SPLIT(AR.Message, ' '))
                        ) AS FLOAT)
                        / NULLIF((
                            SELECT COUNT(DISTINCT value)
                            FROM STRING_SPLIT(REPLACE(TD.Template_EnglishMessage, '##LinkHere##', ''), ' ')
                        ), 0)
                    ) * 100, 2)
                WHEN AR.LanguageId = 1 THEN
                    ROUND((
                        CAST((
                            SELECT COUNT(DISTINCT t.value)
                            FROM STRING_SPLIT(REPLACE(TD.Template_ArabicMessage, '##LinkHere##', ''), ' ') t
                            WHERE t.value IN (SELECT value FROM STRING_SPLIT(AR.Message, ' '))
                        ) AS FLOAT)
                        / NULLIF((
                            SELECT COUNT(DISTINCT value)
                            FROM STRING_SPLIT(REPLACE(TD.Template_ArabicMessage, '##LinkHere##', ''), ' ')
                        ), 0)
                    ) * 100, 2)
                ELSE 0
            END AS Content_Match_Percentage

        FROM SourceData SRC
        INNER JOIN ServiceData SD ON SRC.Source_Journey = SD.Service_JourneyName
        LEFT JOIN Archive_SMS AR
            ON SRC.sms_mobile = AR.MSISDN
            AND SRC.LanguageId = AR.LanguageId
            AND SD.ServiceId = AR.ChildSourceTypeId
        LEFT JOIN TemplateData TD ON SD.ServiceId = TD.ServiceId AND TD.RN = 1
    )

    -- ── Materialize into temp table so both result sets can use it ────────────
    SELECT
        ServiceId,
        ServiceNameEnglish,
        Processing_Time_Seconds,
        CASE
            WHEN IsProcessed = 0                        THEN 'FAILED'
            WHEN MSISDN IS NULL                         THEN 'NOT SENT'
            WHEN Service_JourneyName <> Source_Journey  THEN 'SERVICE MAPPED WRONG'
            WHEN Content_Match_Percentage < 90          THEN 'MESSAGE NOT MATCHED'
            ELSE                                             'SUCCESS'
        END AS Final_Status
    INTO #FinalData                          -- ← temp table instead of CTE
    FROM Enriched;

    -- ── RS1: Overall summary (dashboard KPI cards) ────────────────────────────
    SELECT
        COUNT(*)                                                                AS Total,
        SUM(CASE WHEN Final_Status = 'SUCCESS'              THEN 1 ELSE 0 END) AS Success,
        SUM(CASE WHEN Final_Status = 'FAILED'               THEN 1 ELSE 0 END) AS Failed,
        SUM(CASE WHEN Final_Status = 'NOT SENT'             THEN 1 ELSE 0 END) AS NotSent,
        SUM(CASE WHEN Final_Status = 'SERVICE MAPPED WRONG' THEN 1 ELSE 0 END) AS ServiceMappedWrong,
        SUM(CASE WHEN Final_Status = 'MESSAGE NOT MATCHED'  THEN 1 ELSE 0 END) AS MessageNotMatched,
        CAST(AVG(CAST(ISNULL(Processing_Time_Seconds, 0) AS FLOAT)) AS DECIMAL(10,2)) AS Avg_Processing_Time,
        MAX(Processing_Time_Seconds)                                            AS Max_Processing_Time,
        CAST(
            100.0 * SUM(CASE WHEN Final_Status = 'SUCCESS' THEN 1 ELSE 0 END)
            / NULLIF(COUNT(*), 0)
        AS DECIMAL(5,2))                                                        AS Success_Rate_Pct
    FROM #FinalData;

    -- ── RS2: Service-wise breakdown ───────────────────────────────────────────
    SELECT
        ServiceId,
        ServiceNameEnglish,
        COUNT(*)                                                                AS Total,
        SUM(CASE WHEN Final_Status = 'SUCCESS'              THEN 1 ELSE 0 END) AS Success,
        SUM(CASE WHEN Final_Status = 'FAILED'               THEN 1 ELSE 0 END) AS Failed,
        SUM(CASE WHEN Final_Status = 'NOT SENT'             THEN 1 ELSE 0 END) AS NotSent,
        SUM(CASE WHEN Final_Status = 'SERVICE MAPPED WRONG' THEN 1 ELSE 0 END) AS ServiceMappedWrong,
        SUM(CASE WHEN Final_Status = 'MESSAGE NOT MATCHED'  THEN 1 ELSE 0 END) AS MessageNotMatched,
        CAST(AVG(CAST(ISNULL(Processing_Time_Seconds, 0) AS FLOAT)) AS DECIMAL(10,2)) AS Avg_Processing_Time,
        MAX(Processing_Time_Seconds)                                            AS Max_Processing_Time,
        CAST(
            100.0 * SUM(CASE WHEN Final_Status = 'SUCCESS' THEN 1 ELSE 0 END)
            / NULLIF(COUNT(*), 0)
        AS DECIMAL(5,2))                                                        AS Success_Rate_Pct
    FROM #FinalData
    GROUP BY ServiceId, ServiceNameEnglish
    ORDER BY Total DESC;

    DROP TABLE #FinalData;   -- clean up

END;
GO