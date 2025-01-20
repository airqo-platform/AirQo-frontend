export const swrOptions = {
  // Revalidate data on focus of the window (when the user returns to the tab)
  revalidateOnFocus: true,

  // Revalidate data when the browser reconnects to the network
  revalidateOnReconnect: true,

  // Disable automatic refreshing at intervals
  refreshInterval: 0,

  // Deduplication interval to prevent duplicate requests for the same key
  dedupingInterval: 60000, // 60 seconds

  // Retry fetching on error settings
  shouldRetryOnError: true,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
};
