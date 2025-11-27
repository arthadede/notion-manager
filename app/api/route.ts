import { NextRequest, NextResponse } from "next/server";
import { getActivities, updateActivity } from "@/lib/notion";
import { validateEnv } from "@/lib/env";

export async function GET() {
  try {
    validateEnv();
    const activities = await getActivities();
    return NextResponse.json({
      success: true,
      activities,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch activities",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    validateEnv();
    const body = await request.json();

    // Validate request body
    const { currentActivityId, newActivityName } = body;
    if (!newActivityName || typeof newActivityName !== 'string') {
      return NextResponse.json({
        error: "Activity name is required and must be a string"
      }, { status: 400 });
    }

    const activity = await updateActivity({
      currentActivityId,
      newActivityName,
    });

    return NextResponse.json({
      success: true,
      activity,
      timestamp: new Date().toISOString(),
      message: "Activity updated successfully"
    });
  } catch (error) {
    console.error("Failed to update activity:", error);
    return NextResponse.json(
      {
        error: "Failed to update activity",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
