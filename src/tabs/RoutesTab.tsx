import type { RouteConfig } from "../api/controlPlane";
import Sparkline from "../components/shared/Sparkline";
import Toggle from "../components/shared/Toggle";

interface RoutesTabProps {
  routes: RouteConfig[];
}

export default function RoutesTab({ routes }: RoutesTabProps) {
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
                <th>Auth</th><th>Cache</th><th>Status</th><th>Timeout</th><th>Strip Prefix</th><th></th>
              </tr>
            </thead>
            
            <tbody>
              {routes.map(r => (
                <tr key={r.id}>
                  <td><span className={`method ${r.method}`}>{r.method}</span></td>
                  <td><span className="route-path">{r.pathPattern}</span></td>
                  <td><code className="code-tag">{r.upstreamUrl}</code></td>
                  <td style={{ color: "var(--muted)", fontSize: 10 }}>{r.rateLimitPerMinute}/min</td>
                  <td><Toggle on={r.requiresAuth} onChange={() => {}} /></td>
                  <td><Toggle on={r.cacheEnabled} onChange={() => {}} /></td>
                  <td><span className={`status-badge ${r.status}`}>{r.status}</span></td>
                  <td>
                    <div className="flex items-center gap-6">
                      <Sparkline
                        data={Array.from({ length: 8 }, (_, index) => Math.max(200, r.timeoutMillis - 200 + index * 35))}
                        color={r.timeoutMillis > 3000 ? "#eb6f92" : "#c4a7e7"}
                      />
                      <span style={{ fontSize: 10, color: r.timeoutMillis > 3000 ? "var(--error)" : "var(--text)" }}>{r.timeoutMillis}ms</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--muted)", fontSize: 10 }}>{r.stripPrefix}</td>
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
