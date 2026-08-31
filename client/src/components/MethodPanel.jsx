const bands = [
  { label: 'Excellent (85-100)', tone: 'excellent' },
  { label: 'Comfortable (70-84)', tone: 'good' },
  { label: 'Fair (50-69)', tone: 'fair' },
  { label: 'Uncomfortable (0-49)', tone: 'poor' },
]

export default function MethodPanel({ activeBand, onBandChange }) {
  return (
    <div className="method-panel">
      <label className="comfort-filter-select">
        <span>Filter by comfort</span>
        <select
          value={activeBand}
          onChange={(event) => onBandChange(event.target.value)}
        >
          <option value="all">All cities</option>
          {bands.map((band) => (
            <option value={band.tone} key={band.tone}>{band.label}</option>
          ))}
        </select>
      </label>
    </div>
  )
}
