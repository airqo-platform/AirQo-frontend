import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Get environment info
function getEnvironmentInfo() {
  const env = process.env.NEXT_PUBLIC_ALLOW_DEV_TOOLS || process.env.NODE_ENV || 'development';
  
  let environment = 'development';
  if (env === 'staging') {
    environment = 'staging';
  } else if (env === 'production') {
    environment = 'production';
  }
  
  return { environment };
}

// Check if an error should be ignored for Slack notifications
function shouldIgnoreError(context: Record<string, unknown>) {
  const ignoredStatusCodes = [400, 404];
  
  // Check for ignored status codes
  const status = context?.status as number;
  const errorStatus = (context?.error as any)?.status;
  const responseStatus = (context?.error as any)?.response?.status;
  
  if (
    ignoredStatusCodes.includes(status) ||
    ignoredStatusCodes.includes(errorStatus) ||
    ignoredStatusCodes.includes(responseStatus)
  ) {
    return true;
  }
  
  return false;
}

// Simple in-memory cache for deduplication
const errorCache = new Set<string>();
const ERROR_CACHE_TTL = 1000 * 60 * 15; // 15 minutes

export async function POST(request: NextRequest) {
  try {
    const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
    
    if (!SLACK_WEBHOOK_URL) {
      console.warn('Slack webhook URL not configured');
      return NextResponse.json(
        { success: false, error: 'Slack webhook URL not configured' },
        { status: 500 }
      );
    }
    
    const { level, message, context } = await request.json();
    
    // Skip ignored errors
    if (shouldIgnoreError(context)) {
      return NextResponse.json({ success: true, skipped: true });
    }
    
    // Create a fingerprint for deduplication
    const fingerprint = `${level}:${message}:${JSON.stringify(context)}`;
    if (errorCache.has(fingerprint)) {
      return NextResponse.json({ success: true, skipped: true });
    }
    
    // Add to cache
    errorCache.add(fingerprint);
    setTimeout(() => errorCache.delete(fingerprint), ERROR_CACHE_TTL);
    
    // Get environment info
    const envInfo = getEnvironmentInfo();
    
    // Format the message for Slack
    const emoji = level === 'error' ? '🔴' : level === 'warn' ? '⚠️' : 'ℹ️';
    const color = level === 'error' ? '#FF0000' : level === 'warn' ? '#FFA500' : '#36C5F0';
    
    const slackPayload = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${emoji} ${level.toUpperCase()} [${envInfo.environment}]: ${message}`,
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
                  text: `*Environment:*\n${envInfo.environment}`,
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
            text: `*Request Details:*\n${context.method || 'Unknown'} ${context.status ? `(${context.status})` : ''}`,
          },
        ],
      });
    }
    
    // Add context details if available
    const filteredContext = { ...context };
    delete filteredContext.url;
    delete filteredContext.method;
    delete filteredContext.status;
    
    if (Object.keys(filteredContext).length > 0) {
      slackPayload.attachments[0].blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Context:*\n\`\`\`${JSON.stringify(filteredContext, null, 2)}\`\`\``,
        },
      });
    }
    
    // Send to Slack
    await axios.post(SLACK_WEBHOOK_URL, slackPayload, {
      timeout: 5000, // 5 second timeout
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending to Slack:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
