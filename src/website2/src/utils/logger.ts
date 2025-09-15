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

class Logger {
  private isProduction: boolean = false;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  private async sendToSlack(data: LogData): Promise<void> {
    // Gate Slack in non-production unless explicitly enabled
    if (
      process.env.NODE_ENV !== 'production' &&
      process.env.NEXT_PUBLIC_SLACK_LOGS !== 'true'
    ) {
      return;
    }

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
        console.error('Failed to send log to Slack:', response.statusText);
      }
    } catch (err) {
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
