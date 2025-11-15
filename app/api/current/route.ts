import { NextRequest, NextResponse } from 'next/server'
import { getCurrentActivity } from '@/lib/notion'

export async function GET() {
  try {
    const activity = await getCurrentActivity()
    return NextResponse.json({ activity })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch current activity' },
      { status: 500 }
    )
  }
}