export default function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? 'brand--compact' : ''}`} aria-label="Field Notes weather comfort">
       
      <span>
        <strong>Weather Analytics Application</strong>
        {!compact && <small>Weather comfort desk</small>}
      </span>
    </div>
  )
}

