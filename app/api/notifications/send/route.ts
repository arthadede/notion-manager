import { NextRequest, NextResponse } from "next/server";
import { sendPushNotification, isVapidConfigured } from "@/lib/push-notification";

/**
 * POST /api/notifications/send
 * Send a push notification to a specific subscription
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

    const { subscription, notification } = await request.json();

    // Validate input
    if (!subscription || !notification) {
      return NextResponse.json(
        { error: "Subscription and notification are required" },
        { status: 400 }
      );
    }

    if (!notification.title || !notification.body) {
      return NextResponse.json(
        { error: "Notification must have title and body" },
        { status: 400 }
      );
    }

    // Send notification
    const result = await sendPushNotification(subscription, notification);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification sent successfully",
    });
  } catch (error) {
    console.error("Error in send notification API:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
