using System.ComponentModel.DataAnnotations;


namespace Weather.Api.Options
{
    public sealed class Auth0Options
    {
        public const string SectionName = "Auth0";

        [Required]
        public string Domain { get; init; } = string.Empty;

        [Required]
        public string Audience { get; init; } = string.Empty;
    }

    public sealed class OpenWeatherApiOptions
    {
        public const string SectionName = "OpenWeatherApi";

        [Required]
        public string BaseUrl { get; init; } = "https://api.openweathermap.org/data/2.5/";

        [Required]
        public string ApiKey { get; init; } = string.Empty;

        [Range(1, 60)]
        public int RawCacheMinutes { get; init; } = 5;

        [Range(1, 60)]
        public int ProcessedCacheMinutes { get; init; } = 4;
    }
}