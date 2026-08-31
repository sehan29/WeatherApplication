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