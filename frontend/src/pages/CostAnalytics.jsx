function CostAnalytics({ stats }) {
  const variancePercentage =
    stats.estimated_cost > 0
      ? (stats.cost_variance / stats.estimated_cost) * 100
      : 0;

  return (
    <div className="analytics-page">
      <div className="page-heading">
        <p className="eyebrow">COST CONTROL</p>
        <h3>Cost Analytics</h3>
        <p>
          Compare predicted inference costs against actual
          usage collected by InferGuard.
        </p>
      </div>

      <section className="metrics">
        <div className="metric-card">
          <span className="metric-label">Estimated Cost</span>
          <strong>${stats.estimated_cost.toFixed(6)}</strong>
        </div>

        <div className="metric-card">
          <span className="metric-label">Actual Cost</span>
          <strong>${stats.actual_cost.toFixed(6)}</strong>
        </div>

        <div className="metric-card">
          <span className="metric-label">Cost Variance</span>
          <strong>${stats.cost_variance.toFixed(6)}</strong>
        </div>

        <div className="metric-card">
          <span className="metric-label">Variance %</span>
          <strong>{variancePercentage.toFixed(2)}%</strong>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Estimated vs Actual</h3>
            <p>Current aggregate inference cost</p>
          </div>
        </div>

        <div className="cost-comparison">
          <div className="cost-bar">
            <span>Estimated</span>

            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width:
                    stats.actual_cost > 0
                      ? `${Math.min(
                          (stats.estimated_cost /
                            stats.actual_cost) *
                            100,
                          100
                        )}%`
                      : "0%",
                }}
              />
            </div>

            <strong>
              ${stats.estimated_cost.toFixed(6)}
            </strong>
          </div>

          <div className="cost-bar">
            <span>Actual</span>

            <div className="bar-track">
              <div
                className="bar-fill actual"
                style={{
                  width: "100%",
                }}
              />
            </div>

            <strong>
              ${stats.actual_cost.toFixed(6)}
            </strong>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Cost Protection</h3>
            <p>
              InferGuard compares predicted and actual
              inference usage to identify cost deviations.
            </p>
          </div>
        </div>

        <div className="status-box">
          <strong>
            {stats.cost_variance <= 0
              ? "Within prediction"
              : "Cost variance detected"}
          </strong>

          <span>
            Current variance: $
            {stats.cost_variance.toFixed(6)}
          </span>
        </div>
      </section>
    </div>
  );
}

export default CostAnalytics;