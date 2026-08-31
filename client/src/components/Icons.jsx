export function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M11 6l4 4-4 4" />
    </svg>
  )
}

export function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="m13 13 4 4" />
    </svg>
  )
}

export function RefreshIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M16 7a7 7 0 1 0 .4 5M16 3v4h-4" />
    </svg>
  )
}

export function WeatherIcon({ condition }) {
  const name = condition?.toLowerCase() ?? ''

  if (name.includes('rain') || name.includes('drizzle') || name.includes('thunder')) {
    return (
      <svg className="weather-icon" viewBox="0 0 44 44" aria-hidden="true">
        <path className="weather-stroke" d="M12 26h21a7 7 0 0 0-1.4-13.8A10 10 0 0 0 12.7 15 5.5 5.5 0 0 0 12 26Z" />
        <path className="weather-accent" d="m17 30-2 5m9-5-2 5m9-5-2 5" />
      </svg>
    )
  }

  if (name.includes('cloud') || name.includes('mist') || name.includes('fog') || name.includes('haze')) {
    return (
      <svg className="weather-icon" viewBox="0 0 44 44" aria-hidden="true">
        <path className="weather-stroke" d="M9 28h25a7 7 0 0 0-1.6-13.8 11 11 0 0 0-20.7 3.2A5.5 5.5 0 0 0 9 28Z" />
        {name.includes('mist') || name.includes('fog') || name.includes('haze') ? (
          <path className="weather-accent" d="M10 33h23M14 37h16" />
        ) : null}
      </svg>
    )
  }

  if (name.includes('snow')) {
    return (
      <svg className="weather-icon" viewBox="0 0 44 44" aria-hidden="true">
        <path className="weather-stroke" d="M11 25h22a7 7 0 0 0-1.4-13.8A10 10 0 0 0 12.7 14 5.5 5.5 0 0 0 11 25Z" />
        <path className="weather-accent" d="M16 31h.1m7-.1h.1m7 .1h.1M20 36h.1m7-.1h.1" />
      </svg>
    )
  }

  return (
    <svg className="weather-icon" viewBox="0 0 44 44" aria-hidden="true">
      <circle className="weather-accent" cx="22" cy="22" r="7" />
      <path className="weather-stroke" d="M22 6v5m0 22v5M6 22h5m22 0h5M10.7 10.7l3.5 3.5m15.6 15.6 3.5 3.5m0-22.6-3.5 3.5M14.2 29.8l-3.5 3.5" />
    </svg>
  )
}

