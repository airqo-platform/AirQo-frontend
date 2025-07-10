import { useState, useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { subDays } from 'date-fns';
import formatDateRangeToISO from '@/core/utils/formatDateRangeToISO';
import {
  setTimeFrame,
  setPollutant,
  setChartDataRange,
  setRefreshChart,
} from '@/lib/store/services/charts/ChartSlice';
import { useAnalyticsData } from '@/core/hooks/analyticHooks';
import { useGetActiveGroup } from '@/app/providers/UnifiedGroupProvider';

/**
 * Custom hook for managing analytics overview data
 * Handles chart data fetching, date range management, and state synchronization
 */
export const useAnalyticsOverviewData = () => {
  const dispatch = useDispatch();
  const chartData = useSelector((state) => state.chart);
  const refreshChart = useSelector((state) => state.chart.refreshChart);
  const { title: groupTitle } = useGetActiveGroup();

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
        organisationName: chartData.organizationName || groupTitle,
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
  const isChartLoading = chartLoading || (!allSiteData && !isError);

  return {
    // Data
    allSiteData,
    chartData,
    dateRange,
    apiDateRange,

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
