import { useState } from "react";
import { ROUTES } from "../data/mockData";
import Sparkline from "../components/shared/Sparkline";
import Toggle from "../components/shared/Toggle";

export default function RoutesTab() {
  const [routes, setRoutes] = useState(ROUTES);
  const toggleCache = (id: number) =>
    setRoutes(r => r.map(x => x.id === id ? { ...x, cache: !x.cache } : x));

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <span className="card-title">Route Registry — {routes.length} entries</span>
          <div className="flex gap-6">
            <button className="btn btn-ghost">Import YAML</button>
            <button className="btn btn-primary">+ Add Route</button>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Method</th><th>Path</th><th>Upstream</th><th>Rate Limit</th>
                <th>Auth</th><th>Cache</th><th>Status</th><th>Latency</th><th>RPS</th><th></th>
              </tr>
            </thead>
            <tbody>
              {routes.map(r => (
                <tr key={r.id}>
                  <td><span className={`method ${r.method}`}>{r.method}</span></td>
                  <td><span className="route-path">{r.path}</span></td>
                  <td><code className="code-tag">{r.upstream}</code></td>
                  <td style={{ color: "var(--muted)", fontSize: 10 }}>{r.rate}</td>
                  <td><Toggle on={r.auth} onChange={() => {}} /></td>
                  <td><Toggle on={r.cache} onChange={() => toggleCache(r.id)} /></td>
                  <td><span className={`status-badge ${r.status}`}>{r.status}</span></td>
                  <td>
                    <div className="flex items-center gap-6">
                      <Sparkline
                        data={Array.from({length:8},()=>Math.max(5,r.latency+Math.floor(Math.random()*20-10)))}
                        color={r.latency > 100 ? "#EF4444" : "#00E5FF"}
                      />
                      <span style={{ fontSize: 10, color: r.latency > 100 ? "var(--error)" : "var(--text)" }}>{r.latency}ms</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--muted)", fontSize: 10 }}>{r.rps}</td>
                  <td>
                    <div className="flex gap-6">
                      <button className="btn btn-ghost" style={{ padding: "3px 8px" }}>Edit</button>
                      <button className="btn btn-danger" style={{ padding: "3px 8px" }}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}