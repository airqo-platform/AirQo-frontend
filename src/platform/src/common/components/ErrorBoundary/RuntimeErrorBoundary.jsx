import React from 'react';
import PropTypes from 'prop-types';
import logger from '@/lib/logger';

class RuntimeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    logger.error('Runtime Error Boundary caught an error', error, {
      errorInfo,
      component: this.props.name || 'RuntimeErrorBoundary',
      feature: this.props.feature || 'unknown',
      timestamp: new Date().toISOString(),
    });

    this.setState({
      error,
      errorInfo,
    });

    // If it's a webpack originalFactory error, try to recover
    if (
      error?.message?.includes('originalFactory') ||
      error?.message?.includes("can't access property")
    ) {
      // Attempt recovery after a short delay
      setTimeout(() => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        if (this.props.onRecover) {
          this.props.onRecover();
        }
      }, 1000);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      // If webpack/module loading error, show minimal recovery UI
      const isWebpackError =
        this.state.error?.message?.includes('originalFactory') ||
        this.state.error?.message?.includes("can't access property");

      if (isWebpackError) {
        return (
          <div className="flex items-center justify-center h-32 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Loading components...
              </p>
              <button
                onClick={this.handleRetry}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Retry
              </button>
            </div>
          </div>
        );
      }

      // For other errors, show custom fallback or default
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center h-32 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="text-center p-4">
            <div className="text-red-500 mb-2">
              <svg
                className="w-8 h-8 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Something went wrong
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              {this.props.name || 'Component'} encountered an error
            </p>
            <button
              onClick={this.handleRetry}
              className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

RuntimeErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  name: PropTypes.string,
  feature: PropTypes.string,
  onRecover: PropTypes.func,
  onRetry: PropTypes.func,
  fallback: PropTypes.node,
};

export default RuntimeErrorBoundary;
