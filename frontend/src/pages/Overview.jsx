import MetricCard from "../components/MetricCard";
import WorkflowDistribution from "../components/WorkflowDistribution";
import RecentRequests from "../components/RecentRequests";
import RequestAnalyzer from "../components/RequestAnalyzer";

function Overview({
  stats,
  refreshStats,
  refreshing,
  setActivePage,

  analyzerPrompt,
  setAnalyzerPrompt,

  analyzerModel,
  setAnalyzerModel,

  analyzerMaxOutputTokens,
  setAnalyzerMaxOutputTokens,

  analyzerResult,

  analyzerLoading,
  analyzerError,

  analyzeRequest,
}) {
  return (
    <div className="page">

      {/* Header */}
      <div className="page-header">
        <div>
          <p className="eyebrow">
            INFERENCE MONITORING
          </p>

          <h1>Overview</h1>

          <p>
            Monitor LLM inference usage, cost,
            and guardrail decisions.
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
          value={`$${Number(
            stats.estimated_cost ?? 0
          ).toFixed(4)}`}
        />

        <MetricCard
          title="Actual Cost"
          value={`$${Number(
            stats.actual_cost ?? 0
          ).toFixed(4)}`}
        />

        <MetricCard
          title="Cost Variance"
          value={`$${Number(
            stats.cost_variance ?? 0
          ).toFixed(4)}`}
        />

      </div>

      {/* Live Request Analyzer */}
      <RequestAnalyzer
        prompt={analyzerPrompt}
        setPrompt={setAnalyzerPrompt}

        model={analyzerModel}
        setModel={setAnalyzerModel}

        maxOutputTokens={analyzerMaxOutputTokens}
        setMaxOutputTokens={
          setAnalyzerMaxOutputTokens
        }

        result={analyzerResult}

        loading={analyzerLoading}
        error={analyzerError}

        analyzeRequest={analyzeRequest}
      />

      {/* Analytics */}
      <div className="dashboard-grid">

        <WorkflowDistribution
          distribution={
            stats.workflow_distribution
          }
        />

        <RecentRequests
          requests={
            stats.recent_requests || []
          }
          setActivePage={setActivePage}
        />

      </div>

    </div>
  );
}

export default Overview;