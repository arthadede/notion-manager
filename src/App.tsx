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

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchCurrentActivity();
    fetchActivities();
  }, []);

  const fetchCurrentActivity = async () => {
    try {
      const response = await fetch(`${API_URL}/api/current-activity`);
      const data = await response.json();
      if (data.activity) {
        setCurrentActivity(data.activity);
        setSelectedActivity(data.activity.name);
      }
    } catch (error) {
      console.error('Error fetching current activity:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch(`${API_URL}/api/activities`);
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
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
      const response = await fetch(`${API_URL}/api/update-activity`, {
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
      console.error('Error updating activity:', error);
      setMessage('Error updating activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Activity Tracker</h1>
          {currentActivity && (
            <p className="text-gray-400 text-sm">
              Current: <span className="text-white font-medium">{currentActivity.name}</span>
            </p>
          )}
        </div>

        <div className="space-y-4">
          {/* Activity Dropdown */}
          <div>
            <label htmlFor="activity" className="block text-sm font-medium text-gray-400 mb-2">
              Activity
            </label>
            <select
              id="activity"
              value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-white transition-colors"
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
            <label htmlFor="notes" className="block text-sm font-medium text-gray-400 mb-2">
              Notes
            </label>
            <input
              id="notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes (optional)"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
            />
          </div>

          {/* Update Button */}
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full px-4 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 transition-colors"
          >
            {loading ? 'Updating...' : 'Update Activity'}
          </button>

          {/* Message */}
          {message && (
            <p className={`text-center text-sm ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
