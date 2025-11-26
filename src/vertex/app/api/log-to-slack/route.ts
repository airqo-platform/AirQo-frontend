import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

interface ErrorResponse {
  status?: number;
  statusText?: string;
  data?: unknown;
}

interface ErrorContext {
  status?: number;
  method?: string;
  url?: string;
  error?: {
    status?: number;
    response?: {
      status?: number;
    };
  };
  [key: string]: unknown;
}

interface LogBody {
  level: 'info' | 'warn' | 'error';
  message: string;
  context: ErrorContext;
}

interface SlackTextBlock {
  type: 'plain_text' | 'mrkdwn';
  text: string;
  emoji?: boolean;
}

interface SlackSectionBlock {
  type: 'section';
  text?: SlackTextBlock;
  fields?: SlackTextBlock[];
}

interface SlackHeaderBlock {
  type: 'header';
  text: SlackTextBlock;
}

interface SlackAttachment {
  color: string;
  blocks: SlackSectionBlock[];
}

interface SlackPayload {
  blocks: (SlackHeaderBlock | SlackSectionBlock)[];
  attachments: SlackAttachment[];
}

// Get environment info
function getEnvironmentInfo() {
  const env =
    process.env.NEXT_PUBLIC_ALLOW_DEV_TOOLS ??
    process.env.NODE_ENV ??
    'development';

  const environment =
    env === 'staging' || env === 'production' ? env : 'development';

  return { environment };
}

// Check if an error should be ignored for Slack notifications
function shouldIgnoreError(context: ErrorContext): boolean {
  const ignoredStatusCodes = [400, 404];

  const status = context.status;
  const errorStatus = context.error?.status;
  const responseStatus = context.error?.response?.status;

  return (
    ignoredStatusCodes.includes(status ?? -1) ||
    ignoredStatusCodes.includes(errorStatus ?? -1) ||
    ignoredStatusCodes.includes(responseStatus ?? -1)
  );
}

// Simple in-memory cache for deduplication
const errorCache = new Set<string>();
const ERROR_CACHE_TTL = 1000 * 60 * 15; // 15 minutes

export async function POST(request: NextRequest) {
  try {
    const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

    if (!SLACK_WEBHOOK_URL) {
      console.warn(
        'Slack webhook URL not configured - check your .env file'
      );
      console.warn('Expected environment variable: SLACK_WEBHOOK_URL');
      return NextResponse.json(
        { success: false, error: 'Slack webhook URL not configured' },
        { status: 500 }
      );
    }

    const body = (await request.json()) as LogBody;
    const { level, message, context } = body;

    if (shouldIgnoreError(context)) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'Ignored status code',
      });
    }

    const fingerprint = `${level}:${message}:${JSON.stringify(context)}`;
    if (errorCache.has(fingerprint)) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'Deduplication',
      });
    }

    errorCache.add(fingerprint);
    setTimeout(() => {
      errorCache.delete(fingerprint);
    }, ERROR_CACHE_TTL);

    const { environment } = getEnvironmentInfo();

    const emoji =
      level === 'error' ? '🔴' : level === 'warn' ? '⚠️' : 'ℹ️';
    const color =
      level === 'error'
        ? '#FF0000'
        : level === 'warn'
        ? '#FFA500'
        : '#36C5F0';

    const slackPayload: SlackPayload = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${emoji} ${level.toUpperCase()} [${environment}]: ${message}`,
            emoji: true,
          },
        },
      ],
      attachments: [
        {
          color,
          blocks: [
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Environment:*\n${environment}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Time:*\n${new Date().toISOString()}`,
                },
              ],
            },
          ],
        },
      ],
    };

    // Add URL if available in context
    if (context.url) {
      slackPayload.attachments[0].blocks.push({
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*URL:*\n${context.url}`,
          },
        ],
      });
    }

    // Add error details if available
    if (context.status || context.method) {
      slackPayload.attachments[0].blocks.push({
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Request Details:*\n${context.method ?? 'Unknown'}${
              context.status ? ` (${context.status})` : ''
            }`,
          },
        ],
      });
    }

    // Add context details if available
    const { ...filteredContext } = context;
    if (Object.keys(filteredContext).length > 0) {
      slackPayload.attachments[0].blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Context:*\n\`\`\`${JSON.stringify(
            filteredContext,
            null,
            2
          )}\`\`\``,
        },
      });
    }

    const response = await axios.post<string>(SLACK_WEBHOOK_URL, slackPayload, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.data !== 'ok') {
      console.warn('⚠️ [SLACK API] Unexpected response from Slack:', response.data);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as AxiosError<ErrorResponse>;

    console.error('Error sending to Slack:', {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
      config: {
        url: err.config?.url?.substring(0, 50) + '...',
        method: err.config?.method,
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: err.message,
        details: {
          status: err.response?.status,
          statusText: err.response?.statusText,
        },
      },
      { status: 500 }
    );
  }
}
