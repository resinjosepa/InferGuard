function RecentRequests({ requests, setActivePage }) {
  const recentRequests = requests.slice(0, 5);

  return (
    <section className="panel requests-panel">
      <div className="panel-header">
        <div>
          <h3>Recent Requests</h3>

          <p>
            Latest LLM inference activity
          </p>
        </div>

        <button
          onClick={() => setActivePage("requests")}
          className="view-all-button"
        >
          View all →
        </button>
      </div>

      {recentRequests.length === 0 ? (
        <div className="empty-state">
          <p>No requests recorded yet.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>REQUEST</th>
                <th>MODEL</th>
                <th>WORKFLOW</th>
                <th>PREDICTED</th>
                <th>ACTUAL</th>
                <th>REASONING</th>
                <th>ACTUAL COST</th>
              </tr>
            </thead>

            <tbody>
              {recentRequests.map((request, index) => (
                <tr
                  key={
                    request.request_id ||
                    request.id ||
                    index
                  }
                >
                  <td
                    title={request.prompt || ""}
                    style={{
                      maxWidth: "260px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {request.prompt || "-"}
                  </td>

                  <td>
                    <code>{request.model}</code>
                  </td>

                  <td>
                    <span className="workflow-badge">
                      {request.workflow_type || "unknown"}
                    </span>
                  </td>

                  <td>
                    {request.predicted_output_tokens ?? "-"}
                  </td>

                  <td>
                    {request.actual_output_tokens ?? "-"}
                  </td>

                  <td>
                    {request.reasoning_tokens ?? "-"}
                  </td>

                  <td>
                    {request.actual_cost != null
                      ? `$${Number(
                          request.actual_cost
                        ).toFixed(6)}`
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default RecentRequests;