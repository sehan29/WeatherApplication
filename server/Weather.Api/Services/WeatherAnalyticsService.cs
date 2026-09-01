using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Weather.Api.Models;
using Weather.Api.Options;

namespace Weather.Api.Services;

public interface IWeatherAnalyticsService
{
    Task<WeatherDashboardResponse> GetRankingsAsync(CancellationToken cancellationToken);
    CacheDebugResponse GetCacheStatus();
}

public sealed class WeatherAnalyticsService : IWeatherAnalyticsService
{
    private const string ProcessedCacheKey = "processed-weather-rankings";

    private readonly ICityCatalog _cityCatalog;
    private readonly IOpenWeatherClient _weatherClient;
    private readonly IComfortIndexCalculator _comfortCalculator;
    private readonly IWeatherCacheMonitor _cacheMonitor;
    private readonly IMemoryCache _cache;
    private readonly OpenWeatherApiOptions _options;
    private readonly SemaphoreSlim _refreshLock = new(1, 1);

    public WeatherAnalyticsService(
        ICityCatalog cityCatalog,
        IOpenWeatherClient weatherClient,
        IComfortIndexCalculator comfortCalculator,
        IWeatherCacheMonitor cacheMonitor,
        IMemoryCache cache,
        IOptions<OpenWeatherApiOptions> options)
    {
        _cityCatalog = cityCatalog;
        _weatherClient = weatherClient;
        _comfortCalculator = comfortCalculator;
        _cacheMonitor = cacheMonitor;
        _cache = cache;
        _options = options.Value;
    }

    public async Task<WeatherDashboardResponse> GetRankingsAsync(CancellationToken cancellationToken)
    {
        if (_cache.TryGetValue<WeatherDashboardResponse>(ProcessedCacheKey, out var cached) && cached is not null)
        {
            return cached with { CacheStatus = "HIT" };
        }

        await _refreshLock.WaitAsync(cancellationToken);

        try
        {
            if (_cache.TryGetValue<WeatherDashboardResponse>(ProcessedCacheKey, out cached) && cached is not null)
            {
                return cached with { CacheStatus = "HIT" };
            }

            var results = await Task.WhenAll(
                _cityCatalog.GetCities().Select(city => FetchCityAsync(city, cancellationToken)));

            var successful = results
                .Where(result => result.Ranking is not null)
                .Select(result => result.Ranking!)
                .OrderByDescending(city => city.ComfortScore)
                .ThenBy(city => city.CityName)
                .Select((city, index) => city with { Rank = index + 1 })
                .ToArray();

            if (successful.Length == 0)
            {
                throw new InvalidOperationException("Weather data could not be loaded for any configured city.");
            }

            var errors = results
                .Where(result => result.Error is not null)
                .Select(result => result.Error!)
                .ToArray();

            var response = new WeatherDashboardResponse(
                DateTimeOffset.UtcNow,
                "MISS",
                successful,
                errors);

            _cache.Set(
                ProcessedCacheKey,
                response,
                TimeSpan.FromMinutes(_options.ProcessedCacheMinutes));

            return response;
        }
        finally
        {
            _refreshLock.Release();
        }
    }

    public CacheDebugResponse GetCacheStatus() => new(
        _cache.TryGetValue(ProcessedCacheKey, out _),
        _cacheMonitor.GetStatuses());

    private async Task<CityResult> FetchCityAsync(CitySeed city, CancellationToken cancellationToken)
    {
        try
        {
            var weather = await _weatherClient.GetCurrentWeatherAsync(city, cancellationToken);
            var condition = weather.Weather.FirstOrDefault()
                ?? new WeatherCondition(800, "Unknown", "No description", "01d");

            var comfort = _comfortCalculator.Calculate(new ComfortInputs(
                weather.Main.Temperature,
                weather.Main.Humidity,
                weather.Wind.Speed,
                weather.Clouds.All,
                condition.Id));

            var ranking = new WeatherRanking(
                0,
                city.CityCode,
                string.IsNullOrWhiteSpace(weather.Name) ? city.CityName : weather.Name,
                weather.System.Country,
                condition.Description,
                condition.Main,
                condition.Icon,
                Math.Round(weather.Main.Temperature, 1),
                comfort.ApparentTemperatureC,
                weather.Main.Humidity,
                Math.Round(weather.Wind.Speed, 1),
                weather.Clouds.All,
                weather.Main.Pressure,
                weather.Visibility,
                comfort.Score,
                comfort.Label,
                DateTimeOffset.FromUnixTimeSeconds(weather.ObservedAtUnix));

            return new CityResult(ranking, null);
        }
        catch (Exception exception) when (exception is HttpRequestException or InvalidOperationException)
        {
            return new CityResult(
                null,
                new CityFetchError(city.CityCode, city.CityName, exception.Message));
        }
    }

    private sealed record CityResult(WeatherRanking? Ranking, CityFetchError? Error);
}
