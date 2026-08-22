import { useCallback, useEffect, useState } from "react";

import Sidebar from "./components/Sidebar";
import Overview from "./pages/Overview";
import Requests from "./pages/Requests";
import CostAnalytics from "./pages/CostAnalytics";

import "./App.css";

const API_URL = "http://127.0.0.1:8000";


/* =========================================================
   API helper
   ========================================================= */

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      ...(options.headers || {}),
      "Cache-Control": "no-cache",
    },
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        `Backend returned ${response.status}`
    );
  }

  return data;
}


/* =========================================================
   App
   ========================================================= */

function App() {
  const [activePage, setActivePage] = useState("overview");

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  /*
   * Analyzer state lives here.
   * This means the prompt/result survives navigation.
   */
  const [analyzerPrompt, setAnalyzerPrompt] = useState("");
  const [analyzerModel, setAnalyzerModel] =
    useState("gemini-3.5-flash");
  const [analyzerMaxOutputTokens, setAnalyzerMaxOutputTokens] =
    useState(256);

  const [analyzerResult, setAnalyzerResult] = useState(null);
  const [analyzerLoading, setAnalyzerLoading] = useState(false);
  const [analyzerError, setAnalyzerError] = useState(null);


  /* =========================================================
     Dashboard stats
     ========================================================= */

  const refreshStats = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);

      const data = await apiFetch("/dashboard/stats");

      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    refreshStats();
  }, [refreshStats]);


  /* =========================================================
     Analyze request
     ========================================================= */

  const analyzeRequest = async () => {
    if (!analyzerPrompt.trim()) {
      setAnalyzerError(
        "Enter a prompt before analyzing."
      );
      return;
    }

    try {
      setAnalyzerLoading(true);
      setAnalyzerError(null);

      const data = await apiFetch("/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: "dashboard-user",
          prompt: analyzerPrompt,
          model: analyzerModel,
          max_output_tokens: Number(
            analyzerMaxOutputTokens
          ),
        }),
      });

      /*
       * IMPORTANT:
       * Keep the prompt separately in analyzerPrompt.
       * Keep the complete backend result separately.
       */
      setAnalyzerResult(data);

      /*
       * Refresh request/cost statistics after
       * a successful inference.
       */
      await refreshStats();
    } catch (err) {
      setAnalyzerError(err.message);
    } finally {
      setAnalyzerLoading(false);
    }
  };


  /* =========================================================
     Loading
     ========================================================= */

  if (loading) {
    return (
      <div className="app">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
        />

        <main className="main">
          <div className="page-loading">
            Loading InferGuard...
          </div>
        </main>
      </div>
    );
  }


  /* =========================================================
     Main application
     ========================================================= */

  return (
    <div className="app">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="main">

        {error && (
          <div className="page-error">
            <h2>Unable to connect to InferGuard</h2>

            <p>{error}</p>

            <button onClick={refreshStats}>
              Retry
            </button>
          </div>
        )}


        {!error && stats && (
          <>

            {activePage === "overview" && (
              <Overview
                stats={stats}
                refreshStats={refreshStats}
                refreshing={refreshing}
                setActivePage={setActivePage}

                analyzerPrompt={analyzerPrompt}
                setAnalyzerPrompt={setAnalyzerPrompt}

                analyzerModel={analyzerModel}
                setAnalyzerModel={setAnalyzerModel}

                analyzerMaxOutputTokens={
                  analyzerMaxOutputTokens
                }

                setAnalyzerMaxOutputTokens={
                  setAnalyzerMaxOutputTokens
                }

                analyzerResult={analyzerResult}
                setAnalyzerResult={setAnalyzerResult}

                analyzerLoading={analyzerLoading}
                analyzerError={analyzerError}

                analyzeRequest={analyzeRequest}
              />
            )}


            {activePage === "requests" && (
              <Requests
                stats={stats}
                onRefresh={refreshStats}
                refreshing={refreshing}
              />
            )}


            {activePage === "cost" && (
              <CostAnalytics
                stats={stats}
              />
            )}


            {activePage === "guardrails" && (
              <Guardrails
                onConfigChanged={refreshStats}
              />
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
   Guardrails
   ========================================================= */

function Guardrails({ onConfigChanged }) {

  const [maxCost, setMaxCost] = useState(null);

  const [warningThreshold, setWarningThreshold] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);


  /* =========================================================
     Load configuration from backend
     ========================================================= */

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      /*
       * Always ask the backend for the current value.
       * No frontend default is used.
       */
      const data = await apiFetch(
        `/guardrails/config?t=${Date.now()}`
      );

      setMaxCost(Number(data.max_cost));

      setWarningThreshold(
        Number(data.warning_threshold)
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);


  /*
   * Load every time this component is mounted.
   *
   * Since App only renders Guardrails when
   * activePage === "guardrails", navigating away
   * and coming back mounts it again and fetches
   * the current backend configuration.
   */
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);


  /* =========================================================
     Save configuration
     ========================================================= */

  const saveConfig = async () => {

    const value = Number(maxCost);

    if (!Number.isFinite(value) || value <= 0) {
      setError(
        "Maximum cost must be greater than 0."
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      const data = await apiFetch(
        "/guardrails/config",
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


      /*
       * Backend is the source of truth.
       *
       * Do NOT calculate the values ourselves here.
       * Use exactly what the backend returned.
       */
      setMaxCost(Number(data.max_cost));

      setWarningThreshold(
        Number(data.warning_threshold)
      );


      setMessage(
        "Guardrail configuration saved."
      );


      /*
       * Refresh dashboard statistics after
       * configuration changes.
       */
      if (onConfigChanged) {
        await onConfigChanged();
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };


  /* =========================================================
     Loading state
     ========================================================= */

  if (loading) {
    return (
      <div className="page">
        <div className="page-loading">
          Loading guardrail configuration...
        </div>
      </div>
    );
  }


  /* =========================================================
     Error state
     ========================================================= */

  if (error && maxCost === null) {
    return (
      <div className="page guardrails-page">

        <div className="page-header">
          <div>
            <p className="eyebrow">
              SAFETY & CONTROL
            </p>

            <h1>Guardrails</h1>

            <p>
              Configure spending limits that protect
              inference requests before they reach the
              model.
            </p>
          </div>
        </div>

        <div className="analyzer-error">
          {error}
        </div>

        <button
          className="save-guardrail-button"
          onClick={loadConfig}
        >
          Retry
        </button>

      </div>
    );
  }


  /* =========================================================
     Guardrails UI
     ========================================================= */

  return (
    <div className="page guardrails-page">

      <div className="page-header">
        <div>

          <p className="eyebrow">
            SAFETY & CONTROL
          </p>

          <h1>Guardrails</h1>

          <p>
            Configure spending limits that protect
            inference requests before they reach the
            model.
          </p>

        </div>
      </div>


      {/* =====================================================
          Cost protection
          ===================================================== */}

      <section className="panel guardrail-config-panel">

        <div className="panel-header">

          <div>

            <h3>Cost Protection</h3>

            <p>
              InferGuard evaluates predicted inference
              cost before execution.
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

                value={
                  maxCost !== null
                    ? maxCost
                    : ""
                }

                onChange={(e) => {
                  setMaxCost(
                    e.target.value
                  );

                  setMessage(null);
                  setError(null);
                }}
              />

            </div>

          </label>


          <div className="guardrail-warning">

            <div>

              <span>
                Warning threshold
              </span>

              <strong>
                $
                {warningThreshold !== null
                  ? warningThreshold.toFixed(6)
                  : "0.000000"}
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
            {saving
              ? "Saving..."
              : "Save Changes"}
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


      {/* =====================================================
          Current policy
          ===================================================== */}

      <section className="panel">

        <div className="panel-header">

          <div>

            <h3>Current Policy</h3>

            <p>
              Requests are classified using the
              configured predicted-cost threshold.
            </p>

          </div>

        </div>


        <div className="guardrail-policy">

          {/* ALLOW */}

          <div className="policy-row allow">

            <div>

              <strong>
                ALLOW
              </strong>

              <span>
                Predicted cost below warning threshold
              </span>

            </div>

            <code>
              &lt; $
              {warningThreshold !== null
                ? warningThreshold.toFixed(6)
                : "0.000000"}
            </code>

          </div>


          {/* WARN */}

          <div className="policy-row warn">

            <div>

              <strong>
                WARN
              </strong>

              <span>
                Predicted cost approaching maximum
              </span>

            </div>

            <code>

              $
              {warningThreshold !== null
                ? warningThreshold.toFixed(6)
                : "0.000000"}

              {" – "}

              $
              {maxCost !== null
                ? Number(maxCost).toFixed(6)
                : "0.000000"}

            </code>

          </div>


          {/* BLOCK */}

          <div className="policy-row block">

            <div>

              <strong>
                BLOCK
              </strong>

              <span>
                Predicted cost exceeds maximum
              </span>

            </div>

            <code>

              &gt; $

              {maxCost !== null
                ? Number(maxCost).toFixed(6)
                : "0.000000"}

            </code>

          </div>

        </div>

      </section>

    </div>
  );
}


/* =========================================================
   Models
   ========================================================= */

function Models() {

  return (
    <div className="page">

      <div className="page-header">

        <div>

          <p className="eyebrow">
            MODEL REGISTRY
          </p>

          <h1>Models</h1>

          <p>
            View configured inference models and
            pricing.
          </p>

        </div>

      </div>


      <section className="panel">

        <div className="panel-header">

          <div>

            <h3>
              Configured Models
            </h3>

            <p>
              Models currently available to
              InferGuard.
            </p>

          </div>

        </div>


        <div className="model-list">

          <div className="model-row">

            <div>

              <strong>
                gemini-3.5-flash
              </strong>

              <span>
                Google Gemini
              </span>

            </div>

            <span className="model-status">
              Available
            </span>

          </div>


          <div className="model-row">

            <div>

              <strong>
                gpt-5.6
              </strong>

              <span>
                OpenAI
              </span>

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