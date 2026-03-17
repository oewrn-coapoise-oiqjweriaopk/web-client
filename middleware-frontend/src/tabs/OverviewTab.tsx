import { ROUTES, NODES } from "../data/mockData";
import Sparkline from "../components/shared/Sparkline";

interface Log {
  id: number;
  time: string;
  level: string;
  msg: string;
}

interface OverviewTabProps {
  logs: Log[];
  rpsData: number[];
}

export default function OverviewTab({ logs, rpsData }: OverviewTabProps) {
  const totalRPS = ROUTES.reduce((a, r) => a + r.rps, 0);
  const healthyNodes = NODES.filter(n => n.status === "ok").length;
  const avgLatency = Math.round(
    ROUTES.filter(r => r.latency > 0).reduce((a, r) => a + r.latency, 0) /
    ROUTES.filter(r => r.latency > 0).length
  );

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
          <div className="stat-label">Avg Latency</div>
          <div className="stat-value" style={{ color: "var(--ok)" }}>{avgLatency}<span style={{ fontSize: 14, color: "var(--muted)" }}>ms</span></div>
          <div className="stat-delta up">▼ 3ms improvement</div>
        </div>
        <div className="stat-card warn">
          <div className="stat-label">Active Nodes</div>
          <div className="stat-value" style={{ color: "var(--warn)" }}>{healthyNodes}<span style={{ fontSize: 14, color: "var(--muted)" }}>/{NODES.length}</span></div>
          <div className="stat-delta down">1 node unreachable</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-label">Active Routes</div>
          <div className="stat-value" style={{ color: "#A78BFA" }}>{ROUTES.length}<span style={{ fontSize: 14, color: "var(--muted)" }}> cfg</span></div>
          <div className="stat-delta down" style={{ color: "var(--error)" }}>1 route down</div>
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
            <span className="text-muted">{NODES.filter(n=>n.status==="ok").length} healthy</span>
          </div>
          <div className="card-body">
            <div className="node-grid">
              {NODES.map(n => (
                <div key={n.id} className={`node-chip ${n.status}`}>
                  <div className={`dot ${n.status === "ok" ? "" : n.status}`} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 10 }}>{n.id}</div>
                    <div style={{ color: "var(--muted)", fontSize: 9 }}>{n.region}</div>
                  </div>
                  {n.status !== "error" && (
                    <div style={{ marginLeft: "auto", textAlign: "right" }}>
                      <div style={{ fontSize: 9, color: n.cpu > 60 ? "var(--warn)" : "var(--muted)" }}>CPU {n.cpu}%</div>
                      <div style={{ fontSize: 9, color: "var(--muted)" }}>{n.conns.toLocaleString()} conn</div>
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
            <span className="text-muted">WebSocket /api/v2/metrics/stream</span>
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