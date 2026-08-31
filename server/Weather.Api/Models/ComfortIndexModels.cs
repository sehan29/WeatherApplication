namespace Weather.Api.Models;

public sealed record ComfortInputs(
    double TemperatureC,
    int HumidityPercent,
    double WindSpeedMps,
    int CloudinessPercent,
    int WeatherConditionId);


public sealed record ComfortResult(
    double Score,
    string Label,
    double ApparentTemperatureC,
    ComfortBreakdown Breakdown);

public sealed record ComfortBreakdown(
    double TemperatureScore,
    double HumidityScore,
    double WindScore,
    double CloudScore,
    double SevereWeatherPenalty);
