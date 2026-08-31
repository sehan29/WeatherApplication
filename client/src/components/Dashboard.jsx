import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import CachePanel from './CachePanel'
import Header from './Header'
import MethodPanel from './MethodPanel'
import { RefreshIcon, SearchIcon } from './Icons'
import WeatherCharts from './WeatherCharts'
import WeatherList from './WeatherList'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5062'

function getBand(score) {
  if (score >= 85) return 'excellent'
  if (score >= 70) return 'good'
  if (score >= 50) return 'fair'
  return 'poor'
}

export default function Dashboard() {
  const { getAccessTokenSilently } = useAuth0()
  const [dashboard, setDashboard] = useState(null)
  const [cache, setCache] = useState(null)
  const [showCache, setShowCache] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [band, setBand] = useState('all')
  const [sort, setSort] = useState('rank')
  const [theme, setTheme] = useState(() => localStorage.getItem('field-notes-theme') || 'light')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('field-notes-theme', theme)
  }, [theme])

  const authorizedFetch = useCallback(async (path) => {
    const token = await getAccessTokenSilently()
    const response = await fetch(`${apiBaseUrl}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      const problem = await response.json().catch(() => null)
      throw new Error(problem?.detail || `The server returned ${response.status}.`)
    }

    return response.json()
  }, [getAccessTokenSilently])

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setDashboard(await authorizedFetch('/api/weather/rankings'))
    } catch (requestError) {
      setError(requestError.message || 'The weather dashboard could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [authorizedFetch])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const openCache = async () => {
    setShowCache(true)
    setCache(null)
    try {
      setCache(await authorizedFetch('/api/weather/cache'))
    } catch (requestError) {
      setError(requestError.message)
      setShowCache(false)
    }
  }

  const visibleCities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const cities = (dashboard?.cities || []).filter((city) => {
      const matchesSearch = !normalizedQuery ||
        city.cityName.toLowerCase().includes(normalizedQuery) ||
        city.country.toLowerCase().includes(normalizedQuery) ||
        city.description.toLowerCase().includes(normalizedQuery)
      const matchesBand = band === 'all' || getBand(city.comfortScore) === band
      return matchesSearch && matchesBand
    })

    return [...cities].sort((left, right) => {
      if (sort === 'city') return left.cityName.localeCompare(right.cityName)
      if (sort === 'temperature') return right.temperatureC - left.temperatureC
      return left.rank - right.rank
    })
  }, [dashboard, query, band, sort])

  const averageScore = dashboard?.cities?.length
    ? dashboard.cities.reduce((total, city) => total + city.comfortScore, 0) / dashboard.cities.length
    : 0
  const bestCity = dashboard?.cities?.[0]

  return (
    <div className="app-shell">
      <Header theme={theme} onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} />

      <main className="dashboard">
        <section className="dashboard-title">
          <div>
            <p className="eyebrow">Current city ranking</p>
            <h1>City comfort, right now.</h1>
          </div>
          <div className="title-actions">
            {dashboard && (
              <button className="cache-button" type="button" onClick={openCache}>
                <span className={`status-dot status-dot--${dashboard.cacheStatus.toLowerCase()}`} />
                Server cache: {dashboard.cacheStatus}
              </button>
            )}
            <button className="secondary-button" type="button" onClick={loadDashboard} disabled={loading}>
              <RefreshIcon />
              Refresh
            </button>
          </div>
        </section>

        {error && (
          <section className="request-error" role="alert">
            <div>
              <strong>We couldn&apos;t load the weather desk.</strong>
              <p>{error}</p>
            </div>
            <button className="secondary-button" type="button" onClick={loadDashboard}>Try again</button>
          </section>
        )}

        {!error && loading && !dashboard ? (
          <section className="dashboard-loading" aria-live="polite">
            <div className="loader-mark" aria-hidden="true" />
            <p>Contacting weather stations…</p>
          </section>
        ) : dashboard ? (
          <>
            <section className="summary-grid" aria-label="Weather ranking summary">
              <article className="summary-card summary-card--featured">
                <span>Most comfortable</span>
                <strong>{bestCity?.cityName}</strong>
                <p>{bestCity?.comfortScore} index · {bestCity?.temperatureC}°C</p>
              </article>
              <article className="summary-card">
                <span>Average comfort</span>
                <strong>{averageScore.toFixed(1)}</strong>
                <p>Across {dashboard.cities.length} reporting cities</p>
              </article>
              <article className="summary-card">
                <span>Last calculated</span>
                <strong>{new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(new Date(dashboard.generatedAtUtc))}</strong>
                <p>{dashboard.errors.length ? `${dashboard.errors.length} station issue${dashboard.errors.length > 1 ? 's' : ''}` : 'All stations reporting'}</p>
              </article>
            </section>

            {dashboard.errors.length > 0 && (
              <details className="partial-warning">
                <summary>{dashboard.errors.length} cities could not be updated</summary>
                <ul>
                  {dashboard.errors.map((item) => <li key={item.cityCode}>{item.cityName}: {item.message}</li>)}
                </ul>
              </details>
            )}

            <WeatherCharts cities={dashboard.cities} />

            <section className="ranking-panel">
              <div className="ranking-toolbar">
                <label className="search-field">
                  <SearchIcon />
                  <span className="visually-hidden">Search cities</span>
                  <input
                    type="search"
                    placeholder="Search city or condition"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </label>

                <div className="ranking-toolbar__controls">
                  <MethodPanel activeBand={band} onBandChange={setBand} />
                  <label className="sort-field">
                    <span>Sort by</span>
                    <select value={sort} onChange={(event) => setSort(event.target.value)}>
                      <option value="rank">Comfort rank</option>
                      <option value="city">City name</option>
                      <option value="temperature">Temperature</option>
                    </select>
                  </label>
                </div>
              </div>

              <WeatherList cities={visibleCities} />
            </section>
          </>
        ) : null}
      </main>

      {showCache && <CachePanel cache={cache} onClose={() => setShowCache(false)} />}
    </div>
  )
}
