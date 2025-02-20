import React from 'react';
import PropTypes from 'prop-types';

// Define the ErrorBoundary class component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  // Update state when an error is caught
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Log the error or send it to an error reporting service
  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('Caught an error:', error, errorInfo);
  }

  // Render method to display fallback UI in case of error
  render() {
    if (this.state.hasError) {
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
              Oops! Something went wrong.
            </h1>
            <p className="text-gray-600 mt-2">
              We encountered an unexpected error. Our team has been notified.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-all"
            >
              Reload the page
            </button>

            {/* Optional details for debugging */}
            {this.state.error && (
              <details className="mt-6 text-left text-sm bg-gray-50 p-4 rounded-lg shadow-inner">
                <summary className="text-gray-500 cursor-pointer mb-2">
                  Show error details
                </summary>
                <p className="text-red-500">{this.state.error.toString()}</p>
                <p>{this.state.errorInfo?.componentStack}</p>
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
};

export default ErrorBoundary;
