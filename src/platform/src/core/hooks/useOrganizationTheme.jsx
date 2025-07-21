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
  dedupingInterval: 5000,
  revalidateOnMount: true,
  revalidateIfStale: true,
  errorRetryCount: 3,
  errorRetryInterval: 1000,
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

      // Standardize response format
      if (response?.data) {
        return response.data;
      } else if (response?.primaryColor) {
        return response;
      } else if (response) {
        return response;
      }

      return null;
    } catch (error) {
      logger.error('Error fetching organization theme:', error);
      throw error;
    }
  }, [activeGroupId]);

  // Use SWR for data fetching with optimized configuration
  const {
    data: themeData,
    error,
    isLoading,
    mutate: mutateSWR,
  } = useSWR(swrKey, fetcher, SWR_CONFIG);

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
