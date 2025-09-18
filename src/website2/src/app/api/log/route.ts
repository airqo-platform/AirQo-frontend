import { NextRequest, NextResponse } from 'next/server';

// Ensure this route is always treated as dynamic at runtime
export const dynamic = 'force-dynamic';

/**
 * Helper function to merge multiple abort signals, with fallback for older Node.js versions
 */
function mergeAbortSignals(
  ...signals: (AbortSignal | undefined)[]
): AbortSignal {
  const filtered = signals.filter(Boolean) as AbortSignal[];

  // Native fast-path if available (Node.js 20+)
  if (typeof (AbortSignal as any).any === 'function') {
    return (AbortSignal as any).any(filtered);
  }

  // Polyfill: forward the first abort reason
  if (filtered.some((s) => s.aborted)) {
    const s = filtered.find((s) => s.aborted)!;
    return AbortSignal.abort((s as any).reason);
  }

  const ctrl = new AbortController();
  const onAbort = (e: any) => {
    ctrl.abort((e?.target as any)?.reason);
  };

  for (const s of filtered) {
    s.addEventListener('abort', onAbort, { once: true });
  }

  return ctrl.signal;
}

export interface LogData {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  error?: Error;
  context?: Record<string, any>;
  url?: string;
  userAgent?: string;
  userId?: string;
}

export async function POST(request: NextRequest) {
  // Check if the client disconnected before processing
  if (request.signal?.aborted) {
    return new NextResponse(null, { status: 499 }); // Client closed request
  }

  let controller: AbortController | undefined;
  let timeout: NodeJS.Timeout | undefined;

  try {
    const logData: LogData = await request.json();

    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    const slackChannel = process.env.SLACK_CHANNEL;

    if (!slackWebhookUrl) {
      console.error('SLACK_WEBHOOK_URL is not configured');
      return NextResponse.json(
        { error: 'Logging service not available' },
        { status: 500 },
      );
    }

    const { level, message, error, context, url, userAgent } = logData;

    // Ensure channel starts with #
    const channel = slackChannel?.startsWith('#')
      ? slackChannel
      : `#${slackChannel || 'notifs-official-website'}`;

    const timestamp = new Date().toISOString();
    const environment =
      process.env.NODE_ENV === 'production' ? 'Production' : 'Development';

    let color = '#36a64f'; // good - green
    if (level === 'error') {
      color = '#ff0000'; // danger - red
    } else if (level === 'warn') {
      color = '#ff9900'; // warning - orange
    } else if (level === 'info') {
      color = '#2196F3'; // info - blue
    }

    const baseFields = [
      {
        title: 'Environment',
        value: environment,
        short: true,
      },
      {
        title: 'Timestamp',
        value: timestamp,
        short: true,
      },
    ];

    const urlField = url
      ? [
          {
            title: 'URL',
            value: url,
            short: false,
          },
        ]
      : [];

    const userAgentField = userAgent
      ? [
          {
            title: 'User Agent',
            value: userAgent,
            short: false,
          },
        ]
      : [];

    const errorField = error
      ? [
          {
            title: 'Error Details',
            value: `\`\`\`${error.name}: ${error.message}\n${error.stack || 'No stack trace'}\`\`\``,
            short: false,
          },
        ]
      : [];

    const contextField = context
      ? [
          {
            title: 'Context',
            value: `\`\`\`json\n${JSON.stringify(context, null, 2)}\`\`\``,
            short: false,
          },
        ]
      : [];

    const slackPayload = {
      channel,
      username: 'AirQo Website Logger',
      icon_emoji: ':computer:',
      attachments: [
        {
          color,
          title: `${level.toUpperCase()}: ${message}`,
          fields: [
            ...baseFields,
            ...urlField,
            ...userAgentField,
            ...errorField,
            ...contextField,
          ],
          footer: 'AirQo Website',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    // Set up timeout and abort controllers
    controller = new AbortController();
    timeout = setTimeout(() => {
      controller?.abort(new DOMException('TimeoutError', 'TimeoutError'));
    }, 5000); // 5s timeout for logging

    // Combine client abort signal with our timeout controller (works on Node 18+)
    const combinedSignal = mergeAbortSignals(request.signal, controller.signal);

    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackPayload),
      signal: combinedSignal,
    });

    // Clear timeout on successful response
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // Clean up timeout if still active
    if (timeout) {
      clearTimeout(timeout);
    }

    // Handle specific error types gracefully
    if (error instanceof Error) {
      // Client disconnected or request was aborted
      if (error.name === 'AbortError' || request.signal?.aborted) {
        // Don't log client disconnections as errors - they're normal
        return new NextResponse(null, { status: 499 }); // Client closed request
      }

      // Handle timeout specifically
      if (error.message?.includes('timeout') || controller?.signal.aborted) {
        console.warn('Slack logging request timeout');
        return NextResponse.json({ error: 'Request timeout' }, { status: 408 });
      }
    }

    console.error('Slack logging error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack:
        process.env.NODE_ENV === 'development' && error instanceof Error
          ? error.stack
          : undefined,
    });

    return NextResponse.json(
      { error: 'Failed to send log to Slack' },
      { status: 500 },
    );
  }
}
