"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

interface LogEntry {
  id: string;
  timestamp: Date;
  level: "info" | "warn" | "error" | "success" | "debug";
  message: string;
  data?: unknown;
}

const SSE_ENDPOINT = "https://histweety-notification.vercel.app/sse";

export default function SSELogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "error">("disconnected");
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const addLog = useCallback((level: LogEntry["level"], message: string, data?: unknown) => {
    const newLog: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      level,
      message,
      data,
    };
    setLogs((prev) => [...prev, newLog]);
  }, []);

  useEffect(() => {
    // Connect to SSE endpoint
    const connectSSE = () => {
      setConnectionStatus("connecting");

      try {
        const eventSource = new EventSource(SSE_ENDPOINT);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          setConnectionStatus("connected");
          addLog("info", "Connected to SSE endpoint");
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as Record<string, unknown>;

            // Determine log level from data
            let level: LogEntry["level"] = "info";
            if (data.level && typeof data.level === "string") {
              level = data.level.toLowerCase() as LogEntry["level"];
            } else if (data.type && typeof data.type === "string") {
              const type = data.type.toLowerCase();
              if (type.includes("error")) level = "error";
              else if (type.includes("warn")) level = "warn";
              else if (type.includes("success")) level = "success";
              else if (type.includes("debug")) level = "debug";
            }

            // Extract message and ensure it's a string
            const message = String(
              data.message || data.msg || data.text || JSON.stringify(data)
            );

            addLog(level, message, data);
          } catch {
            // If not JSON, treat as plain text
            addLog("info", String(event.data));
          }
        };

        eventSource.onerror = (error) => {
          console.error("SSE Error:", error);
          setConnectionStatus("error");
          addLog("error", "SSE connection error occurred");

          // Attempt to reconnect after 5 seconds
          setTimeout(() => {
            if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
              addLog("info", "Attempting to reconnect...");
              connectSSE();
            }
          }, 5000);
        };

        // Listen for custom event types
        eventSource.addEventListener("notification", (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data) as Record<string, unknown>;
            const msg = String(data.message || JSON.stringify(data));
            addLog("success", `Notification: ${msg}`, data);
          } catch {
            addLog("success", `Notification: ${String(event.data)}`);
          }
        });

      } catch (error) {
        setConnectionStatus("error");
        addLog("error", `Failed to connect: ${error}`);
      }
    };

    connectSSE();

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [addLog]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const clearLogs = () => {
    setLogs([]);
    addLog("info", "Logs cleared");
  };

  const reconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setConnectionStatus("connecting");
    const eventSource = new EventSource(SSE_ENDPOINT);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setConnectionStatus("connected");
      addLog("info", "Reconnected to SSE endpoint");
    };

    eventSource.onerror = () => {
      setConnectionStatus("error");
      addLog("error", "Connection error");
    };
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-500";
      case "connecting":
        return "bg-yellow-500 animate-pulse";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "error":
        return "Error";
      default:
        return "Disconnected";
    }
  };

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "warn":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "success":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "debug":
        return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      default:
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    }
  };

  const getLevelIcon = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
        return "❌";
      case "warn":
        return "⚠️";
      case "success":
        return "✅";
      case "debug":
        return "🔍";
      default:
        return "ℹ️";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-primary">SSE Logs Monitor</h1>

            {/* Connection Status */}
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5">
              <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor()}`} />
              <span className="text-sm text-primary-muted">{getStatusText()}</span>
            </div>
          </div>

          <Link
            href="/"
            className="group flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-primary-muted hover:bg-surface-hover"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            onClick={clearLogs}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-primary-muted transition-colors hover:bg-surface-hover hover:text-primary"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear Logs
          </button>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${
              autoScroll
                ? "border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                : "border-border bg-surface text-primary-muted hover:bg-surface-hover"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            Auto-scroll {autoScroll ? "ON" : "OFF"}
          </button>

          <button
            onClick={reconnect}
            disabled={connectionStatus === "connecting"}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-primary-muted transition-colors hover:bg-surface-hover hover:text-primary disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reconnect
          </button>

          <div className="ml-auto text-sm text-primary-subtle">
            Total logs: <span className="font-semibold text-primary-muted">{logs.length}</span>
          </div>
        </div>

        {/* Logs Display */}
        <div className="card h-[calc(100vh-280px)] overflow-hidden">
          <div className="flex h-full flex-col">
            {/* Endpoint Info */}
            <div className="mb-4 rounded-lg border border-border-hover bg-surface-hover p-3">
              <div className="flex items-center gap-2 text-xs text-primary-subtle">
                <span className="font-semibold text-primary-muted">Endpoint:</span>
                <code className="rounded bg-background px-2 py-1 font-mono text-cyan-400">{SSE_ENDPOINT}</code>
              </div>
            </div>

            {/* Logs Container */}
            <div className="flex-1 space-y-2 overflow-y-auto rounded-lg border border-border bg-background p-4">
              {logs.length === 0 ? (
                <div className="flex h-full items-center justify-center text-primary-subtle">
                  <div className="text-center">
                    <div className="mb-2 text-4xl">📡</div>
                    <p>Waiting for logs...</p>
                    <p className="mt-2 text-xs text-primary-subtle/60">
                      {connectionStatus === "connected" ? "Connected and listening" : "Connecting to server"}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {logs.map((log) => {
                    const logDataString = log.data ? String(JSON.stringify(log.data, null, 2)) : null;

                    return (
                      <div
                        key={log.id}
                        className={`group animate-slide-up rounded-lg border p-3 transition-all hover:shadow-md ${getLevelColor(log.level)}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-lg" aria-label={log.level}>
                            {getLevelIcon(log.level)}
                          </span>

                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-3 text-xs">
                              <span className="font-mono text-primary-subtle">
                                {formatTime(log.timestamp)}
                              </span>
                              <span className="rounded bg-background/50 px-2 py-0.5 font-mono font-semibold uppercase tracking-wider">
                                {log.level}
                              </span>
                            </div>

                            <div className="line-clamp-2 text-sm font-medium leading-relaxed">
                              {log.message}
                            </div>

                            {logDataString && (
                              <details className="mt-2">
                                <summary className="cursor-pointer text-xs text-primary-subtle hover:text-primary-muted">
                                  View raw data
                                </summary>
                                <pre className="mt-2 overflow-x-auto rounded bg-background/50 p-2 text-xs text-primary-subtle">
                                  {logDataString}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
