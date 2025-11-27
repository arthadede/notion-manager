import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActivity, getActivities } from '@/lib/notion';
import { validateEnv } from '@/lib/env';

export async function GET(request: NextRequest) {
  try {
    validateEnv();
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    // Collect all data
    const takeoutData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        format,
        version: '1.0.0',
      },
      activities: await getActivities(),
      currentActivity: await getCurrentActivity(),
    };

    if (format === 'json') {
      return NextResponse.json(takeoutData);
    }

    // Handle CSV format
    const csvHeaders = ['Activity Name'];
    const csvRows = [
      csvHeaders.join(','),
      ...takeoutData.activities.map(activity => `"${activity}"`)
    ];
    const csvContent = csvRows.join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="takeout-${Date.now()}.${format}"`,
      },
    });
  } catch (error) {
    console.error('Takeout request failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate takeout data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    validateEnv();
    const body = await request.json();
    const { action, data } = body;

    if (action === 'cleanup') {
      // Handle cleanup actions
      console.log('Cleanup action requested:', data);
      return NextResponse.json({ success: true, message: 'Cleanup completed' });
    }

    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Takeout POST request failed:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}