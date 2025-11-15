import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const DATABASE_ID = process.env.NOTION_DATABASE_ID || ''

export interface Activity {
  id: string
  name: string
  notes: string
  startTime: string
  endTime: string | null
}

const parseActivity = (page: any): Activity => ({
  id: page.id,
  name: page.properties.Kind?.select?.name || '',
  notes: page.properties.Note?.rich_text?.[0]?.plain_text || '',
  startTime: page.properties['Started Time']?.date?.start || '',
  endTime: page.properties['End Time']?.date?.start || null,
})

export async function getCurrentActivity(): Promise<Activity | null> {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: 'End Time',
        date: { is_empty: true },
      },
      sorts: [{ property: 'Started Time', direction: 'descending' }],
      page_size: 1,
    })

    if (response.results.length === 0) {
      return null
    }

    return parseActivity(response.results[0])
  } catch (error) {
    console.error('Error fetching current activity:', error)
    throw new Error('Failed to fetch current activity')
  }
}

export async function getActivities(): Promise<string[]> {
  try {
    const database = await notion.databases.retrieve({
      database_id: DATABASE_ID,
    })

    const kindProperty: any = database.properties.Kind
    const activities = kindProperty?.select?.options?.map((opt: any) => opt.name) || []

    return activities.sort()
  } catch (error) {
    console.error('Error fetching activities:', error)
    throw new Error('Failed to fetch activities')
  }
}

export async function updateActivity(data: {
  currentActivityId?: string
  newActivityName: string
  notes?: string
}): Promise<Activity> {
  try {
    const { currentActivityId, newActivityName, notes } = data
    const now = new Date().toISOString()

    if (currentActivityId) {
      await notion.pages.update({
        page_id: currentActivityId,
        properties: {
          'End Time': { date: { start: now } },
        },
      })
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
    })

    return parseActivity(newPage)
  } catch (error) {
    console.error('Error updating activity:', error)
    throw new Error('Failed to update activity')
  }
}