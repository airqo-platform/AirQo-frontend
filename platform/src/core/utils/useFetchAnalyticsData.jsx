import { useState, useCallback, useEffect } from 'react';
import { getAnalyticsData } from '@/core/apis/DeviceRegistry';
import { parseAndValidateISODate } from '@/core/utils/dateUtils';

/**
 * Custom hook to fetch analytics data based on provided parameters.
 */
const useFetchAnalyticsData = ({
  selectedSiteIds = [],
  dateRange = { startDate: new Date(), endDate: new Date() },
  chartType = 'line',
  frequency = 'daily',
  pollutant = 'pm2_5',
  organisationName = 'airqo',
}) => {
  const [allSiteData, setAllSiteData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches analytics data from the API.
   */
  const fetchAnalyticsData = useCallback(async () => {
    setChartLoading(true);
    setError(null);

    try {
      if (selectedSiteIds.length === 0) {
        setAllSiteData([]);
        setError(null);
        setChartLoading(false);
        return;
      }

      const requestBody = {
        sites: selectedSiteIds,
        startDate: parseAndValidateISODate(dateRange.startDate),
        endDate: parseAndValidateISODate(dateRange.endDate),
        chartType,
        frequency,
        pollutant,
        organisation_name: organisationName,
      };

      const controller = new AbortController();

      const response = await getAnalyticsData({
        body: requestBody,
        signal: controller.signal,
      });

      if (response.status === 'success' && Array.isArray(response.data)) {
        setAllSiteData(response.data);
      } else {
        setAllSiteData([]);
        throw new Error(response.message || 'Failed to fetch analytics data.');
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err.message || 'An unexpected error occurred.');
      setAllSiteData([]);
    } finally {
      setChartLoading(false);
    }
  }, [
    selectedSiteIds,
    dateRange.startDate,
    dateRange.endDate,
    chartType,
    frequency,
    pollutant,
    organisationName,
  ]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  /**
   * Refetch function to manually trigger data fetching.
   */
  const refetch = useCallback(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  return { allSiteData, chartLoading, error, refetch };
};

export default useFetchAnalyticsData;
