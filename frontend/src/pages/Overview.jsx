import { useEffect, useState } from "react";

import MetricCard from "../components/MetricCard";
import WorkflowDistribution from "../components/WorkflowDistribution";
import RecentRequests from "../components/RecentRequests";
import RequestAnalyzer from "../components/RequestAnalyzer";

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
    return <div className="page-loading">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="page-error">
        <h2>Unable to load dashboard</h2>
        <p>{error}</p>
        <p>Make sure the FastAPI backend is running on port 8000.</p>
      </div>
    );
  }

  return (
    <div className="page">

      {/* Header */}
      <div className="page-header">
        <div>
          <p className="eyebrow">INFERENCE MONITORING</p>

          <h1>Overview</h1>

          <p>
            Monitor LLM inference usage, cost, and guardrail decisions.
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Requests"
          value={stats.total_requests}
        />

        <MetricCard
          title="Estimated Cost"
          value={`$${stats.estimated_cost.toFixed(4)}`}
        />

        <MetricCard
          title="Actual Cost"
          value={`$${stats.actual_cost.toFixed(4)}`}
        />

        <MetricCard
          title="Cost Variance"
          value={`$${stats.cost_variance.toFixed(4)}`}
        />
      </div>

      {/* Request Analyzer */}
      <RequestAnalyzer />

      {/* Analytics */}
      <div className="dashboard-grid">
        <WorkflowDistribution
          distribution={stats.workflow_distribution}
        />

        <RecentRequests
          requests={stats.recent_requests}
          setActivePage={setActivePage}
        />
      </div>

    </div>
  );
}

export default Overview;