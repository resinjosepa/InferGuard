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
          throw new Error(
            `Backend returned ${response.status}`
          );
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
      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      {/* Main Content */}
      <main className="main">

        {/* Loading */}
        {loading && (
          <div className="page-loading">
            Loading InferGuard...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="page-error">
            <h2>Unable to connect to InferGuard</h2>

            <p>{error}</p>

            <p>
              Make sure the FastAPI backend is running on
              port 8000.
            </p>
          </div>
        )}

        {/* Pages */}
        {!loading && !error && stats && (
          <>
            {activePage === "overview" && (
              <Overview
                setActivePage={setActivePage}
              />
            )}

            {activePage === "requests" && (
              <Requests
                stats={stats}
              />
            )}

            {activePage === "cost" && (
              <CostAnalytics
                stats={stats}
              />
            )}

            {activePage === "guardrails" && (
              <div className="page">
                <div className="page-header">
                  <div>
                    <p className="eyebrow">
                      SAFETY & CONTROL
                    </p>

                    <h1>Guardrails</h1>

                    <p>
                      Configure and monitor inference
                      guardrails.
                    </p>
                  </div>
                </div>

                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <h3>Guardrails</h3>

                      <p>
                        Guardrail controls will be
                        integrated here.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activePage === "models" && (
              <div className="page">
                <div className="page-header">
                  <div>
                    <p className="eyebrow">
                      MODEL REGISTRY
                    </p>

                    <h1>Models</h1>

                    <p>
                      View configured inference models
                      and pricing.
                    </p>
                  </div>
                </div>

                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <h3>Models</h3>

                      <p>
                        Model management will be
                        integrated here.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}

export default App;