import { NextRequest, NextResponse } from "next/server";
import { getActivities, updateActivity } from "@/lib/notion";

export async function GET() {
  try {
    const activities = await getActivities();
    return NextResponse.json({ activities });
  } catch {
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentActivityId, newActivityName, notes } = body;

    if (!newActivityName) {
      return NextResponse.json({ error: "Activity name is required" }, { status: 400 });
    }

    const activity = await updateActivity({
      currentActivityId,
      newActivityName,
      notes,
    });

    return NextResponse.json({ success: true, activity });
  } catch {
    return NextResponse.json({ error: "Failed to update activity" }, { status: 500 });
  }
}
