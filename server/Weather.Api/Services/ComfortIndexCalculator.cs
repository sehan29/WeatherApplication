using Weather.Api.Models;

namespace Weather.Api.Services;

public interface IComfortIndexCalculator
{
    ComfortResult Calculate(ComfortInputs input);
}

public sealed class ComfortIndexCalculator : IComfortIndexCalculator
{
    public ComfortResult Calculate(ComfortInputs input)
    {
        var apparentTemperature = CalculateApparentTemperature(input);

        var temperatureScore = ScoreInsideBand(apparentTemperature, 18, 24, 5);
        var humidityScore = ScoreInsideBand(input.HumidityPercent, 40, 60, 2.5);
        var windScore = ScoreWind(input.WindSpeedMps);
        var cloudScore = ScoreInsideBand(input.CloudinessPercent, 20, 60, 1.5);
        var severeWeatherPenalty = GetSevereWeatherPenalty(input.WeatherConditionId);

        var weightedScore =
            temperatureScore * 0.50 +
            humidityScore * 0.25 +
            windScore * 0.15 +
            cloudScore * 0.10 -
            severeWeatherPenalty;

        var score = Math.Round(Math.Clamp(weightedScore, 0, 100), 1);

        return new ComfortResult(
            score,
            GetLabel(score),
            Math.Round(apparentTemperature, 1),
            new ComfortBreakdown(
                Math.Round(temperatureScore, 1),
                Math.Round(humidityScore, 1),
                Math.Round(windScore, 1),
                Math.Round(cloudScore, 1),
                severeWeatherPenalty));
    }

    private static double CalculateApparentTemperature(ComfortInputs input)
    {
        if (input.TemperatureC >= 27 && input.HumidityPercent >= 40)
        {
            var fahrenheit = input.TemperatureC * 9 / 5 + 32;
            var humidity = input.HumidityPercent;
            var heatIndexF =
                -42.379 +
                2.04901523 * fahrenheit +
                10.14333127 * humidity -
                0.22475541 * fahrenheit * humidity -
                0.00683783 * fahrenheit * fahrenheit -
                0.05481717 * humidity * humidity +
                0.00122874 * fahrenheit * fahrenheit * humidity +
                0.00085282 * fahrenheit * humidity * humidity -
                0.00000199 * fahrenheit * fahrenheit * humidity * humidity;

            return (heatIndexF - 32) * 5 / 9;
        }

        var windKph = input.WindSpeedMps * 3.6;
        if (input.TemperatureC <= 10 && windKph > 4.8)
        {
            var windFactor = Math.Pow(windKph, 0.16);
            return 13.12 + 0.6215 * input.TemperatureC -
                   11.37 * windFactor + 0.3965 * input.TemperatureC * windFactor;
        }

        return input.TemperatureC;
    }

    private static double ScoreInsideBand(double value, double minimum, double maximum, double lossPerUnit)
    {
        if (value >= minimum && value <= maximum)
        {
            return 100;
        }

        var distance = value < minimum ? minimum - value : value - maximum;
        return Math.Clamp(100 - distance * lossPerUnit, 0, 100);
    }

    private static double ScoreWind(double windSpeedMps)
    {
        if (windSpeedMps is >= 0.5 and <= 5)
        {
            return 100;
        }

        if (windSpeedMps < 0.5)
        {
            return 90;
        }

        return Math.Clamp(100 - (windSpeedMps - 5) * 12, 0, 100);
    }

    private static double GetSevereWeatherPenalty(int conditionId) => conditionId switch
    {
        >= 200 and < 300 => 20, 
        >= 500 and < 600 => 8,  
        >= 600 and < 700 => 10, 
        >= 700 and < 800 => 6,  
        _ => 0
    };

    private static string GetLabel(double score) => score switch
    {
        >= 85 => "Excellent",
        >= 70 => "Comfortable",
        >= 50 => "Fair",
        >= 30 => "Uncomfortable",
        _ => "Severe"
    };
}
