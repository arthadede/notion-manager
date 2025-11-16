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
    <div className="animate-fade-in" aria-label="Loading activity tracker" role="status" aria-live="polite">
      <p className="sr-only">Loading application data...</p>

      <div className="card">
        <div className="space-y-6">
          <div>
            <div className="skeleton mb-3 h-5 w-16 rounded-md" aria-hidden="true"></div>
            <div className="skeleton h-12 w-full rounded-md" aria-hidden="true"></div>
          </div>

          <div>
            <div className="skeleton mb-3 h-5 w-12 rounded-md" aria-hidden="true"></div>
            <div className="skeleton h-12 w-full rounded-md" aria-hidden="true"></div>
          </div>

          <div className="skeleton-loading h-12 w-full rounded-md" aria-hidden="true"></div>
        </div>
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
    <>
      <a href="#main" className="skip-to-main">
        Skip to main content
      </a>
      <div className="min-h-screen bg-black text-white">
        <div className="container">
          <div className="py-responsive mb-responsive mb-12 py-16">
            {initialLoading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {/* Main Card */}
                <div className="card animate-fade-in" role="main" id="main">
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
                        className="form-control focus-visible"
                        aria-describedby={selectedActivity ? "" : "activity-help"}
                        aria-required="true"
                      >
                        <option value="">Select an activity</option>
                        {activities.map((activity) => (
                          <option key={activity} value={activity}>
                            {activity}
                          </option>
                        ))}
                      </select>
                      {!selectedActivity && (
                        <p id="activity-help" className="mt-2 text-sm text-gray-600">
                          Please choose an activity from the list
                        </p>
                      )}
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
                        className="form-control focus-visible"
                        aria-describedby="notes-help"
                      />
                      <p id="notes-help" className="mt-2 text-sm text-gray-600">
                        Add any additional context or details about your activity
                      </p>
                    </div>

                    {/* Update Button */}
                    <button
                      onClick={handleUpdate}
                      disabled={loading || !selectedActivity}
                      className={`btn ${loading ? "loading" : ""} focus-visible`}
                      aria-describedby="update-status"
                    >
                      {loading ? "Updating..." : "Update Activity"}
                    </button>

                    {/* Status Message */}
                    {message && (
                      <div
                        className={`status-indicator animate-slide-in ${
                          message.includes("success") ? "status-success" : "status-error"
                        }`}
                        role="alert"
                        aria-live="polite"
                        id="update-status"
                      >
                        {message}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
