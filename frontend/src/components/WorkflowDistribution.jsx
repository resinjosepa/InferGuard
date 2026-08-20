function WorkflowDistribution({ distribution }) {
  const entries = Object.entries(distribution || {});

  const total = entries.reduce(
    (sum, [, count]) => sum + count,
    0
  );

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h3>Workflow Distribution</h3>
          <p>Predicted request complexity</p>
        </div>
      </div>

      {entries.length === 0 ? (
        <p>No workflow data available.</p>
      ) : (
        <div className="workflow-content">
          <div className="donut">
            <div className="donut-inner">
              <strong>{total}</strong>
              <span>requests</span>
            </div>
          </div>

          <div className="workflow-list">
            {entries.map(([workflow, count]) => {
              const percentage =
                total > 0
                  ? Math.round((count / total) * 100)
                  : 0;

              return (
                <div className="workflow-item" key={workflow}>
                  <span className="workflow-name">
                    {workflow.replace("_", "-")}
                  </span>

                  <strong>{percentage}%</strong>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkflowDistribution;