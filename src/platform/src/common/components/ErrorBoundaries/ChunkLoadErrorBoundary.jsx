'use client';

import React from 'react';
import logger from '@/lib/logger';

const RELOAD_KEY = 'airqo:chunk-reload-ts';

const isChunkLoadError = (error) => {
  if (!error) return false;
  const name = error.name || '';
  const msg = error.message || '';
  return (
    name === 'ChunkLoadError' ||
    /Loading (?:CSS )?chunk/i.test(msg) ||
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg)
  );
};

const safeReload = (minIntervalMs = 30000) => {
  try {
    const now = Date.now();
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    const online =
      typeof navigator !== 'undefined' ? navigator.onLine !== false : true;
    if (!online) return; // don't loop while offline
    if (now - last < minIntervalMs) return; // throttle reloads
    sessionStorage.setItem(RELOAD_KEY, String(now));
    const url = new URL(window.location.href);
    url.searchParams.set('_', String(now)); // cache-bust
    window.location.replace(url.toString());
  } catch {
    window.location.reload();
  }
};

class ChunkLoadErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Only show fallback for chunk loading errors
    if (isChunkLoadError(error)) {
      return { hasError: true, error };
    }
    // Let non-chunk errors bubble to a higher-level boundary
    return null;
  }

  componentDidCatch(error, errorInfo) {
    if (isChunkLoadError(error)) {
      logger.error('Chunk loading error caught by boundary', {
        error: error.message,
        stack: error.stack,
        errorInfo,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        online: typeof navigator !== 'undefined' ? navigator.onLine : undefined,
      });
      // Auto-reload once (throttled) after a short delay
      setTimeout(() => {
        safeReload();
      }, 1000);
    } else {
      // Forward non-chunk errors to upstream monitoring and boundaries
      logger.error(
        'Non-chunk error caught by ChunkLoadErrorBoundary; rethrowing',
        {
          error: error.message,
          stack: error.stack,
          errorInfo,
        },
      );
      setTimeout(() => {
        throw error;
      });
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
              type="button"
              onClick={() => safeReload(0)}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              aria-label="Reload the page now"
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
