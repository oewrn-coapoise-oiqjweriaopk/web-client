import { NODES, ROUTES } from "../../data/mockData";

export default function Topbar() {
  const alertCount = ROUTES.filter(r => r.status !== "healthy").length + NODES.filter(n => n.status !== "ok").length;

  return (
    <div className="topbar">
      <div className="logo">APIGW<span>/portal</span></div>
      <div className="topbar-divider" />
      <div className="status-pill"><div className="dot" /> Gateway Cluster Online</div>
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
        <span className="text-muted" style={{ fontSize: 10 }}>v2.14.1</span>
        <div className="badge">ADMIN</div>
        <div className="avatar">PM</div>
      </div>
    </div>
  );
}