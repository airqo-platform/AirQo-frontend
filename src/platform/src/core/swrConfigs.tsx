/**
 * SWR configurations with best practices
 */
export const SWR_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false, // Prevent refetch on window focus/reconnect
  revalidateOnVisibilityChange: false, // Prevent refetch when tab becomes visible again
  refreshInterval: 0,
  shouldRetryOnError: true,
  errorRetryCount: 3,
  dedupingInterval: 5000, // Increased to prevent duplicate calls
  suspense: false,
};

/**
 * SWR configuration for analytics data
 */
export const ANALYTICS_SWR_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false, // Prevent refetch on window focus/reconnect
  revalidateOnVisibilityChange: false, // Prevent refetch when tab becomes visible again
  refreshInterval: 0,
  shouldRetryOnError: true,
  errorRetryCount: 3,
  dedupingInterval: 15000, // Increased to prevent duplicate calls
  keepPreviousData: true,
  focusThrottleInterval: 30000, // Increase throttle time
};
