import { useState, useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { subDays } from 'date-fns';
import formatDateRangeToISO from '@/core/utils/formatDateRangeToISO';
import {
  setTimeFrame,
  setPollutant,
  setChartDataRange,
  setRefreshChart,
  clearChartDataForOrganizationSwitch,
  setChartSites,
} from '@/lib/store/services/charts/ChartSlice';
import { useAnalyticsData } from '@/core/hooks/analyticHooks';
import { useOrgChartSites } from '@/core/hooks/useOrgChartSites';
import { useGetActiveGroup } from '@/app/providers/UnifiedGroupProvider';
import { getIndividualUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';

/**
 * Custom hook for managing organization analytics overview data
 * Handles chart data fetching, date range management, and organization-specific state
 */
export const useOrganizationAnalyticsData = (organization) => {
  const dispatch = useDispatch();
  const chartData = useSelector((state) => state.chart);
  const refreshChart = useSelector((state) => state.chart.refreshChart);

  // Get user preferences from Redux state
  const preferenceData = useSelector(
    (state) => state.defaults.individual_preferences,
  );

  // Get active group data for preferences
  const { id: activeGroupId, userID } = useGetActiveGroup();
  // Track previous organization and group to detect changes
  const [previousOrgId, setPreviousOrgId] = useState(null);
  const [previousGroupId, setPreviousGroupId] = useState(null);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  // Clear previous organization data when organization changes
  useEffect(() => {
    const currentOrgId = organization?._id;

    if (previousOrgId && currentOrgId && previousOrgId !== currentOrgId) {
      // Clear all chart data when switching organizations
      // This prevents showing previous organization's data
      dispatch(clearChartDataForOrganizationSwitch());
      setPreferencesLoaded(false);
    }

    setPreviousOrgId(currentOrgId);
  }, [organization?._id, previousOrgId, dispatch]);

  // Reset preferences when active group changes
  useEffect(() => {
    if (previousGroupId && activeGroupId && previousGroupId !== activeGroupId) {
      setPreferencesLoaded(false);
    }
    setPreviousGroupId(activeGroupId);
  }, [activeGroupId, previousGroupId]);
  // Fetch organization-specific user preferences when organization or group changes
  useEffect(() => {
    const fetchOrganizationPreferences = async () => {
      if (!userID || !activeGroupId) {
        return;
      }

      // Validate ObjectId format
      const isValidObjectId = (id) => id && /^[0-9a-fA-F]{24}$/.test(id);

      if (!isValidObjectId(userID) || !isValidObjectId(activeGroupId)) {
        return;
      }

      try {
        // Fetch preferences with the current active group ID
        await dispatch(
          getIndividualUserPreferences({
            identifier: userID,
            groupID: activeGroupId,
          }),
        );
        setPreferencesLoaded(true);
      } catch {
        setPreferencesLoaded(true); // Don't block the UI
      }
    };

    // Fetch if we haven't loaded preferences for this group yet
    if (!preferencesLoaded && activeGroupId && userID) {
      fetchOrganizationPreferences();
    }
  }, [dispatch, userID, activeGroupId, organization?.name, preferencesLoaded]);

  // Use the organization chart sites hook to automatically fetch and set chart sites
  const {
    isLoading: sitesLoading,
    isError: sitesError,
    error: sitesErrorMessage,
    hasSites,
    totalSites,
    onlineSites,
  } = useOrgChartSites(organization?.name, {
    enabled: !!organization?.name,
    maxSites: 4, // Limit to 4 sites for easier analysis
  });

  // Memoized default date range to prevent unnecessary re-renders
  const defaultDateRange = useMemo(
    () => ({
      startDate: subDays(new Date(), 7),
      endDate: new Date(),
      label: 'Last 7 days',
    }),
    [],
  );

  // Local state for date range with initialization from Redux store
  const [dateRange, setDateRange] = useState(() => {
    if (
      chartData.chartDataRange.startDate &&
      chartData.chartDataRange.endDate
    ) {
      return {
        startDate: new Date(chartData.chartDataRange.startDate),
        endDate: new Date(chartData.chartDataRange.endDate),
        label: chartData.chartDataRange.label || 'Custom Range',
      };
    }
    return defaultDateRange;
  });

  // Memoized API date range to prevent unnecessary API calls
  const apiDateRange = useMemo(
    () => ({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }),
    [dateRange.startDate, dateRange.endDate],
  );

  // Fetch analytics data with memoized parameters
  const { allSiteData, chartLoading, isError, error, refetch } =
    useAnalyticsData(
      {
        selectedSiteIds: chartData.chartSites,
        dateRange: apiDateRange,
        frequency: chartData.timeFrame,
        pollutant: chartData.pollutionType,
        organisationName: organization?.name || '',
      },
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateOnVisibilityChange: false, // Prevent refetch when tab becomes visible again
      },
    );

  // Initialize chart data range if not set
  useEffect(() => {
    if (
      !chartData.chartDataRange.startDate ||
      !chartData.chartDataRange.endDate
    ) {
      const { startDate, endDate } = defaultDateRange;
      const { startDateISO, endDateISO } = formatDateRangeToISO(
        startDate,
        endDate,
      );
      dispatch(
        setChartDataRange({
          startDate: startDateISO,
          endDate: endDateISO,
          label: defaultDateRange.label,
        }),
      );
    }
  }, [dispatch, defaultDateRange, chartData.chartDataRange]);

  // Cleanup effect to reset to default range on unmount
  useEffect(() => {
    return () => {
      const { startDate, endDate } = defaultDateRange;
      const { startDateISO, endDateISO } = formatDateRangeToISO(
        startDate,
        endDate,
      );
      dispatch(
        setChartDataRange({
          startDate: startDateISO,
          endDate: endDateISO,
          label: defaultDateRange.label,
        }),
      );
    };
  }, [dispatch, defaultDateRange]);
  // Handle chart refresh when AddLocations saves new locations
  useEffect(() => {
    if (refreshChart) {
      refetch();
      dispatch(setRefreshChart(false));
    }
  }, [refreshChart, refetch, dispatch]);
  // Set chart sites from user preferences (similar to user analytics page)
  useEffect(() => {
    if (
      preferenceData &&
      preferenceData.length > 0 &&
      preferenceData[0]?.selected_sites
    ) {
      const { selected_sites } = preferenceData[0];
      const chartSites = selected_sites
        .map((site) => site?._id)
        .filter(Boolean);

      // Only update if we have valid site IDs and they differ from current ones
      if (chartSites.length > 0) {
        const currentSites = chartData.chartSites || [];
        const sitesChanged =
          chartSites.length !== currentSites.length ||
          chartSites.some((siteId) => !currentSites.includes(siteId));

        if (sitesChanged) {
          dispatch(setChartSites(chartSites));
        }
      }
    }
  }, [dispatch, preferenceData, chartData.chartSites]);

  // Handlers with useCallback to prevent unnecessary re-renders
  const handleTimeFrameChange = useCallback(
    (option) => {
      if (chartData.timeFrame !== option) {
        dispatch(setTimeFrame(option));
      }
    },
    [dispatch, chartData.timeFrame],
  );

  const handlePollutantChange = useCallback(
    (pollutantId) => {
      if (chartData.pollutionType !== pollutantId) {
        dispatch(setPollutant(pollutantId));
      }
    },
    [dispatch, chartData.pollutionType],
  );

  const handleDateChange = useCallback(
    (startDate, endDate, label) => {
      if (!startDate || !endDate) return;

      const { startDateISO, endDateISO } = formatDateRangeToISO(
        startDate,
        endDate,
      );

      setDateRange({
        startDate,
        endDate,
        label: label || 'Custom Range',
      });

      dispatch(
        setChartDataRange({
          startDate: startDateISO,
          endDate: endDateISO,
          label: label || 'Custom Range',
        }),
      );

      // Use setTimeout to prevent immediate refetch during render
      setTimeout(refetch, 0);
    },
    [dispatch, refetch],
  );

  // Computed loading state
  const isChartLoading =
    chartLoading ||
    sitesLoading ||
    (!allSiteData && !isError) ||
    !preferencesLoaded;

  return {
    // Data
    allSiteData,
    chartData,
    dateRange,
    apiDateRange,
    organization,

    // Organization-specific data
    sitesLoading,
    sitesError,
    sitesErrorMessage,
    hasSites,
    totalSites,
    onlineSites,
    preferencesLoaded,

    // Loading states
    isChartLoading,
    chartLoading,
    isError,
    error,

    // Handlers
    handleTimeFrameChange,
    handlePollutantChange,
    handleDateChange,
    refetch,
  };
};
