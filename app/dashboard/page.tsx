"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DashboardStats {
  totalActivities: number;
  todayActivities: number;
  currentActivity: string | null;
  startTime: Date | null;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalActivities: 0,
    todayActivities: 0,
    currentActivity: null,
    startTime: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load activities from API
        const response = await fetch('/api/activities?limit=1');
        const data = await response.json();

        if (data.activities) {
          const totalActivities = data.activities.length;
          const todayActivities = data.activities.filter((activity: { created_time?: string; properties?: { Start?: { date?: { start?: string } } } }) => {
            const activityDate = new Date(activity.properties?.Start?.date?.start || activity.created_time || Date.now());
            const today = new Date();
            return activityDate.toDateString() === today.toDateString();
          }).length;

          setStats(prev => ({
            ...prev,
            totalActivities,
            todayActivities,
          }));
        }

        // Load current activity
        const currentResponse = await fetch('/api/current');
        const currentData = await currentResponse.json();

        if (currentData.activity) {
          setStats(prev => ({
            ...prev,
            currentActivity: currentData.activity.properties.Name.title[0]?.plain_text || 'Unknown Activity',
            startTime: currentData.activity.properties.Start?.date?.start ? new Date(currentData.activity.properties.Start.date.start) : null,
          }));
        }

        setLoading(false);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

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
    } catch (error) {
      console.error('Failed to export takeout data', error);
    }
  };

  const formatDuration = (startTime: Date | null) => {
    if (!startTime) return 'N/A';

    const now = new Date();
    const diffMs = now.getTime() - startTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHours}h ${diffMinutes}m`;
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
            <h1 className="text-3xl font-bold text-primary">Activity Dashboard</h1>
            <p className="mt-2 text-primary-subtle">Track and manage your daily activities</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={takeoutData}
              className="flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-2 text-sm text-green-400 transition-colors hover:bg-green-500/20 hover:text-green-300"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Data
            </button>

            <Link
              href="/activities"
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-primary-muted transition-colors hover:bg-surface-hover"
            >
              View Activities
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Activities */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-subtle">Total Activities</p>
                <p className="mt-2 text-3xl font-bold text-primary">{stats.totalActivities.toLocaleString()}</p>
              </div>
              <div className="text-4xl text-primary-subtle">📋</div>
            </div>
          </div>

          {/* Today&apos;s Activities */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-subtle">Today&apos;s Activities</p>
                <p className="mt-2 text-3xl font-bold text-primary">{stats.todayActivities}</p>
              </div>
              <div className="text-4xl text-primary-subtle">📅</div>
            </div>
          </div>

          {/* Current Activity */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-subtle">Current Activity</p>
                <p className="mt-2 text-lg font-bold text-primary">
                  {stats.currentActivity || 'None'}
                </p>
              </div>
              <div className="text-4xl text-primary-subtle">▶️</div>
            </div>
          </div>

          {/* Duration */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-subtle">Current Duration</p>
                <p className="mt-2 text-3xl font-bold text-primary">
                  {formatDuration(stats.startTime)}
                </p>
              </div>
              <div className="text-4xl text-primary-subtle">⏱️</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Activity Status */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Activity Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-muted">Tracking Active</span>
                <span className="text-sm font-semibold text-green-400">
                  {stats.currentActivity ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-muted">Activities Today</span>
                <span className="text-sm font-semibold text-primary">{stats.todayActivities}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-muted">Total Recorded</span>
                <span className="text-sm font-semibold text-primary">{stats.totalActivities}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/activities"
                className="block w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-primary-muted transition-colors hover:bg-surface-hover"
              >
                Manage Activities
              </Link>
              <Link
                href="/transactions"
                className="block w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-primary-muted transition-colors hover:bg-surface-hover"
              >
                View Transactions
              </Link>
              <Link
                href="https://histweety-reader.vercel.app/"
                target="_blank"
                className="block w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-primary-muted transition-colors hover:bg-surface-hover"
              >
                Book Reader
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}