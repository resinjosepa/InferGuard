import { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar";
import Overview from "./pages/Overview";
import Requests from "./pages/Requests";
import CostAnalytics from "./pages/CostAnalytics";

import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [activePage, setActivePage] = useState("overview");

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/dashboard/stats`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
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

  return (
    <div className="app">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="main">

        {loading && (
          <div className="page-loading">
            Loading InferGuard...
          </div>
        )}

        {!loading && error && (
          <div className="page-error">
            <h2>Unable to connect to InferGuard</h2>
            <p>{error}</p>
            <p>
              Make sure the FastAPI backend is running on port 8000.
            </p>
          </div>
        )}

        {!loading && !error && stats && (
          <>
            {activePage === "overview" && (
              <Overview
                setActivePage={setActivePage}
              />
            )}

            {activePage === "requests" && (
              <Requests stats={stats} />
            )}

            {activePage === "cost" && (
              <CostAnalytics stats={stats} />
            )}

            {activePage === "guardrails" && (
              <Guardrails />
            )}

            {activePage === "models" && (
              <Models />
            )}
          </>
        )}

      </main>
    </div>
  );
}


/* =========================================================
   Guardrails Page
   ========================================================= */

function Guardrails() {
  const [maxCost, setMaxCost] = useState("");
  const [warningThreshold, setWarningThreshold] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_URL}/guardrails/config`
      );

      if (!response.ok) {
        throw new Error(
          `Backend returned ${response.status}`
        );
      }

      const data = await response.json();

      setMaxCost(data.max_cost);
      setWarningThreshold(data.warning_threshold);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const saveConfig = async () => {
    const value = Number(maxCost);

    if (!value || value <= 0) {
      setError("Maximum cost must be greater than 0.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      const response = await fetch(
        `${API_URL}/guardrails/config`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            max_cost: value,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || `Backend returned ${response.status}`
        );
      }

      setMaxCost(data.max_cost);
      setWarningThreshold(data.warning_threshold);

      setMessage("Guardrail configuration saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="page-loading">
          Loading guardrail configuration...
        </div>
      </div>
    );
  }

  return (
    <div className="page guardrails-page">

      <div className="page-header">
        <div>
          <p className="eyebrow">SAFETY & CONTROL</p>

          <h1>Guardrails</h1>

          <p>
            Configure spending limits that protect inference
            requests before they reach the model.
          </p>
        </div>
      </div>

      <section className="panel guardrail-config-panel">

        <div className="panel-header">
          <div>
            <h3>Cost Protection</h3>

            <p>
              InferGuard evaluates predicted inference cost
              before execution.
            </p>
          </div>
        </div>

        <div className="guardrail-form">

          <label>
            Maximum predicted cost

            <div className="cost-input">
              <span>$</span>

              <input
                type="number"
                min="0.000001"
                step="0.000001"
                value={maxCost}
                onChange={(e) => {
                  setMaxCost(e.target.value);
                  setMessage(null);
                }}
              />
            </div>
          </label>

          <div className="guardrail-warning">

            <div>
              <span>Warning threshold</span>

              <strong>
                ${Number(warningThreshold).toFixed(6)}
              </strong>
            </div>

            <span className="warning-percent">
              80% of maximum cost
            </span>

          </div>

          <button
            className="save-guardrail-button"
            onClick={saveConfig}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

        </div>

        {message && (
          <div className="guardrail-success">
            {message}
          </div>
        )}

        {error && (
          <div className="analyzer-error">
            {error}
          </div>
        )}

      </section>


      <section className="panel">

        <div className="panel-header">
          <div>
            <h3>Current Policy</h3>

            <p>
              Requests are classified using the configured
              predicted-cost threshold.
            </p>
          </div>
        </div>

        <div className="guardrail-policy">

          <div className="policy-row allow">
            <div>
              <strong>ALLOW</strong>
              <span>
                Predicted cost below warning threshold
              </span>
            </div>

            <code>
              &lt; ${Number(warningThreshold).toFixed(6)}
            </code>
          </div>

          <div className="policy-row warn">
            <div>
              <strong>WARN</strong>
              <span>
                Predicted cost approaching maximum
              </span>
            </div>

            <code>
              ${Number(warningThreshold).toFixed(6)}
              {" – "}
              ${Number(maxCost).toFixed(6)}
            </code>
          </div>

          <div className="policy-row block">
            <div>
              <strong>BLOCK</strong>
              <span>
                Predicted cost exceeds maximum
              </span>
            </div>

            <code>
              &gt; ${Number(maxCost).toFixed(6)}
            </code>
          </div>

        </div>

      </section>

    </div>
  );
}


/* =========================================================
   Models Page
   ========================================================= */

function Models() {
  return (
    <div className="page">

      <div className="page-header">
        <div>
          <p className="eyebrow">MODEL REGISTRY</p>

          <h1>Models</h1>

          <p>
            View configured inference models and pricing.
          </p>
        </div>
      </div>

      <section className="panel">

        <div className="panel-header">
          <div>
            <h3>Configured Models</h3>

            <p>
              Models currently available to InferGuard.
            </p>
          </div>
        </div>

        <div className="model-list">

          <div className="model-row">
            <div>
              <strong>gemini-3.5-flash</strong>
              <span>Google Gemini</span>
            </div>

            <span className="model-status">
              Available
            </span>
          </div>

          <div className="model-row">
            <div>
              <strong>gpt-5.6</strong>
              <span>OpenAI</span>
            </div>

            <span className="model-status">
              Configured
            </span>
          </div>

        </div>

      </section>

    </div>
  );
}


export default App;