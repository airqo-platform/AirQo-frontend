import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import useSWR from 'swr';
import { useGetActiveGroup } from '@/app/providers/UnifiedGroupProvider';
import {
  getOrganizationThemePreferencesApi,
  updateOrganizationThemePreferencesApi,
} from '@/core/apis/Organizations';
import logger from '@/lib/logger';

// Constants
const DEFAULT_THEME = {
  primaryColor: '#3B82F6',
  mode: 'light',
  interfaceStyle: 'bordered',
  contentLayout: 'compact',
};

const SWR_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 10000, // Increased from 5000 to reduce API calls
  revalidateOnMount: true,
  revalidateIfStale: false, // Changed to false to reduce API calls
  errorRetryCount: 2, // Reduced from 3
  errorRetryInterval: 2000, // Increased retry interval
  onError: (error) => {
    // Only log non-rate-limit errors to reduce noise
    if (
      !error.message?.includes('rate limit') &&
      !error.message?.includes('429')
    ) {
      logger.error('SWR Organization Theme Error:', error);
    }
  },
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    // Don't retry if rate limited
    if (error.status === 429 || error.message?.includes('rate limit')) {
      return;
    }
    // Don't retry if we've exceeded max retries
    if (retryCount >= 2) return;
    // Exponential backoff
    setTimeout(
      () => revalidate({ retryCount }),
      Math.pow(2, retryCount) * 1000,
    );
  },
};

/**
 * Custom hook for managing organization theme preferences
 * Combines SWR-based theme management with Redux store access
 * @returns {Object} Hook state and methods
 */
