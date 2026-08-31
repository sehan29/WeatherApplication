using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Weather.Api.Services;

namespace Weather.Api.Controllers;

[ApiController]
[Route("api/weather")]
[Authorize]
public sealed class WeatherController : ControllerBase
{
    private readonly IWeatherAnalyticsService _weatherAnalytics;

    public WeatherController(IWeatherAnalyticsService weatherAnalytics)
    {
        _weatherAnalytics = weatherAnalytics;
    }

    [HttpGet("rankings")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status502BadGateway)]
    public async Task<IActionResult> GetRankings(CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _weatherAnalytics.GetRankingsAsync(cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Problem(
                title: "Weather data is unavailable",
                detail: exception.Message,
                statusCode: StatusCodes.Status502BadGateway);
        }
    }

    [HttpGet("cache")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult GetCacheStatus() => Ok(_weatherAnalytics.GetCacheStatus());
}
