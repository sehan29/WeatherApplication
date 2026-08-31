using System.Collections.Concurrent;
using Weather.Api.Models;

namespace Weather.Api.Services;

public interface IWeatherCacheMonitor
{
    void Record(CacheEntryStatus status);
    IReadOnlyList<CacheEntryStatus> GetStatuses();
}

public sealed class WeatherCacheMonitor : IWeatherCacheMonitor
{
    private readonly ConcurrentDictionary<string, CacheEntryStatus> _statuses = new();

    public void Record(CacheEntryStatus status) => _statuses[status.CityCode] = status;

    public IReadOnlyList<CacheEntryStatus> GetStatuses() => _statuses.Values
        .OrderBy(status => status.CityName)
        .ToArray();
}

