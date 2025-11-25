"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  isNotificationSupported,
  isNotificationEnabled,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  getCurrentSubscription,
  sendTestNotification,
} from "@/lib/notification-client";

interface SubscriptionStats {
  total: number;
  subscriptions: Array<{
    id: string;
    createdAt: string;
    updatedAt: string;
    userAgent?: string;
  }>;
}

export default function DebugPage() {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState<SubscriptionStats | null>(null);

  // Broadcast notification form
  const [broadcastTitle, setBroadcastTitle] = useState("Test Notification");
  const [broadcastBody, setBroadcastBody] = useState("This is a test broadcast notification!");
  const [broadcastUrl, setBroadcastUrl] = useState("/");

  useEffect(() => {
    // Check notification status on mount
    const checkStatus = async () => {
      setIsSupported(isNotificationSupported());
      setIsEnabled(isNotificationEnabled());
      const subscription = await getCurrentSubscription();
      setIsSubscribed(!!subscription);
    };

    // Fetch stats on mount
    const loadStats = async () => {
      try {
        const response = await fetch("/api/notifications/broadcast");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    checkStatus();
    loadStats();
  }, []);

  const checkNotificationStatus = async () => {
    setIsSupported(isNotificationSupported());
    setIsEnabled(isNotificationEnabled());
    const subscription = await getCurrentSubscription();
    setIsSubscribed(!!subscription);
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/notifications/broadcast");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleEnableNotifications = async () => {
    setLoading(true);
    setMessage("");
    try {
      await subscribeToPushNotifications();
      setMessage("✅ Notifications enabled successfully!");
      await checkNotificationStatus();
      await fetchStats();
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
    setLoading(false);
  };

  const handleDisableNotifications = async () => {
    setLoading(true);
    setMessage("");
    try {
      await unsubscribeFromPushNotifications();
      setMessage("✅ Notifications disabled successfully!");
      await checkNotificationStatus();
      await fetchStats();
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
    setLoading(false);
  };

  const handleTestLocal = async () => {
    setLoading(true);
    setMessage("");
    try {
      await sendTestNotification("Test Notification", "This is a local test notification!");
      setMessage("✅ Local notification sent!");
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
    setLoading(false);
  };

  const handleBroadcast = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/notifications/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: broadcastTitle,
          body: broadcastBody,
          url: broadcastUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          `✅ Broadcast sent! Total: ${data.total}, Successful: ${data.successful}, Failed: ${data.failed}`
        );
        await fetchStats();
      } else {
        setMessage(`❌ Error: ${data.error || "Failed to broadcast"}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-primary">Debug Console</h1>
            <p className="text-primary-subtle">Push Notification Testing & Management</p>
          </div>
          <Link
            href="/"
            className="rounded-lg bg-surface px-4 py-2 text-sm text-primary transition-colors hover:bg-surface-hover"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Status Section */}
        <div className="mb-6 rounded-xl bg-surface p-6">
          <h2 className="mb-4 text-xl font-semibold text-primary">System Status</h2>
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <span className="text-primary-muted">Browser Support:</span>
              <span className={isSupported ? "text-green-400" : "text-red-400"}>
                {isSupported ? "✅ Supported" : "❌ Not Supported"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-primary-muted">Notification Permission:</span>
              <span className={isEnabled ? "text-green-400" : "text-yellow-400"}>
                {isEnabled ? "✅ Granted" : "⚠️ Not Granted"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-primary-muted">Push Subscription:</span>
              <span className={isSubscribed ? "text-green-400" : "text-gray-400"}>
                {isSubscribed ? "✅ Active" : "○ Inactive"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-primary-muted">Total Subscribers:</span>
              <span className="text-primary">{stats?.total || 0}</span>
            </div>
          </div>
        </div>

        {/* Enable/Disable Section */}
        {isSupported && (
          <div className="mb-6 rounded-xl bg-surface p-6">
            <h2 className="mb-4 text-xl font-semibold text-primary">Subscription Control</h2>
            <div className="flex gap-3">
              {!isSubscribed ? (
                <button
                  onClick={handleEnableNotifications}
                  disabled={loading}
                  className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Enable Notifications"}
                </button>
              ) : (
                <button
                  onClick={handleDisableNotifications}
                  disabled={loading}
                  className="rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Disable Notifications"}
                </button>
              )}
              <button
                onClick={handleTestLocal}
                disabled={loading || !isEnabled}
                className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                Test Local Notification
              </button>
            </div>
          </div>
        )}

        {/* Broadcast Section */}
        <div className="mb-6 rounded-xl bg-surface p-6">
          <h2 className="mb-4 text-xl font-semibold text-primary">Broadcast Notification</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-primary-muted">
                Title
              </label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full rounded-lg bg-background px-4 py-2 text-primary"
                placeholder="Notification title"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-primary-muted">
                Message
              </label>
              <textarea
                value={broadcastBody}
                onChange={(e) => setBroadcastBody(e.target.value)}
                className="w-full rounded-lg bg-background px-4 py-2 text-primary"
                rows={3}
                placeholder="Notification message"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-primary-muted">
                URL (optional)
              </label>
              <input
                type="text"
                value={broadcastUrl}
                onChange={(e) => setBroadcastUrl(e.target.value)}
                className="w-full rounded-lg bg-background px-4 py-2 text-primary"
                placeholder="/page-to-open"
              />
            </div>
            <button
              onClick={handleBroadcast}
              disabled={loading || !broadcastTitle || !broadcastBody}
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-bold text-white transition-all hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
            >
              {loading ? "Sending..." : "📢 Send Broadcast to All Users"}
            </button>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className="mb-6 rounded-xl bg-surface p-4">
            <p className="text-primary">{message}</p>
          </div>
        )}

        {/* Subscribers List */}
        {stats && stats.subscriptions.length > 0 && (
          <div className="rounded-xl bg-surface p-6">
            <h2 className="mb-4 text-xl font-semibold text-primary">Active Subscribers</h2>
            <div className="space-y-3">
              {stats.subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-lg bg-background p-4 text-sm"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-mono text-primary-muted">{sub.id}</span>
                    <span className="text-xs text-primary-subtle">
                      {new Date(sub.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {sub.userAgent && (
                    <p className="truncate text-xs text-primary-subtle">{sub.userAgent}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
