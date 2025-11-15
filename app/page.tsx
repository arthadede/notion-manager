"use client";

import { useState, useEffect } from "react";

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

  useEffect(() => {
    fetchCurrentActivity();
    fetchActivities();
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
      setMessage("Failed to fetch current activity");
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api");
      const data = await response.json();
      setActivities(data.activities || []);
    } catch {
      setMessage("Failed to fetch activities");
    }
  };

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
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-2xl px-4 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-4 text-5xl font-bold">Activity Tracker</h1>
          {currentActivity && (
            <div className="flex items-center gap-2 text-gray-400">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
              <span className="text-sm">
                Currently tracking: <span className="font-medium text-white">{currentActivity.name}</span>
              </span>
            </div>
          )}
        </div>

        {/* Main Card */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8">
          <div className="space-y-6">
            {/* Activity Dropdown */}
            <div>
              <label htmlFor="activity" className="mb-3 block text-sm font-medium text-gray-400">
                Activity
              </label>
              <select
                id="activity"
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-black px-4 py-3 text-white transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-white"
              >
                <option value="">Select an activity</option>
                {activities.map((activity) => (
                  <option key={activity} value={activity}>
                    {activity}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes Input */}
            <div>
              <label htmlFor="notes" className="mb-3 block text-sm font-medium text-gray-400">
                Notes <span className="text-gray-600">(optional)</span>
              </label>
              <input
                id="notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes..."
                className="w-full rounded-md border border-zinc-800 bg-black px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>

            {/* Update Button */}
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="w-full rounded-md bg-white px-4 py-3 font-medium text-black transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:bg-gray-800 disabled:text-gray-600"
            >
              {loading ? "Updating..." : "Update Activity"}
            </button>

            {/* Message */}
            {message && (
              <div
                className={`rounded-md p-4 text-sm ${
                  message.includes("success")
                    ? "border border-green-500/20 bg-green-500/10 text-green-400"
                    : "border border-red-500/20 bg-red-500/10 text-red-400"
                }`}
              >
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">Powered by Notion API</div>
      </div>
    </div>
  );
}
