import { useState } from "react";

const ARCH_SECTIONS = [
  {
    title: "Folder Structure",
    icon: "📁",
    code: "src/\n├── app/\n│   ├── store/           # Redux Toolkit slices\n│   │   ├── authSlice.ts\n│   │   ├── gatewaySlice.ts\n│   │   ├── metricsSlice.ts\n│   │   └── index.ts\n│   ├── hooks/           # Typed useAppDispatch/Selector\n│   └── router.tsx       # React Router v6 config\n├── features/\n│   ├── auth/            # Login, RBAC guards\n│   ├── routes/          # Route CRUD + config\n│   ├── nodes/           # Node health map\n│   ├── metrics/         # Real-time charts\n│   ├── logs/            # Log stream viewer\n│   └── users/           # User & role management\n├── shared/\n│   ├── api/             # Axios + interceptors\n│   │   ├── client.ts\n│   │   ├── endpoints.ts\n│   │   └── types.ts\n│   ├── ws/              # WebSocket manager\n│   │   ├── WSClient.ts\n│   │   └── useWSChannel.ts\n│   ├── components/      # Design system\n│   └── utils/\n└── pages/               # Route-level page components"
  },
  {
    title: "State Management",
    icon: "⚙️",
    code: "// Redux Toolkit slice pattern\nconst routesSlice = createSlice({\n  name: 'routes',\n  initialState: {\n    items: [],       // RouteConfig[]\n    selected: null,  // editing\n    status: 'idle',  // 'loading' | 'error'\n    meta: {}         // pagination\n  },\n  reducers: {\n    routeUpdated: (state, action) => {\n      const idx = state.items.findIndex(\n        r => r.id === action.payload.id\n      );\n      if (idx >= 0)\n        state.items[idx] = action.payload;\n    }\n  },\n  extraReducers: builder => {\n    builder\n      .addCase(fetchRoutes.fulfilled, ...)\n      .addCase(updateRoute.fulfilled, ...)\n  }\n});\n\nconst gatewayApi = createApi({\n  reducerPath: 'gatewayApi',\n  baseQuery: axiosBaseQuery(),\n  tagTypes: ['Route', 'Node', 'User'],\n  endpoints: (build) => ({\n    getRoutes:   build.query({ ... }),\n    updateRoute: build.mutation({ ... }),\n    getNodes:    build.query({ ... }),\n  })\n});"
  },
  {
    title: "WebSocket Pattern",
    icon: "🔌",
    code: "// shared/ws/WSClient.ts\nclass WSClient extends EventEmitter {\n  private socket: WebSocket | null = null;\n\n  connect(url: string, token: string) {\n    this.socket = new WebSocket(url + '?token=' + token);\n    this.socket.onmessage = (e) => {\n      const { channel, event, payload }\n        = JSON.parse(e.data);\n      this.emit(channel + ':' + event, payload);\n    };\n    this.socket.onclose = () =>\n      this.scheduleReconnect();\n  }\n\n  subscribe(channel: string) {\n    this.send({ type: 'SUBSCRIBE', channel });\n  }\n\n  scheduleReconnect(delay = 3000) {\n    this.reconnectTimer =\n      setTimeout(() => this.connect(), delay);\n  }\n}\n\nfunction useWSChannel(channel: string) {\n  const dispatch = useAppDispatch();\n  useEffect(() => {\n    wsClient.subscribe(channel);\n    wsClient.on(channel + ':update', (payload) => {\n      dispatch(routeUpdated(payload));\n    });\n    wsClient.on(channel + ':metric', (payload) => {\n      dispatch(metricsReceived(payload));\n    });\n  }, [channel]);\n}"
  },
  {
    title: "Auth & RBAC",
    icon: "🔐",
    code: "// JWT + refresh token flow\naxios.interceptors.request.use(config => {\n  config.headers.Authorization =\n    'Bearer ' + store.getState().auth.accessToken;\n  return config;\n});\n\naxios.interceptors.response.use(null, async (err) => {\n  if (err.response?.status === 401) {\n    const newToken = await refreshToken();\n    return axios(patchConfig(err.config, newToken));\n  }\n  return Promise.reject(err);\n});\n\nconst PERMISSIONS = {\n  admin:    ['read','write','delete','configure'],\n  ops:      ['read','write','configure'],\n  readonly: ['read'],\n};\n\nfunction Guarded({ permission, children }) {\n  const role = useAppSelector(s => s.auth.role);\n  const allowed =\n    PERMISSIONS[role]?.includes(permission);\n  return allowed ? children : <Forbidden />;\n}"
  },
];

