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
  shouldRetryOnError: true,
  errorRetryCount: 2, // This will result in 3 total attempts (initial + 2 retries)
  errorRetryInterval: 5000,

  // Custom onErrorRetry function to stop retrying after 3 attempts
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    // Only retry up to 2 times (3 total attempts)
    if (retryCount >= 2) return;

    // Retry after 5 seconds
    setTimeout(() => revalidate({ retryCount: retryCount + 1 }), 5000);
  },
};
