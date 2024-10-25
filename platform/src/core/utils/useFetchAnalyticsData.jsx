import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect, useCallback } from 'react';
import { getAnalyticsData } from '@/core/apis/DeviceRegistry';
import { setRefreshChart } from '@/lib/store/services/charts/ChartSlice';

const useFetchAnalyticsData = ({
  selectedSiteIds = [],
  dateRange = { startDate: new Date(), endDate: new Date() },
  chartType = 'line',
  frequency = 'daily',
  pollutant = 'pm2_5',
  organisationName = 'airqo',
  refetch,
}) => {
  const dispatch = useDispatch();
  const [allSiteData, setAllSiteData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true); // Start loading only initially
  const [error, setError] = useState(null);
  const refreshChart = useSelector((state) => state.chart.refreshChart);

  const getValidDateRange = useCallback(() => {
    let { startDate, endDate } = dateRange;

    if (!(startDate instanceof Date)) startDate = new Date(startDate);
    if (!(endDate instanceof Date)) endDate = new Date(endDate);

    if (isNaN(startDate) || isNaN(endDate) || startDate > endDate) {
      throw new Error('Invalid date range provided.');
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  }, [dateRange]);

  const fetchAnalyticsData = useCallback(async () => {
    if (!selectedSiteIds.length) {
      setAllSiteData([]);
      setError(null);
      setChartLoading(false);
      return;
    }

    setChartLoading(true);

    try {
      const validDateRange = getValidDateRange();

      const requestBody = {
        sites: selectedSiteIds,
        startDate: validDateRange.startDate,
        endDate: validDateRange.endDate,
        chartType,
        frequency,
        pollutant,
        organisation_name: organisationName,
      };

      const response = await getAnalyticsData(requestBody);

      if (response.status === 'success' && Array.isArray(response.data)) {
        setAllSiteData(response.data);
        setChartLoading(false);
      } else {
        throw new Error(response.message || 'Failed to fetch analytics data.');
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(
        err.message || 'An error occurred while fetching analytics data.',
      );
      setAllSiteData([]);
      setChartLoading(false);
    } finally {
      dispatch(setRefreshChart(false));
    }
  }, [
    selectedSiteIds,
    // getValidDateRange,
    // chartType,
    // frequency,
    // pollutant,
    // organisationName,
    // dispatch,
    refreshChart,
    refetch,
  ]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  return { allSiteData, chartLoading, error };
};

export default useFetchAnalyticsData;
