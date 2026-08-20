import "./App.css";

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">I</div>
          <div>
            <h1>InferGuard</h1>
            <span>LLM Guardrails</span>
          </div>
        </div>

        <nav>
          <a className="active">Overview</a>
          <a>Requests</a>
          <a>Cost Analytics</a>
          <a>Guardrails</a>
          <a>Models</a>
        </nav>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="status-dot"></span>
            <div>
              <strong>System Operational</strong>
              <small>All services running</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">INFERENCE CONTROL CENTER</p>
            <h2>Overview</h2>
          </div>

          <div className="topbar-right">
            <span className="api-status">
              <span className="status-dot"></span>
              API Operational
            </span>
            <div className="avatar">R</div>
          </div>
        </header>

        <section className="metrics">
          <MetricCard
            label="Total Requests"
            value="1,284"
            change="+12.4%"
            positive
          />
          <MetricCard
            label="Estimated Cost"
            value="$2.84"
            change="+8.2%"
          />
          <MetricCard
            label="Actual Cost"
            value="$3.17"
            change="+11.6%"
          />
          <MetricCard
            label="Cost Variance"
            value="$0.33"
            change="10.4%"
            warning
          />
        </section>

        <section className="dashboard-grid">
          <div className="panel cost-panel">
            <div className="panel-header">
              <div>
                <h3>Cost Analytics</h3>
                <p>Estimated vs actual inference cost</p>
              </div>
              <button>Last 7 days ▾</button>
            </div>

            <div className="chart-placeholder">
              <div className="chart-grid">
                <span>$4</span>
                <span>$3</span>
                <span>$2</span>
                <span>$1</span>
                <span>$0</span>
              </div>

              <div className="chart-lines">
                <div className="line estimated"></div>
                <div className="line actual"></div>
              </div>

              <div className="chart-labels">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>

            <div className="legend">
              <span><i className="legend-estimated"></i> Estimated</span>
              <span><i className="legend-actual"></i> Actual</span>
            </div>
          </div>

          <div className="panel workflow-panel">
            <div className="panel-header">
              <div>
                <h3>Workflow Distribution</h3>
                <p>Predicted request complexity</p>
              </div>
            </div>

            <div className="workflow-content">
              <div className="donut">
                <div className="donut-inner">
                  <strong>1,284</strong>
                  <span>requests</span>
                </div>
              </div>

              <div className="workflow-list">
                <Workflow name="Simple" value="48%" />
                <Workflow name="RAG" value="22%" />
                <Workflow name="Multi-hop" value="14%" />
                <Workflow name="Agentic" value="10%" />
                <Workflow name="Open-ended" value="6%" />
              </div>
            </div>
          </div>
        </section>

        <section className="panel requests-panel">
          <div className="panel-header">
            <div>
              <h3>Recent Requests</h3>
              <p>Latest LLM inference activity</p>
            </div>

            <button>View all →</button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>REQUEST</th>
                  <th>MODEL</th>
                  <th>WORKFLOW</th>
                  <th>TOKENS</th>
                  <th>EST. COST</th>
                  <th>ACTUAL COST</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                <RequestRow
                  id="7d865b3a"
                  model="gemini-3.5-flash"
                  workflow="Simple"
                  tokens="7 / 1"
                  estimated="$0.000081"
                  actual="$0.000244"
                  status="Normal"
                />

                <RequestRow
                  id="4125740e"
                  model="gemini-3.5-flash"
                  workflow="Simple"
                  tokens="7 / 2"
                  estimated="$0.000081"
                  actual="$0.000478"
                  status="Review"
                />

                <RequestRow
                  id="928c9322"
                  model="gemini-3.5-flash"
                  workflow="RAG"
                  tokens="7 / 1"
                  estimated="$0.000405"
                  actual="$0.000468"
                  status="Normal"
                />
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function MetricCard({ label, value, change, positive, warning }) {
  return (
    <div className="metric-card">
      <span className="metric-label">{label}</span>
      <div className="metric-value-row">
        <strong>{value}</strong>
        <span
          className={`metric-change ${
            positive ? "positive" : warning ? "warning" : ""
          }`}
        >
          {change}
        </span>
      </div>
    </div>
  );
}

function Workflow({ name, value }) {
  return (
    <div className="workflow-item">
      <span className="workflow-name">{name}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RequestRow({
  id,
  model,
  workflow,
  tokens,
  estimated,
  actual,
  status,
}) {
  return (
    <tr>
      <td>
        <code>#{id}</code>
      </td>
      <td>{model}</td>
      <td>
        <span className={`workflow-badge ${workflow.toLowerCase()}`}>
          {workflow}
        </span>
      </td>
      <td>{tokens}</td>
      <td>{estimated}</td>
      <td>{actual}</td>
      <td>
        <span className={`request-status ${status.toLowerCase()}`}>
          {status}
        </span>
      </td>
    </tr>
  );
}

export default App;