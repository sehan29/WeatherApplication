using System.Text.Json.Serialization;

namespace Weather.Api.Models;

public sealed record CitySeed(
    [property: JsonPropertyName("CityCode")] string CityCode,
    [property: JsonPropertyName("CityName")] string CityName);

public sealed class CitySeedFile
{
    [JsonPropertyName("List")]
    public List<CitySeed> List { get; init; } = [];
}


public sealed record CacheEntryStatus(
    string CityCode,
    string CityName,
    string Status,
    DateTimeOffset LastCheckedUtc,
    DateTimeOffset? ExpiresAtUtc);

public sealed record CacheDebugResponse(
    bool ProcessedResponseCached,
    IReadOnlyList<CacheEntryStatus> RawWeatherEntries);

public sealed record WeatherRanking(
    int Rank,
    string CityCode,
    string CityName,
    string Country,
    string Description,
    string Condition,
    string Icon,
    double TemperatureC,
    double ApparentTemperatureC,
    int HumidityPercent,
    double WindSpeedMps,
    int CloudinessPercent,
    int PressureHpa,
    int VisibilityMeters,
    double ComfortScore,
    string ComfortLabel,
    DateTimeOffset ObservedAtUtc);

public sealed record CityFetchError(string CityCode, string CityName, string Message);

public sealed record WeatherDashboardResponse(
    DateTimeOffset GeneratedAtUtc,
    string CacheStatus,
    IReadOnlyList<WeatherRanking> Cities,
    IReadOnlyList<CityFetchError> Errors);