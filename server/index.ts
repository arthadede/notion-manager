import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Client } from '@notionhq/client';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const databaseId = process.env.NOTION_DATABASE_ID || '';

interface Activity {
  id: string;
  name: string;
  notes: string;
  startTime: string;
  endTime: string | null;
}

// Get current (latest) activity
app.get('/api/current-activity', async (req, res) => {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: 'Start Time',
          direction: 'descending',
        },
      ],
      page_size: 1,
    });

    if (response.results.length === 0) {
      return res.json({ activity: null });
    }

    const page: any = response.results[0];
    const properties = page.properties;

    const activity: Activity = {
      id: page.id,
      name: properties.Activity?.title?.[0]?.plain_text || '',
      notes: properties.Notes?.rich_text?.[0]?.plain_text || '',
      startTime: properties['Start Time']?.date?.start || '',
      endTime: properties['End Time']?.date?.start || null,
    };

    res.json({ activity });
  } catch (error) {
    console.error('Error fetching current activity:', error);
    res.status(500).json({ error: 'Failed to fetch current activity' });
  }
});

// Get all unique activity names for dropdown
app.get('/api/activities', async (req, res) => {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 100,
    });

    const activityNames = new Set<string>();
    response.results.forEach((page: any) => {
      const name = page.properties.Activity?.title?.[0]?.plain_text;
      if (name) {
        activityNames.add(name);
      }
    });

    res.json({ activities: Array.from(activityNames).sort() });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Update activity - ends current activity and creates new one
app.post('/api/update-activity', async (req, res) => {
  try {
    const { currentActivityId, newActivityName, notes } = req.body;

    // End the current activity by adding end time
    if (currentActivityId) {
      await notion.pages.update({
        page_id: currentActivityId,
        properties: {
          'End Time': {
            date: {
              start: new Date().toISOString(),
            },
          },
        },
      });
    }

    // Create new activity without end time (ongoing)
    const newPage = await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        Activity: {
          title: [
            {
              text: {
                content: newActivityName,
              },
            },
          ],
        },
        Notes: {
          rich_text: [
            {
              text: {
                content: notes || '',
              },
            },
          ],
        },
        'Start Time': {
          date: {
            start: new Date().toISOString(),
          },
        },
      },
    });

    res.json({ success: true, newActivityId: newPage.id });
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
