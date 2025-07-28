import log from 'loglevel';
import axios from 'axios';

// Configure log level based on environment
function configureLogLevel() {
  const env = process.env.NODE_ENV || 'development';
  const allowDevTools = process.env.NEXT_PUBLIC_ALLOW_DEV_TOOLS;

  if (env === 'production' || allowDevTools === 'staging') {
    return log.setLevel('silent');
  } else {
    return log.setLevel('debug');
  }
}

// Apply log level configuration
configureLogLevel();

// Simple in-memory cache for deduplication with more robust fingerprinting
const errorCache = new Set();
const ERROR_CACHE_TTL = 1000 * 60 * 15;

// Slack webhook URL from environment variable
const SLACK_WEBHOOK_URL = process.env.NEXT_PUBLIC_SLACK_WEBHOOK_URL;

// Get environment information
const ENV_TYPE =
  process.env.NEXT_PUBLIC_ALLOW_DEV_TOOLS ||
  process.env.NODE_ENV ||
  'development';

// Determine environment details
function getEnvironmentInfo() {
  let environment = 'development';

  if (ENV_TYPE === 'staging') {
    environment = 'staging';
  } else if (ENV_TYPE === 'production') {
    environment = 'production';
  }

  return {
    environment,
    fullDescription: environment,
  };
}

// Check if the current environment should send to Slack
function shouldSendToSlack() {
  const { environment } = getEnvironmentInfo();
  return (
    (environment === 'production' || environment === 'staging') &&
    SLACK_WEBHOOK_URL
  );
}

// Check if an error should be ignored for Slack notifications
function shouldIgnoreError(error: any, context: any = {}) {
  // Ignore 404 and 400 errors
  const ignoredStatusCodes = [400, 404];

  // Check direct error status properties
  if (
    ignoredStatusCodes.includes(error?.status) ||
    ignoredStatusCodes.includes(error?.statusCode) ||
    ignoredStatusCodes.includes(error?.response?.status)
  ) {
    return true;
  }

  // Check context for status indicators
  if (
    ignoredStatusCodes.includes(context.status) ||
    ignoredStatusCodes.includes(context.statusCode)
  ) {
    return true;
  }

  // Check for status codes in error message
  if (
    (typeof error?.message === 'string' &&
      (error.message.includes('400') || error.message.includes('404'))) ||
    (typeof context?.message === 'string' &&
      (context.message.includes('400') || context.message.includes('404')))
  ) {
    return true;
  }

  return false;
}

// Track the last error time and URL to prevent similar errors
let lastErrorTime = 0;
let lastErrorUrl = '';
const ERROR_THRESHOLD_MS = 2000;

const logger = {
  error(message: string, errorOrContext: any = {}, context: any = {}) {
    // Log locally regardless of error type
    if (errorOrContext instanceof Error) {
      log.error(message, errorOrContext, context);
    } else {
      log.error(message, { ...errorOrContext, ...context });
    }

    // Send to Slack only if we should (production/staging) and it's not an ignored error
    if (shouldSendToSlack()) {
      if (errorOrContext instanceof Error) {
        if (!shouldIgnoreError(errorOrContext, context)) {
          sendToSlack('error', message, errorOrContext, context);
        }
      } else {
        if (!shouldIgnoreError(null, { ...errorOrContext, ...context })) {
          sendToSlack('error', message, null, {
            ...errorOrContext,
            ...context,
          });
        }
      }
    }
  },

  warn(message: string, context = {}) {
    log.warn(message, context);
    if (shouldSendToSlack() && !shouldIgnoreError(null, context)) {
      sendToSlack('warn', message, null, context);
    }
  },

  info(message: string, context = {}) {
    log.info(message, context);
  },

  debug(message: string, context = {}) {
    log.debug(message, context);
  },
};

// Helper function to send logs to Slack
function sendToSlack(level: string, message: string, error: any, context: any = {}) {
  try {
    // Safe defaults
    const safeLevel = level || 'info';
    const safeMessage = message || 'No message provided';
    const errorName = error?.name || '';
    const errorStack = error?.stack || '';

    // Get URL info
    const url = typeof window !== 'undefined' ? window.location.href : 'server';

    // Create fingerprint that's more sensitive to the actual error location
    const contextStr = JSON.stringify(context || {});
    let stackSignature = '';
    if (errorStack) {
      // Extract file paths and line numbers from stack
      const stackLines = errorStack.split('\n').slice(0, 2).join('');
      const fileMatch = stackLines.match(/([^/\s:]+)+/g);
      stackSignature = fileMatch ? fileMatch.join('') : '';
    }
    const fingerprint = `${errorName}:${url}:${stackSignature}:${contextStr.substring(0, 50)}`;

    // Deduplication checks
    const now = Date.now();
    if (lastErrorUrl === url && now - lastErrorTime < ERROR_THRESHOLD_MS) {
      return; // Skip this error as it's likely a duplicate
    }
    if (errorCache.has(fingerprint)) return;

    // Update tracking variables
    lastErrorTime = now;
    lastErrorUrl = url;
    errorCache.add(fingerprint);
    setTimeout(() => errorCache.delete(fingerprint), ERROR_CACHE_TTL);

    // Format the stack trace
    const formattedStack = errorStack ? formatStackTrace(errorStack) : [];

    // Get environment info
    const envInfo = getEnvironmentInfo();

    // Emojis for different error levels
    const emojiMap = {
      error: '🔴',
      warn: '⚠️',
      info: 'ℹ️',
      debug: '🔧',
    };
    const emoji =
      emojiMap[safeLevel.toLowerCase() as keyof typeof emojiMap] || 'ℹ️';

    // Build a slack message
    const slackPayload = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${emoji} ${safeLevel.toUpperCase()} [${envInfo.environment}]: ${safeMessage}`,
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
                  text: '*Environment:*\n' + envInfo.environment,
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
    if (error && errorName) {
      const statusInfo =
        error.status ||
        error.statusCode ||
        error.response?.status ||
        context.status ||
        '';
      const statusText = statusInfo ? ` (Status: ${statusInfo})` : '';

      slackPayload.attachments[0].blocks.push({
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: '*Error:* ' + errorName + statusText,
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
      const cleanStack = formattedStack.map(cleanStackLine).join('\n');

      slackPayload.attachments[0].blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '```' + cleanStack + '```',
        },
      });
    }

    // Send to API endpoint
    axios.post('/api/log-to-slack', slackPayload).catch(() => {
      // Silent fail to prevent loops
    });
  } catch {
    // Silent fail to prevent loops
  }
}

// Helper to format stack trace
function formatStackTrace(stack: string) {
  if (!stack) return [];
  return stack
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 5);
}

// Clean up the stack trace line
function cleanStackLine(line: string) {
  return line
    .replace(/webpack-internal:\/\//g, '')
    .replace(/\(webpack-internal:\/\//g, '(');
}

export default logger;
