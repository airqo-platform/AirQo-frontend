import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const webhookUrl = process.env.NEXT_PUBLIC_SLACK_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'Slack webhook URL not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { error, errorInfo, timestamp, userAgent, url, additionalData } =
      body;

    // Build fields for the Slack message
    const fields = [
      {
        type: 'mrkdwn',
        text: `*Error Type:*\n${error.name || 'Error'}`,
      },
      {
        type: 'mrkdwn',
        text: `*Time:*\n${new Date(timestamp).toLocaleString()}`,
      },
    ];

    if (url) {
      fields.push({
        type: 'mrkdwn',
        text: `*URL:*\n${url.substring(0, 100)}`,
      });
    }

    if (additionalData?.errorType) {
      fields.push({
        type: 'mrkdwn',
        text: `*Source:*\n${additionalData.errorType}`,
      });
    }

    // Build blocks for the Slack message
    const blocks: Array<{
      type: string;
      text?: { type: string; text: string; emoji?: boolean };
      fields?: Array<{ type: string; text: string }>;
      elements?: Array<{ type: string; text: string }>;
    }> = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🚨 Critical Error Alert',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Error Message:*\n${error.message}`,
        },
      },
      {
        type: 'section',
        fields,
      },
    ];

    // Add stack trace if available
    if (error.stack) {
      const stackPreview = error.stack.split('\n').slice(0, 10).join('\n');
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Stack Trace:*\n\`\`\`${stackPreview.substring(0, 500)}\`\`\``,
        },
      });
    }

    // Add component stack if available
    if (errorInfo?.componentStack) {
      const componentStackPreview = errorInfo.componentStack
        .split('\n')
        .slice(0, 8)
        .join('\n');
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Component Stack:*\n\`\`\`${componentStackPreview.substring(0, 400)}\`\`\``,
        },
      });
    }

    // Add context footer
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Environment: ${process.env.NODE_ENV || 'unknown'} | Browser: ${userAgent?.substring(0, 50) || 'unknown'}`,
        },
      ],
    });

    // Send to Slack
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ blocks }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Slack API error: ${response.status} - ${errorText}`);
      throw new Error(`Slack API error: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
    return NextResponse.json(
      {
        error: 'Failed to send notification',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
