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
