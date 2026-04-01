import type { GatewayNode, OverviewResponse, RouteConfig } from "../../api/controlPlane";

interface TopbarProps {
  overview: OverviewResponse | null;
  routes: RouteConfig[];
  nodes: GatewayNode[];
}

export default function Topbar({ overview, routes, nodes }: TopbarProps) {
  const alertCount = routes.filter((route) => route.status !== "healthy").length
    + nodes.filter((node) => node.status !== "ok").length;
  const clusterOnline = nodes.length > 0 && nodes.every((node) => node.status !== "error");

  return (
    <div className="topbar">
      <div className="logo">APIGW<span>/control-plane</span></div>
      <div className="topbar-divider" />
      <div className="status-pill"><div className={`dot ${clusterOnline ? "" : "warn"}`} /> {clusterOnline ? "Gateway Cluster Online" : "Gateway Cluster Degraded"}</div>
      <div className="topbar-divider" />
      <div className="env-tag">AWS · us-east-1</div>
      <div className="topbar-divider" />
      <div className="env-tag" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>PRODUCTION</div>
      <div className="topbar-divider" />
      <div className="status-pill">
        <div className="dot warn" />
        <span>{alertCount} alerts</span>
      </div>
      <div className="topbar-right">
        <span className="text-muted" style={{ fontSize: 10 }}>
          {overview ? `${overview.activeApiKeys} active keys` : "syncing"}
        </span>
        <div className="badge">ADMIN</div>
        <div className="avatar">PM</div>
      </div>
    </div>
  );
}
