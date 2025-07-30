/**
 * Optimized SWR configurations for better performance
 */

// Base configuration for optimal performance
const BASE_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
  refreshInterval: 0,
  shouldRetryOnError: false,
  errorRetryCount: 1,
  errorRetryInterval: 3000,
  dedupingInterval: 10000, // 10 seconds
  focusThrottleInterval: 60000, // 1 minute
  keepPreviousData: true,
  suspense: false,
};

/**
 * Standard SWR configuration
 */
export const SWR_CONFIG = {
  ...BASE_CONFIG,
  dedupingInterval: 10000, // 10 seconds
  loadingTimeout: 10000,
};

/**
 * Optimized SWR configuration for analytics data
 */
export const ANALYTICS_SWR_CONFIG = {
  ...BASE_CONFIG,
  dedupingInterval: 30000, // 30 seconds for analytics
  loadingTimeout: 15000,
  // Keep previous data for smooth transitions
  keepPreviousData: true,
  // Longer focus throttle for analytics
  focusThrottleInterval: 120000, // 2 minutes
};

/**
 * Configuration for real-time data that needs frequent updates
 */
export const REALTIME_SWR_CONFIG = {
  ...BASE_CONFIG,
  refreshInterval: 30000, // 30 seconds
  revalidateIfStale: true,
  dedupingInterval: 5000, // 5 seconds
  errorRetryCount: 2,
};

/**
 * Configuration for static/settings data that rarely changes
 */
export const STATIC_SWR_CONFIG = {
  ...BASE_CONFIG,
  dedupingInterval: 300000, // 5 minutes
  loadingTimeout: 20000,
  // Never revalidate static data
  revalidateOnMount: false,
  revalidateIfStale: false,
};

/**
 * Configuration for user-specific data
 */
export const USER_SWR_CONFIG = {
  ...BASE_CONFIG,
  dedupingInterval: 15000, // 15 seconds
  loadingTimeout: 12000,
  // Allow one retry for user data
  errorRetryCount: 1,
};
