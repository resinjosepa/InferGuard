import { useMemo, useState } from "react";

function Requests({
  stats,
  onRefresh,
  refreshing,
}) {
  const [search, setSearch] = useState("");
  const [workflowFilter, setWorkflowFilter] =
    useState("all");
  const [sortBy, setSortBy] =
    useState("recent");

  const requests =
    stats?.all_requests || [];

  const workflows = useMemo(() => {
    return [
      "all",
      ...new Set(
        requests
          .map(
            (request) =>
              request.workflow_type
          )
          .filter(Boolean)
      ),
    ];
  }, [requests]);

  const filteredRequests = useMemo(() => {
    let result = [...requests];

    if (search.trim()) {
      const query =
        search.trim().toLowerCase();

      result = result.filter((request) => {
        const model =
          String(
            request.model || ""
          ).toLowerCase();

        const workflow =
          String(
            request.workflow_type || ""
          ).toLowerCase();

        return (
          model.includes(query) ||
          workflow.includes(query)
        );
      });
    }

    if (workflowFilter !== "all") {
      result = result.filter(
        (request) =>
          request.workflow_type ===
          workflowFilter
      );
    }

    const number = (value) =>
      value == null
        ? 0
        : Number(value);

    if (sortBy === "actual-cost") {
      result.sort(
        (a, b) =>
          number(b.actual_cost) -
          number(a.actual_cost)
      );
    }

    if (sortBy === "predicted-cost") {
      result.sort(
        (a, b) =>
          number(b.predicted_cost) -
          number(a.predicted_cost)
      );
    }

    if (sortBy === "input-tokens") {
      result.sort(
        (a, b) =>
          number(b.input_tokens) -
          number(a.input_tokens)
      );
    }

    if (sortBy === "output-tokens") {
      result.sort(
        (a, b) =>
          number(b.actual_output_tokens) -
          number(a.actual_output_tokens)
      );
    }

    if (sortBy === "reasoning-tokens") {
      result.sort(
        (a, b) =>
          number(b.reasoning_tokens) -
          number(a.reasoning_tokens)
      );
    }

    // Backend already sends newest first.
    // Do not mutate that order for "recent".

    return result;
  }, [
    requests,
    search,
    workflowFilter,
    sortBy,
  ]);

  const actualCost = requests.reduce(
    (sum, request) =>
      sum +
      (Number(request.actual_cost) || 0),
    0
  );

  const workflowCount =
    new Set(
      requests
        .map(
          (request) =>
            request.workflow_type
        )
        .filter(Boolean)
    ).size;

  return (
    <div className="requests-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">
            INFERENCE ACTIVITY
          </p>

          <h1>Requests</h1>

          <p>
            Inspect LLM requests captured and
            analyzed by InferGuard.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={onRefresh}
          disabled={refreshing}
        >
          {refreshing
            ? "Refreshing..."
            : "↻ Refresh"}
        </button>
      </div>

      <div className="request-summary">
        <div className="summary-card">
          <span>Total Requests</span>

          <strong>
            {stats?.total_requests ?? 0}
          </strong>
        </div>

        <div className="summary-card">
          <span>Filtered</span>

          <strong>
            {filteredRequests.length}
          </strong>
        </div>

        <div className="summary-card">
          <span>Actual Cost</span>

          <strong>
            ${actualCost.toFixed(6)}
          </strong>
        </div>

        <div className="summary-card">
          <span>Workflows</span>

          <strong>
            {workflowCount}
          </strong>
        </div>
      </div>

      <section className="panel requests-container">
        <div className="requests-toolbar">
          <div className="search-box">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search model or workflow..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </div>

          <select
            value={workflowFilter}
            onChange={(event) =>
              setWorkflowFilter(
                event.target.value
              )
            }
          >
            {workflows.map(
              (workflow) => (
                <option
                  key={workflow}
                  value={workflow}
                >
                  {workflow === "all"
                    ? "All workflows"
                    : workflow.replace(
                        "_",
                        "-"
                      )}
                </option>
              )
            )}
          </select>

          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(
                event.target.value
              )
            }
          >
            <option value="recent">
              Recent
            </option>

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

            <option value="reasoning-tokens">
              Most reasoning tokens
            </option>
          </select>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <strong>
              No requests found
            </strong>

            <p>
              Try changing your search or
              workflow filter.
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
                  (request) => (
                    <tr
                      key={
                        request.request_id ||
                        request.id ||
                        `${request.model}-${request.timestamp}`
                      }
                    >
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
                        {
                          request.actual_output_tokens ??
                          "-"
                        }
                      </td>

                      <td>
                        {
                          request.reasoning_tokens ??
                          "-"
                        }
                      </td>

                      <td>
                        {request.predicted_cost !=
                        null
                          ? `$${Number(
                              request.predicted_cost
                            ).toFixed(6)}`
                          : "-"}
                      </td>

                      <td>
                        {request.actual_cost !=
                        null
                          ? `$${Number(
                              request.actual_cost
                            ).toFixed(6)}`
                          : "-"}
                      </td>

                      <td>
                        {request.cost_error !=
                        null
                          ? `$${Number(
                              request.cost_error
                            ).toFixed(6)}`
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