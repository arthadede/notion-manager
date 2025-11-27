/**
 * Notion Database IDs
 *
 * These are static database IDs used across the application.
 * Format: UUID with dashes (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
 */

export const DATABASE_IDS = {
  /**
   * Activities Database
   * Tracks user activities and their durations
   */
  ACTIVITIES: process.env.NOTION_ACTIVITIES_DATABASE_ID || "",

  /**
   * Transactions Database
   * Tracks financial transactions
   */
  TRANSACTIONS: process.env.NOTION_TRANSACTIONS_DATABASE_ID || "",

  /**
   * Emotions Database
   * Tracks user's current emotional state
   */
  EMOTIONS: "2b723004-7143-80dd-ad64-d6c51f291f49",
} as const;
