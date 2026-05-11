using Microsoft.AspNetCore.Mvc;
using PuffinRecon.API.Models;
using PuffinRecon.API.Services;

namespace PuffinRecon.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IReconciliationService _service;

    public DashboardController(IReconciliationService service) => _service = service;

    /// <summary>
    /// GET /api/dashboard?dateFrom=&dateTo=
    /// Returns RS1 (overall KPI summary) + RS2 (service-wise breakdown).
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo)
    {
        var data = await _service.GetDashboardAsync(dateFrom, dateTo);

        return Ok(new ApiResponse<DashboardData>
        {
            Success = true,
            Data    = data,
        });
    }
}
