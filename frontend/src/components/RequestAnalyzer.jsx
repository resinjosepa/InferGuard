import { useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function RequestAnalyzer() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("gemini-3.5-flash");
  const [maxOutputTokens, setMaxOutputTokens] = useState(100);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeRequest = async () => {
    if (!prompt.trim()) {
      setError("Enter a prompt before analyzing.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: "dashboard-user",
          prompt,
          model,
          max_output_tokens: Number(maxOutputTokens),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || `Backend returned ${response.status}`
        );
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const actionClass =
    result?.guardrail_action?.toLowerCase() || "";

  return (
    <section className="panel analyzer-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">LIVE INFERENCE CONTROL</p>
          <h3>Analyze Request</h3>
          <p>
            Predict cost and evaluate guardrails before inference.
          </p>
        </div>
      </div>

      <div className="analyzer-form">
        <label>
          Prompt
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter an LLM request..."
            rows={4}
          />
        </label>

        <div className="analyzer-options">
          <label>
            Model
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="gemini-3.5-flash">
                gemini-3.5-flash
              </option>
              <option value="gpt-5.6">
                gpt-5.6
              </option>
            </select>
          </label>

          <label>
            Max output tokens
            <input
              type="number"
              min="1"
              value={maxOutputTokens}
              onChange={(e) =>
                setMaxOutputTokens(e.target.value)
              }
            />
          </label>

          <button
            className="analyze-button"
            onClick={analyzeRequest}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze Request"}
          </button>
        </div>
      </div>

      {error && (
        <div className="analyzer-error">
          {error}
        </div>
      )}

      {result && (
        <div className={`analysis-result ${actionClass}`}>
          <div className="decision">
            <span className="decision-label">
              GUARDRAIL DECISION
            </span>

            <strong>
              {result.guardrail_action}
            </strong>
          </div>

          <div className="analysis-metrics">
            <div>
              <span>Predicted Cost</span>
              <strong>
                ${result.estimated_cost.toFixed(6)}
              </strong>
            </div>

            <div>
              <span>Limit</span>
              <strong>
                ${result.guardrail_threshold.toFixed(6)}
              </strong>
            </div>

            <div>
              <span>Workflow</span>
              <strong>
                {result.workflow_type}
              </strong>
            </div>

            <div>
              <span>Predicted Output</span>
              <strong>
                {result.predicted_output_tokens}
              </strong>
            </div>
          </div>

          <p className="analysis-reason">
            {result.guardrail_reason}
          </p>

          {result.blocked ? (
            <div className="blocked-message">
              Request blocked before inference.
            </div>
          ) : result.response ? (
            <div className="model-response">
              <span>MODEL RESPONSE</span>
              <p>{result.response}</p>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}

export default RequestAnalyzer;