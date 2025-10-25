'use client';

import React from 'react';
import log from 'loglevel';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Determine if this is a critical error
    const isCritical = this.isCriticalError(error);

    if (isCritical) {
      this.sendToSlack(error, errorInfo);
    }

    // Log to console for debugging
    log.error('Error caught by boundary:', error, errorInfo);
  }

  private isCriticalError(error: Error): boolean {
    // Define what constitutes a critical error
    // For now, consider all errors critical, but you can customize this logic
    // e.g., check error.message for specific keywords like 'TypeError', 'ReferenceError', etc.
    const criticalKeywords = [
      'TypeError',
      'ReferenceError',
      'SyntaxError',
      'RangeError',
    ];
    return (
      criticalKeywords.some(keyword => error.message.includes(keyword)) ||
      (error.name === 'Error' && error.message.includes('critical'))
    );
  }

  private async sendToSlack(error: Error, errorInfo: React.ErrorInfo) {
    const webhookUrl = process.env.NEXT_PUBLIC_SLACK_WEBHOOK_URL;

    if (!webhookUrl) {
      log.warn('Slack webhook URL not configured');
      return;
    }

    const message = {
      text: `🚨 Critical Error Alert 🚨\n\nError: ${error.message}\n\nStack: ${error.stack}\n\nComponent Stack: ${errorInfo.componentStack}\n\nTime: ${new Date().toISOString()}`,
    };

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      log.info('Error sent to Slack successfully');
    } catch (slackError) {
      log.error('Failed to send error to Slack:', slackError);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-muted">
          <div className="text-center p-8 bg-background rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-destructive mb-4">
              Something went wrong
            </h1>
            <p className="text-muted-foreground mb-4">
              We&apos;re sorry, but an unexpected error occurred. Our team has
              been notified.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
