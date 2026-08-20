import { useMemo, useState } from "react";

function Requests({ stats, onRefresh, refreshing }) {
  const [search, setSearch] = useState("");
  const [workflowFilter, setWorkflowFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const requests = stats?.recent_requests || [];

  const workflows = [
    "all",
    ...new Set(requests.map((request) => request.workflow_type)),
  ];

  const filteredRequests = useMemo(() => {
    let result = [...requests];

    // Search
    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((request) =>
        request.model.toLowerCase().includes(query)
      );
    }

    // Workflow filter
    if (workflowFilter !== "all") {
      result = result.filter(
        (request) => request.workflow_type === workflowFilter
      );
    }

    // Sorting
    if (sortBy === "actual-cost") {
      result.sort(
        (a, b) => (b.actual_cost || 0) - (a.actual_cost || 0)
      );
    }

    if (sortBy === "predicted-cost") {
      result.sort(
        (a, b) =>
          (b.predicted_cost || 0) - (a.predicted_cost || 0)
      );
    }

    if (sortBy === "input-tokens") {
      result.sort(
        (a, b) =>
          (b.input_tokens || 0) - (a.input_tokens || 0)
      );
    }

    if (sortBy === "output-tokens") {
      result.sort(
        (a, b) =>
          (b.actual_output_tokens || 0) -
          (a.actual_output_tokens || 0)
      );
    }

    return result;
  }, [requests, search, workflowFilter, sortBy]);

  return (
    <div className="requests-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <p className="eyebrow">INFERENCE ACTIVITY</p>

          <h1>Requests</h1>

          <p>
            Inspect LLM requests captured and analyzed by InferGuard.
          </p>
        </div>

       <button
        className="refresh-button"
        onClick={onRefresh}
        disabled={refreshing}
        >
        {refreshing ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {/* Summary */}
      <div className="request-summary">
        <div className="summary-card">
          <span>Total Requests</span>
          <strong>{requests.length}</strong>
        </div>

        <div className="summary-card">
          <span>Filtered</span>
          <strong>{filteredRequests.length}</strong>
        </div>

        <div className="summary-card">
          <span>Actual Cost</span>
          <strong>
            $
            {requests
              .reduce(
                (sum, request) =>
                  sum + (request.actual_cost || 0),
                0
              )
              .toFixed(6)}
          </strong>
        </div>

        <div className="summary-card">
          <span>Workflows</span>
          <strong>
            {new Set(
              requests.map(
                (request) => request.workflow_type
              )
            ).size}
          </strong>
        </div>
      </div>

      {/* Filters */}
      <section className="panel requests-container">
        <div className="requests-toolbar">
          <div className="search-box">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search model..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <select
            value={workflowFilter}
            onChange={(event) =>
              setWorkflowFilter(event.target.value)
            }
          >
            {workflows.map((workflow) => (
              <option
                key={workflow}
                value={workflow}
              >
                {workflow === "all"
                  ? "All workflows"
                  : workflow.replace("_", "-")}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value)
            }
          >
            <option value="recent">Recent</option>
            <option value="actual-cost">
              Highest actual cost
            </option>
            <option value="predicted-cost">
              Highest predicted cost
            </option>
            <option value="input-tokens">
              Most input tokens
            </option>
            <option value="output-tokens">
              Most output tokens
            </option>
          </select>
        </div>

        {/* Table */}
        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <strong>No requests found</strong>

            <p>
              Try changing your search or workflow filter.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>MODEL</th>
                  <th>WORKFLOW</th>
                  <th>INPUT</th>
                  <th>PREDICTED OUTPUT</th>
                  <th>ACTUAL OUTPUT</th>
                  <th>REASONING</th>
                  <th>PREDICTED COST</th>
                  <th>ACTUAL COST</th>
                  <th>COST ERROR</th>
                </tr>
              </thead>

              <tbody>
                {filteredRequests.map(
                  (request, index) => (
                    <tr key={index}>
                      <td>
                        <code>
                          {request.model}
                        </code>
                      </td>

                      <td>
                        <span className="workflow-badge">
                          {request.workflow_type}
                        </span>
                      </td>

                      <td>
                        {request.input_tokens}
                      </td>

                      <td>
                        {
                          request.predicted_output_tokens
                        }
                      </td>

                      <td>
                        {request.actual_output_tokens}
                      </td>

                      <td>
                        {request.reasoning_tokens ??
                          "-"}
                      </td>

                      <td>
                        {request.predicted_cost !=
                        null
                          ? `$${request.predicted_cost.toFixed(
                              6
                            )}`
                          : "-"}
                      </td>

                      <td>
                        {request.actual_cost != null
                          ? `$${request.actual_cost.toFixed(
                              6
                            )}`
                          : "-"}
                      </td>

                      <td>
                        {request.cost_error != null
                          ? `$${request.cost_error.toFixed(
                              6
                            )}`
                          : "-"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Requests;