using Microsoft.AspNetCore.Mvc;
using PuffinRecon.API.Models;
using PuffinRecon.API.Services;

namespace PuffinRecon.API.Controllers;

[ApiController]
[Route("api/insert")]
public class InsertRecordsController : ControllerBase
{
    private readonly IInsertRecordsService _service;
    private readonly ILogger<InsertRecordsController> _logger;

    public InsertRecordsController(IInsertRecordsService service, ILogger<InsertRecordsController> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// Inserts test records into d_CX_Customer_detail for one or more journeys.
    /// POST /api/insert/records
    /// </summary>
    [HttpPost("records")]
    public async Task<IActionResult> InsertRecords([FromBody] InsertRecordsRequest request)
    {
        if (request == null)
            return BadRequest(new { message = "Request body is required." });

        if (request.Journeys == null || request.Journeys.Count == 0)
            return BadRequest(new { message = "At least one journey must be specified." });

        if (string.IsNullOrWhiteSpace(request.MobileNumber))
            return BadRequest(new { message = "MobileNumber is required." });

        if (request.PreferredLanguage != 1 && request.PreferredLanguage != 2)
            return BadRequest(new { message = "PreferredLanguage must be 1 (Arabic) or 2 (English)." });

        try
        {
            var result = await _service.InsertRecordsAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to insert records for mobile {Mobile}", request.MobileNumber);
            return StatusCode(500, new { message = "An error occurred while inserting records." });
        }
    }
}
