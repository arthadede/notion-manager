import { NextResponse } from "next/server";
import { getCurrentActivity } from "@/lib/notion";
import { validateEnv } from "@/lib/env";

export async function GET() {
  try {
    validateEnv();
    const activity = await getCurrentActivity();
    return NextResponse.json({
      success: true,
      activity,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Failed to fetch current activity:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch current activity",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
