import { useMemo, useState } from "react";
import type { RouteConfig, RouteRequest } from "../api/controlPlane";
import Sparkline from "../components/shared/Sparkline";
import Toggle from "../components/shared/Toggle";

interface RoutesTabProps {
  routes: RouteConfig[];
  onCreate: (payload: RouteRequest) => Promise<void>;
  onUpdate: (id: number, payload: RouteRequest) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const EMPTY_ROUTE_FORM: RouteRequest = {
  name: "",
  method: "GET",
  pathPattern: "",
  upstreamUrl: "",
  requiresAuth: true,
  cacheEnabled: false,
  rateLimitPerMinute: 100,
  status: "healthy",
  timeoutMillis: 2000,
  stripPrefix: "/api",
};

function mapRouteToRequest(route: RouteConfig): RouteRequest {
  return {
    name: route.name,
    method: route.method,
    pathPattern: route.pathPattern,
    upstreamUrl: route.upstreamUrl,
    requiresAuth: route.requiresAuth,
    cacheEnabled: route.cacheEnabled,
    rateLimitPerMinute: route.rateLimitPerMinute,
    status: route.status,
    timeoutMillis: route.timeoutMillis,
    stripPrefix: route.stripPrefix,
  };
}

export default function RoutesTab({ routes, onCreate, onUpdate, onDelete }: RoutesTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingRouteId, setEditingRouteId] = useState<number | null>(null);
  const [form, setForm] = useState<RouteRequest>(EMPTY_ROUTE_FORM);
  const [saving, setSaving] = useState(false);
  const [busyRouteId, setBusyRouteId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const sortedRoutes = useMemo(() => [...routes].sort((a, b) => a.pathPattern.localeCompare(b.pathPattern)), [routes]);

  function openCreateForm() {
    setShowForm(true);
    setEditingRouteId(null);
    setForm(EMPTY_ROUTE_FORM);
    setError(null);
    setNotice(null);
  }

  function openEditForm(route: RouteConfig) {
    setShowForm(true);
    setEditingRouteId(route.id);
    setForm(mapRouteToRequest(route));
    setError(null);
    setNotice(null);
  }

  function closeForm() {
    setShowForm(false);
    setEditingRouteId(null);
    setForm(EMPTY_ROUTE_FORM);
    setError(null);
  }

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      if (editingRouteId === null) {
        await onCreate(form);
        setNotice("Route created and synced to the control plane.");
      } else {
        await onUpdate(editingRouteId, form);
        setNotice("Route updated and synced to the control plane.");
      }
      closeForm();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save route.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(route: RouteConfig) {
    const confirmed = window.confirm(`Delete route ${route.pathPattern}?`);
    if (!confirmed) {
      return;
    }

    setBusyRouteId(route.id);
    setError(null);
    setNotice(null);

    try {
      await onDelete(route.id);
      setNotice(`Deleted route ${route.pathPattern}.`);
      if (editingRouteId === route.id) {
        closeForm();
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete route.");
    } finally {
      setBusyRouteId(null);
    }
  }

  async function handleToggle(route: RouteConfig, field: "requiresAuth" | "cacheEnabled", value: boolean) {
    setBusyRouteId(route.id);
    setError(null);
    setNotice(null);

    try {
      await onUpdate(route.id, {
        ...mapRouteToRequest(route),
        [field]: value,
      });
      setNotice(`Updated ${field === "requiresAuth" ? "authentication" : "cache"} for ${route.pathPattern}.`);
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Failed to update route toggle.");
    } finally {
      setBusyRouteId(null);
    }
  }

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {showForm && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">{editingRouteId === null ? "Create Route" : "Edit Route"}</span>
            <button className="btn btn-ghost" onClick={closeForm}>Close</button>
          </div>
          <form className="card-body entity-form" onSubmit={submitForm}>
            <label className="field">
              <span className="field-label">Name</span>
              <input className="field-input" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            </label>
            <label className="field">
              <span className="field-label">Method</span>
              <select className="field-input" value={form.method} onChange={(event) => setForm((current) => ({ ...current, method: event.target.value }))}>
                {["GET", "POST", "PUT", "PATCH", "DELETE"].map((method) => <option key={method} value={method}>{method}</option>)}
              </select>
            </label>
            <label className="field field-span-2">
              <span className="field-label">Path Pattern</span>
              <input className="field-input" value={form.pathPattern} onChange={(event) => setForm((current) => ({ ...current, pathPattern: event.target.value }))} required />
            </label>
            <label className="field field-span-2">
              <span className="field-label">Upstream URL</span>
              <input className="field-input" value={form.upstreamUrl} onChange={(event) => setForm((current) => ({ ...current, upstreamUrl: event.target.value }))} required />
            </label>
            <label className="field">
              <span className="field-label">Rate Limit / min</span>
              <input className="field-input" type="number" min="0" value={form.rateLimitPerMinute} onChange={(event) => setForm((current) => ({ ...current, rateLimitPerMinute: Number(event.target.value) }))} required />
            </label>
            <label className="field">
              <span className="field-label">Timeout ms</span>
              <input className="field-input" type="number" min="1" value={form.timeoutMillis} onChange={(event) => setForm((current) => ({ ...current, timeoutMillis: Number(event.target.value) }))} required />
            </label>
            <label className="field">
              <span className="field-label">Status</span>
              <select className="field-input" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                {["healthy", "degraded", "down"].map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Strip Prefix</span>
              <input className="field-input" value={form.stripPrefix} onChange={(event) => setForm((current) => ({ ...current, stripPrefix: event.target.value }))} required />
            </label>
            <label className="field-inline">
              <span className="field-label">Requires Auth</span>
              <Toggle on={form.requiresAuth} onChange={(value) => setForm((current) => ({ ...current, requiresAuth: value }))} />
            </label>
            <label className="field-inline">
              <span className="field-label">Cache Enabled</span>
              <Toggle on={form.cacheEnabled} onChange={(value) => setForm((current) => ({ ...current, cacheEnabled: value }))} />
            </label>
            {error && <div className="form-message error">{error}</div>}
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={closeForm} disabled={saving}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : editingRouteId === null ? "Create Route" : "Save Route"}</button>
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

      <div className="card">
        <div className="card-header">
          <span className="card-title">Route Registry — {routes.length} entries</span>
          <div className="flex gap-6">
            <button className="btn btn-ghost" disabled>Import YAML</button>
            <button className="btn btn-primary" onClick={openCreateForm}>+ Add Route</button>
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
              {sortedRoutes.map(r => (
                <tr key={r.id}>
                  <td><span className={`method ${r.method}`}>{r.method}</span></td>
                  <td><span className="route-path">{r.pathPattern}</span></td>
                  <td><code className="code-tag">{r.upstreamUrl}</code></td>
                  <td style={{ color: "var(--muted)", fontSize: 10 }}>{r.rateLimitPerMinute}/min</td>
                  <td><Toggle on={r.requiresAuth} disabled={busyRouteId === r.id} onChange={(value) => void handleToggle(r, "requiresAuth", value)} /></td>
                  <td><Toggle on={r.cacheEnabled} disabled={busyRouteId === r.id} onChange={(value) => void handleToggle(r, "cacheEnabled", value)} /></td>
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
                      <button className="btn btn-ghost" style={{ padding: "3px 8px" }} onClick={() => openEditForm(r)} disabled={busyRouteId === r.id}>Edit</button>
                      <button className="btn btn-danger" style={{ padding: "3px 8px" }} onClick={() => void handleDelete(r)} disabled={busyRouteId === r.id}>{busyRouteId === r.id ? "..." : "✕"}</button>
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
