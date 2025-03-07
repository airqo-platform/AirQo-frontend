'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react';

import CustomButton from './CustomButton';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    // Notify the developers about the error
    this.notifyDevelopers(error, errorInfo);
  }

  notifyDevelopers(error: Error, errorInfo: ErrorInfo) {
    // Example: log error details to an external service
    console.log('Developer notified about the error.', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 text-center">
          {/* Error Icon */}
          <div className="mb-4">
            <svg
              className="w-16 h-16 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m0-4h.01M12 18h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
              ></path>
            </svg>
          </div>

          {/* Error Message */}
          <h1 className="text-5xl font-bold text-blue-600 mb-4">
            Oops, Something Went Wrong!
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            We encountered an error. Our team has been notified and is working
            on fixing it.
          </p>

          {/* Reload Button */}
          <CustomButton
            className="bg-blue-600 text-white px-6 py-3 rounded-md shadow-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </CustomButton>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