export default function ArchitectureTab() {
  const [active, setActive] = useState(0);

  const current = ARCH_SECTIONS[active];

  return (
    <div className="fade-in">

      {/* Tab bar */}
      <div className="tabs">
        {ARCH_SECTIONS.map((s, i) => (
          <div
            key={i}
            className={`tab ${active === i ? "active" : ""}`}
            onClick={() => setActive(i)}
          >
            {s.icon} {s.title}
          </div>
        ))}
      </div>

      {/* Code block */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">{current.icon} {current.title}</span>
          <button className="btn btn-ghost" style={{ padding: "3px 10px" }}>Copy</button>
        </div>
        <div className="card-body">
          <pre
            style={{
              fontFamily: "var(--mono)",
              fontSize: 10.5,
              lineHeight: 1.7,
              color: "var(--accent)",
              overflowX: "auto",
              whiteSpace: "pre",
              background: "transparent",
              border: "none",
              margin: 0,
              padding: 0,
            }}
          >
            {current.code}
          </pre>
        </div>
      </div>

      {/* Control Plane vs Data Plane */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <span className="card-title">🏗 Control Plane vs Data Plane</span>
        </div>
        <div className="card-body">

          {/* Two plane boxes */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 16,
            }}
          >
            {/* Control Plane */}
            <div
              style={{
                border: "1px solid rgba(0,229,255,0.25)",
                borderTop: "2px solid var(--accent)",
                borderRadius: 4,
                padding: 14,
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: 12,
                  fontWeight: 700,
                }}
              >
                ⚙ Control Plane
              </div>
              {[
                { label: "API Key Lifecycle",   sub: "Issue, rotate, revoke API keys" },
                { label: "Rule Composition",    sub: "Author and version policy rules" },
                { label: "Admin Operations",    sub: "User management, RBAC, audit" },
                { label: "Runtime Config Push", sub: "Push rules to data plane — no redeploy" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--accent)",
                      flexShrink: 0,
                      marginTop: 4,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text)" }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 9, color: "var(--muted)" }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Data Plane */}
            <div
              style={{
                border: "1px solid rgba(0,200,150,0.25)",
                borderTop: "2px solid var(--ok)",
                borderRadius: 4,
                padding: 14,
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: "var(--ok)",
                  marginBottom: 12,
                  fontWeight: 700,
                }}
              >
                ◈ Data Plane
              </div>
              {[
                { label: "Request Validation", sub: "Schema, auth token, header checks" },
                { label: "Rate Limiting",       sub: "Per-IP, per-key, per-route limits" },
                { label: "Policy Evaluation",   sub: "Runtime rule enforcement per request" },
                { label: "Routing",             sub: "Resolve and proxy to upstream service" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--ok)",
                      flexShrink: 0,
                      marginTop: 4,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text)" }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 9, color: "var(--muted)" }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Request flow strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 12,
              alignItems: "center",
            }}
          >
            {[
              { label: "Client Request", sub: "Browser / API consumer",   color: "var(--accent3)" },
              { label: "Data Plane",     sub: "Validate · Limit · Route", color: "var(--ok)"      },
              { label: "Policy Engine",  sub: "Runtime rule evaluation",   color: "var(--accent)"  },
              { label: "Upstream Proxy", sub: "Microservice routing",      color: "var(--warn)"    },
              { label: "AWS Cloud",      sub: "Scalable infra · us-east-1",color: "var(--accent2)" },
            ].map((b, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    padding: "10px 8px",
                    background: "var(--surface)",
                    border: "1px solid " + b.color + "30",
                    borderTop: "2px solid " + b.color,
                    borderRadius: 3,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: b.color,
                      marginBottom: 3,
                    }}
                  >
                    {b.label}
                  </div>
                  <div style={{ fontSize: 9, color: "var(--muted)" }}>{b.sub}</div>
                </div>
                {i < 4 && (
                  <div
                    style={{
                      fontSize: 14,
                      color: "var(--muted2)",
                      textAlign: "center",
                      marginTop: -4,
                    }}
                  >
                    →
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Roadmap row */}
          <div
            style={{
              marginTop: 16,
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
            }}
          >
            {[
              {
                label: "Current — v1",
                detail:
                  "Policy-driven gateway, control/data plane separation, React portal, AWS deployment.",
              },
              {
                label: "Planned — v2",
                detail:
                  "Distributed state management, edge node deployment, intelligent traffic routing.",
              },
              {
                label: "Architecture Goal",
                detail:
                  "Modular, scalable, zero-downtime rule updates via runtime config push — no gateway redeploy.",
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 3,
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    color: "var(--muted)",
                    marginBottom: 5,
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--text)",
                    lineHeight: 1.6,
                    opacity: 0.8,
                  }}
                >
                  {item.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}