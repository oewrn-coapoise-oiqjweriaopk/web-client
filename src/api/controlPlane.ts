const API_BASE_URL = import.meta.env.VITE_CONTROL_PLANE_BASE_URL ?? "http://localhost:8081";

export interface LogEntry {
  id: number;
  timestamp: string;
  level: string;
  nodeId: string;
  message: string;
  requestId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  responseTimeMs?: number;
  error?: string;
}

export interface OverviewResponse {
  totalRoutes: number;
  healthyRoutes: number;
  activePolicies: number;
  activeApiKeys: number;
  onlineNodes: number;
  totalAdmins: number;
  averageNodeCpu: number;
  averageNodeMemory: number;
  totalNodeConnections: number;
  routesByStatus: Record<string, number>;
  nodesByStatus: Record<string, number>;
  recentLogs: LogEntry[];
}

export interface RouteConfig {
  id: number;
  name: string;
  method: string;
  pathPattern: string;
  upstreamUrl: string;
  requiresAuth: boolean;
  cacheEnabled: boolean;
  rateLimitPerMinute: number;
  status: string;
  timeoutMillis: number;
  stripPrefix: string;
}

export interface RouteRequest {
  name: string;
  method: string;
  pathPattern: string;
  upstreamUrl: string;
  requiresAuth: boolean;
  cacheEnabled: boolean;
  rateLimitPerMinute: number;
  status: string;
  timeoutMillis: number;
  stripPrefix: string;
}

export interface PolicyRule {
  id: number;
  name: string;
  scope: string;
  conditionExpression: string;
  action: string;
  priority: number;
  enabled: boolean;
  routePattern: string;
}

export interface PolicyRuleRequest {
  name: string;
  scope: string;
  conditionExpression: string;
  action: string;
  priority: number;
  enabled: boolean;
  routePattern: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  mfaEnabled: boolean;
  lastSeenAt: string | null;
  status: string;
}

export interface GatewayNode {
  id: number;
  nodeId: string;
  region: string;
  status: string;
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  lastHeartbeatAt: string;
}

export interface MetricsResponse {
  nodeId: string;
  requestsPerSecond: number;
  totalRequests: number;
  errorRate: number;
  averageResponseTimeMs: number;
  p99ResponseTimeMs: number;
  cpuUsagePercent: number;
  lastUpdated: number;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed for ${path}: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function getJson<T>(path: string): Promise<T> {
  return request<T>(path, { method: "GET" });
}

export async function fetchControlPlaneSnapshot() {
  const [overview, routes, policies, users, nodes] = await Promise.all([
    getJson<OverviewResponse>("/api/v1/overview"),
    getJson<RouteConfig[]>("/api/v1/routes"),
    getJson<PolicyRule[]>("/api/v1/policies"),
    getJson<AdminUser[]>("/api/v1/users"),
    getJson<GatewayNode[]>("/api/v1/nodes"),
  ]);

  return { overview, routes, policies, users, nodes };
}

export async function fetchMetrics() {
  return getJson<MetricsResponse[]>("/api/v1/metrics");
}

export function createRoute(payload: RouteRequest) {
  return request<RouteConfig>("/api/v1/routes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateRoute(id: number, payload: RouteRequest) {
  return request<RouteConfig>(`/api/v1/routes/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteRoute(id: number) {
  return request<void>(`/api/v1/routes/${id}`, {
    method: "DELETE",
  });
}

export function createPolicy(payload: PolicyRuleRequest) {
  return request<PolicyRule>("/api/v1/policies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updatePolicy(id: number, payload: PolicyRuleRequest) {
  return request<PolicyRule>(`/api/v1/policies/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deletePolicy(id: number) {
  return request<void>(`/api/v1/policies/${id}`, {
    method: "DELETE",
  });
}
