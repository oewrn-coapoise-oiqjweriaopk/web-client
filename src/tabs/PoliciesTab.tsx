import { useState } from "react";

const POLICIES = [
  { id: 1, name: "Rate Limit — Public Routes",     type: "rate-limit",  target: "/api/v2/products",        status: "active",   priority: 1, rule: "max 2000 req/min per IP" },
  { id: 2, name: "Auth Enforcement — User APIs",   type: "auth",        target: "/api/v2/users/*",         status: "active",   priority: 2, rule: "require Bearer JWT" },
  { id: 3, name: "Cache Policy — Catalog",         type: "cache",       target: "/api/v2/products",        status: "active",   priority: 3, rule: "TTL 60s, vary: Accept" },
  { id: 4, name: "Block Deprecated Endpoints",     type: "block",       target: "/api/v1/*",               status: "active",   priority: 4, rule: "return 410 Gone" },
  { id: 5, name: "IP Allowlist — Admin Config",    type: "allowlist",   target: "/api/v2/config/runtime",  status: "active",   priority: 5, rule: "allow 10.0.0.0/8 only" },
  { id: 6, name: "Retry Policy — Order Service",   type: "retry",       target: "/api/v2/orders/*",        status: "degraded", priority: 6, rule: "max 3 retries, backoff 200ms" },
  { id: 7, name: "Webhook Signature Validation",   type: "auth",        target: "/api/v2/webhooks/*",      status: "inactive", priority: 7, rule: "HMAC-SHA256 header check" },
];

const TYPE_COLORS: Record<string, string> = {
  "rate-limit": "var(--accent)",
  "auth":       "var(--ok)",
  "cache":      "#A78BFA",
  "block":      "var(--error)",
  "allowlist":  "var(--warn)",
  "retry":      "var(--accent2)",
};

export default function PoliciesTab() {
  const [policies, setPolicies] = useState(POLICIES);

  const toggleStatus = (id: number) => {
    setPolicies(p => p.map(x =>
      x.id === id
        ? { ...x, status: x.status === "active" ? "inactive" : "active" }
        : x
    ));
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Summary row */}
      <div className="stat-grid">
        <div className="stat-card accent">
          <div className="stat-label">Total Policies</div>
          <div className="stat-value" style={{ color: "var(--accent)" }}>{policies.length}</div>
          <div className="stat-sub">across all routes</div>
        </div>
        <div className="stat-card ok">
          <div className="stat-label">Active</div>
          <div className="stat-value" style={{ color: "var(--ok)" }}>
            {policies.filter(p => p.status === "active").length}
          </div>
          <div className="stat-sub">enforced at runtime</div>
        </div>
        <div className="stat-card warn">
          <div className="stat-label">Degraded</div>
          <div className="stat-value" style={{ color: "var(--warn)" }}>
            {policies.filter(p => p.status === "degraded").length}
          </div>
          <div className="stat-sub">partial enforcement</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-label">Inactive</div>
          <div className="stat-value" style={{ color: "#A78BFA" }}>
            {policies.filter(p => p.status === "inactive").length}
          </div>
          <div className="stat-sub">disabled / draft</div>
        </div>
      </div>

      {/* Policy table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Policy Registry — Runtime Enforced</span>
          <div className="flex gap-6">
            <button className="btn btn-ghost">Import Rules</button>
            <button className="btn btn-primary">+ New Policy</button>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Policy Name</th>
                <th>Type</th>
                <th>Target Route</th>
                <th>Rule</th>
                <th>Status</th>
                <th>Enabled</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {policies.map(p => (
                <tr key={p.id}>
                  <td style={{ color: "var(--muted)", fontSize: 10, textAlign: "center" }}>#{p.priority}</td>
                  <td style={{ fontSize: 11, fontWeight: 600 }}>{p.name}</td>
                  <td>
                    <span style={{
                      fontSize: 9, padding: "2px 7px", borderRadius: 2, fontWeight: 600,
                      letterSpacing: 0.5, border: `1px solid ${TYPE_COLORS[p.type]}40`,
                      background: `${TYPE_COLORS[p.type]}15`, color: TYPE_COLORS[p.type]
                    }}>
                      {p.type}
                    </span>
                  </td>
                  <td><code className="code-tag">{p.target}</code></td>
                  <td style={{ fontSize: 10, color: "var(--muted)" }}>{p.rule}</td>
                  <td>
                    <span className={`status-badge ${p.status === "active" ? "healthy" : p.status === "degraded" ? "degraded" : "down"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <div
                      className={`toggle ${p.status === "active" ? "on" : ""}`}
                      onClick={() => toggleStatus(p.id)}
                    />
                  </td>
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

      {/* Policy Plane Info */}
      <div className="section-row">
        <div className="card">
          <div className="card-header">
            <span className="card-title">⚙ Control Plane — Policy Lifecycle</span>
          </div>
          <div className="card-body">
            {[
              { step: "01", label: "Rule Composition",    desc: "Policies are authored and composed via the portal or imported as YAML/JSON rule sets." },
              { step: "02", label: "API Key Binding",     desc: "Policies are bound to API keys or route targets. Key lifecycle is managed centrally." },
              { step: "03", label: "Runtime Push",        desc: "Rules are pushed to the data plane at runtime — no gateway redeployment required." },
              { step: "04", label: "Policy Evaluation",   desc: "The data plane evaluates policies per-request: rate limits, auth, routing, and caching." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < 3 ? 14 : 0 }}>
                <div style={{
                  fontSize: 9, fontWeight: 800, color: "var(--accent)", width: 20,
                  flexShrink: 0, paddingTop: 1, fontFamily: "var(--sans)"
                }}>{item.step}</div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)", lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">◈ Data Plane — Request Flow</span>
          </div>
          <div className="card-body">
            {[
              { label: "Request Ingress",    sub: "Client request hits gateway entry point",   color: "var(--accent)"  },
              { label: "Policy Evaluation",  sub: "Auth → Rate Limit → IP Rules → Cache",      color: "var(--ok)"      },
              { label: "Route Resolution",   sub: "Match rule → resolve upstream target",       color: "#A78BFA"        },
              { label: "Upstream Proxy",     sub: "Forward to microservice, apply transforms",  color: "var(--warn)"    },
              { label: "Response Return",    sub: "Cache write → log → return to client",       color: "var(--accent2)" },
            ].map((item, i, arr) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < arr.length - 1 ? 10 : 0 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", background: item.color,
                  flexShrink: 0, marginTop: 3
                }} />
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: item.color }}>{item.label}</div>
                  <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 1 }}>{item.sub}</div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ position: "absolute", marginLeft: 3, marginTop: 14, fontSize: 8, color: "var(--muted2)" }}>↓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}