export const useOrganizationTheme = () => {
  const { id: activeGroupId } = useGetActiveGroup();
  const [isUpdating, setIsUpdating] = useState(false);
  const isUnmountedRef = useRef(false);

  // Access organization theme from Redux store (default theme from login)
  const organizationTheme = useSelector((state) => state.organizationTheme);

  // Memoized SWR key to prevent unnecessary re-renders
  const swrKey = useMemo(
    () => (activeGroupId ? `org-theme-${activeGroupId}` : null),
    [activeGroupId],
  );

  // Memoized fetcher function with proper error handling
  const fetcher = useCallback(async () => {
    if (!activeGroupId) return null;

    try {
      const response = await getOrganizationThemePreferencesApi(activeGroupId);

      // Ensure response is properly structured
      if (!response) return null;

      // Standardize response format - handle various response structures
      let themeData = null;

      if (response?.data && typeof response.data === 'object') {
        themeData = response.data;
      } else if (
        response?.primaryColor ||
        response?.mode ||
        response?.interfaceStyle
      ) {
        // Direct theme object
        themeData = response;
      } else if (
        typeof response === 'object' &&
        Object.keys(response).length > 0
      ) {
        // Generic object response
        themeData = response;
      }

      // Ensure we return a valid theme object or null
      if (themeData && typeof themeData === 'object') {
        return {
          primaryColor: themeData.primaryColor || DEFAULT_THEME.primaryColor,
          mode: themeData.mode || DEFAULT_THEME.mode,
          interfaceStyle:
            themeData.interfaceStyle || DEFAULT_THEME.interfaceStyle,
          contentLayout: themeData.contentLayout || DEFAULT_THEME.contentLayout,
        };
      }

      return null;
    } catch (error) {
      logger.error('Error fetching organization theme:', error);

      // Don't throw for rate limiting errors - return null instead
      if (error.status === 429 || error.message?.includes('rate limit')) {
        logger.warn('Rate limited - skipping theme fetch');
        return null;
      }

      throw error;
    }
  }, [activeGroupId]);

  // Use SWR for data fetching with optimized configuration
  const {
    data: themeData,
    error,
    isLoading,
    mutate: mutateSWR,
  } = useSWR(swrKey, fetcher, {
    ...SWR_CONFIG,
    // Add fallback data to prevent undefined errors
    fallbackData: null,
    // Add error handling for SWR itself
    onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
      // Prevent iteration on undefined errors
      if (!error || typeof error !== 'object') {
        logger.warn('Invalid error object in SWR:', error);
        return;
      }

      // Don't retry if rate limited
      if (error.status === 429 || error.message?.includes('rate limit')) {
        logger.warn('SWR: Rate limited, not retrying');
        return;
      }

      // Don't retry if we've exceeded max retries
      if (retryCount >= 2) {
        logger.warn('SWR: Max retries exceeded');
        return;
      }

      // Exponential backoff
      const delay = Math.pow(2, retryCount) * 1000;
      setTimeout(() => revalidate({ retryCount }), delay);
    },
  });

  // Safe state setter to prevent updates after unmount
  const safeSetState = useCallback((setter, value) => {
    if (!isUnmountedRef.current) {
      setter(value);
    }
  }, []);

  // Update theme preferences with optimistic updates
  const updateTheme = useCallback(
    async (newThemeData) => {
      if (!activeGroupId) {
        throw new Error('No active group ID available');
      }

      if (!themeData) {
        throw new Error('No current theme data available');
      }

      if (!newThemeData || typeof newThemeData !== 'object') {
        throw new Error('Invalid theme data provided');
      }

      safeSetState(setIsUpdating, true);

      try {
        // Optimistic update - immediately update UI
        const optimisticData = { ...themeData, ...newThemeData };
        await mutateSWR(optimisticData, false);

        // Make API call
        const response = await updateOrganizationThemePreferencesApi(
          activeGroupId,
          themeData,
          newThemeData,
        );

        // Update with actual response
        const actualData = response?.data || response;
        await mutateSWR(actualData, false);

        return response;
      } catch (error) {
        logger.error('Error updating organization theme:', error);
        // Revert optimistic update on error
        await mutateSWR();
        throw error;
      } finally {
        safeSetState(setIsUpdating, false);
      }
    },
    [activeGroupId, themeData, mutateSWR, safeSetState],
  );

  // Refresh data
  const refresh = useCallback(() => {
    return mutateSWR();
  }, [mutateSWR]);

  // Memoized Redux theme selectors to prevent unnecessary re-renders
  const reduxThemeData = useMemo(
    () => ({
      theme: organizationTheme.organizationTheme,
      isLoading: organizationTheme.isLoading,
      error: organizationTheme.error,
      hasData: organizationTheme.hasData,
    }),
    [organizationTheme],
  );

  // Memoized helper functions
  const themeHelpers = useMemo(
    () => ({
      hasOrganizationTheme: () => !!reduxThemeData.theme,

      getOrganizationPrimaryColor: () =>
        reduxThemeData.theme?.primaryColor || DEFAULT_THEME.primaryColor,

      getOrganizationThemeMode: () =>
        reduxThemeData.theme?.mode || DEFAULT_THEME.mode,

      getOrganizationInterfaceStyle: () =>
        reduxThemeData.theme?.interfaceStyle || DEFAULT_THEME.interfaceStyle,

      getOrganizationContentLayout: () =>
        reduxThemeData.theme?.contentLayout || DEFAULT_THEME.contentLayout,

      getOrganizationThemeWithDefaults: () =>
        reduxThemeData.theme
          ? { ...DEFAULT_THEME, ...reduxThemeData.theme }
          : DEFAULT_THEME,
    }),
    [reduxThemeData.theme],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
    };
  }, []);

  // Memoized return object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      // SWR-based theme data (for updates)
      themeData,
      error,
      isLoading,
      isUpdating,
      updateTheme,
      refresh,
      hasActiveGroup: !!activeGroupId,

      // Redux-based organization theme data (default from login)
      organizationTheme: reduxThemeData.theme,
      organizationThemeLoading: reduxThemeData.isLoading,
      organizationThemeError: reduxThemeData.error,
      organizationThemeHasData: reduxThemeData.hasData,

      // Helper functions
      ...themeHelpers,
    }),
    [
      themeData,
      error,
      isLoading,
      isUpdating,
      updateTheme,
      refresh,
      activeGroupId,
      reduxThemeData,
      themeHelpers,
    ],
  );
};

export default useOrganizationTheme;
