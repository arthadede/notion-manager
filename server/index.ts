import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { Client } from '@notionhq/client';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID || '';

interface Activity {
  id: string;
  name: string;
  notes: string;
  startTime: string;
  endTime: string | null;
}

const parseActivity = (page: any): Activity => ({
  id: page.id,
  name: page.properties.Kind?.select?.name || '',
  notes: page.properties.Note?.rich_text?.[0]?.plain_text || '',
  startTime: page.properties['Started Time']?.date?.start || '',
  endTime: page.properties['End Time']?.date?.start || null,
});

app.get('/api/current-activity', async (_req: Request, res: Response) => {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: 'End Time',
        date: { is_empty: true },
      },
      sorts: [{ property: 'Started Time', direction: 'descending' }],
      page_size: 1,
    });

    if (response.results.length === 0) {
      return res.json({ activity: null });
    }

    res.json({ activity: parseActivity(response.results[0]) });
  } catch (error) {
    console.error('Error fetching current activity:', error);
    res.status(500).json({ error: 'Failed to fetch current activity' });
  }
});

app.get('/api/activities', async (_req: Request, res: Response) => {
  try {
    const database = await notion.databases.retrieve({
      database_id: DATABASE_ID,
    });

    const kindProperty: any = database.properties.Kind;
    const activities = kindProperty?.select?.options?.map((opt: any) => opt.name) || [];

    res.json({ activities: activities.sort() });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

app.post('/api/update-activity', async (req: Request, res: Response) => {
  try {
    const { currentActivityId, newActivityName, notes } = req.body;
    const now = new Date().toISOString();

    if (currentActivityId) {
      await notion.pages.update({
        page_id: currentActivityId,
        properties: {
          'End Time': { date: { start: now } },
        },
      });
    }

    const newPage = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: {
        Name: { title: [] },
        Kind: { select: { name: newActivityName } },
        Note: {
          rich_text: notes ? [{ text: { content: notes } }] : [],
        },
        'Started Time': { date: { start: now } },
        Author: { select: { name: 'Claude' } },
      },
    });

    const newActivity = parseActivity(newPage);
    res.json({ success: true, activity: newActivity });
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
