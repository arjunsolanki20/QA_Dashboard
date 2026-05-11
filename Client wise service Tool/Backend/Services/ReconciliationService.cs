using Dapper;
using ClosedXML.Excel;
using PuffinRecon.API.Infrastructure;
using PuffinRecon.API.Models;

namespace PuffinRecon.API.Services;

public interface IReconciliationService
{
    Task<DetailResult>   GetDetailAsync(ReconciliationFilter filter);
    Task<DashboardData>  GetDashboardAsync(DateTime? dateFrom, DateTime? dateTo);
    Task<byte[]>         ExportToExcelAsync(ReconciliationFilter filter);
}

public class ReconciliationService : IReconciliationService
{
    private readonly IDbConnectionFactory _db;
    private readonly ILogger<ReconciliationService> _logger;

    public ReconciliationService(IDbConnectionFactory db, ILogger<ReconciliationService> logger)
    {
        _db = db;
        _logger = logger;
    }

    // ── Detail records ────────────────────────────────────────────────────────
    public async Task<DetailResult> GetDetailAsync(ReconciliationFilter filter)
    {
        _logger.LogInformation("GetDetailAsync: {@Filter}", filter);

        using var conn = _db.CreateConnection();

        var p = new DynamicParameters();
        p.Add("@MobileNumber", filter.MobileNumber);
        p.Add("@StatusFilter", filter.StatusFilter);
        p.Add("@DateFrom",     filter.DateFrom);
        p.Add("@DateTo",       filter.DateTo);

        var items = (await conn.QueryAsync<ReconciliationDetailRecord>(
            "sp_GetReconciliationDetail", p,
            commandType: System.Data.CommandType.StoredProcedure,
            commandTimeout: 120
        )).ToList();

        return new DetailResult { Items = items, TotalCount = items.Count };
    }

    // ── Dashboard (2 result sets) ─────────────────────────────────────────────
    public async Task<DashboardData> GetDashboardAsync(DateTime? dateFrom, DateTime? dateTo)
    {
        _logger.LogInformation("GetDashboardAsync: {DateFrom} → {DateTo}", dateFrom, dateTo);

        using var conn = _db.CreateConnection();

        var p = new DynamicParameters();
        p.Add("@DateFrom", dateFrom);
        p.Add("@DateTo",   dateTo);

        using var multi = await conn.QueryMultipleAsync(
            "sp_GetReconciliationDashboard", p,
            commandType: System.Data.CommandType.StoredProcedure,
            commandTimeout: 120
        );

        var summary          = await multi.ReadSingleOrDefaultAsync<DashboardSummary>() ?? new();
        var serviceBreakdown = (await multi.ReadAsync<ServiceBreakdownRow>()).ToList();

        return new DashboardData
        {
            Summary          = summary,
            ServiceBreakdown = serviceBreakdown,
        };
    }

    // ── Excel export ──────────────────────────────────────────────────────────
    public async Task<byte[]> ExportToExcelAsync(ReconciliationFilter filter)
    {
        _logger.LogInformation("ExportToExcelAsync: {@Filter}", filter);

        var result = await GetDetailAsync(filter);

        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Reconciliation");

        var headers = new[]
        {
            "Service ID", "Service Name", "Service Journey", "Source Journey",
            "Language", "Is Processed", "Mobile Number", "MSISDN",
            "Archived Message", "Insert Date", "Archive Updated",
            "Processing Time (s)", "Content Match %", "Final Status"
        };

        for (int col = 1; col <= headers.Length; col++)
        {
            var cell = ws.Cell(1, col);
            cell.Value = headers[col - 1];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#1e3a5f");
            cell.Style.Font.FontColor = XLColor.White;
        }

        int row = 2;
        foreach (var r in result.Items)
        {
            ws.Cell(row,  1).Value = r.ServiceId?.ToString() ?? "";
            ws.Cell(row,  2).Value = r.ServiceNameEnglish ?? "";
            ws.Cell(row,  3).Value = r.Service_JourneyName ?? "";
            ws.Cell(row,  4).Value = r.Source_Journey ?? "";
            ws.Cell(row,  5).Value = r.LanguageId == 2 ? "English" : "Arabic";
            ws.Cell(row,  6).Value = r.IsProcessed;
            ws.Cell(row,  7).Value = r.MobileNumber ?? "";
            ws.Cell(row,  8).Value = r.MSISDN ?? "";
            ws.Cell(row,  9).Value = r.Message ?? "";
            ws.Cell(row, 10).Value = r.InsertDate?.ToString("yyyy-MM-dd HH:mm:ss") ?? "";
            ws.Cell(row, 11).Value = r.UpdatedOn?.ToString("yyyy-MM-dd HH:mm:ss") ?? "";
            ws.Cell(row, 12).Value = r.Processing_Time_Seconds?.ToString() ?? "";
            ws.Cell(row, 13).Value = (double)r.Content_Match_Percentage;
            ws.Cell(row, 14).Value = r.Final_Status ?? "";

            ws.Cell(row, 14).Style.Fill.BackgroundColor = r.Final_Status switch
            {
                "SUCCESS"              => XLColor.FromHtml("#d1fae5"),
                "FAILED"               => XLColor.FromHtml("#fee2e2"),
                "NOT SENT"             => XLColor.FromHtml("#fef3c7"),
                "SERVICE MAPPED WRONG" => XLColor.FromHtml("#fde8d0"),
                "MESSAGE NOT MATCHED"  => XLColor.FromHtml("#ede9fe"),
                _                      => XLColor.White
            };

            row++;
        }

        ws.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }
}
