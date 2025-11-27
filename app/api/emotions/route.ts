import { NextRequest, NextResponse } from "next/server";
import { getEmotions, updateEmotion } from "@/lib/notion";
import { validateEnv } from "@/lib/env";

export async function GET() {
  try {
    validateEnv();
    const emotions = await getEmotions();
    return NextResponse.json({
      success: true,
      emotions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Failed to fetch emotions:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch emotions",
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
    const { currentEmotionId, newEmotionName } = body;
    if (!newEmotionName || typeof newEmotionName !== 'string') {
      return NextResponse.json({
        error: "Emotion name is required and must be a string"
      }, { status: 400 });
    }

    const emotion = await updateEmotion({
      currentEmotionId,
      newEmotionName,
    });

    return NextResponse.json({
      success: true,
      emotion,
      timestamp: new Date().toISOString(),
      message: "Emotion updated successfully"
    });
  } catch (error) {
    console.error("Failed to update emotion:", error);
    return NextResponse.json(
      {
        error: "Failed to update emotion",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
