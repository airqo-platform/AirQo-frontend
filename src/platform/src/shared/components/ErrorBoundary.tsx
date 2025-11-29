'use client';

import React from 'react';
import logger, { sendToSlack } from '@/shared/lib/logger';
import OopsIcon from './ui/OopsIcon';
import { Button } from './ui/button';

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
    // Log error with component stack
    logger.error('Error caught by boundary:', error, errorInfo);

    // Determine if this is a critical error that should be sent to Slack
    const isCritical = this.isCriticalError(error);

    if (isCritical) {
      // Send to Slack with deduplication and rate limiting handled by logger
      sendToSlack(error, {
        componentStack: errorInfo.componentStack ?? undefined,
        additionalData: {
          errorType: 'ErrorBoundary',
          isCritical: true,
        },
      }).catch(err =>
        logger.error('Failed to send critical error to Slack:', err)
      );
    }
  }

  private isCriticalError(error: Error): boolean {
    // Define critical error patterns
    const criticalPatterns = [
      'TypeError',
      'ReferenceError',
      'SyntaxError',
      'RangeError',
      'ChunkLoadError',
      'NetworkError',
    ];

    return criticalPatterns.some(
      pattern => error.name.includes(pattern) || error.message.includes(pattern)
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8 bg-background rounded-lg">
            <div className="mb-6 flex justify-center">
              <OopsIcon className="w-24 h-24" />
            </div>
            <h1 className="text-2xl font-bold text-destructive mb-4">
              Something went wrong
            </h1>
            <p className="text-muted-foreground mb-6">
              We&apos;re sorry, but an unexpected error occurred. Our team has
              been notified.
            </p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
