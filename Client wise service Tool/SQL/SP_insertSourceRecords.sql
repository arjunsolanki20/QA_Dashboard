-- =============================================
-- Author:      Puffin Reconciliation System
-- Description: Insert test/reconciliation records into d_CX_Customer_detail
--              for one or more journeys.
--
--   Parameters:
--     @MobileNumber      - The mobile number to use (sms_mobile + mobile columns)
--     @PreferredLanguage - 1 = Arabic, 2 = English
--     @JourneyList       - Comma-separated journey names.
--                          Pass NULL or empty string to insert ALL 51 journeys.
--
--   Returns: scalar INT = number of rows inserted
--
--   Usage examples:
--     EXEC sp_InsertSourceRecords
--          @MobileNumber      = '9655566835',
--          @PreferredLanguage = 1,
--          @JourneyList       = 'KFH go V4,IVR V3,Telesales V4';
--
--     -- Insert ALL journeys:
--     EXEC sp_InsertSourceRecords
--          @MobileNumber      = '9655566835',
--          @PreferredLanguage = 1,
--          @JourneyList       = NULL;
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[sp_InsertSourceRecords]
    @MobileNumber       NVARCHAR(50),
    @PreferredLanguage  INT          = 1,      -- 1 = Arabic, 2 = English
    @JourneyList        NVARCHAR(MAX) = NULL   -- NULL / '' = all journeys
