import log from 'loglevel';

// Error tracking to prevent duplicate notifications
const errorCache = new Map<string, number>();
const ERROR_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_ERRORS_PER_MINUTE = 5;
let errorCount = 0;
let lastErrorReset = Date.now();

// Clean up old errors from cache
const cleanErrorCache = () => {
  const now = Date.now();
  const keysToDelete: string[] = [];

  errorCache.forEach((timestamp, key) => {
    if (now - timestamp > ERROR_CACHE_DURATION) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => errorCache.delete(key));
};

// Rate limiting - only checks, doesn't increment
const shouldSendToSlack = (): boolean => {
  const now = Date.now();

  // Reset counter every minute
  if (now - lastErrorReset > 60000) {
    errorCount = 0;
    lastErrorReset = now;
  }

  // Check if we've exceeded the rate limit
  if (errorCount >= MAX_ERRORS_PER_MINUTE) {
    log.warn('Slack notification rate limit exceeded');
    return false;
  }

  return true;
};

// Increment the rate limit counter after all checks pass
const incrementErrorCount = (): void => {
  errorCount++;
};

// Generate error signature for deduplication
const getErrorSignature = (error: Error): string => {
  // Take first 2 lines of stack to better distinguish errors at same location
  // This is more robust across browsers and minification
  const stackLines = error.stack?.split('\n').slice(0, 2).join('|') || '';
  return `${error.name}:${error.message}:${stackLines}`;
};

// Check if error was recently sent
const isDuplicate = (error: Error): boolean => {
  cleanErrorCache();
  const signature = getErrorSignature(error);
  const lastSent = errorCache.get(signature);

  if (lastSent && Date.now() - lastSent < ERROR_CACHE_DURATION) {
    return true;
  }

  errorCache.set(signature, Date.now());
  return false;
};

// Check if Slack notifications are enabled
const isSlackEnabled = (): boolean => {
  const isProduction = process.env.NODE_ENV === 'production';

  // In production, Slack is always enabled
  if (isProduction) {
    return true;
  }

  // In development, check env variable (defaults to false if not set)
  const devNotificationsEnabled =
    process.env.NEXT_PUBLIC_ENABLE_SLACK_DEV_NOTIFS === 'true';
  return devNotificationsEnabled;
};

// Send error to Slack via API route
const sendToSlack = async (
  error: Error,
  context?: {
    componentStack?: string;
    userInfo?: Record<string, unknown>;
    additionalData?: Record<string, unknown>;
  }
): Promise<void> => {
  // Validate input
  if (!error || !(error instanceof Error)) {
    log.warn('sendToSlack called with invalid error object');
    return;
  }

  // Check if Slack notifications are enabled
  if (!isSlackEnabled()) {
    log.debug(
      'Slack notifications disabled in development mode. To enable, set NEXT_PUBLIC_ENABLE_SLACK_DEV_NOTIFS=true in .env.local'
    );
    return;
  }

  // Check if this is a duplicate error
  if (isDuplicate(error)) {
    log.info('Skipping duplicate error notification');
    return;
  }

  // Check rate limiting
  if (!shouldSendToSlack()) {
    return;
  }

  // Increment counter only after all checks pass
  incrementErrorCount();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch('/api/slack/notify', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
        errorInfo: {
          componentStack: context?.componentStack || '',
        },
        timestamp: new Date().toISOString(),
        userAgent:
          typeof window !== 'undefined' ? window.navigator.userAgent : '',
        url: typeof window !== 'undefined' ? window.location.href : '',
        additionalData: context?.additionalData,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: 'Non-JSON error response' };
      }
      log.error('Failed to send error to Slack:', errorData);
    }
  } catch (slackError) {
    if (slackError instanceof Error && slackError.name === 'AbortError') {
      log.error('Slack notification timed out');
    } else {
      log.error('Failed to send error to Slack:', slackError);
    }
  }
};

// Configure loglevel
const configureLogger = () => {
  // Set log level based on environment
  if (typeof window !== 'undefined') {
    const isDevelopment = process.env.NODE_ENV === 'development';
    log.setLevel(isDevelopment ? 'debug' : 'warn');
  }
};

// Extend loglevel with Slack integration for critical errors
const logger = {
  ...log,

  critical: (
    message: string,
    error?: Error,
    context?: Record<string, unknown>
  ) => {
    log.error('[CRITICAL]', message, error);

    if (error) {
      sendToSlack(error, {
        additionalData: {
          criticalMessage: message,
          ...context,
        },
      }).catch(err =>
        log.error('Failed to send critical error to Slack:', err)
      );
    }
  },

  errorWithSlack: (
    message: string,
    error: Error,
    context?: Record<string, unknown>
  ) => {
    log.error(message, error);
    sendToSlack(error, { additionalData: { message, ...context } }).catch(err =>
      log.error('Failed to send error to Slack:', err)
    );
  },
};

// Initialize logger
configureLogger();

export { logger, sendToSlack };
export default logger;
