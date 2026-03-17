export const ROUTES = [
  { id:1, method:"GET",    path:"/api/v2/users/:id",         upstream:"user-svc:8080",    rate:"1200/min", auth:true,  cache:true,  status:"healthy",  latency:14,  rps:340 },
  { id:2, method:"POST",   path:"/api/v2/auth/token",        upstream:"auth-svc:8081",    rate:"500/min",  auth:false, cache:false, status:"healthy",  latency:28,  rps:120 },
  { id:3, method:"GET",    path:"/api/v2/products",          upstream:"catalog-svc:8082", rate:"2000/min", auth:false, cache:true,  status:"healthy",  latency:9,   rps:890 },
  { id:4, method:"PUT",    path:"/api/v2/orders/:id",        upstream:"order-svc:8083",   rate:"400/min",  auth:true,  cache:false, status:"degraded", latency:145, rps:67  },
  { id:5, method:"DELETE", path:"/api/v2/sessions/:token",   upstream:"auth-svc:8081",    rate:"200/min",  auth:true,  cache:false, status:"healthy",  latency:22,  rps:15  },
  { id:6, method:"PATCH",  path:"/api/v2/config/runtime",   upstream:"config-svc:8084",  rate:"60/min",   auth:true,  cache:false, status:"healthy",  latency:18,  rps:4   },
  { id:7, method:"GET",    path:"/api/v2/metrics/stream",    upstream:"metrics-svc:8085", rate:"unlimited",auth:true,  cache:false, status:"healthy",  latency:3,   rps:12  },
  { id:8, method:"POST",   path:"/api/v2/webhooks/dispatch", upstream:"event-svc:8086",   rate:"300/min",  auth:true,  cache:false, status:"down",     latency:0,   rps:0   },
];

export const NODES = [
  { id:"gw-01", region:"us-east-1a",     cpu:34, mem:61, conns:1420, status:"ok"    },
  { id:"gw-02", region:"us-east-1b",     cpu:41, mem:58, conns:1380, status:"ok"    },
  { id:"gw-03", region:"us-west-2a",     cpu:28, mem:52, conns:960,  status:"ok"    },
  { id:"gw-04", region:"eu-west-1a",     cpu:67, mem:74, conns:2100, status:"warn"  },
  { id:"gw-05", region:"eu-west-1b",     cpu:19, mem:43, conns:780,  status:"ok"    },
  { id:"gw-06", region:"ap-southeast-1", cpu:0,  mem:0,  conns:0,    status:"error" },
];

export const USERS = [
  { id:1, name:"Priya Mehta",  email:"p.mehta@corp.io",  role:"admin",    lastSeen:"2m ago",  mfa:true  },
  { id:2, name:"Jordan Cole",  email:"j.cole@corp.io",   role:"ops",      lastSeen:"14m ago", mfa:true  },
  { id:3, name:"Sam Rivera",   email:"s.rivera@corp.io", role:"ops",      lastSeen:"1h ago",  mfa:false },
  { id:4, name:"Alex Chen",    email:"a.chen@corp.io",   role:"readonly", lastSeen:"3h ago",  mfa:true  },
  { id:5, name:"Dana Park",    email:"d.park@corp.io",   role:"readonly", lastSeen:"1d ago",  mfa:false },
];

export const INIT_LOGS = [
  { id:1, time:"09:14:02", level:"INFO",  msg:"[gw-01] Route /api/v2/users/:id — 200 OK — 12ms" },
  { id:2, time:"09:14:03", level:"INFO",  msg:"[gw-03] Route /api/v2/products — 200 OK — 8ms — cache HIT" },
  { id:3, time:"09:14:04", level:"WARN",  msg:"[gw-04] order-svc upstream latency spike: 145ms" },
  { id:4, time:"09:14:05", level:"ERROR", msg:"[gw-06] Node unreachable — health check failed" },
  { id:5, time:"09:14:06", level:"INFO",  msg:"[gw-02] Rate limit reset for tenant:t_9k2x — /auth/token" },
  { id:6, time:"09:14:07", level:"WARN",  msg:"[gw-04] CPU utilization 67% — approaching threshold" },
];

export const LOG_POOL = [
  { level:"INFO",  msg:"[gw-01] GET /api/v2/users/91822 — 200 OK — 11ms" },
  { level:"INFO",  msg:"[gw-03] GET /api/v2/products — 304 Not Modified — cache HIT" },
  { level:"WARN",  msg:"[gw-04] Retrying order-svc — attempt 2/3" },
  { level:"INFO",  msg:"[gw-02] POST /api/v2/auth/token — 200 OK — 26ms" },
  { level:"ERROR", msg:"[gw-06] Failed to connect: ECONNREFUSED event-svc:8086" },
  { level:"INFO",  msg:"[gw-05] PATCH /api/v2/config/runtime — 200 OK — 18ms — applied" },
  { level:"WARN",  msg:"[gw-04] Memory usage 74% — monitor closely" },
  { level:"INFO",  msg:"[gw-01] WebSocket upgrade: /api/v2/metrics/stream — peer 10.0.1.44" },
];