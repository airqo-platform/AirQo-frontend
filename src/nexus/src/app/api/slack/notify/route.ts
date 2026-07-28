import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/shared/lib/auth';
import logger from '@/shared/lib/logger';
import { checkRateLimit, getClientIp } from '@/shared/lib/rateLimit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    // Require authentication — only the app should send Slack notifications
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit
    const rateLimitResult = checkRateLimit(getClientIp(request), {
      windowMs: 60_000,
      maxRequests: 10,
    });
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(rateLimitResult.retryAfterMs / 1000).toString(),
          },
        }
      );
    }

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

    // Validate required fields
    if (!error || typeof error !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request: error object is required' },
        { status: 400 }
      );
    }

    // Build fields for the Slack message
    const fields = [
      {
        type: 'mrkdwn',
        text: `*Error Type:*\n${error.name ?? 'Error'}`,
      },
      {
        type: 'mrkdwn',
        text: `*Time:*\n${new Date(timestamp || Date.now()).toLocaleString()}`,
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

    const controller = new AbortController();
    const timeoutMs = 10000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let response;
    try {
      response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blocks }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Slack API error: ${response.status} - ${errorText}`);
      throw new Error(`Slack API error: ${response.status}`);
    }

    return NextResponse.json(
      { success: true },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    logger.error('Failed to send Slack notification', error as Error);

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        {
          error: 'Request timeout',
          details: 'Slack webhook request timed out',
        },
        {
          status: 408,
          headers: {
            'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to send notification',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  }
}
