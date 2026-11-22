const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  info: (message, data = {}) => {
    const logEntry = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      service: 'beacon-template',
      ...data
    };
    
    if (isDevelopment) {
      console.log('ℹ️', message, data);
    } else {
      console.log(JSON.stringify(logEntry));
    }
  },
  
  error: (message, error = {}) => {
    const logEntry = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      service: 'beacon-template',
      error: error.message || error,
      stack: error.stack
    };
    
    if (isDevelopment) {
      console.error('❌', message, error);
    } else {
      console.error(JSON.stringify(logEntry));
    }
  },
  
  warn: (message, data = {}) => {
    const logEntry = {
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      service: 'beacon-template',
      ...data
    };
    
    if (isDevelopment) {
      console.warn('⚠️', message, data);
    } else {
      console.warn(JSON.stringify(logEntry));
    }
  }
};

const RATE_LIMIT = 5;
const DEDUP_TTL = 5 * 60_000; // 5 minutes

const seen = new Map();
let alertCount = 0;
let windowStart = Date.now();

function errorSignature(error) {
  const lines = error.stack?.split("\n").slice(0, 2).join("|") ?? "";
  return `${error.name}:${error.message}:${lines}`;
}

function canSend(error) {
  const now = Date.now();
  if (now - windowStart > 60_000) {
    alertCount = 0;
    windowStart = now;
  }
  if (alertCount >= RATE_LIMIT) return false;

  const sig = errorSignature(error);
  const last = seen.get(sig);
  if (last && now - last < DEDUP_TTL) return false;

  seen.set(sig, now);
  alertCount++;
  return true;
}

/**
 * Reports an unexpected client error. The template logs it to the console, rate-limited and
 * de-duplicated; point this at your error tracker (Sentry, a webhook, ...) to collect them.
 */
export async function reportError(
  message,
  error,
  context = {}
) {
  if (!canSend(error)) return;

  const stack = error.stack?.split("\n").slice(0, 10).join("\n").slice(0, 500);
  console.error(`[reportError] ${message}`, {
    errorName: error.name,
    errorMessage: error.message,
    stack,
    url: typeof window !== "undefined" ? window.location.href : "SSR",
    ...context,
  });
}
