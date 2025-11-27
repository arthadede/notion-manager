import { NextResponse } from "next/server";
import { getCurrentEmotion } from "@/lib/notion";
import { validateEnv } from "@/lib/env";

export async function GET() {
  try {
    validateEnv();
    const emotion = await getCurrentEmotion();
    return NextResponse.json({
      success: true,
      emotion,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Failed to fetch current emotion:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch current emotion",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
