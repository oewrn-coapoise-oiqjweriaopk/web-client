import { useState, useEffect, useRef } from "react";
import { CSS } from "./styles/globalStyles";
import { INIT_LOGS, LOG_POOL, NODES, ROUTES } from "./data/mockData";
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
  const [rpsData, setRpsData] = useState(() =>
    Array.from({ length: 30 }, () => 1200 + Math.floor(Math.random() * 400))
  );
  const [wsConnected] = useState(true);
  const logIdRef = useRef(100);

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      const entry = LOG_POOL[Math.floor(Math.random() * LOG_POOL.length)];
      setLogs(prev => [...prev.slice(-40), { ...entry, id: logIdRef.current++, time: `${h}:${m}:${s}` }]);
      setRpsData(prev => [...prev.slice(-29), 1100 + Math.floor(Math.random() * 500)]);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div className="shell">
        <Topbar />
        <div className="body">
          <Sidebar tab={tab} setTab={setTab} wsConnected={wsConnected} />
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

            {tab === "overview"  && <OverviewTab logs={logs} rpsData={rpsData} />}
            {tab === "routes"    && <RoutesTab />}
            {tab === "policies"  && <PoliciesTab />}
            {tab === "arch"      && <ArchitectureTab />}
            {tab === "users"     && <UsersTab />}

            {tab === "nodes" && (
              <div className="fade-in">
                <div className="stat-grid">
                  {NODES.map(n => (
                    <div key={n.id} className={`stat-card ${n.status === "ok" ? "ok" : n.status === "warn" ? "warn" : "accent"}`}>
                      <div className="stat-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div className={`dot ${n.status === "ok" ? "" : n.status}`} />
                        {n.id} — {n.region}
                      </div>
                      {n.status !== "error" ? (
                        <>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                            <div>
                              <div style={{ fontSize: 9, color: "var(--muted)", marginBottom: 3 }}>CPU</div>
                              <div className="progress">
                                <div className={`progress-fill ${n.cpu > 60 ? "warn" : "ok"}`} style={{ width: `${n.cpu}%` }} />
                              </div>
                              <div style={{ fontSize: 10, marginTop: 3 }}>{n.cpu}%</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 9, color: "var(--muted)", marginBottom: 3 }}>MEM</div>
                              <div className="progress">
                                <div className={`progress-fill ${n.mem > 70 ? "warn" : "accent"}`} style={{ width: `${n.mem}%` }} />
                              </div>
                              <div style={{ fontSize: 10, marginTop: 3 }}>{n.mem}%</div>
                            </div>
                          </div>
                          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 8 }}>{n.conns.toLocaleString()} connections</div>
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