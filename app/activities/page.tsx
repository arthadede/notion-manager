"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Activity {
  id: string;
  name: string;
  duration: number;
  createdTime: string;
}

interface Emotion {
  id: string;
  name: string;
  duration: number;
  createdTime: string;
}

export default function ActivityTracker() {
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [activities, setActivities] = useState<string[]>([]);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(null);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [loading, setLoading] = useState(false);
  const [emotionLoading, setEmotionLoading] = useState(false);
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

  // Calculate duration from created time
  const calculateDuration = (createdTime: string) => {
    const created = new Date(createdTime).getTime();
    const now = new Date().getTime();
    const diffMs = now - created;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;

    if (diffHours === 0) {
      return `${remainingMinutes}m`;
    } else if (remainingMinutes === 0) {
      return `${diffHours}h`;
    } else {
      return `${diffHours}h ${remainingMinutes}m`;
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      try {
        const [currentResponse, activitiesResponse, currentEmotionResponse, emotionsResponse] = await Promise.all([
          fetch("/api/current"),
          fetch("/api"),
          fetch("/api/emotions/current"),
          fetch("/api/emotions")
        ]);

        const currentData = await currentResponse.json();
        const activitiesData = await activitiesResponse.json();
        const currentEmotionData = await currentEmotionResponse.json();
        const emotionsData = await emotionsResponse.json();

        if (mounted) {
          // getCurrentActivity() now always returns an activity
          if (currentData.activity) {
            setCurrentActivity(currentData.activity);
            setSelectedActivity(currentData.activity.name);
          } else {
            // Fallback handling in case API structure changes
            console.warn("No activity returned from API");
          }

          if (currentEmotionData.emotion) {
            setCurrentEmotion(currentEmotionData.emotion);
            setSelectedEmotion(currentEmotionData.emotion.name);
          } else {
            console.warn("No emotion returned from API");
          }

          setActivities(activitiesData.activities || []);
          setEmotions(emotionsData.emotions || []);
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
      } else {
        console.warn("No activity returned from current API");
      }
    } catch (error) {
      // Silently fail to avoid showing error message during update
      console.warn("Failed to fetch current activity:", error);
    }
  };

  const fetchCurrentEmotion = async () => {
    try {
      const response = await fetch("/api/emotions/current");
      const data = await response.json();
      if (data.emotion) {
        setCurrentEmotion(data.emotion);
        setSelectedEmotion(data.emotion.name);
      } else {
        console.warn("No emotion returned from current API");
      }
    } catch (error) {
      // Silently fail to avoid showing error message during update
      console.warn("Failed to fetch current emotion:", error);
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

  const handleEmotionQuickSwitch = async (emotionName: string) => {
    // Don't do anything if clicking the current emotion
    if (currentEmotion && currentEmotion.name === emotionName) {
      return;
    }

    setEmotionLoading(true);
    setMessage("");
    setSelectedEmotion(emotionName);

    try {
      const response = await fetch("/api/emotions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentEmotionId: currentEmotion?.id,
          newEmotionName: emotionName,
        }),
      });

      if (response.ok) {
        setMessage("Emotion updated successfully!");
        await fetchCurrentEmotion();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to update emotion");
      }
    } catch {
      setMessage("Error updating emotion");
    } finally {
      setEmotionLoading(false);
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
                  {formatTime(currentActivity.createdTime)} {currentActivity.name}
                </p>
                <p className="text-xs text-primary-subtle mt-1">
                  Duration: {calculateDuration(currentActivity.createdTime)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Current Emotion Badge */}
        {currentEmotion && (
          <div className="mb-6 animate-fade-in">
            <div className="flex items-center gap-3 rounded-lg border border-accent-purple/20 bg-accent-purple/5 p-4">
              <div className="relative flex h-3 w-3 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-purple opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-accent-purple"></span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-primary-subtle">Current Emotion</p>
                <p className="font-medium text-primary">
                  {formatTime(currentEmotion.createdTime)} {currentEmotion.name}
                </p>
                <p className="text-xs text-primary-subtle mt-1">
                  Duration: {calculateDuration(currentEmotion.createdTime)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Emotion Switches */}
        {!initialLoading && emotions.length > 0 && (
          <div className="mb-6 animate-fade-in">
            <h2 className="mb-3 text-sm font-medium text-primary">Quick Emotions</h2>
            <div className="flex flex-wrap gap-2">
              {emotions.map((emotion) => {
                const isActive = currentEmotion?.name === emotion;
                return (
                  <button
                    key={emotion}
                    onClick={() => handleEmotionQuickSwitch(emotion)}
                    disabled={emotionLoading || isActive}
                    className={`group relative overflow-hidden rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "border-accent-purple/40 bg-accent-purple/10 text-accent-purple cursor-default"
                        : "border-border bg-surface text-primary-muted hover:border-border-hover hover:bg-surface-hover hover:text-primary active:scale-95"
                    } ${emotionLoading && !isActive ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isActive && (
                      <span className="absolute inset-0 bg-gradient-to-r from-accent-purple/5 to-transparent animate-pulse"></span>
                    )}
                    <span className="relative flex items-center gap-2">
                      {isActive && (
                        <span className="flex h-2 w-2">
                          <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-accent-purple opacity-75"></span>
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-purple"></span>
                        </span>
                      )}
                      {emotion}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Status Message */}
        {message && (
          <div className="fixed top-4 right-4 z-50">
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
          </div>
        )}
      </div>
    </div>
  );
}
