/**
 * Enhanced SSE Logger for comprehensive tracking and monitoring
 * Handles both client-side connection logging and server-side event logging
 */

export interface SSELogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success' | 'debug' | 'connection';
  source: 'client' | 'server';
  message: string;
  data?: unknown;
  metadata?: {
    connectionId?: string;
    eventId?: string;
    retryCount?: number;
    latency?: number;
    endpoint?: string;
    userAgent?: string;
    ip?: string;
  };
}

export interface SSEConnectionMetrics {
  connectedAt: Date;
  disconnectedAt?: Date;
  retryCount: number;
  totalEventsReceived: number;
  connectionDuration?: number;
  lastEventTime?: Date;
  errorCount: number;
}

export class SSELogger {
  private logs: SSELogEntry[] = [];
  private connectionMetrics: Map<string, SSEConnectionMetrics> = new Map();
  private maxLogEntries: number = 1000;
  private isClient: boolean;

  constructor(isClient: boolean = false) {
    this.isClient = isClient;
  }

  /**
   * Add a new log entry
   */
  addLog(
    level: SSELogEntry['level'],
    message: string,
    data?: unknown,
    metadata?: SSELogEntry['metadata']
  ): SSELogEntry {
    const logEntry: SSELogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      source: this.isClient ? 'client' : 'server',
      message,
      data,
      metadata,
    };

    this.logs.unshift(logEntry);

    // Maintain log size limit
    if (this.logs.length > this.maxLogEntries) {
      this.logs = this.logs.slice(0, this.maxLogEntries);
    }

    // Log to console for debugging
    if (this.isClient) {
      this.logToConsole(logEntry);
    }

    return logEntry;
  }

  /**
   * Log connection events
   */
  logConnection(
    status: 'connecting' | 'connected' | 'disconnected' | 'error',
    endpoint: string,
    retryCount: number = 0,
    error?: Error,
    connectionId?: string
  ): SSELogEntry {
    const message = {
      connecting: `Connecting to SSE endpoint: ${endpoint}`,
      connected: `Connected to SSE endpoint: ${endpoint}`,
      disconnected: `Disconnected from SSE endpoint: ${endpoint}`,
      error: `Connection error for endpoint: ${endpoint}`,
    }[status];

    return this.addLog(
      status === 'error' ? 'error' : 'info',
      message,
      error ? { error: error.message, stack: error.stack } : undefined,
      {
        connectionId,
        retryCount,
        endpoint,
      }
    );
  }

  /**
   * Log SSE events
   */
  logEvent(
    eventType: string,
    data: unknown,
    eventId?: string,
    latency?: number,
    endpoint?: string
  ): SSELogEntry {
    return this.addLog(
      'info',
      `Received SSE event: ${eventType}`,
      data,
      {
        eventId,
        latency,
        endpoint,
      }
    );
  }

  /**
   * Log retry attempts
   */
  logRetry(
    endpoint: string,
    retryCount: number,
    error?: Error,
    delay: number = 5000
  ): SSELogEntry {
    return this.addLog(
      'warn',
      `Retrying SSE connection (${retryCount}) to ${endpoint} in ${delay}ms`,
      error ? { error: error.message } : undefined,
      {
        retryCount,
        endpoint,
      }
    );
  }

  /**
   * Update connection metrics
   */
  updateConnectionMetrics(
    connectionId: string,
    updates: Partial<SSEConnectionMetrics>
  ): void {
    const current = this.connectionMetrics.get(connectionId) || {
      connectedAt: new Date(),
      retryCount: 0,
      totalEventsReceived: 0,
      errorCount: 0,
    };

    this.connectionMetrics.set(connectionId, { ...current, ...updates });
  }

  /**
   * Get logs filtered by criteria
   */
  getLogs(options?: {
    level?: SSELogEntry['level'][];
    source?: SSELogEntry['source'];
    since?: Date;
    limit?: number;
    endpoint?: string;
  }): SSELogEntry[] {
    let filtered = [...this.logs];

    if (options?.level) {
      filtered = filtered.filter(log => options.level!.includes(log.level));
    }

    if (options?.source) {
      filtered = filtered.filter(log => log.source === options.source);
    }

    if (options?.since) {
      filtered = filtered.filter(log => log.timestamp >= options.since!);
    }

    if (options?.endpoint) {
      filtered = filtered.filter(log =>
        log.metadata?.endpoint === options.endpoint
      );
    }

    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  /**
   * Get connection metrics
   */
  getConnectionMetrics(connectionId?: string): SSEConnectionMetrics | Map<string, SSEConnectionMetrics> {
    if (connectionId) {
      return this.connectionMetrics.get(connectionId) || {
        connectedAt: new Date(),
        retryCount: 0,
        totalEventsReceived: 0,
        errorCount: 0,
      };
    }
    return this.connectionMetrics;
  }

  /**
   * Export logs for takeout functionality
   */
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify({
        logs: this.logs,
        connectionMetrics: Object.fromEntries(this.connectionMetrics),
        exportedAt: new Date().toISOString(),
        totalLogs: this.logs.length,
      }, null, 2);
    }

    // CSV format
    const headers = [
      'ID', 'Timestamp', 'Level', 'Source', 'Message', 'Endpoint', 'Connection ID',
      'Retry Count', 'Latency', 'Event ID'
    ];

    const rows = this.logs.map(log => [
      log.id,
      log.timestamp.toISOString(),
      log.level,
      log.source,
      log.message.replace(/"/g, '""'), // Escape quotes for CSV
      log.metadata?.endpoint || '',
      log.metadata?.connectionId || '',
      log.metadata?.retryCount?.toString() || '',
      log.metadata?.latency?.toString() || '',
      log.metadata?.eventId || '',
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Clear all logs and metrics
   */
  clear(): void {
    this.logs = [];
    this.connectionMetrics.clear();
    this.addLog('info', 'Logs cleared', undefined, { internal: true });
  }

  /**
   * Get log statistics
   */
  getStats() {
    const levelCounts = this.logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sourceCounts = this.logs.reduce((acc, log) => {
      acc[log.source] = (acc[log.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLogs: this.logs.length,
      levelCounts,
      sourceCounts,
      connections: this.connectionMetrics.size,
      oldestLog: this.logs[this.logs.length - 1]?.timestamp,
      newestLog: this.logs[0]?.timestamp,
    };
  }

  /**
   * Private method to log to console on client side
   */
  private logToConsole(log: SSELogEntry): void {
    const timestamp = log.timestamp.toISOString();
    const prefix = `[${timestamp}] [${log.source.toUpperCase()}] [${log.level.toUpperCase()}]`;

    switch (log.level) {
      case 'error':
        console.error(prefix, log.message, log.data);
        break;
      case 'warn':
        console.warn(prefix, log.message, log.data);
        break;
      case 'debug':
        console.debug(prefix, log.message, log.data);
        break;
      case 'success':
        console.log(prefix, log.message, log.data);
        break;
      default:
        console.log(prefix, log.message, log.data);
    }
  }
}

// Create singleton instances
export const clientSSELogger = new SSELogger(true);
export const serverSSELogger = new SSELogger(false);