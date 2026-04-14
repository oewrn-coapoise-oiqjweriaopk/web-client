import { useMemo, useState } from "react";
import Toggle from "../components/shared/Toggle";
import type { PolicyRule, PolicyRuleRequest } from "../api/controlPlane";

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
  onCreate: (payload: PolicyRuleRequest) => Promise<void>;
  onUpdate: (id: number, payload: PolicyRuleRequest) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function getPolicyStatus(policy: PolicyRule) {
  return policy.enabled ? "active" : "inactive";
}

const EMPTY_POLICY_FORM: PolicyRuleRequest = {
  name: "",
  scope: "tenant",
  conditionExpression: "",
  action: "throttle",
  priority: 10,
  enabled: true,
  routePattern: "",
};

function mapPolicyToRequest(policy: PolicyRule): PolicyRuleRequest {
  return {
    name: policy.name,
    scope: policy.scope,
    conditionExpression: policy.conditionExpression,
    action: policy.action,
    priority: policy.priority,
    enabled: policy.enabled,
    routePattern: policy.routePattern,
  };
}

export default function PoliciesTab({ policies, onCreate, onUpdate, onDelete }: PoliciesTabProps) {
  const activePolicies = policies.filter((policy) => policy.enabled);
  const [showForm, setShowForm] = useState(false);
  const [editingPolicyId, setEditingPolicyId] = useState<number | null>(null);
  const [form, setForm] = useState<PolicyRuleRequest>(EMPTY_POLICY_FORM);
  const [saving, setSaving] = useState(false);
  const [busyPolicyId, setBusyPolicyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const sortedPolicies = useMemo(() => [...policies].sort((a, b) => a.priority - b.priority), [policies]);

  function openCreateForm() {
    setShowForm(true);
    setEditingPolicyId(null);
    setForm(EMPTY_POLICY_FORM);
    setError(null);
    setNotice(null);
  }

  function openEditForm(policy: PolicyRule) {
    setShowForm(true);
    setEditingPolicyId(policy.id);
    setForm(mapPolicyToRequest(policy));
    setError(null);
    setNotice(null);
  }

  function closeForm() {
    setShowForm(false);
    setEditingPolicyId(null);
    setForm(EMPTY_POLICY_FORM);
    setError(null);
  }

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      if (editingPolicyId === null) {
        await onCreate(form);
        setNotice("Policy created and pushed to the control plane.");
      } else {
        await onUpdate(editingPolicyId, form);
        setNotice("Policy updated and pushed to the control plane.");
      }
      closeForm();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save policy.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(policy: PolicyRule) {
    const confirmed = window.confirm(`Delete policy ${policy.name}?`);
    if (!confirmed) {
      return;
    }

    setBusyPolicyId(policy.id);
    setError(null);
    setNotice(null);

    try {
      await onDelete(policy.id);
      setNotice(`Deleted policy ${policy.name}.`);
      if (editingPolicyId === policy.id) {
        closeForm();
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete policy.");
    } finally {
      setBusyPolicyId(null);
    }
  }

  async function handleEnabledToggle(policy: PolicyRule, enabled: boolean) {
    setBusyPolicyId(policy.id);
    setError(null);
    setNotice(null);

    try {
      await onUpdate(policy.id, {
        ...mapPolicyToRequest(policy),
        enabled,
      });
      setNotice(`Policy ${policy.name} ${enabled ? "enabled" : "disabled"}.`);
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Failed to update policy.");
    } finally {
      setBusyPolicyId(null);
    }
  }

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {showForm && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">{editingPolicyId === null ? "Create Policy" : "Edit Policy"}</span>
            <button className="btn btn-ghost" onClick={closeForm}>Close</button>
          </div>
          <form className="card-body entity-form" onSubmit={submitForm}>
            <label className="field">
              <span className="field-label">Name</span>
              <input className="field-input" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            </label>
            <label className="field">
              <span className="field-label">Scope</span>
              <select className="field-input" value={form.scope} onChange={(event) => setForm((current) => ({ ...current, scope: event.target.value }))}>
                {["tenant", "auth", "cache", "block", "allowlist", "retry"].map((scope) => <option key={scope} value={scope}>{scope}</option>)}
              </select>
            </label>
            <label className="field field-span-2">
              <span className="field-label">Route Pattern</span>
              <input className="field-input" value={form.routePattern} onChange={(event) => setForm((current) => ({ ...current, routePattern: event.target.value }))} required />
            </label>
            <label className="field field-span-2">
              <span className="field-label">Condition</span>
              <input className="field-input" value={form.conditionExpression} onChange={(event) => setForm((current) => ({ ...current, conditionExpression: event.target.value }))} required />
            </label>
            <label className="field field-span-2">
              <span className="field-label">Action</span>
              <input className="field-input" value={form.action} onChange={(event) => setForm((current) => ({ ...current, action: event.target.value }))} required />
            </label>
            <label className="field">
              <span className="field-label">Priority</span>
              <input className="field-input" type="number" min="0" value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: Number(event.target.value) }))} required />
            </label>
            <label className="field-inline">
              <span className="field-label">Enabled</span>
              <Toggle on={form.enabled} onChange={(value) => setForm((current) => ({ ...current, enabled: value }))} />
            </label>
            {error && <div className="form-message error">{error}</div>}
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={closeForm} disabled={saving}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : editingPolicyId === null ? "Create Policy" : "Save Policy"}</button>
            </div>
          </form>
        </div>
      )}

      {(notice || error) && !showForm && (
        <div className="card">
          <div className="card-body" style={{ color: error ? "var(--error)" : "var(--ok)" }}>
            {error ?? notice}
          </div>
        </div>
      )}

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
          <div className="stat-value" style={{ color: "var(--accent3)" }}>
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
            <button className="btn btn-ghost" disabled>Import Rules</button>
            <button className="btn btn-primary" onClick={openCreateForm}>+ New Policy</button>
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
              {sortedPolicies.map(p => (
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
                    <Toggle on={p.enabled} disabled={busyPolicyId === p.id} onChange={(value) => void handleEnabledToggle(p, value)} />
                  </td>
                  <td>
                    <div className="flex gap-6">
                      <button className="btn btn-ghost" style={{ padding: "3px 8px" }} onClick={() => openEditForm(p)} disabled={busyPolicyId === p.id}>Edit</button>
                      <button className="btn btn-danger" style={{ padding: "3px 8px" }} onClick={() => void handleDelete(p)} disabled={busyPolicyId === p.id}>{busyPolicyId === p.id ? "..." : "✕"}</button>
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
