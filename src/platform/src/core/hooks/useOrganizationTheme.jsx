import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import useSWR from 'swr';
import { useGetActiveGroup } from '@/app/providers/UnifiedGroupProvider';
import {
  getOrganizationThemePreferencesApi,
  updateOrganizationThemePreferencesApi,
} from '@/core/apis/Organizations';
import logger from '@/lib/logger';

/**
 * Custom hook for managing organization theme preferences
 * Combines SWR-based theme management with Redux store access
 * @returns {Object} Hook state and methods
 */
export const useOrganizationTheme = () => {
  const { id: activeGroupId } = useGetActiveGroup();
  const [isUpdating, setIsUpdating] = useState(false);

  // Access organization theme from Redux store (default theme from login)
  const organizationTheme = useSelector((state) => state.organizationTheme);

  // Create SWR key
  const swrKey = activeGroupId ? `org-theme-${activeGroupId}` : null; // Fetcher function
  const fetcher = useCallback(async () => {
    if (!activeGroupId) return null;

    try {
      const response = await getOrganizationThemePreferencesApi(activeGroupId);

      // Handle different response formats
      if (response && response.data) {
        // If response has a data property, use it
        return response.data;
      } else if (response && response.primaryColor) {
        // If response directly contains theme data
        return response;
      } else {
        // Fallback - return whatever we got
        return response;
      }
    } catch (error) {
      logger.error('Error fetching organization theme:', error);
      throw error;
    }
  }, [activeGroupId]);

  // Use SWR for data fetching
  const {
    data: themeData,
    error,
    isLoading,
    mutate: mutateSWR,
  } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
    revalidateOnMount: true, // Always validate on mount
    revalidateIfStale: true, // Revalidate if data is stale
  });

  // Update theme preferences
  const updateTheme = useCallback(
    async (newThemeData) => {
      if (!activeGroupId) {
        throw new Error('No active group ID available');
      }

      if (!themeData) {
        throw new Error('No current theme data available');
      }

      setIsUpdating(true);
      try {
        const response = await updateOrganizationThemePreferencesApi(
          activeGroupId,
          themeData,
          newThemeData,
        );

        // Optimistically update the local data
        await mutateSWR(response.data || response, false);
        return response;
      } catch (error) {
        logger.error('Error updating organization theme:', error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [activeGroupId, themeData, mutateSWR],
  );

  // Refresh data
  const refresh = useCallback(() => {
    return mutateSWR();
  }, [mutateSWR]);

  // Helper functions for organization theme data from Redux
  const hasOrganizationTheme = () => !!organizationTheme.organizationTheme;

  const getOrganizationPrimaryColor = () => {
    return organizationTheme.organizationTheme?.primaryColor || '#3B82F6';
  };

  const getOrganizationThemeMode = () => {
    return organizationTheme.organizationTheme?.mode || 'light';
  };

  const getOrganizationInterfaceStyle = () => {
    return organizationTheme.organizationTheme?.interfaceStyle || 'bordered';
  };

  const getOrganizationContentLayout = () => {
    return organizationTheme.organizationTheme?.contentLayout || 'compact';
  };

  // Get full organization theme with defaults
  const getOrganizationThemeWithDefaults = () => {
    const defaultTheme = {
      primaryColor: '#3B82F6',
      mode: 'light',
      interfaceStyle: 'bordered',
      contentLayout: 'compact',
    };

    return organizationTheme.organizationTheme
      ? { ...defaultTheme, ...organizationTheme.organizationTheme }
      : defaultTheme;
  };

  return {
    // SWR-based theme data (for updates)
    themeData,
    error,
    isLoading,
    isUpdating,
    updateTheme,
    refresh,
    hasActiveGroup: !!activeGroupId,

    // Redux-based organization theme data (default from login)
    organizationTheme: organizationTheme.organizationTheme,
    organizationThemeLoading: organizationTheme.isLoading,
    organizationThemeError: organizationTheme.error,
    organizationThemeHasData: organizationTheme.hasData,

    // Helper functions
    hasOrganizationTheme,
    getOrganizationPrimaryColor,
    getOrganizationThemeMode,
    getOrganizationInterfaceStyle,
    getOrganizationContentLayout,
    getOrganizationThemeWithDefaults,
  };
};

export default useOrganizationTheme;
