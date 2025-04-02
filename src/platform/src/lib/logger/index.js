// utils/logger.js
import log from 'loglevel';
import axios from 'axios';

// Configure log level based on environment
// In production, set to 'silent' to suppress all console logs
// In staging, use 'silent' or 'warn' depending on preference
// In development, keep 'debug' for full logging
function configureLogLevel() {
  const env = process.env.NODE_ENV || 'development';
  const allowDevTools = process.env.NEXT_PUBLIC_ALLOW_DEV_TOOLS;

  if (env === 'production') {
    // Suppress all console logs in production
    return log.setLevel('silent');
  } else if (allowDevTools === 'staging') {
    // For staging, either suppress all logs or only show warnings
    return log.setLevel('silent'); // Change to 'warn' if you want to see warnings in staging
  } else {
    // Full logging in development
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
  // Map the environment value to one of the specific environments
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
  // Only send to Slack for production and staging environments
  return (
    (environment === 'production' || environment === 'staging') &&
    SLACK_WEBHOOK_URL
  );
}

// Track the last error time and URL to prevent similar errors
let lastErrorTime = 0;
let lastErrorUrl = '';
const ERROR_THRESHOLD_MS = 2000; // 2 seconds threshold

// Enhanced logger methods
const logger = {
  error(message, errorOrContext = {}, context = {}) {
    // Standard console logging (will be suppressed in production based on log level)
    if (errorOrContext instanceof Error) {
      log.error(message, errorOrContext, context);
    } else {
      log.error(message, { ...errorOrContext, ...context });
    }

    // Send to Slack only if we should (production/staging)
    if (shouldSendToSlack()) {
      if (errorOrContext instanceof Error) {
        sendToSlack('error', message, errorOrContext, context);
      } else {
        sendToSlack('error', message, null, { ...errorOrContext, ...context });
      }
    }
  },

  warn(message, context = {}) {
    log.warn(message, context);
    if (shouldSendToSlack()) sendToSlack('warn', message, null, context);
  },

  info(message, context = {}) {
    log.info(message, context);
    // Info logs are not sent to Slack by default
  },

  debug(message, context = {}) {
    log.debug(message, context);
    // Debug logs are never sent to Slack
  },
};

// Helper function to send logs to Slack
function sendToSlack(level, message, error, context) {
  try {
    // Safe defaults
    const safeLevel = level || 'info';
    const safeMessage = message || 'No message provided';
    const errorName = error?.name || '';
    const errorStack = error?.stack || '';

    // Get URL info
    const url = typeof window !== 'undefined' ? window.location.href : 'server';

    // Include error type, URL, and relevant stack info
    const contextStr = JSON.stringify(context || {});
    let stackSignature = '';
    if (errorStack) {
      // Extract file paths and line numbers from stack
      const stackLines = errorStack.split('\n').slice(0, 2).join('');
      const fileMatch = stackLines.match(/([^/\s:]+)+/g);
      stackSignature = fileMatch ? fileMatch.join('') : '';
    }

    // Create fingerprint that's more sensitive to the actual error location
    const fingerprint = `${errorName}:${url}:${stackSignature}:${contextStr.substring(0, 50)}`;

    // Check current time against last error
    const now = Date.now();

    // Deduplication check: same URL and error within threshold
    if (lastErrorUrl === url && now - lastErrorTime < ERROR_THRESHOLD_MS) {
      // Skip this error as it's likely a duplicate
      return;
    }

    // Standard deduplication via cache
    if (errorCache.has(fingerprint)) return;

    // Update tracking variables
    lastErrorTime = now;
    lastErrorUrl = url;

    // Add to cache
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
    const emoji = emojiMap[safeLevel.toLowerCase()] || 'ℹ️';

    // Build a slack message similar to the format in the image
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
      slackPayload.attachments[0].blocks.push({
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: '*Error:* ' + errorName,
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
    .replace(/webpack-internal:\/\//g, '')
    .replace(/\(webpack-internal:\/\//g, '(');
}

export default logger;
