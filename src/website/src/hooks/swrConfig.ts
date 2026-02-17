import type { SWRConfiguration } from 'swr';

export const swrOptions: SWRConfiguration = {
  // Revalidate data on focus of the window (when the user returns to the tab)
  // Enabled for better UX - ensures data is fresh when user returns
  revalidateOnFocus: true,

  // Revalidate data when the browser reconnects to the network
  // Helps recover from network issues automatically
  revalidateOnReconnect: true,

  // Revalidate if stale - provides better user experience
  revalidateIfStale: true,

  // Keep previous data while fetching new data (better UX)
  keepPreviousData: true,

  // Automatic revalidation interval for dynamic content
  // Set to 10 minutes for air quality data which changes regularly
  refreshInterval: process.env.NODE_ENV === 'production' ? 600000 : 0, // 10 min in prod, disabled in dev

  // Deduplication interval to prevent duplicate requests for the same key
  // Increased to 5 minutes for better performance
  dedupingInterval: 300000, // 5 minutes

  // Retry fetching on error settings
  shouldRetryOnError: process.env.NODE_ENV === 'production', // Don't retry in development to avoid flooding logs
  errorRetryCount: process.env.NODE_ENV === 'development' ? 0 : 3, // No retries in dev, 3 in prod
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
