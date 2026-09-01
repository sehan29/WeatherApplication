# Weather Comfort Dashboard

Field Notes is a secure weather analytics dashboard built with ASP.NET Core 8 and React 19. It loads a configured list of cities, retrieves live observations from OpenWeatherMap, calculates a server-side hybrid Comfort Index, and ranks the cities from most to least comfortable.

The application includes Auth0 authentication, protected weather endpoints, light and dark themes, city search and filtering, cache diagnostics, and a responsive Chart.js comparison chart.

## Technology

- ASP.NET Core 8 Web API
- React 19 and Vite 8
- Auth0 SPA authentication and JWT bearer authorization
- OpenWeatherMap current-weather API
- Chart.js with `react-chartjs-2`
- ASP.NET Core in-memory caching

## Prerequisites

- .NET SDK 8.x
- Node.js 20.19+ or 22.12+
- An OpenWeatherMap API key
- An Auth0 Single Page Application and Auth0 API

## Configuration

Local `.env` files are excluded by `.gitignore`. Never commit API keys, access tokens, or other secrets.

Create `server/Weather.Api/.env`:

```dotenv
OpenWeatherApi__ApiKey=your-openweathermap-api-key
OpenWeatherApi__BaseUrl=https://api.openweathermap.org/data/2.5/
Auth0__Domain=your-tenant.auth0.com
Auth0__Audience=your-api-identifier
Cors__AllowedOrigins__0=http://localhost:5173
ASPNETCORE_URLS=http://localhost:5062
```

Create `client/.env`:

```dotenv
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-spa-client-id
VITE_AUTH0_AUDIENCE=your-api-identifier
VITE_API_BASE_URL=http://localhost:5062
```

`VITE_AUTH0_AUDIENCE` must exactly match `Auth0__Audience`. The OpenWeatherMap key belongs only in the server environment and is never exposed in the browser bundle.

## Auth0 setup

Configure the Auth0 Single Page Application with these local-development values:

- Allowed Callback URLs: `http://localhost:5173`
- Allowed Logout URLs: `http://localhost:5173`
- Allowed Web Origins: `http://localhost:5173`

Create or select an Auth0 API whose identifier matches the configured audience. The API validates the token issuer, audience, signature, and lifetime. Refresh-token rotation is recommended because the client uses refresh tokens with a silent-auth fallback.

If access must be restricted, disable public database sign-ups, create approved users manually, verify their email addresses, and configure the required MFA policy in the Auth0 Dashboard. These tenant settings cannot be enforced by this repository alone.

## Run locally

Open two PowerShell terminals in the `WeatherApplication` directory.

Terminal 1 — API:

```powershell
dotnet run --project server/Weather.Api/Weather.Api.csproj --launch-profile http
```

Terminal 2 — React client:

```powershell
Set-Location client
npm.cmd install
npm.cmd run dev
```

Local URLs:

- React application: `http://localhost:5173`
- Login: `http://localhost:5173/login`
- Dashboard: `http://localhost:5173/dashboard`
- API: `http://localhost:5062`
- Health check: `http://localhost:5062/api/health`
- Swagger UI in Development: `http://localhost:5062/swagger`

## Comfort Index

The Comfort Index is calculated entirely by the API. It first determines apparent temperature and then combines five normalized factor scores with an explicit severe-weather penalty.

### Apparent temperature

- When temperature is at least `27°C` and humidity is at least `40%`, the NOAA heat-index equation is used.
- When temperature is at most `10°C` and wind speed is above `4.8 km/h`, the Environment Canada wind-chill equation is used.
- Otherwise, the measured temperature is used.

### Weighted factors

| Factor | Preferred value or band | Weight |
| --- | --- | ---: |
| Apparent temperature | `18–24°C` | 45% |
| Relative humidity | `40–60%` | 25% |
| Wind speed | `0.5–5 m/s` | 15% |
| Cloud cover | `20–60%` | 10% |
| Visibility | `8,000 m` or more | 5% |

Values outside a preferred band lose points according to their distance from that band. Visibility scales linearly from 0 to 100 until it reaches 8,000 metres.

```text
base = temperatureScore × 0.45
     + humidityScore    × 0.25
     + windScore        × 0.15
     + cloudScore       × 0.10
     + visibilityScore  × 0.05

Comfort Index = clamp(base - severeWeatherPenalty, 0, 100)
```

Condition penalties are 20 points for thunderstorms, 8 for rain, 10 for snow, and 6 for atmospheric conditions such as mist or haze.

| Score | Label |
| ---: | --- |
| `85–100` | Excellent |
| `70–84.9` | Comfortable |
| `50–69.9` | Fair |
| `30–49.9` | Uncomfortable |
| `0–29.9` | Severe |

The formula is intentionally transparent and adjustable, but it is not a medical safety index. It does not account for acclimatization, clothing, direct solar radiation, or individual health factors.

## Caching

The API uses two process-local cache layers:

1. Raw OpenWeatherMap responses are cached for 5 minutes per city. A per-city semaphore prevents concurrent cache misses from producing duplicate external requests.
2. The complete processed ranking is cached for 4 minutes. Its shorter lifetime allows one recalculation from cached raw observations before those observations expire.

If a city request fails, successful cities are still returned and ranked while failures appear in the response. If every city fails, the API returns a `502 Bad Gateway` Problem Details response.

The protected `GET /api/weather/cache` endpoint reports whether the processed result is cached and the latest raw cache status recorded for each requested city.

## API endpoints

| Method | Route | Authentication | Description |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | Reports API health and the current UTC check time |
| `GET` | `/api/weather/rankings` | Auth0 bearer token | Returns current observations, Comfort Index scores, errors, and rankings |
| `GET` | `/api/weather/cache` | Auth0 bearer token | Returns processed and per-city raw cache diagnostics |

In Development, Swagger UI is available at `http://localhost:5062/swagger`. Select **Authorize** and paste an Auth0 access token; Swagger adds the `Bearer` prefix automatically.

## Cities

`server/Weather.Api/Data/cities.json` contains ten configured cities: Colombo, Tokyo, Liverpool, Paris, Sydney, Boston, Shanghai, Oslo, London, and New York. The legacy `Temp` and `Status` values in that file are source metadata only; live values come from OpenWeatherMap.

## Build and validation

```powershell
dotnet build WeatherApplication.sln

Set-Location client
npm.cmd run lint
npm.cmd run build
```

The solution currently contains the API project only; no automated test project is included.

## Known limitations

- `IMemoryCache` is local to one API process. A multi-instance deployment should use a distributed cache such as Redis.
- The dashboard compares current observations and does not provide historical trends or forecasts.
- Cache diagnostics are snapshots of the latest recorded access, not guarantees of sliding expiration.
- Auth0 callback URLs, sign-up restrictions, users, email verification, and MFA must be configured in the Auth0 tenant.
- A new or invalid OpenWeatherMap API key can cause partial station errors or a complete `502` response.

## Project layout

```text
WeatherApplication/
├── client/                    React and Vite application
├── server/
│   └── Weather.Api/           ASP.NET Core API
├── WeatherApplication.sln
└── README.md
```
