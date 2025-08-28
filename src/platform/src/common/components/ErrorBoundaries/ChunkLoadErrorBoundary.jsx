'use client';

import React from 'react';
import logger from '@/lib/logger';

class ChunkLoadErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Check if it's a chunk loading error
    if (
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Loading chunk')
    ) {
      return { hasError: true, error };
    }
    return null;
  }

  componentDidCatch(error, errorInfo) {
    // Only handle chunk loading errors
    if (
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Loading chunk')
    ) {
      logger.error('Chunk loading error caught by boundary:', {
        error: error.message,
        stack: error.stack,
        errorInfo,
      });

      // Auto-reload the page after a short delay for chunk loading errors
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center p-8">
            <div className="mb-6">
              <div className="mx-auto h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Loading Application Update
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              The application is updating with the latest changes. The page will
              reload automatically in a moment.
            </p>

            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Reload Now
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkLoadErrorBoundary;
