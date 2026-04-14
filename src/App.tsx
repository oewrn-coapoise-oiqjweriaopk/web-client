import { useState, useEffect } from "react";
import { CSS } from "./styles/globalStyles";
import {
  createPolicy,
  createRoute,
  deletePolicy,
  deleteRoute,
  fetchControlPlaneSnapshot,
  fetchMetrics,
  updatePolicy,
  updateRoute,
  type AdminUser,
  type GatewayNode,
  type LogEntry,
  type MetricsResponse,
  type OverviewResponse,
  type PolicyRule,
  type PolicyRuleRequest,
  type RouteConfig,
  type RouteRequest,
} from "./api/controlPlane";
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

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function mergeNodesWithMetrics(nodes: GatewayNode[], metrics: MetricsResponse[]): GatewayNode[] {
  if (metrics.length === 0) {
    return nodes;
  }

  const nodesById = new Map(nodes.map((node) => [node.nodeId, node]));
  return metrics.map((metric, index) => {
    const existingNode = nodesById.get(metric.nodeId);
    return {
      id: existingNode?.id ?? -(index + 1),
      nodeId: metric.nodeId,
      region: existingNode?.region ?? "runtime",
      status: "ok",
      cpuUsage: clampPercent(metric.cpuUsagePercent),
      memoryUsage: existingNode?.memoryUsage ?? 0,
      activeConnections: existingNode?.activeConnections ?? 0,
      lastHeartbeatAt: new Date(metric.lastUpdated).toISOString(),
    };
  });
}

export default function App() {
  const [tab, setTab] = useState("overview");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [routes, setRoutes] = useState<RouteConfig[]>([]);
  const [policies, setPolicies] = useState<PolicyRule[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [nodes, setNodes] = useState<GatewayNode[]>([]);
  const [rpsData, setRpsData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(true);

  async function loadSnapshot(cancelled = false) {
    try {
      const [snapshot, metrics] = await Promise.all([
        fetchControlPlaneSnapshot(),
        fetchMetrics(),
      ]);
      
      if (cancelled) {
        return;
      }
      
      setLogs(snapshot.overview.recentLogs || []);
      setRoutes(snapshot.routes);
      setPolicies(snapshot.policies);
      setUsers(snapshot.users);
      setNodes(mergeNodesWithMetrics(snapshot.nodes, metrics));

      const averageCpuFromMetrics = metrics.length > 0
        ? metrics.reduce((sum, metric) => sum + metric.cpuUsagePercent, 0) / metrics.length
        : snapshot.overview.averageNodeCpu;
      setOverview({
        ...snapshot.overview,
        averageNodeCpu: averageCpuFromMetrics,
        onlineNodes: metrics.length > 0 ? metrics.length : snapshot.overview.onlineNodes,
      });
      
      // Extract RPS data from metrics and accumulate it
      setRpsData((prevRps) => {
        const latestRps = metrics.reduce((sum, metric) => sum + metric.requestsPerSecond, 0);
        const newData = [...prevRps, Math.round(latestRps)];
        // Keep last 100 data points
        return newData.slice(-100);
      });
      
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
    // Poll every 5 seconds for metrics (faster than the 15 second overview poll)
    const pollId = setInterval(() => {
      void loadSnapshot(cancelled);
    }, 5000);

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

  async function handleRouteCreate(payload: RouteRequest) {
    await createRoute(payload);
    await loadSnapshot();
  }

  async function handleRouteUpdate(id: number, payload: RouteRequest) {
    await updateRoute(id, payload);
    await loadSnapshot();
  }

  async function handleRouteDelete(id: number) {
    await deleteRoute(id);
    await loadSnapshot();
  }

  async function handlePolicyCreate(payload: PolicyRuleRequest) {
    await createPolicy(payload);
    await loadSnapshot();
  }

  async function handlePolicyUpdate(id: number, payload: PolicyRuleRequest) {
    await updatePolicy(id, payload);
    await loadSnapshot();
  }

  async function handlePolicyDelete(id: number) {
    await deletePolicy(id);
    await loadSnapshot();
  }

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
            {tab === "routes"    && (
              <RoutesTab
                routes={routes}
                onCreate={handleRouteCreate}
                onUpdate={handleRouteUpdate}
                onDelete={handleRouteDelete}
              />
            )}
            {tab === "policies"  && (
              <PoliciesTab
                policies={policies}
                onCreate={handlePolicyCreate}
                onUpdate={handlePolicyUpdate}
                onDelete={handlePolicyDelete}
              />
            )}
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
