import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export interface PushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface StoredSubscription extends PushSubscription {
  id: string;
  createdAt: string;
  updatedAt: string;
  userAgent?: string;
}

const SUBSCRIPTIONS_FILE = path.join(process.cwd(), "data", "push-subscriptions.json");

/**
 * Ensure data directory exists
 */
async function ensureDataDir() {
  const dataDir = path.dirname(SUBSCRIPTIONS_FILE);
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true });
  }
}

/**
 * Read all subscriptions from storage
 */
export async function getAllSubscriptions(): Promise<StoredSubscription[]> {
  try {
    await ensureDataDir();
    if (!existsSync(SUBSCRIPTIONS_FILE)) {
      return [];
    }
    const data = await readFile(SUBSCRIPTIONS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading subscriptions:", error);
    return [];
  }
}

/**
 * Save a new subscription
 */
export async function saveSubscription(
  subscription: PushSubscription,
  userAgent?: string
): Promise<StoredSubscription> {
  try {
    await ensureDataDir();
    const subscriptions = await getAllSubscriptions();

    // Check if subscription already exists
    const existingIndex = subscriptions.findIndex(
      (sub) => sub.endpoint === subscription.endpoint
    );

    const now = new Date().toISOString();
    const storedSubscription: StoredSubscription = {
      ...subscription,
      id: existingIndex >= 0 ? subscriptions[existingIndex].id : generateId(),
      createdAt: existingIndex >= 0 ? subscriptions[existingIndex].createdAt : now,
      updatedAt: now,
      userAgent,
    };

    if (existingIndex >= 0) {
      subscriptions[existingIndex] = storedSubscription;
    } else {
      subscriptions.push(storedSubscription);
    }

    await writeFile(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2));
    return storedSubscription;
  } catch (error) {
    console.error("Error saving subscription:", error);
    throw error;
  }
}

/**
 * Remove a subscription by endpoint
 */
export async function removeSubscription(endpoint: string): Promise<boolean> {
  try {
    await ensureDataDir();
    const subscriptions = await getAllSubscriptions();
    const filteredSubscriptions = subscriptions.filter((sub) => sub.endpoint !== endpoint);

    if (filteredSubscriptions.length === subscriptions.length) {
      return false; // No subscription was removed
    }

    await writeFile(SUBSCRIPTIONS_FILE, JSON.stringify(filteredSubscriptions, null, 2));
    return true;
  } catch (error) {
    console.error("Error removing subscription:", error);
    return false;
  }
}

/**
 * Remove invalid/expired subscriptions
 */
export async function cleanupExpiredSubscriptions(): Promise<number> {
  try {
    const subscriptions = await getAllSubscriptions();
    const now = Date.now();
    const validSubscriptions = subscriptions.filter((sub) => {
      if (sub.expirationTime && sub.expirationTime < now) {
        return false;
      }
      return true;
    });

    const removedCount = subscriptions.length - validSubscriptions.length;

    if (removedCount > 0) {
      await writeFile(SUBSCRIPTIONS_FILE, JSON.stringify(validSubscriptions, null, 2));
    }

    return removedCount;
  } catch (error) {
    console.error("Error cleaning up subscriptions:", error);
    return 0;
  }
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
