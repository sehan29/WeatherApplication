export default function CachePanel({ cache, onClose }) {
  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside
        className="cache-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cache-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="drawer-head">
          <div>
            <p className="eyebrow">Debug endpoint</p>
            <h2 id="cache-title">Server cache status</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close cache status">×</button>
        </div>

        {!cache ? (
          <p>Loading cache entries…</p>
        ) : (
          <>
            <p className="processed-cache">
              Processed rankings
              <strong>{cache.processedResponseCached ? 'CACHED' : 'EMPTY'}</strong>
            </p>
            <div className="cache-list">
              {cache.rawWeatherEntries.map((entry) => (
                <div key={entry.cityCode}>
                  <span>
                    <strong>{entry.cityName}</strong>
                    <small>ID {entry.cityCode}</small>
                  </span>
                  <span className={`cache-pill cache-pill--${entry.status.toLowerCase()}`}>{entry.status}</span>
                </div>
              ))}
            </div>
            <p className="drawer-note">Raw responses expire after 5 minutes. Rankings expire after 4 minutes.</p>
          </>
        )}
      </aside>
    </div>
  )
}

