import { useState, useEffect } from 'react';

interface Activity {
  id: string;
  name: string;
  notes: string;
  startTime: string;
  endTime: string | null;
}

function App() {
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [activities, setActivities] = useState<string[]>([]);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // In combined mode, use same-origin relative API paths

  useEffect(() => {
    fetchCurrentActivity();
    fetchActivities();
  }, []);

  const fetchCurrentActivity = async () => {
    try {
      const response = await fetch('/api/activities/current');
      const data = await response.json();
      if (data.activity) {
        setCurrentActivity(data.activity);
        setSelectedActivity(data.activity.name);
      }
    } catch (error) {
      setMessage('Failed to fetch current activity');
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities');
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      setMessage('Failed to fetch activities');
    }
  };

  const handleUpdate = async () => {
    if (!selectedActivity) {
      setMessage('Please select an activity');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentActivityId: currentActivity?.id,
          newActivityName: selectedActivity,
          notes,
        }),
      });

      if (response.ok) {
        setMessage('Activity updated successfully!');
        setNotes('');
        fetchCurrentActivity();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to update activity');
      }
    } catch (error) {
      setMessage('Error updating activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Activity Tracker</h1>
          {currentActivity && (
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">
                Currently tracking: <span className="text-white font-medium">{currentActivity.name}</span>
              </span>
            </div>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <div className="space-y-6">
            {/* Activity Dropdown */}
            <div>
              <label htmlFor="activity" className="block text-sm font-medium text-gray-400 mb-3">
                Activity
              </label>
              <select
                id="activity"
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
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
              <label htmlFor="notes" className="block text-sm font-medium text-gray-400 mb-3">
                Notes <span className="text-gray-600">(optional)</span>
              </label>
              <input
                id="notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes..."
                className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
              />
            </div>

            {/* Update Button */}
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="w-full px-4 py-3 bg-white text-black font-medium rounded-md hover:bg-gray-200 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Updating...' : 'Update Activity'}
            </button>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-md text-sm ${
                message.includes('success')
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          Powered by Notion API
        </div>
      </div>
    </div>
  );
}

export default App;
