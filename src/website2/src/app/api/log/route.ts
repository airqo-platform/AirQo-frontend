import { NextRequest, NextResponse } from 'next/server';

// Ensure this route is always treated as dynamic at runtime
export const dynamic = 'force-dynamic';

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

    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackPayload),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Slack logging error:', error);
    return NextResponse.json(
      { error: 'Failed to send log to Slack' },
      { status: 500 },
    );
  }
}
