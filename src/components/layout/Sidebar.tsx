import type { AdminUser, GatewayNode, OverviewResponse, RouteConfig } from "../../api/controlPlane";

interface SidebarProps {
  tab: string;
  setTab: (tab: string) => void;
  wsConnected: boolean;
  overview: OverviewResponse | null;
  routes: RouteConfig[];
  nodes: GatewayNode[];
  users: AdminUser[];
}

const systemNav = [
  { id: "config",   label: "Runtime Config", icon: "◎" },
  { id: "plugins",  label: "Plugins",        icon: "⊕" },
  { id: "audit",    label: "Audit Log",      icon: "≡" },
  { id: "settings", label: "Settings",       icon: "⚙" },
];

export default function Sidebar({ tab, setTab, wsConnected, overview, routes, nodes, users }: SidebarProps) {
  const dataPlaneNav = [
    { id: "overview", label: "Overview", icon: "◈", count: null },
    { id: "routes", label: "Routes", icon: "⇄", count: routes.length },
    { id: "nodes", label: "Nodes", icon: "◉", count: `${nodes.filter((node) => node.status === "ok").length}/${nodes.length}` },
  ];

  const controlPlaneNav = [
    { id: "policies", label: "Policy Rules", icon: "⚑", count: overview?.activePolicies ?? null },
    { id: "users", label: "Users & RBAC", icon: "⊿", count: users.length },
    { id: "arch", label: "Architecture", icon: "⊞", count: null },
  ];

  return (
    <div className="sidebar">
      <div style={{ height: 16 }} />

      {/* DATA PLANE */}
      <div className="nav-section">Data Plane</div>
      {dataPlaneNav.map(n => (
        <div
          key={n.id}
          className={`nav-item ${tab === n.id ? "active" : ""}`}
          onClick={() => setTab(n.id)}
        >
          <span className="nav-icon">{n.icon}</span>
          <span>{n.label}</span>
          {n.count !== null && (
            <span className={`nav-count ${n.id === "nodes" && nodes.filter(x => x.status !== "ok").length > 0 ? "alert" : ""}`}>
              {n.count}
            </span>
          )}
        </div>
      ))}

      {/* CONTROL PLANE */}
      <div className="nav-section" style={{ marginTop: 8 }}>Control Plane</div>
      {controlPlaneNav.map(n => (
        <div
          key={n.id}
          className={`nav-item ${tab === n.id ? "active" : ""}`}
          onClick={() => setTab(n.id)}
        >
          <span className="nav-icon">{n.icon}</span>
          <span>{n.label}</span>
          {n.count !== null && (
            <span className="nav-count">{n.count}</span>
          )}
        </div>
      ))}

      {/* SYSTEM */}
      <div className="nav-section" style={{ marginTop: 8 }}>System</div>
      {systemNav.map(n => (
        <div key={n.id} className="nav-item">
          <span className="nav-icon">{n.icon}</span>
          <span>{n.label}</span>
        </div>
      ))}

      <div className="sidebar-footer">
        <div className="ws-status">
          <div className={`dot ${wsConnected ? "" : "error"} ws-blink`} />
          <span>WS {wsConnected ? "connected" : "reconnecting"}</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 9, color: "var(--muted2)" }}>
          {nodes.reduce((sum, node) => sum + node.activeConnections, 0).toLocaleString()} active connections
        </div>
      </div>
    </div>
  );
}
