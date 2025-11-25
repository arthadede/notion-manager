import { NextRequest, NextResponse } from "next/server";
import { getAllSubscriptions } from "@/lib/push-subscription-store";
import { sendPushNotificationToAll, isVapidConfigured } from "@/lib/push-notification";

/**
 * POST /api/notifications/broadcast
 * Send a push notification to all subscribed users
 */
export async function POST(request: NextRequest) {
  try {
    // Check if VAPID is configured
    if (!isVapidConfigured()) {
      return NextResponse.json(
        { error: "VAPID keys are not configured" },
        { status: 500 }
      );
    }

    const notification = await request.json();

    // Validate notification
    if (!notification.title || !notification.body) {
      return NextResponse.json(
        { error: "Notification must have title and body" },
        { status: 400 }
      );
    }

    // Get all subscriptions
    const subscriptions = await getAllSubscriptions();

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No subscriptions found",
        total: 0,
        successful: 0,
        failed: 0,
      });
    }

    // Send to all subscriptions
    const result = await sendPushNotificationToAll(subscriptions, notification);

    return NextResponse.json({
      success: true,
      message: `Notification broadcast completed`,
      ...result,
    });
  } catch (error) {
    console.error("Error in broadcast notification API:", error);
    return NextResponse.json(
      { error: "Failed to broadcast notification" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notifications/broadcast
 * Get subscription statistics
 */
export async function GET() {
  try {
    const subscriptions = await getAllSubscriptions();

    return NextResponse.json({
      total: subscriptions.length,
      subscriptions: subscriptions.map((sub) => ({
        id: sub.id,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
        userAgent: sub.userAgent,
      })),
    });
  } catch (error) {
    console.error("Error getting subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to get subscriptions" },
      { status: 500 }
    );
  }
}
