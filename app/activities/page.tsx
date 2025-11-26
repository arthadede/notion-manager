"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Activity {
  id: string;
  name: string;
  notes: string;
  startTime: string;
  endTime: string | null;
}

export default function ActivityTracker() {
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [activities, setActivities] = useState<string[]>([]);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  // Format time to 12-hour format
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");
    return `${formattedHours}:${formattedMinutes}${ampm}`;
  };

  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      try {
        const [currentResponse, activitiesResponse] = await Promise.all([fetch("/api/current"), fetch("/api")]);

        const currentData = await currentResponse.json();
        const activitiesData = await activitiesResponse.json();

        if (mounted) {
          if (currentData.activity) {
            setCurrentActivity(currentData.activity);
            setSelectedActivity(currentData.activity.name);
          }

          setActivities(activitiesData.activities || []);
          setInitialLoading(false);
        }
      } catch {
        if (mounted) {
          setMessage("Failed to load initial data");
          setInitialLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, []);

  const fetchCurrentActivity = async () => {
    try {
      const response = await fetch("/api/current");
      const data = await response.json();
      if (data.activity) {
        setCurrentActivity(data.activity);
        setSelectedActivity(data.activity.name);
      }
    } catch {
      // Silently fail to avoid showing error message during update
    }
  };

  const LoadingSkeleton = () => (
    <div className="card animate-pulse">
      <div className="space-y-4">
        <div className="h-12 w-full rounded-lg bg-surface-hover"></div>
        <div className="h-12 w-full rounded-lg bg-surface-hover"></div>
        <div className="h-12 w-3/4 rounded-lg bg-surface-hover"></div>
      </div>
    </div>
  );

  const handleUpdate = async () => {
    if (!selectedActivity) {
      setMessage("Please select an activity");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentActivityId: currentActivity?.id,
          newActivityName: selectedActivity,
          notes,
        }),
      });

      if (response.ok) {
        setMessage("Activity updated successfully!");
        setNotes("");
        await fetchCurrentActivity();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to update activity");
      }
    } catch {
      setMessage("Error updating activity");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSwitch = async (activityName: string) => {
    // Don't do anything if clicking the current activity
    if (currentActivity && currentActivity.name === activityName) {
      return;
    }

    setLoading(true);
    setMessage("");
    setSelectedActivity(activityName);

    try {
      const response = await fetch("/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentActivityId: currentActivity?.id,
          newActivityName: activityName,
          notes: "",
        }),
      });

      if (response.ok) {
        setMessage("Activity updated successfully!");
        await fetchCurrentActivity();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to update activity");
      }
    } catch {
      setMessage("Error updating activity");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 lg:py-16">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Activity Tracker</h1>
            <p className="mt-1 text-sm text-primary-subtle">Monitor your daily activities</p>
          </div>
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-primary-muted transition-all duration-200 hover:border-border-hover hover:bg-surface-hover hover:text-primary"
          >
            <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
        </div>

        {/* Quick Action Shortcuts */}
        {!initialLoading && activities.length > 0 && (
          <div className="mb-6 animate-fade-in">
            <h2 className="mb-3 text-sm font-medium text-primary">Quick Actions</h2>
            <div className="flex flex-wrap gap-2">
              {activities.map((activity) => {
                const isActive = currentActivity?.name === activity;
                return (
                  <button
                    key={activity}
                    onClick={() => handleQuickSwitch(activity)}
                    disabled={loading || isActive}
                    className={`group relative overflow-hidden rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "border-accent-green/40 bg-accent-green/10 text-accent-green cursor-default"
                        : "border-border bg-surface text-primary-muted hover:border-border-hover hover:bg-surface-hover hover:text-primary active:scale-95"
                    } ${loading && !isActive ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isActive && (
                      <span className="absolute inset-0 bg-gradient-to-r from-accent-green/5 to-transparent animate-pulse"></span>
                    )}
                    <span className="relative flex items-center gap-2">
                      {isActive && (
                        <span className="flex h-2 w-2">
                          <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-accent-green opacity-75"></span>
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-green"></span>
                        </span>
                      )}
                      {activity}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Current Activity Badge */}
        {currentActivity && (
          <div className="mb-6 animate-fade-in">
            <div className="flex items-center gap-3 rounded-lg border border-accent-green/20 bg-accent-green/5 p-4">
              <div className="relative flex h-3 w-3 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-green opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-accent-green"></span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-primary-subtle">Currently Active</p>
                <p className="font-medium text-primary">
                  {formatTime(currentActivity.startTime)} {currentActivity.name}
                  {currentActivity.notes && ` - ${currentActivity.notes}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {initialLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="card animate-slide-up">
            <div className="space-y-6">
              {/* Activity Select */}
              <div>
                <label htmlFor="activity" className="mb-2 block text-sm font-medium text-primary">
                  Select Activity
                </label>
                <select
                  id="activity"
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                  className="select"
                  disabled={loading}
                >
                  <option value="">Choose an activity...</option>
                  {activities.map((activity) => (
                    <option key={activity} value={activity}>
                      {activity}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes Input */}
              <div>
                <label htmlFor="notes" className="mb-2 block text-sm font-medium text-primary">
                  Notes{" "}
                  <span className="font-normal text-primary-subtle">(optional)</span>
                </label>
                <input
                  id="notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  className="input"
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <button onClick={handleUpdate} disabled={loading || !selectedActivity} className="btn-primary">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  "Update Activity"
                )}
              </button>

              {/* Status Message */}
              {message && (
                <div
                  className={`animate-fade-in ${
                    message.includes("success") ? "alert-success" : "alert-error"
                  }`}
                  role="alert"
                >
                  <div className="flex items-center gap-2">
                    {message.includes("success") ? (
                      <svg className="h-5 w-5 text-accent-green" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-accent-red" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <span>{message}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
