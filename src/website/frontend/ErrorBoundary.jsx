import React, { Component } from 'react';

class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  static getDerivedStateFromError(error) {
    // Update state to display fallback UI on error
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error information for debugging
    console.error('Caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
    // TODO: Implement logging to an error reporting service here
  }

  handleReload = () => {
    // Reload the current page to recover from the error
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h1 className="error-title">Oops! Something Went Wrong</h1>
            <p className="error-message">
              An unexpected error occurred. Our team has been notified, and we are working to
              resolve the issue.
            </p>
            <button className="error-button" onClick={this.handleReload}>
              Reload Page
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary className="error-summary">Error Details</summary>
                <p>{this.state.error && this.state.error.toString()}</p>
                <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
