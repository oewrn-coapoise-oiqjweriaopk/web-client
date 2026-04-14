import { useState } from "react";
import type { LogEntry } from "../../api/controlPlane";

interface LogsPanelProps {
  logs: LogEntry[];
}

export default function LogsPanel({ logs }: LogsPanelProps) {
  const [filterLevel, setFilterLevel] = useState<string | null>(null);

  // Filter logs by level if selected
  const filteredLogs = filterLevel
    ? logs.filter(log => log.level === filterLevel)
    : logs;

  // Count logs by level
  const levelCounts = {
    INFO: logs.filter(l => l.level === "INFO").length,
    WARN: logs.filter(l => l.level === "WARN").length,
    ERROR: logs.filter(l => l.level === "ERROR").length,
    DEBUG: logs.filter(l => l.level === "DEBUG").length,
  };

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatLogMessage = (log: LogEntry): string => {
    let msg = `[${log.nodeId}] ${log.message}`;
    
    if (log.method && log.path) {
      msg += ` ${log.method} ${log.path}`;
    }
    
    if (log.statusCode) {
      const statusText = getStatusText(log.statusCode);
      msg += ` — ${log.statusCode} ${statusText}`;
    }
    
    if (log.responseTimeMs) {
      msg += ` — ${log.responseTimeMs}ms`;
    }
    
    if (log.error) {
      msg += ` — ${log.error}`;
    }
    
    return msg;
  };

  const getStatusText = (code: number): string => {
    const statusMap: Record<number, string> = {
      200: "OK",
      201: "Created",
      204: "No Content",
      304: "Not Modified",
      400: "Bad Request",
      401: "Unauthorized",
      403: "Forbidden",
      404: "Not Found",
      429: "Too Many Requests",
      500: "Internal Server Error",
      502: "Bad Gateway",
      503: "Service Unavailable",
      504: "Gateway Timeout",
    };
    return statusMap[code] || "Unknown";
  };

  return (
    <div className="fade-in">
      <div className="card" style={{ marginBottom: 16 }}>
        <div
          className="card-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 9, color: "var(--muted2)", letterSpacing: 1, textTransform: "uppercase" }}>
              ● LIVE
            </span>
            <span className="text-muted">data-plane logs</span>
          </div>
          <div style={{ display: "flex", gap: 8, fontSize: 11 }}>
            <button
              className={`btn ${filterLevel === "INFO" ? "btn-primary" : "btn-default"}`}
              onClick={() => setFilterLevel(filterLevel === "INFO" ? null : "INFO")}
              style={{ padding: "4px 8px" }}
            >
              INFO ({levelCounts.INFO})
            </button>
            <button
              className={`btn ${filterLevel === "WARN" ? "btn-primary" : "btn-default"}`}
              onClick={() => setFilterLevel(filterLevel === "WARN" ? null : "WARN")}
              style={{ padding: "4px 8px" }}
            >
              WARN ({levelCounts.WARN})
            </button>
            <button
              className={`btn ${filterLevel === "ERROR" ? "btn-primary" : "btn-default"}`}
              onClick={() => setFilterLevel(filterLevel === "ERROR" ? null : "ERROR")}
              style={{ padding: "4px 8px" }}
            >
              ERROR ({levelCounts.ERROR})
            </button>
          </div>
        </div>
        <div className="card-body">
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              lineHeight: "18px",
              maxHeight: "400px",
              overflowY: "auto",
              backgroundColor: "var(--bg2)",
              padding: 8,
              borderRadius: 4,
            }}
          >
            {filteredLogs.length === 0 ? (
              <div style={{ color: "var(--muted)", textAlign: "center", padding: 16 }}>
                {filterLevel ? `No ${filterLevel} logs` : "No logs available"}
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={`${log.id}-${log.timestamp}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto auto 1fr",
                    gap: "12px",
                    padding: "6px 0",
                    borderBottom: "1px solid var(--border)",
                    alignItems: "start",
                  }}
                >
                  <span style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>
                    {formatTime(log.timestamp)}
                  </span>
                  <span
                    style={{
                      whiteSpace: "nowrap",
                      padding: "2px 6px",
                      borderRadius: 2,
                      fontSize: 9,
                      fontWeight: "bold",
                      backgroundColor: getLevelColor(log.level).bg,
                      color: getLevelColor(log.level).text,
                    }}
                  >
                    {log.level}
                  </span>
                  <span style={{ color: "var(--fg)" }}>{formatLogMessage(log)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getLevelColor(level: string) {
  switch (level) {
    case "ERROR":
      return { bg: "rgba(255, 59, 48, 0.15)", text: "#ff3b30" };
    case "WARN":
      return { bg: "rgba(255, 159, 64, 0.15)", text: "#ff9f40" };
    case "INFO":
      return { bg: "rgba(52, 168, 219, 0.15)", text: "#34a8db" };
    case "DEBUG":
      return { bg: "rgba(156, 156, 156, 0.15)", text: "#9c9c9c" };
    default:
      return { bg: "transparent", text: "var(--fg)" };
  }
}
