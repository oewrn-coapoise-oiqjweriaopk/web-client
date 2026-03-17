import { NODES, ROUTES, USERS } from "../../data/mockData";

interface SidebarProps {
  tab: string;
  setTab: (tab: string) => void;
  wsConnected: boolean;
}

const datePlaneNav = [
  { id: "overview", label: "Overview",    icon: "◈", count: null },
  { id: "routes",   label: "Routes",      icon: "⇄", count: ROUTES.length },
  { id: "nodes",    label: "Nodes",       icon: "◉", count: `${NODES.filter(n => n.status === "ok").length}/${NODES.length}` },
];

const controlPlaneNav = [
  { id: "policies", label: "Policy Rules",  icon: "⚑", count: null },
  { id: "users",    label: "Users & RBAC",  icon: "⊿", count: USERS.length },
  { id: "arch",     label: "Architecture",  icon: "⊞", count: null },
];

const systemNav = [
  { id: "config",   label: "Runtime Config", icon: "◎" },
  { id: "plugins",  label: "Plugins",        icon: "⊕" },
  { id: "audit",    label: "Audit Log",      icon: "≡" },
  { id: "settings", label: "Settings",       icon: "⚙" },
];

export default function Sidebar({ tab, setTab, wsConnected }: SidebarProps) {
  return (
    <div className="sidebar">
      <div style={{ height: 16 }} />

      {/* DATA PLANE */}
      <div className="nav-section">Data Plane</div>
      {datePlaneNav.map(n => (
        <div
          key={n.id}
          className={`nav-item ${tab === n.id ? "active" : ""}`}
          onClick={() => setTab(n.id)}
        >
          <span className="nav-icon">{n.icon}</span>
          <span>{n.label}</span>
          {n.count !== null && (
            <span className={`nav-count ${n.id === "nodes" && NODES.filter(x => x.status !== "ok").length > 0 ? "alert" : ""}`}>
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
          {NODES.reduce((a, n) => a + n.conns, 0).toLocaleString()} active connections
        </div>
      </div>
    </div>
  );
}