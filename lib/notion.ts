import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const ACTIVITIES_DATABASE_ID = process.env.NOTION_ACTIVITIES_DATABASE_ID || "";
const TRANSACTIONS_ACTIVITIES_DATABASE_ID = process.env.NOTION_TRANSACTIONS_DATABASE_ID || "";

export interface Activity {
  id: string;
  name: string;
  duration: number;
  createdTime: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  notes: string;
}

interface NotionPage {
  id: string;
  properties: Record<string, any>;
  created_time: string;
  last_edited_time: string;
}

interface NotionSelectProperty {
  type: 'select';
  select: {
    name: string;
  } | null;
}

interface NotionNumberProperty {
  type: 'number';
  number: number | null;
}

interface NotionRichTextProperty {
  type: 'rich_text';
  rich_text: Array<{ type: 'text'; text: { content: string } }> | [];
}

const parseActivity = (page: NotionPage): Activity => ({
  id: page.id,
  name: page.properties.Kind?.select?.name || "",
  duration: page.properties["Duration in hours"]?.number || 0,
  createdTime: page.created_time,
});

export async function getCurrentActivity(): Promise<Activity | null> {
  try {
    const response = await notion.databases.query({
      database_id: ACTIVITIES_DATABASE_ID,
      filter: {
        property: "Duration in hours",
        number: { equals: 0 },
      },
      sorts: [{ property: "Created time", direction: "descending" }],
      page_size: 1,
    });

    if (response.results.length === 0) {
      return null;
    }

    return parseActivity(response.results[0] as NotionPage);
  } catch (error) {
    console.error("Error fetching current activity:", error);
    throw new Error("Failed to fetch current activity");
  }
}

export async function getActivities(): Promise<string[]> {
  try {
    const database = await notion.databases.retrieve({
      database_id: ACTIVITIES_DATABASE_ID,
    });

    const kindProperty = database.properties.Kind as any;
    const activities = kindProperty?.select?.options?.map((opt: any) => opt.name) || [];

    return activities.sort();
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw new Error("Failed to fetch activities");
  }
}

export async function updateActivity(data: {
  currentActivityId?: string;
  newActivityName: string;
}): Promise<Activity> {
  try {
    const { currentActivityId, newActivityName } = data;
    const now = new Date().toISOString();

    // Calculate duration for current activity and update it
    if (currentActivityId) {
      const currentActivity = await notion.pages.retrieve({ page_id: currentActivityId }) as any;
      const createdTime = new Date(currentActivity.created_time).getTime();
      const currentTime = new Date(now).getTime();
      const durationInHours = (currentTime - createdTime) / (1000 * 60 * 60);

      await notion.pages.update({
        page_id: currentActivityId,
        properties: {
          "Duration in hours": { number: durationInHours },
        },
      });
    }

    // Create new current activity with 0 duration
    const newPage = await notion.pages.create({
      parent: { database_id: ACTIVITIES_DATABASE_ID },
      properties: {
        Name: {
          title: [{ text: { content: newActivityName } }],
        },
        Kind: { select: { name: newActivityName } },
        "Duration in hours": { number: 0 },
      },
    });

    return parseActivity(newPage as NotionPage);
  } catch (error) {
    console.error("Error updating activity:", error);
    throw new Error("Failed to update activity");
  }
}

export function getTransactionCategories(): string[] {
  return ["Makan", "Gift", "Bill", "HealthCare", "Shopping", "Subscription", "Transportation"];
}

export async function createTransaction(data: {
  amount: number;
  type: string;
  note?: string;
}): Promise<Transaction> {
  try {
    const { amount, type, note } = data;

    const pageProperties: any = {
      Name: {
        title: [],
      },
      Amount: {
        number: amount,
      },
      Kind: {
        select: { name: type },
      },
    };

    if (note) {
      pageProperties.Note = {
        rich_text: [{ text: { content: note } }],
      };
    }

    const newPage = await notion.pages.create({
      parent: { database_id: TRANSACTIONS_ACTIVITIES_DATABASE_ID },
      properties: pageProperties,
    });

    return parseTransaction(newPage as any);
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw new Error("Failed to create transaction");
  }
}

const parseTransaction = (page: NotionPage): Transaction => ({
  id: page.id,
  description: page.properties.Name?.title?.[0]?.plain_text || "",
  amount: page.properties.Amount?.number || 0,
  category: page.properties.Kind?.select?.name || "",
  date: page.created_time || "",
  notes: page.properties.Note?.rich_text?.[0]?.text?.content || "",
});

export async function getTransactionsByMonth(year: number, month: number): Promise<Transaction[]> {
  try {
    const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];

    const response = await notion.databases.query({
      database_id: TRANSACTIONS_ACTIVITIES_DATABASE_ID,
      filter: {
        and: [
          {
            property: "Created time",
            date: { on_or_after: startDate },
          },
          {
            property: "Created time",
            date: { on_or_before: endDate },
          },
        ],
      },
      sorts: [{ property: "Created time", direction: "descending" }],
    });

    return response.results.map((page: any) => parseTransaction(page));
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions");
  }
}
