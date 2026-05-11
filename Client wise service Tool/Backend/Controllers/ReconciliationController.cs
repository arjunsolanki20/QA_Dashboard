using Microsoft.AspNetCore.Mvc;
using PuffinRecon.API.Models;
using PuffinRecon.API.Services;

namespace PuffinRecon.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReconciliationController : ControllerBase
{
    private readonly IReconciliationService _service;
    private readonly ILogger<ReconciliationController> _logger;

    public ReconciliationController(IReconciliationService service,
                                    ILogger<ReconciliationController> logger)
    {
        _service = service;
        _logger  = logger;
    }

    /// <summary>GET /api/reconciliation — full record list</summary>
    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] string? mobileNumber,
        [FromQuery] string? statusFilter,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo)
    {
        var filter = new ReconciliationFilter
        {
            MobileNumber = mobileNumber,
            StatusFilter = statusFilter,
            DateFrom     = dateFrom,
            DateTo       = dateTo,
        };

        var result = await _service.GetDetailAsync(filter);

        return Ok(new ApiResponse<DetailResult>
        {
            Success = true,
            Data    = result,
        });
    }

    /// <summary>GET /api/reconciliation/export — download Excel</summary>
    [HttpGet("export")]
    public async Task<IActionResult> Export(
        [FromQuery] string? mobileNumber,
        [FromQuery] string? statusFilter,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo)
    {
        var filter = new ReconciliationFilter
        {
            MobileNumber = mobileNumber,
            StatusFilter = statusFilter,
            DateFrom     = dateFrom,
            DateTo       = dateTo,
        };

        var bytes    = await _service.ExportToExcelAsync(filter);
        var filename = $"Reconciliation_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

        return File(bytes,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename);
    }
}
