import React from 'react';
import PropTypes from 'prop-types';
import logger from '../../lib/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
    this.componentId = `${props.name || 'Component'}-${Math.random().toString(36).substr(2, 9)}`;
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Extract the component path from the stack to provide better context
    const componentPath = this.extractComponentPath(errorInfo.componentStack);

    // Create richer context for debugging
    const loggingContext = {
      component: this.props.name || 'Unknown',
      feature: this.props.feature || 'Unknown',
      props: this.sanitizeProps(this.props),
      componentId: this.componentId,
      route:
        typeof window !== 'undefined' ? window.location.pathname : 'server',
      componentPath,
      timestamp: new Date().toISOString(),
    };

    // Log the error with enhanced context
    logger.error(
      `Component Error: ${this.props.name || 'Unknown Component'}`,
      error,
      loggingContext,
    );
  }

  // Extract meaningful component path from React's componentStack
  extractComponentPath(componentStack) {
    if (!componentStack) return 'Unknown path';

    const lines = componentStack.split('\n');
    // Find the first actual component in the stack (skip ErrorBoundary itself)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('at ') && !line.includes('ErrorBoundary')) {
        // Extract just the component name and file for better readability
        const match = line.match(/at\s+([A-Za-z0-9_$]+)\s+\((.+)\)/);
        if (match) {
          return `${match[1]} in ${match[2].split('/').pop()}`;
        }
        return line.replace('at ', '');
      }
    }
    return 'Unknown path';
  }

  // Safely sanitize props to avoid circular references and excessive data
  sanitizeProps(props) {
    const safeProps = {};
    Object.keys(props).forEach((key) => {
      // Skip children and functions
      if (key === 'children' || typeof props[key] === 'function') {
        return;
      }

      // Handle objects and arrays safely
      if (typeof props[key] === 'object' && props[key] !== null) {
        try {
          // Just log the keys for objects to avoid huge payloads
          safeProps[key] = Array.isArray(props[key])
            ? `Array(${props[key].length})`
            : `Object{${Object.keys(props[key]).join(', ')}}`;
        } catch {
          safeProps[key] = '[Complex Object]';
        }
      } else if (typeof props[key] === 'string' && props[key].length > 50) {
        // Truncate long strings
        safeProps[key] = `${props[key].substring(0, 50)}...`;
      } else {
        safeProps[key] = props[key];
      }
    });
    return safeProps;
  }

  // Reset the error state - using standard class method syntax
  resetErrorBoundary() {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise use default error UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center">
          <div className="bg-white shadow-md rounded-lg p-8 max-w-lg mx-auto">
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-red-500 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M4.93 4.93a10 10 0 0114.14 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">
              {this.props.errorTitle || 'Oops! Something went wrong.'}
            </h1>
            <p className="text-gray-600 mt-2">
              {this.props.errorMessage ||
                'We encountered an unexpected error. Our team has been notified.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={this.resetErrorBoundary}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-all"
              >
                {this.props.resetButtonText || 'Try again'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/user/Home';
                  }
                }}
                className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-all"
              >
                Go to home
              </button>
            </div>

            {/* Only show error details in development */}
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <details className="mt-6 text-left text-sm bg-gray-50 p-4 rounded-lg shadow-inner">
                <summary className="text-gray-500 cursor-pointer mb-2">
                  Show error details
                </summary>
                <div className="bg-gray-100 p-3 rounded overflow-auto">
                  <p className="text-red-500 font-mono text-xs mb-2">
                    {this.state.error.toString()}
                  </p>
                  <pre className="text-xs overflow-auto whitespace-pre-wrap">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  name: PropTypes.string,
  feature: PropTypes.string,
  fallback: PropTypes.element,
  errorTitle: PropTypes.string,
  errorMessage: PropTypes.string,
  resetButtonText: PropTypes.string,
  onReset: PropTypes.func,
};

export default ErrorBoundary;
