using System.Text.Json.Serialization;

namespace Weather.Api.Models;

public sealed class OpenWeatherResponse
{
    [JsonPropertyName("weather")]
    public List<WeatherCondition> Weather { get; init; } = [];

    [JsonPropertyName("main")]
    public required MainWeather Main { get; init; }

    [JsonPropertyName("visibility")]
    public int Visibility { get; init; }

    [JsonPropertyName("wind")]
    public required Wind Wind { get; init; }

    [JsonPropertyName("clouds")]
    public required Clouds Clouds { get; init; }

    [JsonPropertyName("dt")]
    public long ObservedAtUnix { get; init; }

    [JsonPropertyName("sys")]
    public required SystemDetails System { get; init; }

    [JsonPropertyName("id")]
    public long CityId { get; init; }

    [JsonPropertyName("name")]
    public string Name { get; init; } = string.Empty;
}

public sealed record WeatherCondition(
    [property: JsonPropertyName("id")] int Id,
    [property: JsonPropertyName("main")] string Main,
    [property: JsonPropertyName("description")] string Description,
    [property: JsonPropertyName("icon")] string Icon);

public sealed record MainWeather(
    [property: JsonPropertyName("temp")] double Temperature,
    [property: JsonPropertyName("pressure")] int Pressure,
    [property: JsonPropertyName("humidity")] int Humidity);

public sealed record Wind(
    [property: JsonPropertyName("speed")] double Speed);

public sealed record Clouds(
    [property: JsonPropertyName("all")] int All);

public sealed record SystemDetails(
    [property: JsonPropertyName("country")] string Country);

