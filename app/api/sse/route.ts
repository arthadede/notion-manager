import { NextRequest, NextResponse } from 'next/server';
import { serverSSELogger } from '@/lib/sse-logger';

interface SSEConnection {
  id: string;
  response: Response;
  lastActivity: Date;
}

// Store active SSE connections
const activeConnections = new Map<string, SSEConnection>();

export async function GET(request: NextRequest) {
  const connectionId = generateConnectionId();
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  serverSSELogger.updateConnectionMetrics(connectionId, {
    connectedAt: new Date(),
  });

  serverSSELogger.addLog('connection', 'New SSE connection established', undefined, {
    connectionId,
    endpoint: request.url,
    userAgent,
    ip,
  });

  // Set up SSE headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  });

  // Create a transform stream to handle SSE formatting
  const encoder = new TextEncoder();
  let retryCount = 0;
  let lastEventId = 0;

  const stream = new TransformStream({
    transform: async (chunk, controller) => {
      try {
        const data = JSON.parse(chunk.toString());
        lastEventId++;

        const eventData = {
          id: lastEventId,
          timestamp: new Date().toISOString(),
          type: data.type || 'message',
          data: data.data || data,
          source: 'server',
        };

        const sseData = `data: ${JSON.stringify(eventData)}\n\n`;
        controller.enqueue(encoder.encode(sseData));

        // Log the event
        serverSSELogger.addLog('info', `SSE event sent: ${eventData.type}`, eventData, {
          connectionId,
          eventId: lastEventId.toString(),
          endpoint: request.url,
        });

        serverSSELogger.updateConnectionMetrics(connectionId, {
          totalEventsReceived: (serverSSELogger.getConnectionMetrics(connectionId) as any).totalEventsReceived + 1,
          lastEventTime: new Date(),
        });

      } catch (error) {
        serverSSELogger.addLog('error', 'Failed to process SSE chunk', error, {
          connectionId,
          endpoint: request.url,
        });
      }
    },
  });

  // Create initial response
  const response = new Response(stream.readable, {
    headers,
  });

  // Store connection
  const connection: SSEConnection = {
    id: connectionId,
    response,
    lastActivity: new Date(),
  };
  activeConnections.set(connectionId, connection);

  // Log initial connection
  serverSSELogger.logConnection('connected', request.url, 0, undefined, connectionId);

  // Cleanup handler
  request.signal.addEventListener('abort', () => {
    handleClose(connectionId);
  });

  // Heartbeat mechanism
  const heartbeatInterval = setInterval(() => {
    try {
      controller.enqueue(encoder.encode(': heartbeat\n\n'));
      connection.lastActivity = new Date();
    } catch (error) {
      serverSSELogger.addLog('error', 'Failed to send heartbeat', error, {
        connectionId,
        endpoint: request.url,
      });
    }
  }, 30000); // Send heartbeat every 30 seconds

  // Cleanup on connection close
  response.finally?.(() => {
    clearInterval(heartbeatInterval);
    handleClose(connectionId);
  });

  return response;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, clientId, targetConnection } = body;

    serverSSELogger.addLog('info', 'Received SSE broadcast request', body, {
      endpoint: request.url,
    });

    if (type === 'broadcast' && data) {
      // Broadcast to all connections
      let broadcastCount = 0;
      for (const [connectionId, connection] of activeConnections) {
        try {
          const eventData = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            type: 'broadcast',
            data,
            source: 'server',
            broadcast: true,
          };

          const sseData = `data: ${JSON.stringify(eventData)}\n\n`;
          const encoder = new TextEncoder();

          // Note: In a real implementation, you'd need to access the stream directly
          // This is a simplified example
          broadcastCount++;

          serverSSELogger.addLog('info', `Broadcast message sent to connection ${connectionId}`, eventData, {
            connectionId,
            endpoint: request.url,
          });

        } catch (error) {
          serverSSELogger.addLog('error', `Failed to broadcast to connection ${connectionId}`, error, {
            endpoint: request.url,
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: `Broadcasted to ${broadcastCount} connections`,
        broadcastCount,
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid broadcast request format',
    }, { status: 400 });

  } catch (error) {
    serverSSELogger.addLog('error', 'SSE broadcast error', error, {
      endpoint: request.url,
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to process broadcast request',
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const connectionId = searchParams.get('connectionId');

  if (!connectionId) {
    return NextResponse.json({
      success: false,
      error: 'Connection ID required',
    }, { status: 400 });
  }

  handleClose(connectionId);

  return NextResponse.json({
    success: true,
    message: `Connection ${connectionId} closed`,
  });
}

function handleClose(connectionId: string) {
  const connection = activeConnections.get(connectionId);

  if (connection) {
    serverSSELogger.logConnection('disconnected', 'unknown', 0, undefined, connectionId);
    serverSSELogger.updateConnectionMetrics(connectionId, {
      disconnectedAt: new Date(),
    });

    activeConnections.delete(connectionId);
  }
}

// Helper function to generate connection ID
function generateConnectionId(): string {
  return `sse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Optional: Periodic cleanup of inactive connections
setInterval(() => {
  const now = new Date();
  const timeout = 5 * 60 * 1000; // 5 minutes timeout

  for (const [connectionId, connection] of activeConnections) {
    const inactiveTime = now.getTime() - connection.lastActivity.getTime();

    if (inactiveTime > timeout) {
      serverSSELogger.addLog('warn', `Closing inactive connection: ${connectionId}`, undefined, {
        connectionId,
        endpoint: 'unknown',
        metadata: { inactiveTime },
      });
      activeConnections.delete(connectionId);
    }
  }
}, 60000); // Check every minute