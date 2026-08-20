function MetricCard({ title, value, status }) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span className="metric-label">{title}</span>

        {status && (
          <span className={`metric-status ${status.type || ""}`}>
            {status.text}
          </span>
        )}
      </div>

      <div className="metric-value">
        {value}
      </div>
    </div>
  );
}

export default MetricCard;