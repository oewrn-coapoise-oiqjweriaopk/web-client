import { useEffect, useRef, useState } from "react";
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

interface ChartBar {
  id: number;
  value: number;
}

const VISIBLE_RPS_BARS = 30;
const CHART_BAR_WIDTH = 9;
const CHART_BAR_GAP = 1;
const CHART_SLOT_WIDTH = CHART_BAR_WIDTH + CHART_BAR_GAP;
const CHART_HEIGHT = 80;
const CHART_WIDTH = VISIBLE_RPS_BARS * CHART_SLOT_WIDTH - CHART_BAR_GAP;

export default function OverviewTab({ logs, rpsData, overview, routes, nodes }: OverviewTabProps) {
  const logStreamRef = useRef<HTMLDivElement | null>(null);
  const chartAnimationRef = useRef<number | null>(null);
  const chartFrameRef = useRef<number | null>(null);
  const nextChartBarIdRef = useRef(rpsData.length);
  const [chartBars, setChartBars] = useState<ChartBar[]>(() =>
    rpsData.slice(-VISIBLE_RPS_BARS).map((value, index) => ({ id: index, value })),
  );
  const [transitionBars, setTransitionBars] = useState<ChartBar[] | null>(null);
  const [chartSlidePhase, setChartSlidePhase] = useState<"idle" | "primed" | "sliding">("idle");
  const totalRPS = rpsData[rpsData.length - 1] ?? 0;
  const healthyNodes = overview?.onlineNodes ?? nodes.filter((node) => node.status === "ok").length;
  const avgCpu = Math.round(overview?.averageNodeCpu ?? 0);
  const totalRoutes = overview?.totalRoutes ?? routes.length;
  const routeAlerts = Math.max(0, totalRoutes - (overview?.healthyRoutes ?? 0));
  const unhealthyNodes = Math.max(0, nodes.length - healthyNodes);

  useEffect(() => {
    const logStream = logStreamRef.current;
    if (!logStream) {
      return;
    }

    logStream.scrollTop = logStream.scrollHeight;
  }, [logs]);

  useEffect(() => {
    if (chartSlidePhase !== "idle") {
      return;
    }

    const nextVisibleValues = rpsData.slice(-VISIBLE_RPS_BARS);
    const previousValues = chartBars.map((bar) => bar.value);
    const sameSeries =
      previousValues.length === nextVisibleValues.length
      && previousValues.every((value, index) => value === nextVisibleValues[index]);

    if (sameSeries) {
      return;
    }

    if (chartAnimationRef.current !== null) {
      window.clearTimeout(chartAnimationRef.current);
      chartAnimationRef.current = null;
    }

    if (chartFrameRef.current !== null) {
      window.cancelAnimationFrame(chartFrameRef.current);
      chartFrameRef.current = null;
    }

    if (chartBars.length === 0 || nextVisibleValues.length <= 1) {
      setChartBars(nextVisibleValues.map((value) => ({ id: nextChartBarIdRef.current++, value })));
      setTransitionBars(null);
      setChartSlidePhase("idle");
      return;
    }

    const incomingBar = { id: nextChartBarIdRef.current++, value: nextVisibleValues[nextVisibleValues.length - 1] };
    const nextTransitionBars = [...chartBars, incomingBar];
    const nextStableBars = [...chartBars.slice(1), incomingBar];

    setTransitionBars(nextTransitionBars);
    setChartSlidePhase("primed");

    chartFrameRef.current = window.requestAnimationFrame(() => {
      chartFrameRef.current = window.requestAnimationFrame(() => {
        setChartSlidePhase("sliding");
        chartFrameRef.current = null;
      });
    });

    chartAnimationRef.current = window.setTimeout(() => {
      setChartBars(nextStableBars);
      setTransitionBars(null);
      setChartSlidePhase("idle");
      chartAnimationRef.current = null;
    }, 320);
  }, [chartBars, chartSlidePhase, rpsData]);

  useEffect(() => () => {
    if (chartAnimationRef.current !== null) {
      window.clearTimeout(chartAnimationRef.current);
    }

    if (chartFrameRef.current !== null) {
      window.cancelAnimationFrame(chartFrameRef.current);
    }
  }, []);

  const renderedBars = transitionBars ?? chartBars;
  const chartMax = Math.max(
    ...renderedBars.map((bar) => bar.value),
    1,
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
            <div className="bar-window">
              <svg
                className="rps-chart"
                viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                preserveAspectRatio="none"
                aria-label="Request volume chart"
              >
                <g
                  className={`rps-chart-track ${chartSlidePhase === "sliding" ? "sliding" : ""}`}
                  style={{
                    transform: chartSlidePhase === "sliding"
                      ? `translateX(-${CHART_SLOT_WIDTH}px)`
                      : "translateX(0px)",
                  }}
                >
                  {renderedBars.map((bar, i) => {
                    const barHeight = Math.max(8, (bar.value / chartMax) * CHART_HEIGHT);
                    const x = i * CHART_SLOT_WIDTH;
                    const y = CHART_HEIGHT - barHeight;
                    const isLatestStableBar = chartSlidePhase === "idle" && i === renderedBars.length - 1;

                    return (
                      <rect
                        key={bar.id}
                        x={x}
                        y={y}
                        width={CHART_BAR_WIDTH}
                        height={barHeight}
                        rx={2}
                        ry={2}
                        className={isLatestStableBar ? "rps-bar latest" : "rps-bar"}
                      />
                    );
                  })}
                </g>
              </svg>
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
          <div ref={logStreamRef} className="log-stream">
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
