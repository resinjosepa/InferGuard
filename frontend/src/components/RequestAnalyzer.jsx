function RequestAnalyzer({
  prompt,
  setPrompt,

  model,
  setModel,

  maxOutputTokens,
  setMaxOutputTokens,

  result,

  loading,
  error,

  analyzeRequest,
}) {
  const actionClass =
    result?.guardrail_action?.toLowerCase() || "";

  return (
    <section className="panel analyzer-panel">
      {/* Header */}
      <div className="panel-header">
        <div>
          <p className="eyebrow">
            LIVE INFERENCE CONTROL
          </p>

          <h3>Analyze Request</h3>

          <p>
            Predict cost and evaluate guardrails
            before inference.
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="analyzer-form">
        <label>
          Prompt

          <textarea
            value={prompt}
            onChange={(e) =>
              setPrompt(e.target.value)
            }
            placeholder="Enter an LLM request..."
            rows={4}
          />
        </label>

        <div className="analyzer-options">
          {/* Model */}
          <label>
            Model

            <select
              value={model}
              onChange={(e) =>
                setModel(e.target.value)
              }
            >
              <option value="gemini-3.5-flash">
                gemini-3.5-flash
              </option>
            </select>
          </label>

          {/* Max output tokens */}
          <label>
            Max output tokens

            <input
              type="number"
              min="1"
              value={maxOutputTokens}
              onChange={(e) =>
                setMaxOutputTokens(
                  Number(e.target.value)
                )
              }
            />
          </label>

          {/* Analyze button */}
          <button
            className="analyze-button"
            onClick={analyzeRequest}
            disabled={loading}
          >
            {loading
              ? "Analyzing..."
              : "Analyze Request"}
          </button>
        </div>
      </div>

      {/* Frontend/network error */}
      {error && (
        <div className="analyzer-error">
          {error}
        </div>
      )}

      {/* Analysis result */}
      {result && (
        <div
          className={`analysis-result ${actionClass}`}
        >
          {/* Decision */}
          <div className="decision">
            <span className="decision-label">
              GUARDRAIL DECISION
            </span>

            <strong>
              {result.guardrail_action}
            </strong>
          </div>

          {/* Metrics */}
          <div className="analysis-metrics">
            <div>
              <span>Predicted Cost</span>

              <strong>
                $
                {Number(
                  result.estimated_cost ?? 0
                ).toFixed(6)}
              </strong>
            </div>

            <div>
              <span>Limit</span>

              <strong>
                $
                {Number(
                  result.guardrail_threshold ?? 0
                ).toFixed(6)}
              </strong>
            </div>

            <div>
              <span>Workflow</span>

              <strong>
                {result.workflow_type || "-"}
              </strong>
            </div>

            <div>
              <span>Predicted Output</span>

              <strong>
                {result.predicted_output_tokens ??
                  "-"}
              </strong>
            </div>

            <div>
              <span>Actual Output</span>

              <strong>
                {result.actual_output_tokens ??
                  "-"}
              </strong>
            </div>

            <div>
              <span>Actual Cost</span>

              <strong>
                {result.actual_cost != null
                  ? `$${Number(
                      result.actual_cost
                    ).toFixed(6)}`
                  : "-"}
              </strong>
            </div>
          </div>

          {/* Guardrail reason */}
          {result.guardrail_reason && (
            <p className="analysis-reason">
              {result.guardrail_reason}
            </p>
          )}

          {/* Blocked request */}
          {result.blocked ? (
            <div className="blocked-message">
              Request blocked before inference.
            </div>
          ) : result.inference_error ? (
            /*
             * LLM/provider failure.
             *
             * Example:
             * Gemini quota exceeded.
             */
            <div className="inference-error">
              <strong>Inference unavailable</strong>

              <p>
                {result.inference_error}
              </p>
            </div>
          ) : result.response ? (
            /*
             * Successful model response.
             */
            <div className="model-response">
              <span>MODEL RESPONSE</span>

              <p>
                {result.response}
              </p>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}

export default RequestAnalyzer;