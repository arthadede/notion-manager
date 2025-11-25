import webpush from "web-push";
import type { PushSubscription } from "./push-subscription-store";

// Configure VAPID details
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL || "mailto:noreply@notionmanager.app";

if (!vapidPublicKey || !vapidPrivateKey) {
  console.warn("VAPID keys are not configured. Push notifications will not work.");
} else {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  data?: Record<string, unknown>;
}

/**
 * Send a push notification to a single subscription
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: NotificationPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error("VAPID keys are not configured");
    }

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/icons/icon-192.png",
      badge: payload.badge || "/icons/icon-192.png",
      url: payload.url || "/",
      data: payload.data,
    });

    await webpush.sendNotification(subscription, notificationPayload);

    return { success: true };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send a push notification to multiple subscriptions
 */
export async function sendPushNotificationToAll(
  subscriptions: PushSubscription[],
  payload: NotificationPayload
): Promise<{
  total: number;
  successful: number;
  failed: number;
  errors: Array<{ endpoint: string; error: string }>;
}> {
  const results = await Promise.allSettled(
    subscriptions.map((subscription) => sendPushNotification(subscription, payload))
  );

  const successful = results.filter(
    (result) => result.status === "fulfilled" && result.value.success
  ).length;

  const failed = results.length - successful;

  const errors = results
    .map((result, index) => {
      if (result.status === "rejected") {
        return {
          endpoint: subscriptions[index].endpoint,
          error: result.reason,
        };
      }
      if (result.status === "fulfilled" && !result.value.success) {
        return {
          endpoint: subscriptions[index].endpoint,
          error: result.value.error || "Unknown error",
        };
      }
      return null;
    })
    .filter((error): error is { endpoint: string; error: string } => error !== null);

  return {
    total: subscriptions.length,
    successful,
    failed,
    errors,
  };
}

/**
 * Validate VAPID configuration
 */
export function isVapidConfigured(): boolean {
  return !!(vapidPublicKey && vapidPrivateKey);
}
