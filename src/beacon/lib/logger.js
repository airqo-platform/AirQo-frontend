import { beaconConfig } from '@/beacon.config';
import { getPublicEnv } from '@/lib/public-env';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  info: (message, data = {}) => {
    const logEntry = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      service: `${beaconConfig.org.slug}-frontend`,
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
      service: `${beaconConfig.org.slug}-frontend`,
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
      service: `${beaconConfig.org.slug}-frontend`,
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
 * Reports an unexpected client error, rate-limited and de-duplicated. With
 * `monitoring.errorReportEndpoint` set in beacon.config.ts (Beacon: its Slack route), errors are
 * posted there in production, or in development when NEXT_PUBLIC_ENABLE_SLACK_DEV_NOTIFS is true.
 * Without one they're logged to the console.
 */
export async function reportError(
  message,
  error,
  context = {}
) {
  const endpoint = beaconConfig.monitoring.errorReportEndpoint;
  const isProd = process.env.NODE_ENV === "production";
  const devNotifs = getPublicEnv("NEXT_PUBLIC_ENABLE_SLACK_DEV_NOTIFS") === "true";
  if (endpoint && !isProd && !devNotifs) return;
  if (!canSend(error)) return;

  const stack = error.stack?.split("\n").slice(0, 10).join("\n").slice(0, 500);
  const details = {
    errorName: error.name,
    errorMessage: error.message,
    stack,
    url: typeof window !== "undefined" ? window.location.href : "SSR",
    ...context,
  };

  if (!endpoint) {
    console.error(`[reportError] ${message}`, details);
    return;
  }

  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level: "error", message, context: details }),
  }).catch(() => {}); // fire-and-forget; never let alerts break the app
}
