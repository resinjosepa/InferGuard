import { useEffect, useState } from "react";
import MetricCard from "../components/MetricCard";
import WorkflowDistribution from "../components/WorkflowDistribution";
import RecentRequests from "../components/RecentRequests";

const API_URL = "http://127.0.0.1:8000";

function Overview({ setActivePage }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/dashboard/stats`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        return response.json();
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <h2>Unable to load dashboard</h2>
        <p>{error}</p>
        <p>
          Make sure the FastAPI backend is running on port 8000.
        </p>
      </div>
    );
  }

  return (
    <div className="page">

      {/* Page Header */}
      <div className="page-header">
        <div>
          <p className="eyebrow">INFERENCE MONITORING</p>

          <h1>Overview</h1>

          <p>
            Monitor your LLM inference usage, workflows, and cost.
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">

        <MetricCard
          title="Total Requests"
          value={stats.total_requests}
          status="Live"
        />

        <MetricCard
          title="Estimated Cost"
          value={`$${stats.estimated_cost.toFixed(4)}`}
          status="Predicted"
        />

        <MetricCard
          title="Actual Cost"
          value={`$${stats.actual_cost.toFixed(4)}`}
          status="Measured"
        />

        <MetricCard
          title="Cost Variance"
          value={`$${stats.cost_variance.toFixed(4)}`}
          status="Variance"
        />

      </div>

      {/* Workflow Distribution */}
      <section className="overview-section">
        <WorkflowDistribution
          distribution={stats.workflow_distribution}
        />
      </section>

      {/* Recent Requests */}
      <section className="overview-section">

        <div className="overview-section-header">

          <div>
            <h2>Recent Requests</h2>

            <p>
              Latest LLM inference activity captured by InferGuard.
            </p>
          </div>

          <button
            className="view-all-button"
            onClick={() => setActivePage("requests")}
          >
            View all →
          </button>

        </div>

        <RecentRequests
          requests={stats.recent_requests.slice(0, 5)}
          hideHeader={true}
        />

      </section>

    </div>
  );
}

export default Overview;