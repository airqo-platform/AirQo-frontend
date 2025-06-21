import { useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';
import {
  getOrganizationThemePreferencesApi,
  updateOrganizationThemePreferencesApi,
} from '@/core/apis/Organizations';
import logger from '@/lib/logger';

/**
 * Custom hook for managing organization theme preferences
 * @returns {Object} Hook state and methods
 */
export const useOrganizationTheme = () => {
  const { id: activeGroupId } = useGetActiveGroup();
  const [isUpdating, setIsUpdating] = useState(false);

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

  return {
    themeData,
    error,
    isLoading,
    isUpdating,
    updateTheme,
    refresh,
    hasActiveGroup: !!activeGroupId,
  };
};

export default useOrganizationTheme;