AS
BEGIN
    SET NOCOUNT ON;

    -- ── 1. Build the full journey master list ─────────────────────────────────
    CREATE TABLE #AllJourneys (journey NVARCHAR(200));

    INSERT INTO #AllJourneys (journey) VALUES
        ('House'),('Branch2025_survey'),('Branch2024_survey'),
        ('Customer l and r 2'),('customer loyalty and retention'),
        ('Showrooms23'),('Branches23'),('Branch2022v1'),('Branch2022'),
        ('Ruwwad2022'),('Branches v2'),('branchesv1'),('Telesales V22'),
        ('telesale v6'),('telesale v5'),('retention v5'),('Showroom1'),
        ('instant issuance V4'),('KFH go V4'),('IVR V3'),('Telesales V4'),
        ('Ruwaad V4'),('Retention'),('Contact Center - did not log in'),
        ('Online Banking Full Browser'),('ATMs Onsite'),('ATMs Offsite'),
        ('Complaints'),('Prepaid cards (branches)'),
        ('New Car Finance - Car dealers'),('Direct sales'),
        ('Activation of card for account opened via mobile application'),
        ('Activation of debit card for account opened via direct sales'),
        ('Ijara'),('New Operational lease - Car dealers'),
        ('Contact Center Logged In'),('Mobile App'),('Branches'),
        ('Upgrade of existing customers'),('credit card usage'),
        ('Prepaid cards usage - nojoom'),('Prepaid cards usage - oasis'),
        ('Tawarruq Usage'),('Account Usage'),('End of Operational lease'),
        ('Car Finance Usage'),('Credit card (courier)'),
        ('Credit cards (branches)'),('Prepaid card (courier)'),
        ('New Operational lease - KFH Showrooms'),('Tawaruq');

    -- ── 2. Resolve selected journeys ──────────────────────────────────────────
    -- If @JourneyList is NULL or empty → use all journeys
    CREATE TABLE #SelectedJourneys (journey NVARCHAR(200));

    IF NULLIF(LTRIM(RTRIM(@JourneyList)), '') IS NULL
    BEGIN
        -- All journeys
        INSERT INTO #SelectedJourneys (journey)
        SELECT journey FROM #AllJourneys;
    END
    ELSE
    BEGIN
        -- Parse comma-separated list; filter against master list to prevent injection
        INSERT INTO #SelectedJourneys (journey)
        SELECT AJ.journey
        FROM #AllJourneys AJ
        INNER JOIN (
            SELECT LTRIM(RTRIM(value)) AS journey
            FROM STRING_SPLIT(@JourneyList, ',')
        ) Requested ON AJ.journey = Requested.journey;
    END;

    -- ── 3. Insert records ─────────────────────────────────────────────────────
    INSERT INTO d_CX_Customer_detail (
        Civil_ID, Customer_RIM, RIM_creation_date, Age, Gender, Nationality,
        Segment, Residence_area, mobile, open_date, sms_mobile,
        mobile_on_sms_system, journey, Product_type,
        Student_allowance_last_4_months, salary_last_4_months,
        Average_salary_in_past_3_months, Average_balance_in_past_3_months,
        account_type, Outstanding_finance_amount, finance_type,
        Has_active_credit_card, Has_active_prepaid_card,
        Subscribed_to_SMS_notification_service,
        Last_branch_visited_name, Last_ATM_used,
        Number_of_times_branch_visited_last_3_months,
        Number_of_times_ATM_used_last_3_months,
        Number_of_times_logged_to_Application_last_3months,
        Number_of_times_logged_to_full_browser_last_3months,
        Number_of_times_logged_to_call_center_last_3_months,
        Branch_name_visited, Time_and_date_visited, Waiting_time,
        staff_id_that_conducted_transation,
        staff_name_that_conducted_transation,
        Type_of_transaction_conducted, Time_of_login, Session_duration,
        Number_of_clicks, Agent_ID_and_name_who_handled_the_call,
        Time_of_ATM_usage, ATM_ID_location,
        Deisgnation_of_staff_who_served_the_customer,
        Preferred_Language, ModifiedDate, insert_Date, update_date,
        dw_active_ind, dayid, batchid, Intime, UpdateTime, IsProcessed
    )
    SELECT
        '300012100805',
        '316280',
        NULL,                                   -- RIM_creation_date
        64,                                     -- Age
        'F',                                    -- Gender
        'Kuwait',                               -- Nationality
        'Personal',                             -- Segment
        'Province:Ahmadi Region:North Ahmadi',  -- Residence_area
        @MobileNumber,                          -- mobile   ← from parameter
        '2025-11-11',                           -- open_date
        @MobileNumber,                          -- sms_mobile ← from parameter
        '123',                                  -- mobile_on_sms_system
        J.journey,                              -- journey  ← from loop
        'Conducted a transaction at the branch teller, CSO, or RM',
        NULL, NULL, NULL, NULL,                 -- allowance, salary, avg_salary, avg_balance
        NULL, NULL, NULL,                       -- account_type, outstanding, finance_type
        NULL, NULL, NULL,                       -- credit_card, prepaid_card, sms_subscription
        NULL, NULL,                             -- last_branch, last_ATM
        NULL, NULL, NULL, NULL, NULL,           -- visit/ATM/login counts
        'House',                                -- Branch_name_visited
        NULL, NULL,                             -- Time_and_date, Waiting_time
        '8002',                                 -- staff_id
        'Abrar Mohammad Almarri',               -- staff_name
        'Open card -Reward Prepaid Card',       -- Type_of_transaction
        NULL, NULL, NULL, NULL, NULL, NULL,     -- Time_of_login … ATM_ID_location
        'CSO',                                  -- Designation
        @PreferredLanguage,                     -- Preferred_Language ← from parameter
        NULL,                                   -- ModifiedDate
        GETDATE(),                              -- insert_Date
        NULL, NULL, NULL, NULL,                 -- update_date, dw_active_ind, dayid, batchid
        GETDATE(),                              -- Intime
        NULL,                                   -- UpdateTime
        0                                       -- IsProcessed
    FROM #SelectedJourneys J;

    -- ── 4. Return row count ───────────────────────────────────────────────────
    SELECT @@ROWCOUNT AS RowsInserted;

    -- ── 5. Cleanup ────────────────────────────────────────────────────────────
    DROP TABLE #AllJourneys;
    DROP TABLE #SelectedJourneys;

END;
GO
