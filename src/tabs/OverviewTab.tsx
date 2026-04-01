import type { GatewayNode, OverviewResponse, RouteConfig } from "../api/controlPlane";

interface Log {
  id: number;
  time: string;
  level: string;
  msg: string;
}

interface OverviewTabProps {
  logs: Log[];
  rpsData: number[];
  overview: OverviewResponse | null;
  routes: RouteConfig[];
  nodes: GatewayNode[];
}

export default function OverviewTab({ logs, rpsData, overview, routes, nodes }: OverviewTabProps) {
  const totalRPS = rpsData[rpsData.length - 1] ?? 0;
  const healthyNodes = overview?.onlineNodes ?? nodes.filter((node) => node.status === "ok").length;
  const avgCpu = Math.round(overview?.averageNodeCpu ?? 0);
  const totalRoutes = overview?.totalRoutes ?? routes.length;
  const routeAlerts = Math.max(0, totalRoutes - (overview?.healthyRoutes ?? 0));
  const unhealthyNodes = Math.max(0, nodes.length - healthyNodes);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }} className="fade-in">
      {/* KPI row */}
      <div className="stat-grid">
        <div className="stat-card accent">
          <div className="stat-label">Total RPS</div>
          <div className="stat-value" style={{ color: "var(--accent)" }}>{totalRPS.toLocaleString()}</div>
          <div className="stat-delta up">▲ 8.2% vs 1h ago</div>
        </div>
        <div className="stat-card ok">
          <div className="stat-label">Avg Node CPU</div>
          <div className="stat-value" style={{ color: "var(--ok)" }}>{avgCpu}<span style={{ fontSize: 14, color: "var(--muted)" }}>%</span></div>
          <div className="stat-delta up">control-plane reported</div>
        </div>
        <div className="stat-card warn">
          <div className="stat-label">Active Nodes</div>
          <div className="stat-value" style={{ color: "var(--warn)" }}>{healthyNodes}<span style={{ fontSize: 14, color: "var(--muted)" }}>/{nodes.length}</span></div>
          <div className="stat-delta down">{unhealthyNodes} node{unhealthyNodes === 1 ? "" : "s"} need attention</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-label">Active Routes</div>
          <div className="stat-value" style={{ color: "var(--accent3)" }}>{totalRoutes}<span style={{ fontSize: 14, color: "var(--muted)" }}> cfg</span></div>
          <div className="stat-delta down" style={{ color: routeAlerts > 0 ? "var(--error)" : "var(--ok)" }}>
            {routeAlerts} route{routeAlerts === 1 ? "" : "s"} degraded
          </div>
        </div>
      </div>

      {/* Middle row */}
      <div className="section-row">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Request Volume — 30s window</span>
            <span className="text-muted">{rpsData[rpsData.length-1]} RPS</span>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 80 }}>
              {rpsData.map((v, i) => {
                const max = Math.max(...rpsData, 1);
                return (
                  <div key={i} style={{
                    flex: 1,
                    height: `${Math.max(8, (v / max) * 100)}%`,
                    background: i === rpsData.length - 1 ? "var(--accent)" : "var(--border2)",
                    borderRadius: "2px 2px 0 0",
                    transition: "height 0.3s",
                  }} />
                );
              })}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Node Mesh</span>
            <span className="text-muted">{healthyNodes} healthy</span>
          </div>
          <div className="card-body">
            <div className="node-grid">
              {nodes.map(n => (
                <div key={n.nodeId} className={`node-chip ${n.status}`}>
                  <div className={`dot ${n.status === "ok" ? "" : n.status}`} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 10 }}>{n.nodeId}</div>
                    <div style={{ color: "var(--muted)", fontSize: 9 }}>{n.region}</div>
                  </div>
                  {n.status !== "error" && (
                    <div style={{ marginLeft: "auto", textAlign: "right" }}>
                      <div style={{ fontSize: 9, color: n.cpuUsage > 60 ? "var(--warn)" : "var(--muted)" }}>CPU {n.cpuUsage}%</div>
                      <div style={{ fontSize: 9, color: "var(--muted)" }}>{n.activeConnections.toLocaleString()} conn</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Log stream */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Live Log Stream</span>
          <div className="flex items-center gap-6">
            <span className="ws-blink" style={{ fontSize: 9, color: "var(--ok)" }}>● LIVE</span>
            <span className="text-muted">control-plane activity stream</span>
          </div>
        </div>
        <div className="card-body">
          <div className="log-stream">
            {logs.slice(-14).map((l, i) => (
              <div key={l.id} className={`log-line ${i === logs.slice(-14).length - 1 ? "log-new" : ""}`}>
                <span className="log-time">{l.time}</span>
                <span className={`log-level ${l.level}`}>{l.level}</span>
                <span className="log-msg">{l.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
