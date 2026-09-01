using System.Collections.Concurrent;
using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Weather.Api.Models;
using Weather.Api.Options;

namespace Weather.Api.Services;

public interface IOpenWeatherClient
{
    Task<OpenWeatherResponse> GetCurrentWeatherAsync(CitySeed city, CancellationToken cancellationToken);
}

public sealed class OpenWeatherClient : IOpenWeatherClient
{
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;
    private readonly IWeatherCacheMonitor _cacheMonitor;
    private readonly OpenWeatherApiOptions _options;
    private readonly ConcurrentDictionary<string, SemaphoreSlim> _locks = new();

    public OpenWeatherClient(
        HttpClient httpClient,
        IMemoryCache cache,
        IWeatherCacheMonitor cacheMonitor,
        IOptions<OpenWeatherApiOptions> options)
    {
        _httpClient = httpClient;
        _cache = cache;
        _cacheMonitor = cacheMonitor;
        _options = options.Value;
    }

    public async Task<OpenWeatherResponse> GetCurrentWeatherAsync(
        CitySeed city,
        CancellationToken cancellationToken)
    {
        var cacheKey = $"raw-weather:{city.CityCode}";
        var now = DateTimeOffset.UtcNow;

        if (_cache.TryGetValue<CachedWeather>(cacheKey, out var cached) && cached is not null)
        {
            Record(city, "HIT", now, cached.ExpiresAtUtc);
            return cached.Response;
        }

        var cityLock = _locks.GetOrAdd(city.CityCode, _ => new SemaphoreSlim(1, 1));
        await cityLock.WaitAsync(cancellationToken);

        try
        {
            if (_cache.TryGetValue<CachedWeather>(cacheKey, out cached) && cached is not null)
            {
                Record(city, "HIT", DateTimeOffset.UtcNow, cached.ExpiresAtUtc);
                return cached.Response;
            }

            Record(city, "MISS", DateTimeOffset.UtcNow, null);

            var path = $"weather?id={Uri.EscapeDataString(city.CityCode)}&appid={Uri.EscapeDataString(_options.ApiKey)}&units=metric";
            using var response = await _httpClient.GetAsync(path, cancellationToken);

            if (response.StatusCode == HttpStatusCode.Unauthorized)
            {
                throw new InvalidOperationException("OpenWeatherMap rejected the configured API key.");
            }

            response.EnsureSuccessStatusCode();
            var weather = await response.Content.ReadFromJsonAsync<OpenWeatherResponse>(cancellationToken)
                ?? throw new InvalidOperationException($"OpenWeatherMap returned an empty response for {city.CityName}.");

            var expiresAt = DateTimeOffset.UtcNow.AddMinutes(_options.RawCacheMinutes);
            _cache.Set(cacheKey, new CachedWeather(weather, expiresAt), expiresAt);
            Record(city, "MISS", DateTimeOffset.UtcNow, expiresAt);
            return weather;
        }
        finally
        {
            cityLock.Release();
        }
    }

    private void Record(CitySeed city, string status, DateTimeOffset checkedAt, DateTimeOffset? expiresAt)
    {
        _cacheMonitor.Record(new CacheEntryStatus(
            city.CityCode,
            city.CityName,
            status,
            checkedAt,
            expiresAt));
    }

    private sealed record CachedWeather(OpenWeatherResponse Response, DateTimeOffset ExpiresAtUtc);
}
