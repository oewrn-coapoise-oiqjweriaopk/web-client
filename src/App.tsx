import { useState, useEffect, useRef } from "react";
import { CSS } from "./styles/globalStyles";
import { fetchControlPlaneSnapshot, type GatewayNode, type OverviewResponse, type PolicyRule, type RouteConfig, type AdminUser } from "./api/controlPlane";
import { INIT_LOGS, LOG_POOL } from "./data/mockData";
import Topbar from "./components/layout/Topbar";
import Sidebar from "./components/layout/Sidebar";
import OverviewTab from "./tabs/OverviewTab";
import RoutesTab from "./tabs/RoutesTab";
import ArchitectureTab from "./tabs/ArchitectureTab";
import UsersTab from "./tabs/UsersTab";
import PoliciesTab from "./tabs/PoliciesTab";

const nav = [
  { id: "overview",  label: "Overview"      },
  { id: "routes",    label: "Routes"        },
  { id: "nodes",     label: "Nodes"         },
  { id: "policies",  label: "Policy Rules"  },
  { id: "arch",      label: "Architecture"  },
  { id: "users",     label: "Users & RBAC"  },
];

export default function App() {
  const [tab, setTab] = useState("overview");
  const [logs, setLogs] = useState(INIT_LOGS);
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [routes, setRoutes] = useState<RouteConfig[]>([]);
  const [policies, setPolicies] = useState<PolicyRule[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [nodes, setNodes] = useState<GatewayNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rpsData, setRpsData] = useState(() =>
    Array.from({ length: 31 }, () => 1200 + Math.floor(Math.random() * 400))
  );
  const [wsConnected, setWsConnected] = useState(true);
  const logIdRef = useRef(100);

  async function loadSnapshot(cancelled = false) {
    try {
      const snapshot = await fetchControlPlaneSnapshot();
      if (cancelled) {
        return;
      }
      setOverview(snapshot.overview);
      setRoutes(snapshot.routes);
      setPolicies(snapshot.policies);
      setUsers(snapshot.users);
      setNodes(snapshot.nodes);
      setError(null);
      setWsConnected(true);
    } catch (loadError) {
      if (cancelled) {
        return;
      }
      setError(loadError instanceof Error ? loadError.message : "Failed to load control-plane data");
      setWsConnected(false);
    } finally {
      if (!cancelled) {
        setLoading(false);
        setRetrying(false);
      }
    }
  }

  useEffect(() => {
    let cancelled = false;

    void loadSnapshot(cancelled);
    const pollId = setInterval(() => {
      void loadSnapshot(cancelled);
    }, 15000);

    return () => {
      cancelled = true;
      clearInterval(pollId);
    };
  }, []);

  function handleRetry() {
    setRetrying(true);
    setLoading(true);
    setError(null);
    void loadSnapshot();
  }

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      const entry = LOG_POOL[Math.floor(Math.random() * LOG_POOL.length)];
      setLogs(prev => [...prev.slice(-40), { ...entry, id: logIdRef.current++, time: `${h}:${m}:${s}` }]);
      setRpsData(prev => [...prev.slice(-30), 1100 + Math.floor(Math.random() * 500)]);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div className="shell">
        <Topbar overview={overview} routes={routes} nodes={nodes} />
        <div className="body">
          <Sidebar
            tab={tab}
            setTab={setTab}
            wsConnected={wsConnected}
            overview={overview}
            routes={routes}
            nodes={nodes}
            users={users}
          />
          <div className="main">

            {/* Breadcrumb */}
            <div className="flex items-center gap-6" style={{ marginBottom: -4 }}>
              <span style={{ fontSize: 9, color: "var(--muted2)", letterSpacing: 1, textTransform: "uppercase" }}>
                APIGW / {nav.find(n => n.id === tab)?.label ?? tab}
              </span>
              {tab === "routes"   && <span className="text-muted" style={{ marginLeft: 4 }}>— runtime-configurable, zero-downtime</span>}
              {tab === "policies" && <span className="text-muted" style={{ marginLeft: 4 }}>— data-driven policy enforcement, no redeploy</span>}
              {tab === "arch"     && <span className="text-muted" style={{ marginLeft: 4 }}>— control plane / data plane separation</span>}
            </div>

            {error && (
              <div className="card" style={{ marginBottom: 16 }}>
                <div
                  className="card-body"
                  style={{ color: "var(--error)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
                >
                  <span>Control plane unavailable: {error}</span>
                  <button
                    className="btn btn-primary"
                    style={{ borderRadius: 0, flexShrink: 0 }}
                    onClick={handleRetry}
                    disabled={retrying}
                  >
                    {retrying ? "Retrying..." : "Retry"}
                  </button>
                </div>
              </div>
            )}

            {loading && (
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-body">Syncing control-plane data...</div>
              </div>
            )}

            {tab === "overview"  && <OverviewTab logs={logs} rpsData={rpsData} overview={overview} routes={routes} nodes={nodes} />}
            {tab === "routes"    && <RoutesTab routes={routes} />}
            {tab === "policies"  && <PoliciesTab policies={policies} />}
            {tab === "arch"      && <ArchitectureTab />}
            {tab === "users"     && <UsersTab users={users} />}

            {tab === "nodes" && (
              <div className="fade-in">
                <div className="stat-grid">
                  {nodes.map(n => (
                    <div key={n.nodeId} className={`stat-card ${n.status === "ok" ? "ok" : n.status === "warn" ? "warn" : "accent"}`}>
                      <div className="stat-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div className={`dot ${n.status === "ok" ? "" : n.status}`} />
                        {n.nodeId} — {n.region}
                      </div>
                      {n.status !== "error" ? (
                        <>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                            <div>
                              <div style={{ fontSize: 9, color: "var(--muted)", marginBottom: 3 }}>CPU</div>
                              <div className="progress">
                                <div className={`progress-fill ${n.cpuUsage > 60 ? "warn" : "ok"}`} style={{ width: `${n.cpuUsage}%` }} />
                              </div>
                              <div style={{ fontSize: 10, marginTop: 3 }}>{n.cpuUsage}%</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 9, color: "var(--muted)", marginBottom: 3 }}>MEM</div>
                              <div className="progress">
                                <div className={`progress-fill ${n.memoryUsage > 70 ? "warn" : "accent"}`} style={{ width: `${n.memoryUsage}%` }} />
                              </div>
                              <div style={{ fontSize: 10, marginTop: 3 }}>{n.memoryUsage}%</div>
                            </div>
                          </div>
                          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 8 }}>{n.activeConnections.toLocaleString()} connections</div>
                        </>
                      ) : (
                        <div style={{ marginTop: 12, fontSize: 11, color: "var(--error)" }}>NODE UNREACHABLE</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
