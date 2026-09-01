using System.Text.Json;
using Weather.Api.Models;

namespace Weather.Api.Services;

public interface ICityCatalog
{
    IReadOnlyList<CitySeed> GetCities();
}

public sealed class CityCatalog : ICityCatalog
{
    private readonly IReadOnlyList<CitySeed> _cities;

    public CityCatalog(IWebHostEnvironment environment)
    {
        var path = Path.Combine(environment.ContentRootPath, "Data", "cities.json");
        using var stream = File.OpenRead(path);
        var cityFile = JsonSerializer.Deserialize<CitySeedFile>(stream)
            ?? throw new InvalidOperationException("Data/cities.json could not be parsed.");

        _cities = cityFile.List
            .Where(city => !string.IsNullOrWhiteSpace(city.CityCode))
            .DistinctBy(city => city.CityCode)
            .ToArray();

        if (_cities.Count < 10)
        {
            throw new InvalidOperationException("At least 10 unique city codes are required.");
        }
    }

    public IReadOnlyList<CitySeed> GetCities() => _cities;
}

