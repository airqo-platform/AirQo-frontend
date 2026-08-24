'use client';

import log from 'loglevel';

// Configure loglevel
const isDevelopment = process.env.NODE_ENV === 'development';
log.setLevel(isDevelopment ? log.levels.DEBUG : log.levels.ERROR);

export interface LogData {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  error?: Error;
  context?: Record<string, any>;
  url?: string;
  userAgent?: string;
  userId?: string;
}

// Slack dedupe: identical logs are suppressed within this window so bursts
// (bots, stale-cache clients) don't flood the alert channel. First occurrence
// still posts.
const SLACK_DEDUPE_WINDOW_MS = 60 * 1000;
// Exported for tests only: hard upper bound on distinct dedupe keys.
export const SLACK_DEDUPE_MAX_KEYS = 200;

const slackDedupeCache = new Map<string, number>();

/**
 * Deterministic, circular-safe serializer used to build Slack dedupe keys.
 *
 * A bare JSON.stringify throws on circular structures and bigints, and the
 * old catch-all fallback returned '' — collapsing every unserializable
 * context into a single dedupe key so unrelated alerts suppressed each
 * other for the whole window. This replacer-based variant:
 * - marks revisited objects as '[Circular]' instead of throwing;
 * - serializes bigints via String() instead of throwing;
 * - replaces functions/symbols with fixed markers instead of omitting the
 *   keys, so contexts that differ only in such fields still produce
 *   distinct keys.
 * It never returns an empty string.
 */
// Exported for tests only.
export function stableStringify(value: unknown): string {
  const visited = new WeakSet<object>();
  try {
    const serialized = JSON.stringify(value, (_key, val) => {
      if (typeof val === 'bigint') {
        return String(val);
      }
      if (typeof val === 'function') {
        return '[Function]';
      }
      if (typeof val === 'symbol') {
        return '[Symbol]';
      }
      if (val !== null && typeof val === 'object') {
        if (visited.has(val)) {
          return '[Circular]';
        }
        visited.add(val);

        if (!Array.isArray(val)) {
          return Object.keys(val)
            .sort()
            .reduce<Record<string, unknown>>((sorted, key) => {
              sorted[key] = val[key];
              return sorted;
            }, {});
        }
      }
      return val;
    });
    // JSON.stringify returns undefined for top-level undefined values
    return serialized ?? `[unserializable:${typeof value}]`;
  } catch {
    // Last resort: non-empty deterministic fallback that varies by type.
    return `[unserializable:${typeof value}]`;
  }
}

function getSlackDedupeKey(data: LogData): string {
  return [
    data.level,
    data.message,
    data.error?.name ?? '',
    data.error?.message ?? '',
    stableStringify(data.context ?? null),
  ].join('|');
}

/**
 * Test-only helper: clears the Slack dedupe window.
 */
export function resetSlackDedupeForTests(): void {
  slackDedupeCache.clear();
}

/**
 * Test-only helper: dedupe cache keys in insertion order (oldest first).
 */
export function getSlackDedupeKeysForTests(): string[] {
  return Array.from(slackDedupeCache.keys());
}

class Logger {
  private isProduction: boolean = false;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  private async sendToSlack(data: LogData): Promise<void> {
    // Gate Slack in non-production unless explicitly enabled
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    // Suppress duplicate Slack posts within the dedupe window so bursts of
    // identical errors/warnings (bots, stale clients) don't flood the channel.
    const now = Date.now();
    const dedupeKey = getSlackDedupeKey(data);
    const lastSentAt = slackDedupeCache.get(dedupeKey);
    if (lastSentAt !== undefined && now - lastSentAt < SLACK_DEDUPE_WINDOW_MS) {
      return;
    }

    // Keep the cache bounded: drop expired entries, then enforce a hard cap
    // by evicting the oldest entries unconditionally. Without the hard cap,
    // 200+ distinct errors inside a single dedupe window could grow the
    // cache past the limit until the next prune pass.
    if (slackDedupeCache.size >= SLACK_DEDUPE_MAX_KEYS) {
      for (const [key, sentAt] of slackDedupeCache) {
        if (now - sentAt >= SLACK_DEDUPE_WINDOW_MS) {
          slackDedupeCache.delete(key);
        }
      }
      while (slackDedupeCache.size >= SLACK_DEDUPE_MAX_KEYS) {
        const oldestKey = slackDedupeCache.keys().next().value;
        if (oldestKey === undefined) break;
        slackDedupeCache.delete(oldestKey);
      }
    }

    slackDedupeCache.set(dedupeKey, now);

    try {
      // Use our API route instead of direct Slack webhook
      const { error, context, ...rest } = data as any;
      const payload = {
        ...rest,
        errorMessage: error?.message,
        errorStack: error?.stack,
        context: safeJson(context),
        env: process.env.NODE_ENV,
      };

      const response = await fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Delivery failed: undo this request's dedupe entry so an identical
        // error can retry instead of being suppressed for the whole window.
        // Only remove if a newer concurrent request has not re-recorded it.
        if (slackDedupeCache.get(dedupeKey) === now) {
          slackDedupeCache.delete(dedupeKey);
        }
        console.error('Failed to send log to Slack:', response.statusText);
      }
    } catch (err) {
      if (slackDedupeCache.get(dedupeKey) === now) {
        slackDedupeCache.delete(dedupeKey);
      }
      console.error('Error sending log to Slack:', err);
    }
  }
  private async logToConsoleAndSlack(data: LogData): Promise<void> {
    const { level, message, error, context } = data;

    // Always log to console
    switch (level) {
      case 'error':
        if (error) {
          log.error(message, error, context);
        } else {
          log.error(message, context);
        }
        break;
      case 'warn':
        log.warn(message, context);
        break;
      case 'info':
        log.info(message, context);
        break;
      case 'debug':
        log.debug(message, context);
        break;
    }

    // Send to Slack only for errors and warnings, not for info/debug
    if (level === 'error' || level === 'warn') {
      await this.sendToSlack(data);
    }
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    const logData: LogData = {
      level: 'error',
      message,
      error,
      context,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent:
        typeof window !== 'undefined' ? navigator.userAgent : undefined,
    };

    this.logToConsoleAndSlack(logData).catch((err) => {
      console.error('Failed to log error:', err);
    });
  }

  warn(message: string, context?: Record<string, any>): void {
    const logData: LogData = {
      level: 'warn',
      message,
      context,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent:
        typeof window !== 'undefined' ? navigator.userAgent : undefined,
    };

    this.logToConsoleAndSlack(logData).catch((err) => {
      console.error('Failed to log warning:', err);
    });
  }

  info(message: string, context?: Record<string, any>): void {
    const logData: LogData = {
      level: 'info',
      message,
      context,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent:
        typeof window !== 'undefined' ? navigator.userAgent : undefined,
    };

    this.logToConsoleAndSlack(logData).catch((err) => {
      console.error('Failed to log info:', err);
    });
  }

  debug(message: string, context?: Record<string, any>): void {
    const logData: LogData = {
      level: 'debug',
      message,
      context,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent:
        typeof window !== 'undefined' ? navigator.userAgent : undefined,
    };

    this.logToConsoleAndSlack(logData).catch((err) => {
      console.error('Failed to log debug:', err);
    });
  }
}

// Helper to safely serialize potentially non-serializable context objects
function safeJson(value: unknown) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return { warning: 'non-serializable context' };
  }
}

// Create and export a singleton instance
const logger = new Logger();
export default logger;
