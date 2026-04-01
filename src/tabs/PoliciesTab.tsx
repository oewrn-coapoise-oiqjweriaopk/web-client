import type { PolicyRule } from "../api/controlPlane";

const TYPE_COLORS: Record<string, string> = {
  "rate-limit": "var(--accent)",
  "auth":       "var(--ok)",
  "cache":      "var(--accent3)",
  "block":      "var(--error)",
  "allowlist":  "var(--warn)",
  "retry":      "var(--accent2)",
};

interface PoliciesTabProps {
  policies: PolicyRule[];
}

function getPolicyStatus(policy: PolicyRule) {
  return policy.enabled ? "active" : "inactive";
}

export default function PoliciesTab({ policies }: PoliciesTabProps) {
  const activePolicies = policies.filter((policy) => policy.enabled);

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
            {activePolicies.length}
          </div>
          <div className="stat-sub">enforced at runtime</div>
        </div>
        <div className="stat-card warn">
          <div className="stat-label">Disabled</div>
          <div className="stat-value" style={{ color: "var(--warn)" }}>
            {policies.length - activePolicies.length}
          </div>
          <div className="stat-sub">not pushed to runtime</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-label">Scopes</div>
          <div className="stat-value" style={{ color: "#A78BFA" }}>
            {new Set(policies.map((policy) => policy.scope)).size}
          </div>
          <div className="stat-sub">targeting dimensions</div>
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
                <th>Scope</th>
                <th>Target Route</th>
                <th>Condition</th>
                <th>Action</th>
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
                      letterSpacing: 0.5, border: `1px solid ${(TYPE_COLORS[p.scope] ?? "var(--accent)") }40`,
                      background: `${TYPE_COLORS[p.scope] ?? "var(--accent)"}15`, color: TYPE_COLORS[p.scope] ?? "var(--accent)"
                    }}>
                      {p.scope}
                    </span>
                  </td>
                  <td><code className="code-tag">{p.routePattern}</code></td>
                  <td style={{ fontSize: 10, color: "var(--muted)" }}>{p.conditionExpression}</td>
                  <td style={{ fontSize: 10, color: "var(--text)" }}>{p.action}</td>
                  <td>
                    <span className={`status-badge ${p.enabled ? "healthy" : "down"}`}>
                      {getPolicyStatus(p)}
                    </span>
                  </td>
                  <td>
                    <div className={`toggle ${p.enabled ? "on" : ""}`} />
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
              { label: "Route Resolution",   sub: "Match rule → resolve upstream target",       color: "var(--accent3)" },
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
