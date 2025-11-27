"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { clientSSELogger } from "@/lib/sse-logger";

interface DashboardStats {
  totalLogs: number;
  levelCounts: Record<string, number>;
  sourceCounts: Record<string, number>;
  connections: number;
  oldestLog?: Date;
  newestLog?: Date;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLogs: 0,
    levelCounts: {},
    sourceCounts: {},
    connections: 0,
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load stats from API
      const response = await fetch('/api/logs?limit=1');
      const data = await response.json();

      if (data.stats) {
        setStats({
          totalLogs: data.stats.totalLogs || 0,
          levelCounts: data.stats.levelCounts || {},
          sourceCounts: data.stats.sourceCounts || {},
          connections: data.stats.connections || 0,
          oldestLog: data.stats.oldestLog ? new Date(data.stats.oldestLog) : undefined,
          newestLog: data.stats.newestLog ? new Date(data.stats.newestLog) : undefined,
        });
      }

      // Load recent logs
      const logsResponse = await fetch('/api/logs?limit=20');
      const logsData = await logsResponse.json();
      setRecentLogs(logsData.logs || []);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setLoading(false);
    }
  };

  const formatTime = (date: Date | undefined) => {
    return date?.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) || 'N/A';
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-500 text-white';
      case 'warn': return 'bg-yellow-500 text-white';
      case 'success': return 'bg-green-500 text-white';
      case 'debug': return 'bg-purple-500 text-white';
      case 'connection': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const takeoutData = async () => {
    try {
      const response = await fetch('/api/takeout?format=json');
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `takeout-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      clientSSELogger.addLog('success', 'Takeout data exported');
    } catch (error) {
      clientSSELogger.addLog('error', 'Failed to export takeout data', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl animate-spin">🔄</div>
          <p className="text-primary-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">SSE Dashboard</h1>
            <p className="mt-2 text-primary-subtle">Comprehensive monitoring and analytics</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={takeoutData}
              className="flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-2 text-sm text-green-400 transition-colors hover:bg-green-500/20 hover:text-green-300"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export All Data
            </button>

            <Link
              href="/sse-logs"
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-primary-muted transition-colors hover:bg-surface-hover"
            >
              View Logs
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Logs */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-subtle">Total Logs</p>
                <p className="mt-2 text-3xl font-bold text-primary">{stats.totalLogs.toLocaleString()}</p>
              </div>
              <div className="text-4xl text-primary-subtle">📊</div>
            </div>
          </div>

          {/* Active Connections */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-subtle">Active Connections</p>
                <p className="mt-2 text-3xl font-bold text-primary">{stats.connections}</p>
              </div>
              <div className="text-4xl text-primary-subtle">🔌</div>
            </div>
          </div>

          {/* Error Rate */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-subtle">Error Logs</p>
                <p className="mt-2 text-3xl font-bold text-red-400">{stats.levelCounts.error || 0}</p>
              </div>
              <div className="text-4xl text-red-400">❌</div>
            </div>
          </div>

          {/* Success Rate */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-subtle">Success Logs</p>
                <p className="mt-2 text-3xl font-bold text-green-400">{stats.levelCounts.success || 0}</p>
              </div>
              <div className="text-4xl text-green-400">✅</div>
            </div>
          </div>
        </div>

        {/* Charts and Details */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Level Distribution */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Log Level Distribution</h2>
            <div className="space-y-3">
              {Object.entries(stats.levelCounts).map(([level, count]) => (
                <div key={level} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex h-2 w-2 rounded-full ${getLevelColor(level)}`} />
                    <span className="text-sm text-primary-muted capitalize">{level}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary">{count}</span>
                    <span className="text-xs text-primary-subtle">
                      ({stats.totalLogs > 0 ? Math.round((count / stats.totalLogs) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Source Distribution */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Source Distribution</h2>
            <div className="space-y-3">
              {Object.entries(stats.sourceCounts).map(([source, count]) => (
                <div key={source} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-sm text-primary-muted capitalize">{source}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary">{count}</span>
                    <span className="text-xs text-primary-subtle">
                      ({stats.totalLogs > 0 ? Math.round((count / stats.totalLogs) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Logs */}
        <div className="mt-8 card">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-primary">Recent Logs</h2>
          </div>
          <div className="divide-y divide-border">
            {recentLogs.length === 0 ? (
              <div className="p-6 text-center text-primary-subtle">
                <p>No logs available</p>
              </div>
            ) : (
              recentLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex h-2 w-2 rounded-full ${getLevelColor(log.level)}`} />
                    <span className="text-sm font-mono text-primary-subtle">
                      {formatTime(log.timestamp)}
                    </span>
                    <span className="text-sm font-medium text-primary">
                      {log.message}
                    </span>
                    <span className="text-xs text-primary-subtle">
                      [{log.source}]
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="mt-8 card">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-primary">Activity Timeline</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-primary-subtle">Oldest Log</p>
                <p className="text-sm text-primary">
                  {stats.oldestLog ? formatTime(stats.oldestLog) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-primary-subtle">Newest Log</p>
                <p className="text-sm text-primary">
                  {stats.newestLog ? formatTime(stats.newestLog) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}