import type { AdminUser } from "../api/controlPlane";
import { formatRelativeTime } from "../lib/formatters";

interface UsersTabProps {
  users: AdminUser[];
}

export default function UsersTab({ users }: UsersTabProps) {
  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <span className="card-title">Access Control — {users.length} users</span>
          <div className="flex gap-6">
            <button className="btn btn-ghost">Audit Log</button>
            <button className="btn btn-primary">+ Invite User</button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th><th>Email</th><th>Role</th><th>MFA</th><th>Last Seen</th><th>Permissions</th><th></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-8">
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%",
                      background: u.role === "admin" ? "var(--accent3)" : u.role === "ops" ? "rgba(0,229,255,0.2)" : "var(--border2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, color: "#fff", flexShrink: 0
                    }}>
                      {u.name.split(" ").map((s: string) => s[0]).join("")}
                    </div>
                    <span style={{ fontSize: 11 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ color: "var(--muted)", fontSize: 10 }}>{u.email}</td>
                <td><span className={`role-pill ${u.role}`}>{u.role}</span></td>
                <td>
                  <span style={{ fontSize: 10, color: u.mfaEnabled ? "var(--ok)" : "var(--error)" }}>
                    {u.mfaEnabled ? "✓ enabled" : "✗ off"}
                  </span>
                </td>
                <td style={{ color: "var(--muted)", fontSize: 10 }}>{formatRelativeTime(u.lastSeenAt)}</td>
                <td>
                  <div className="flex gap-6" style={{ flexWrap: "wrap" }}>
                    {["read", ...(u.role !== "readonly" ? ["write", "configure"] : []), ...(u.role === "admin" ? ["delete"] : [])].map(p => (
                      <span key={p} style={{ fontSize: 9, padding: "1px 5px", border: "1px solid var(--border2)", borderRadius: 2, color: "var(--muted)" }}>{p}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <div className="flex gap-6">
                    <button className="btn btn-ghost" style={{ padding: "3px 8px" }}>Edit</button>
                    {u.role !== "admin" && <button className="btn btn-danger" style={{ padding: "3px 8px" }}>Revoke</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header"><span className="card-title">RBAC Permission Matrix</span></div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr><th>Permission</th><th>Admin</th><th>Ops</th><th>Read-Only</th><th>Scope</th></tr>
            </thead>
            <tbody>
              {[
                { perm: "View routes & metrics",  admin: true,  ops: true,  ro: true,  scope: "global"    },
                { perm: "Edit route config",       admin: true,  ops: true,  ro: false, scope: "assigned"  },
                { perm: "Toggle auth / cache",     admin: true,  ops: true,  ro: false, scope: "assigned"  },
                { perm: "Manage rate limits",      admin: true,  ops: true,  ro: false, scope: "assigned"  },
                { perm: "Delete routes",           admin: true,  ops: false, ro: false, scope: "global"    },
                { perm: "User management",         admin: true,  ops: false, ro: false, scope: "global"    },
                { perm: "Runtime config push",     admin: true,  ops: true,  ro: false, scope: "global"    },
                { perm: "Audit log access",        admin: true,  ops: true,  ro: false, scope: "global"    },
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ fontSize: 10 }}>{row.perm}</td>
                  {[row.admin, row.ops, row.ro].map((v, j) => (
                    <td key={j} style={{ color: v ? "var(--ok)" : "var(--error)", fontSize: 11 }}>{v ? "✓" : "✗"}</td>
                  ))}
                  <td><span className="code-tag">{row.scope}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
