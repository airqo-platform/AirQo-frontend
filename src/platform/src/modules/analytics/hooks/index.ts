'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  useGetChartData,
  useGetRecentReadings,
  useDownloadData,
} from '@/shared/hooks/useAnalytics';
import { useUserPreferencesList } from '@/shared/hooks/usePreferences';
import { useUser } from '@/shared/hooks/useUser';
import { normalizeAirQualityData } from '@/shared/components/charts/utils';
import { normalizeRecentReadingsToSiteData } from '../utils';
import { useAnalytics } from './useAnalytics';
import type { SiteData, ChartData } from '../types';
import type {
  ChartDataPoint,
  DataDownloadRequest,
  Site,
} from '@/shared/types/api';

// Hook for managing analytics preferences and selected sites
export const useAnalyticsPreferences = () => {
  const { user, activeGroup, isLoading: userLoading } = useUser();
  const userId = user?.id || '';
  const groupId = activeGroup?.id || '';

  // Track the previous group ID to detect group changes
  const prevGroupIdRef = useRef<string | undefined>(undefined);

  // Update previous group ID after we've processed the current one
  useEffect(() => {
    // Only update if groupId is actually different and defined
    if (groupId && prevGroupIdRef.current !== groupId) {
      prevGroupIdRef.current = groupId;
    }
  }, [groupId]);

  const prevGroupId = prevGroupIdRef.current;

  // Only fetch preferences if both userId and groupId are available
  const shouldFetchPreferences = !!(userId && groupId);

  const {
    data: preferencesData,
    error,
    isLoading: preferencesLoading,
  } = useUserPreferencesList(userId, groupId);

  // Get the most recent preference from the list
  const currentPreference = useMemo(() => {
    if (
      !preferencesData?.preferences ||
      preferencesData.preferences.length === 0
    ) {
      return null;
    }
    // Sort by lastAccessed date (most recent first) and take the first one
    return preferencesData.preferences.sort(
      (a, b) =>
        new Date(b.lastAccessed || b.updatedAt).getTime() -
        new Date(a.lastAccessed || a.updatedAt).getTime()
    )[0];
  }, [preferencesData?.preferences]);

  // Extract selected sites IDs
  const selectedSiteIds = useMemo(() => {
    // If we're switching groups or don't have data yet, return empty array
    // This prevents showing old group's selected sites while new data loads
    if (
      !currentPreference ||
      preferencesLoading ||
      (prevGroupId && prevGroupId !== groupId && prevGroupId !== undefined)
    ) {
      return [];
    }

    if (!currentPreference?.selected_sites) {
      return [];
    }
    return currentPreference.selected_sites.map((site: Site) => site._id);
  }, [currentPreference, preferencesLoading, groupId, prevGroupId]);

  // Get full selected sites data
  const selectedSites = useMemo(() => {
    // If we're switching groups or don't have data yet, return empty array
    // This prevents showing old group's selected sites while new data loads
    if (
      !currentPreference ||
      preferencesLoading ||
      (prevGroupId && prevGroupId !== groupId && prevGroupId !== undefined)
    ) {
      return [];
    }

    return currentPreference?.selected_sites || [];
  }, [currentPreference, preferencesLoading, groupId, prevGroupId]);

  // Combined loading state - only show loading if we should fetch and are actually loading
  const isLoading =
    userLoading || (shouldFetchPreferences && preferencesLoading);

  return {
    selectedSiteIds,
    selectedSites,
    preferences: currentPreference || null,
    isLoading,
    error,
    // Additional debug info
    hasUser: !!user,
    hasActiveGroup: !!activeGroup,
    hasPreferencesData: !!preferencesData,
    shouldFetchPreferences,
    userLoading,
    preferencesLoading,
  };
};

