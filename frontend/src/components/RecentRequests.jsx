function RecentRequests({ requests, hideHeader = false }) {
  return (
    <section className="panel requests-panel">

      {!hideHeader && (
        <div className="panel-header">
          <div>
            <h3>Recent Requests</h3>
            <p>Latest LLM inference activity</p>
          </div>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="empty-state">
          No requests recorded yet.
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
                <th>ACTUAL COST</th>
              </tr>
            </thead>

            <tbody>

              {requests.map((request, index) => (
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
                    {request.predicted_output_tokens}
                  </td>

                  <td>
                    {request.actual_output_tokens}
                  </td>

                  <td>
                    {request.reasoning_tokens ?? "-"}
                  </td>

                  <td>
                    {request.actual_cost != null
                      ? `$${request.actual_cost.toFixed(6)}`
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