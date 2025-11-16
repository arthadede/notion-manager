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
    <div className="card">
      <div className="space-y-4">
        <div className="skeleton h-10 w-full rounded-md"></div>
        <div className="skeleton h-10 w-full rounded-md"></div>
        <div className="skeleton h-10 w-full rounded-md"></div>
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Activity Tracker</h1>
          <Link href="/" className="text-sm text-gray-400 hover:text-white">
            ← Back
          </Link>
        </div>

        {currentActivity && (
          <div className="mb-4 rounded-lg bg-zinc-900 p-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-gray-400">
                Current: <span className="text-white">{currentActivity.name}</span>
              </span>
            </div>
          </div>
        )}

        {initialLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="card">
            <div className="space-y-4">
              <div>
                <label htmlFor="activity" className="mb-2 block text-sm font-medium">
                  Activity
                </label>
                <select
                  id="activity"
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                  className="form-control"
                  disabled={loading}
                >
                  <option value="">Select activity</option>
                  {activities.map((activity) => (
                    <option key={activity} value={activity}>
                      {activity}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="notes" className="mb-2 block text-sm font-medium">
                  Notes <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  id="notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes..."
                  className="form-control"
                  disabled={loading}
                />
              </div>

              <button
                onClick={handleUpdate}
                disabled={loading || !selectedActivity}
                className="btn w-full"
              >
                {loading ? "Updating..." : "Update Activity"}
              </button>

              {message && (
                <div
                  className={`rounded-lg p-3 text-sm ${
                    message.includes("success")
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                  role="alert"
                >
                  {message}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