// Hook for fetching and managing chart data
export const useAnalyticsChartData = (
  filters: {
    frequency: string;
    startDate: string;
    endDate: string;
    pollutant: string;
  },
  chartType: 'line' | 'bar' = 'line'
) => {
  const { selectedSiteIds } = useAnalyticsPreferences();
  const { trigger, error, isMutating } = useGetChartData();

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate date range based on filters
  const dateRange = useMemo(() => {
    return {
      startDate: filters.startDate,
      endDate: filters.endDate,
    };
  }, [filters.startDate, filters.endDate]);

  // Fetch chart data
  const fetchChartData = useCallback(
    async (isRefresh = false) => {
      // If no selected sites, we still want to show empty charts (not return early)
      // The UI will show appropriate empty states
      const sitesToUse = selectedSiteIds.length > 0 ? selectedSiteIds : [];

      if (!isRefresh) {
        setIsLoading(true);
      }

      // Only fetch data if we have sites to fetch for
      if (sitesToUse.length === 0) {
        setChartData([]);
        setIsLoading(false);
        return;
      }

      try {
        const response = await trigger({
          sites: sitesToUse,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          chartType: chartType,
          frequency: filters.frequency,
          pollutant: filters.pollutant.toLowerCase().replace('.', '_'),
          organisation_name: '',
        });

        if (response?.data && response.data.length > 0) {
          // Transform API data to chart format
          const transformed = transformChartData(response.data);
          setChartData(transformed);
        } else {
          setChartData([]);
        }
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedSiteIds, dateRange, filters, trigger, chartType]
  );

  // Separate refresh function that doesn't trigger main loading
  const refreshChartData = useCallback(async () => {
    return fetchChartData(true);
  }, [fetchChartData]);

  // Auto-fetch when dependencies change
  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  return {
    chartData,
    isLoading: isLoading || isMutating,
    error,
    refetch: fetchChartData,
    refresh: refreshChartData,
  };
};

// Hook for managing site cards data
export const useAnalyticsSiteCards = () => {
  const { selectedSiteIds, selectedSites } = useAnalyticsPreferences();
  const { filters } = useAnalytics();
  const { trigger: getRecentReadings, isMutating } = useGetRecentReadings();

  const [siteCards, setSiteCards] = useState<SiteData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real site data using recent readings API
  const fetchSiteCards = useCallback(async () => {
    // If no selected sites, show empty cards instead of returning early
    if (!selectedSiteIds.length) {
      setSiteCards([]);
      return;
    }

    setIsLoading(true);

    try {
      // Join site IDs with comma
      const siteIdsParam = selectedSiteIds.join(',');

      const response = await getRecentReadings({
        site_id: siteIdsParam,
      });

      // Create site cards for all selected sites
      const cards: SiteData[] = selectedSites.map(selectedSite => {
        // Find matching measurement data
        const measurement = response?.measurements?.find(
          m => m.site_id === selectedSite._id
        );

        if (measurement) {
          // Use the normalization for sites with data
          const normalized = normalizeRecentReadingsToSiteData(
            [measurement],
            filters.pollutant as 'pm2_5' | 'pm10'
          );
          return normalized[0];
        } else {
          // Create a "no data" card for sites without measurements
          return {
            _id: selectedSite._id,
            name:
              selectedSite.name ||
              selectedSite.formatted_name ||
              selectedSite.generated_name ||
              'Unknown Site',
            location: selectedSite.country || 'Unknown Country',
            value: 0,
            status: 'no-value' as const,
            pollutant: filters.pollutant as 'pm2_5' | 'pm10',
            unit: 'μg/m³',
            trend: 'stable' as const,
            percentageDifference: 0,
          };
        }
      });

      setSiteCards(cards);
    } catch (err) {
      console.error('Error fetching recent readings:', err);
      // Still show selected sites even if API fails
      const cards: SiteData[] = selectedSites.map(selectedSite => {
        return {
          _id: selectedSite._id,
          name:
            selectedSite.name ||
            selectedSite.formatted_name ||
            selectedSite.generated_name ||
            'Unknown Site',
          location: selectedSite.country || 'Unknown Country',
          value: 0,
          status: 'no-value' as const,
          pollutant: filters.pollutant as 'pm2_5' | 'pm10',
          unit: 'μg/m³',
          trend: 'stable' as const,
          percentageDifference: 0,
        };
      });
      setSiteCards(cards);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSiteIds, selectedSites, getRecentReadings, filters.pollutant]);

  // Auto-fetch when selectedSiteIds or pollutant changes
  useEffect(() => {
    fetchSiteCards();
  }, [fetchSiteCards]);

  return {
    siteCards,
    isLoading: isLoading || isMutating,
    error: null, // TODO: handle error from API
    refetch: fetchSiteCards,
  };
};

// Hook for downloading data
export const useDataDownload = () => {
  const { trigger, isMutating, error } = useDownloadData();

  const downloadData = useCallback(
    async (request: DataDownloadRequest, customFilename?: string) => {
      try {
        const response = await trigger(request);

        // Generate default filename if not provided
        const defaultFilename = `air-quality-data-${request.startDateTime.split('T')[0]}-to-${request.endDateTime.split('T')[0]}`;
        const baseFilename = customFilename || defaultFilename;

        // Ensure filename has correct extension
        const extension = request.downloadType;
        const filename = baseFilename.endsWith(`.${extension}`)
          ? baseFilename
          : `${baseFilename}.${extension}`;

        if (request.downloadType === 'csv') {
          // Handle CSV download
          const csvData = response as string;
          const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', filename);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } else if (request.downloadType === 'json') {
          // Handle JSON download
          const jsonData =
            response as import('@/shared/types/api').DataDownloadResponse;
          const dataStr = JSON.stringify(jsonData, null, 2);
          const blob = new Blob([dataStr], {
            type: 'application/json;charset=utf-8;',
          });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', filename);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }

        return { success: true };
      } catch (err) {
        console.error('Download failed:', err);
        throw err; // Re-throw the error so it can be caught by the caller
      }
    },
    [trigger]
  );

  return {
    downloadData,
    isDownloading: isMutating,
    error,
  };
};

// Helper function to transform API data to chart format
const transformChartData = (apiData: ChartDataPoint[]): ChartData[] => {
  if (!apiData || !Array.isArray(apiData)) {
    return [];
  }

  // Use shared normalizeAirQualityData function - this returns NormalizedChartData[]
  return normalizeAirQualityData(apiData);
};
