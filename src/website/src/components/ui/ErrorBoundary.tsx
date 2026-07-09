'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react';

import { isGoogleTranslationActive } from '@/lib/utils/googleTranslate';
import logger from '@/lib/utils/logger';
import {
  getSessionStorageItem,
  setSessionStorageItem,
} from '@/lib/utils/storageUtils';

import CustomButton from './CustomButton';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  showErrorDetails?: boolean;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
};

const GOOGLE_TRANSLATE_DOM_ERROR_PATTERNS = [
  'removeChild',
  'insertBefore',
  'Hydration',
  'Minified React error',
  'Failed to execute',
  'NotFoundError',
];

function isGoogleTranslateDomError(error: Error): boolean {
  if (typeof window === 'undefined') return false;
  if (!isGoogleTranslationActive()) return false;

  return GOOGLE_TRANSLATE_DOM_ERROR_PATTERNS.some(
    (pattern) =>
      error.message.includes(pattern) || error.name.includes(pattern),
  );
}

function shouldSilentlyReload(error: Error): boolean {
  if (typeof window === 'undefined') return false;
  return isGoogleTranslateDomError(error);
}

function canAttemptSilentReload(): boolean {
  const lastReload = getSessionStorageItem<string>('gt_reload_ts');
  if (!lastReload) return true;
  return Date.now() - parseInt(lastReload, 10) > 10000;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // For Google Translate DOM errors, trigger silent reload instead of showing error UI
    if (shouldSilentlyReload(error) && canAttemptSilentReload()) {
      setSessionStorageItem('gt_reload_ts', Date.now().toString());
      // Delay reload to avoid synchronous navigation during render
      setTimeout(() => window.location.reload(), 0);
      // Return no error state — keep children mounted while reload pending
      return {};
    }

    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.state.errorId || 'UNKNOWN';

    logger.error('React Error Boundary caught an error', error, {
      errorId,
      errorInfo: {
        componentStack: errorInfo.componentStack,
        errorBoundary: this.constructor.name,
      },
      errorDetails: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'SSR',
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
    });

    this.setState({ errorInfo });
  }

  private handleReload = () => {
    logger.info('User initiated page reload from error boundary', {
      errorId: this.state.errorId,
      action: 'reload',
    });

    window.location.reload();
  };

  private handleRetry = () => {
    logger.info('User initiated error boundary retry', {
      errorId: this.state.errorId,
      action: 'retry',
    });

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorId } = this.state;
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 text-center px-4">
          <div className="mb-6">
            <svg
              className="w-20 h-20 text-red-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              ></path>
            </svg>
          </div>

          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              We&apos;re sorry for the inconvenience. Our team has been notified
              and is working to fix this issue.
            </p>

            {errorId && (
              <div className="bg-gray-100 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Error ID:</span>{' '}
                  <code className="bg-gray-200 px-2 py-1 rounded text-xs">
                    {errorId}
                  </code>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Please include this ID when contacting support.
                </p>
              </div>
            )}

            {isDevelopment && this.props.showErrorDetails && error && (
              <details className="bg-red-50 border border-red-200 rounded-lg p-4 text-left mb-6">
                <summary className="font-semibold text-red-800 cursor-pointer mb-2">
                  Error Details (Development Only)
                </summary>
                <div className="space-y-2">
                  <div>
                    <strong className="text-red-700">Error:</strong>
                    <pre className="text-red-600 text-sm mt-1 overflow-auto">
                      {error.message}
                    </pre>
                  </div>
                  {error.stack && (
                    <div>
                      <strong className="text-red-700">Stack Trace:</strong>
                      <pre className="text-red-600 text-xs mt-1 overflow-auto max-h-40">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong className="text-red-700">Component Stack:</strong>
                      <pre className="text-red-600 text-xs mt-1 overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CustomButton
                className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                onClick={this.handleRetry}
              >
                Try Again
              </CustomButton>
              <CustomButton
                className="bg-gray-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-colors"
                onClick={this.handleReload}
              >
                Reload Page
              </CustomButton>
            </div>

            <div className="mt-8 text-sm text-gray-500">
              <p>
                If this problem persists, please{' '}
                <a
                  href="/contact"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  contact our support team
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
