import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

function readThemeColor(variableName, fallback) {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim()

  return value || fallback
}

function scoreColor(score, colors) {
  if (score >= 85) return colors.excellent
  if (score >= 70) return colors.comfortable
  if (score >= 50) return colors.fair
  return colors.uncomfortable
}

export default function WeatherCharts({ cities }) {
  if (!cities?.length) {
    return null
  }

  const colors = {
    excellent: readThemeColor('--green', '#0c6659'),
    comfortable: '#76a57c',
    fair: readThemeColor('--yellow', '#d9a72f'),
    uncomfortable: readThemeColor('--red', '#a84c43'),
    text: readThemeColor('--muted', '#697170'),
    grid: readThemeColor('--line', '#d9d9d2'),
  }

  const data = {
    labels: cities.map((city) => city.cityName),
    datasets: [
      {
        label: 'Comfort Index',
        data: cities.map((city) => city.comfortScore),
        backgroundColor: cities.map((city) => scoreColor(city.comfortScore, colors)),
        borderSkipped: false,
        borderRadius: 2,
        maxBarThickness: 48,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 450,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        displayColors: false,
        callbacks: {
          title: ([item]) => item.label,
          label: (context) => `Comfort Index: ${context.parsed.y}`,
          afterLabel: (context) => {
            const city = cities[context.dataIndex]
            return `${city.comfortLabel} · ${city.temperatureC}°C`
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: colors.text,
          autoSkip: false,
          maxRotation: 0,
          font: { family: 'DM Sans', size: 11 },
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        border: { display: false },
        grid: { color: colors.grid },
        ticks: {
          color: colors.text,
          stepSize: 25,
          font: { family: 'DM Sans', size: 10 },
        },
        title: {
          display: true,
          text: 'Comfort Index',
          color: colors.text,
          font: { family: 'DM Sans', size: 11, weight: 600 },
        },
      },
    },
  }

  return (
    <section className="analytics-section" aria-labelledby="analytics-title">
      <header className="analytics-section__head">
        <div>
          <p className="eyebrow">Visual analysis</p>
          <h2 id="analytics-title">How the cities compare.</h2>
        </div>
      </header>

      <div className="charts-grid">
        <article className="chart-card chart-card--full">
          <header className="chart-card__head">
            <div>
              <p className="eyebrow">Comparison</p>
              <h3>Comfort by city</h3>
            </div>
            <span>Index / 100</span>
          </header>

          <div className="chart-canvas-wrap">
            <Bar
              data={data}
              options={options}
              role="img"
              aria-label="Vertical bar chart comparing the Comfort Index of each city"
            />
          </div>
        </article>
      </div>
    </section>
  )
}
