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
  private slackWebhookUrl: string | null = null;
  private slackChannel: string | null = null;
  private isProduction: boolean = false;

  constructor() {
    // Only access environment variables in the browser
    if (typeof window !== 'undefined') {
      this.slackWebhookUrl = process.env.NEXT_PUBLIC_SLACK_WEBHOOK_URL || null;
      this.slackChannel = process.env.NEXT_PUBLIC_SLACK_CHANNEL || null;
      this.isProduction = process.env.NODE_ENV === 'production';
    }
  }

  private formatSlackMessage(data: LogData): any {
    const { level, message, error, context, url, userAgent } = data;

    // Ensure channel starts with #
    const channel = this.slackChannel?.startsWith('#')
      ? this.slackChannel
      : `#${this.slackChannel || 'notifs-official-website'}`;

    const timestamp = new Date().toISOString();
    const environment = this.isProduction ? 'Production' : 'Development';

    let color = '#36a64f'; // good - green
    if (level === 'error') {
      color = '#ff0000'; // danger - red
    } else if (level === 'warn') {
      color = '#ff9900'; // warning - orange
    } else if (level === 'info') {
      color = '#2196F3'; // info - blue
    }

    const attachment: any = {
      color,
      title: `${level.toUpperCase()}: ${message}`,
      timestamp,
      fields: [
        {
          title: 'Environment',
          value: environment,
          short: true,
        },
      ],
    };

    if (url) {
      attachment.fields.push({
        title: 'URL',
        value: url,
        short: true,
      });
    }

    if (userAgent) {
      attachment.fields.push({
        title: 'User Agent',
        value: userAgent,
        short: false,
      });
    }

    if (error) {
      attachment.fields.push({
        title: 'Error Details',
        value: `\`\`\`${error.name}: ${error.message}\n${error.stack}\`\`\``,
        short: false,
      });
    }

    if (context && Object.keys(context).length > 0) {
      attachment.fields.push({
        title: 'Context',
        value: `\`\`\`${JSON.stringify(context, null, 2)}\`\`\``,
        short: false,
      });
    }

    return {
      channel,
      username: 'AirQo Website Monitor',
      icon_emoji: ':warning:',
      text: `${channel} Website ${level.toUpperCase()}`,
      attachments: [attachment],
    };
  }

  private async sendToSlack(data: LogData): Promise<void> {
    if (!this.slackWebhookUrl || !this.isProduction) {
      return;
    }

    try {
      // Validate Slack webhook URL
      const url = new URL(this.slackWebhookUrl);
      if (!url.hostname.includes('hooks.slack.com')) {
        console.warn('Invalid Slack webhook URL domain');
        return;
      }

      const payload = this.formatSlackMessage(data);

      const response = await fetch(this.slackWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error(
          'Failed to send Slack notification:',
          response.statusText,
        );
      }
    } catch (slackError) {
      console.error('Failed to send log to Slack:', slackError);
    }
  }

  private getContext(): Record<string, any> {
    if (typeof window === 'undefined') return {};

    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      referrer: document.referrer || 'direct',
    };
  }

  async error(
    message: string,
    error?: Error,
    context?: Record<string, any>,
  ): Promise<void> {
    const logData: LogData = {
      level: 'error',
      message,
      error,
      context: { ...this.getContext(), ...context },
    };

    log.error(message, error, context);
    await this.sendToSlack(logData);
  }

  async warn(message: string, context?: Record<string, any>): Promise<void> {
    const logData: LogData = {
      level: 'warn',
      message,
      context: { ...this.getContext(), ...context },
    };

    log.warn(message, context);
    await this.sendToSlack(logData);
  }

  async info(message: string, context?: Record<string, any>): Promise<void> {
    const logData: LogData = {
      level: 'info',
      message,
      context: { ...this.getContext(), ...context },
    };

    log.info(message, context);

    // Only send info logs to Slack in production for important events
    if (this.isProduction) {
      await this.sendToSlack(logData);
    }
  }

  async debug(message: string, context?: Record<string, any>): Promise<void> {
    log.debug(message, context);
    // Debug logs are not sent to Slack
  }
}

// Export singleton instance
export const logger = new Logger();
export default logger;
