import { WeatherIcon } from './Icons'

function scoreTone(score) {
  if (score >= 85) return 'excellent'
  if (score >= 70) return 'good'
  if (score >= 50) return 'fair'
  return 'poor'
}

function WeatherRow({ city }) {
  const tone = scoreTone(city.comfortScore)

  return (
    <article className="weather-row">
      <div className="rank-cell" data-label="Rank">
        <span className={`rank-badge ${city.rank <= 3 ? 'rank-badge--top' : ''}`}>{city.rank}</span>
      </div>

      <div className="city-cell" data-label="City">
        <WeatherIcon condition={city.condition} />
        <span>
          <strong>{city.cityName}</strong>
          <small>{city.country} · {city.description}</small>
        </span>
      </div>

      <div className="temperature-cell" data-label="Temperature">
        <strong>{Math.round(city.temperatureC)}°</strong>
        <small>Feels {Math.round(city.apparentTemperatureC)}°C</small>
      </div>

      <dl className="detail-cell">
        <div>
          <dt>Humidity</dt>
          <dd>{city.humidityPercent}%</dd>
        </div>
        <div>
          <dt>Wind</dt>
          <dd>{city.windSpeedMps} m/s</dd>
        </div>
      </dl>

      <div className={`score-cell score-cell--${tone}`} data-label="Comfort score">
        <div>
          <strong>{city.comfortScore}</strong>
          <small>{city.comfortLabel}</small>
        </div>
      </div>
    </article>
  )
}

export default function WeatherList({ cities }) {
  if (cities.length === 0) {
    return (
      <div className="empty-state">
        <strong>No cities match this view.</strong>
        <p>Clear the search or choose a different comfort band.</p>
      </div>
    )
  }

  return (
    <section className="weather-list" aria-label="City comfort rankings">
      <div className="weather-list__head" aria-hidden="true">
        <span>Rank</span>
        <span>City &amp; conditions</span>
        <span>Temperature</span>
        <span>Details</span>
        <span>Comfort index</span>
      </div>
      {cities.map((city) => <WeatherRow city={city} key={city.cityCode} />)}
    </section>
  )
}
