import type { SWRConfiguration } from 'swr';

export const swrOptions: SWRConfiguration = {
  // Revalidate data on focus of the window (when the user returns to the tab)
  revalidateOnFocus: false,

  // Revalidate data when the browser reconnects to the network
  revalidateOnReconnect: false,

  // Disable automatic refreshing at intervals
  refreshInterval: 0,

  // Deduplication interval to prevent duplicate requests for the same key
  dedupingInterval: 60000, // 60 seconds

  // Retry fetching on error settings
  shouldRetryOnError: process.env.NODE_ENV === 'production', // Don't retry in development to avoid flooding logs
  errorRetryCount: process.env.NODE_ENV === 'development' ? 0 : 2, // No retries in dev, 2 in prod
  errorRetryInterval: 5000,

  // Custom onErrorRetry function to stop retrying after 3 attempts
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    // Skip retries in development mode
    if (process.env.NODE_ENV === 'development') {
      // Don't warn about cancelled requests
      if (
        error?.code !== 'ERR_CANCELED' &&
        !error?.message?.includes('aborted')
      ) {
        console.warn(`API call failed in development: ${key}`, error.message);
      }
      return;
    }

    // Don't retry cancelled requests
    if (error?.code === 'ERR_CANCELED' || error?.message?.includes('aborted')) {
      return;
    }

    // Only retry up to 2 times (3 total attempts) in production
    if (retryCount >= 2) return;

    // Retry after 5 seconds
    setTimeout(() => revalidate({ retryCount: retryCount + 1 }), 5000);
  },

  // Add fallback data for development mode
  fallbackData: process.env.NODE_ENV === 'development' ? [] : undefined,
};
