import React, { Component } from 'react';

class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  // This lifecycle method is invoked after an error has been thrown
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  // This method is called with the error and error information
  componentDidCatch(error, errorInfo) {
    console.error('Caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold text-red-600">Something went wrong.</h1>
          <p className="text-gray-700 mt-4">An error occurred, and we are working to fix it.</p>
          {process.env.NODE_ENV === 'development' && (
            <details className="whitespace-pre-wrap text-sm text-left mt-4">
              <summary className="cursor-pointer">Error Details</summary>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
