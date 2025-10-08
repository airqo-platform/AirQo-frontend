'use client';

import { SWRConfig } from 'swr';
import { secureApiProxy } from '@/core/utils/secureApiProxyClient';
import logger from '@/lib/logger';

// Optimized global SWR configuration
const swrConfig = {
  // Cache configuration
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
  refreshInterval: 0,

  // Error handling
  shouldRetryOnError: false,
  errorRetryCount: 1,
  errorRetryInterval: 3000,

  // Performance optimization
  dedupingInterval: 10000, // 10 seconds
  loadingTimeout: 10000,
  focusThrottleInterval: 60000, // 1 minute

  // Keep data fresh
  keepPreviousData: true,

  // Global fetcher with optimized error handling
  fetcher: async (url, options = {}) => {
    try {
      // Use the secure API proxy for all requests
      const response = await secureApiProxy.get(url, options);
      return response.data;
    } catch (error) {
      // Optimize error logging to reduce noise
      if (error.response?.status >= 500 || !error.response) {
        logger.error('SWR fetch error:', {
          url,
          status: error.response?.status,
          message: error.message,
        });
      }
      throw error;
    }
  },

  // Global error handler with optimized retry logic
  onError: (error, key) => {
    // Only log non-401 errors to reduce noise
    if (error.status !== 401 && error.response?.status !== 401) {
      logger.error('SWR error:', {
        key,
        status: error.response?.status,
        message: error.message,
      });
    }
  },

  // Optimize loading states
  onLoadingSlow: (key) => {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('SWR slow loading:', key);
    }
  },

  // Cache provider with memory optimization
  provider: () => {
    const map = new Map();

    // Auto-cleanup cache every 10 minutes to prevent memory leaks
    const cleanupInterval = setInterval(
      () => {
        if (map.size > 100) {
          // Only cleanup if cache is large
          const entries = Array.from(map.entries());
          const cutoff = Date.now() - 10 * 60 * 1000; // 10 minutes ago

          entries.forEach(([key, value]) => {
            if (value.timestamp && value.timestamp < cutoff) {
              map.delete(key);
            }
          });
        }
      },
      10 * 60 * 1000,
    ); // Every 10 minutes

    // Cleanup on unmount
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        clearInterval(cleanupInterval);
        map.clear();
      });
    }

    return map;
  },
};

export default function SWRProvider({ children }) {
  return <SWRConfig value={swrConfig}>{children}</SWRConfig>;
}
