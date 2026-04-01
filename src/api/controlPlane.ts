const API_BASE_URL = import.meta.env.VITE_CONTROL_PLANE_BASE_URL ?? "http://localhost:8081";

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

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed for ${path}: ${response.status}`);
  }
  return response.json() as Promise<T>;
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
