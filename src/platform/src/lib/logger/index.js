// utils/logger.js
import log from 'loglevel';
import axios from 'axios';

// Configure log level based on environment
log.setLevel(process.env.NODE_ENV === 'production' ? 'warn' : 'debug');

// Simple in-memory cache for deduplication
const errorCache = new Set();
const ERROR_CACHE_TTL = 1000 * 60 * 15;

// Slack webhook URL from environment variable
const SLACK_WEBHOOK_URL = process.env.NEXT_PUBLIC_SLACK_WEBHOOK_URL;

// Enhanced logger methods
const logger = {
  error(message, errorOrContext = {}, context = {}) {
    // Standard console logging in all environments
    if (errorOrContext instanceof Error) {
      log.error(message, errorOrContext, context);
    } else {
      log.error(message, { ...errorOrContext, ...context });
    }

    // Send to Slack if configured
    if (SLACK_WEBHOOK_URL) {
      if (errorOrContext instanceof Error) {
        sendToSlack('error', message, errorOrContext, context);
      } else {
        sendToSlack('error', message, null, { ...errorOrContext, ...context });
      }
    }
  },

  warn(message, context = {}) {
    log.warn(message, context);
    if (SLACK_WEBHOOK_URL) sendToSlack('warn', message, null, context);
  },

  info(message, context = {}) {
    log.info(message, context);
  },

  debug(message, context = {}) {
    log.debug(message, context);
  },
};

// Helper function to send logs to Slack
function sendToSlack(level, message, error, context) {
  try {
    // Safe defaults and deduplication
    const safeLevel = level || 'info';
    const safeMessage = message || 'No message provided';
    const errorMessage = error?.message || '';

    const fingerprint = `${safeLevel}:${safeMessage}:${errorMessage}`.substring(
      0,
      100,
    );
    if (errorCache.has(fingerprint)) return;
    errorCache.add(fingerprint);
    setTimeout(() => errorCache.delete(fingerprint), ERROR_CACHE_TTL);

    // Extract error details
    const errorDetails = error
      ? { name: error.name, message: error.message, stack: error.stack }
      : {};

    // Format the stack trace
    const formattedStack = errorDetails.stack
      ? formatStackTrace(errorDetails.stack)
      : [];

    // Get URL info
    const url = typeof window !== 'undefined' ? window.location.href : 'server';

    // Emojis for different error levels
    const emojiMap = {
      error: '🔴',
      warn: '⚠️',
      info: 'ℹ️',
      debug: '🔧',
    };
    const emoji = emojiMap[safeLevel.toLowerCase()] || 'ℹ️';

    // Build a slack message similar to the format in the image
    const slackPayload = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${emoji} ${safeLevel.toUpperCase()}: ${safeMessage}`,
            emoji: true,
          },
        },
      ],
      attachments: [
        {
          color:
            safeLevel === 'error'
              ? '#FF0000'
              : safeLevel === 'warn'
                ? '#FFA500'
                : '#36C5F0',
          blocks: [
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text:
                    '*Environment:*\n' +
                    (process.env.NODE_ENV || 'development'),
                },
                {
                  type: 'mrkdwn',
                  text: '*Time:*\n' + new Date().toISOString(),
                },
              ],
            },
          ],
        },
      ],
    };

    // Add URL field if available
    if (url && url !== 'server') {
      slackPayload.attachments[0].blocks.push({
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: '*URL:*\n' + url,
          },
        ],
      });
    }

    // Add error details
    if (error) {
      slackPayload.attachments[0].blocks.push({
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: '*Error:* ' + (errorDetails.name || 'Error'),
          },
          {
            type: 'mrkdwn',
            text: '*Message:* ' + (errorDetails.message || 'No message'),
          },
        ],
      });
    }

    // Add context if available
    if (context && Object.keys(context).length > 0) {
      slackPayload.attachments[0].blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Context:*',
        },
      });

      slackPayload.attachments[0].blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '```' + JSON.stringify(context, null, 2) + '```',
        },
      });
    }

    // Add stack trace if available
    if (formattedStack.length > 0) {
      slackPayload.attachments[0].blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Stack Trace:*',
        },
      });

      // Clean up the stack trace to remove webpack internal paths
      const cleanStack = formattedStack
        .map((line) => cleanStackLine(line))
        .join('\n');

      slackPayload.attachments[0].blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '```' + cleanStack + '```',
        },
      });
    }

    // Send to API endpoint
    axios.post('/api/proxy/log-to-slack', slackPayload).catch(() => {
      // Silent fail to prevent loops
    });
  } catch {
    // Silent fail to prevent loops
  }
}

// Helper to format stack trace
function formatStackTrace(stack) {
  if (!stack) return [];
  return stack
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, 5); // Limit to 5 lines for readability
}

// Clean up the stack trace line
function cleanStackLine(line) {
  return line
    .replace(/webpack-internal:\/\/\//g, '')
    .replace(/\(webpack-internal:\/\/\//g, '(');
}

export default logger;
