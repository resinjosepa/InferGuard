function Sidebar({ activePage, setActivePage }) {
  const navigationItems = [
    { id: "overview", label: "Overview" },
    { id: "requests", label: "Requests" },
    { id: "cost", label: "Cost Analytics" },
    { id: "guardrails", label: "Guardrails" },
    { id: "models", label: "Models" },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">I</div>

        <div>
          <h1>InferGuard</h1>
          <span>LLM Guardrails</span>
        </div>
      </div>

      <nav>
        {navigationItems.map((item) => (
          <button
            key={item.id}
            className={activePage === item.id ? "active" : ""}
            onClick={() => setActivePage(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="system-status">
          <span className="status-dot"></span>

          <div>
            <strong>API Operational</strong>
            <small>Backend connected</small>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;