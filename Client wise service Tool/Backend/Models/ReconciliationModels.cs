namespace PuffinRecon.API.Models;

// ─── Existing record/filter models (unchanged) ────────────────────────────────

public class ReconciliationFilter
{
    public string? MobileNumber { get; set; }
    public string? StatusFilter { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
}

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

// ─── Detail record (sp_GetReconciliationDetail) ───────────────────────────────

public class ReconciliationDetailRecord
{
    public int?     ServiceId               { get; set; }
    public string?  ServiceNameEnglish      { get; set; }
    public string?  Service_JourneyName     { get; set; }
    public string?  Source_Journey          { get; set; }
    public int      LanguageId              { get; set; }
    public int      IsProcessed             { get; set; }
    public string?  MobileNumber            { get; set; }
    public string?  MSISDN                  { get; set; }
    public string?  Message                 { get; set; }
    public string?  Archive_Status          { get; set; }
    public DateTime? InsertDate             { get; set; }
    public DateTime? UpdatedOn              { get; set; }
    public int?     Processing_Time_Seconds { get; set; }
    public int?     Archive_LanguageId      { get; set; }
    public string?  Template_EnglishMessage { get; set; }
    public string?  Template_ArabicMessage  { get; set; }
    public decimal  Content_Match_Percentage { get; set; }
    public string?  Final_Status            { get; set; }
}

public class DetailResult
{
    public IEnumerable<ReconciliationDetailRecord> Items { get; set; } = [];
    public int TotalCount { get; set; }
}

// ─── Dashboard models (sp_GetReconciliationDashboard) ─────────────────────────

/// <summary>RS1 — overall KPI summary row</summary>
public class DashboardSummary
{
    public int     Total               { get; set; }
    public int     Success             { get; set; }
    public int     Failed              { get; set; }
    public int     NotSent             { get; set; }
    public int     ServiceMappedWrong  { get; set; }
    public int     MessageNotMatched   { get; set; }
    public decimal Avg_Processing_Time { get; set; }
    public int?    Max_Processing_Time { get; set; }
    public decimal Success_Rate_Pct    { get; set; }
}

/// <summary>RS2 — one row per service</summary>
public class ServiceBreakdownRow
{
    public int?    ServiceId            { get; set; }
    public string  ServiceNameEnglish   { get; set; } = "";
    public int     Total                { get; set; }
    public int     Success              { get; set; }
    public int     Failed               { get; set; }
    public int     NotSent              { get; set; }
    public int     ServiceMappedWrong   { get; set; }
    public int     MessageNotMatched    { get; set; }
    public decimal Avg_Processing_Time  { get; set; }
    public int?    Max_Processing_Time  { get; set; }
    public decimal Success_Rate_Pct     { get; set; }
}

/// <summary>Root object returned by GET /api/dashboard</summary>
public class DashboardData
{
    public DashboardSummary              Summary          { get; set; } = new();
    public IEnumerable<ServiceBreakdownRow> ServiceBreakdown { get; set; } = [];
}
