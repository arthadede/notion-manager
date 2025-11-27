import { NextRequest, NextResponse } from 'next/server';
import { serverSSELogger } from '@/lib/sse-logger';
import { getCurrentActivity, getActivities } from '@/lib/notion';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    serverSSELogger.addLog('info', 'Takeout request initiated', { format });

    // Collect all data
    const takeoutData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        format,
        version: '1.0.0',
      },
      logs: serverSSELogger.getLogs({ limit: 1000 }),
      connectionMetrics: Object.fromEntries(serverSSELogger.getConnectionMetrics()),
      activities: {
        current: await getCurrentActivity(),
        all: await getActivities(),
      },
      stats: serverSSELogger.getStats(),
    };

    serverSSELogger.addLog('success', 'Takeout data collected', { totalLogs: takeoutData.logs.length });

    if (format === 'json') {
      const jsonString = JSON.stringify(takeoutData, null, 2);
      return new Response(jsonString, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="takeout-${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    }

    if (format === 'csv') {
      // Convert logs to CSV format
      const logHeaders = ['ID', 'Timestamp', 'Level', 'Source', 'Message', 'Endpoint', 'Connection ID', 'Retry Count', 'Latency', 'Event ID'];
      const logRows = takeoutData.logs.map(log => [
        log.id,
        log.timestamp.toISOString(),
        log.level,
        log.source,
        log.message.replace(/"/g, '""'),
        log.metadata?.endpoint || '',
        log.metadata?.connectionId || '',
        log.metadata?.retryCount?.toString() || '',
        log.metadata?.latency?.toString() || '',
        log.metadata?.eventId || '',
      ]);

      const csvContent = [logHeaders, ...logRows].map(row => row.join(',')).join('\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="takeout-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Unsupported format',
    }, { status: 400 });

  } catch (error) {
    serverSSELogger.addLog('error', 'Takeout request failed', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to generate takeout data',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    serverSSELogger.addLog('info', 'Takeout POST request', { action, data });

    if (action === 'cleanup') {
      // Optional: Clean up old logs or data
      serverSSELogger.addLog('info', 'Takeout cleanup action requested', data);

      return NextResponse.json({
        success: true,
        message: 'Cleanup action processed',
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Unsupported action',
    }, { status: 400 });

  } catch (error) {
    serverSSELogger.addLog('error', 'Takeout POST request failed', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to process takeout request',
    }, { status: 500 });
  }
}