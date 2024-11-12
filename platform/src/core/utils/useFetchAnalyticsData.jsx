import { useState, useCallback, useEffect } from 'react';
import { getAnalyticsData } from '@/core/apis/DeviceRegistry';
import axios from 'axios';
import { format } from 'date-fns';

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
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authorization token is missing.');

      const requestBody = {
        sites: selectedSiteIds,
        startDate: format(
          new Date(dateRange.startDate),
          "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
        ),
        endDate: format(
          new Date(dateRange.endDate),
          "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
        ),
        chartType,
        frequency,
        pollutant,
        organisation_name: organisationName,
      };

      if (process.env.NODE_ENV === 'development') {
        const response = await axios.post('/api/proxy/analytics', requestBody, {
          headers: {
            Authorization: `${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Check if the response status is success and set data accordingly
        if (response.status === 200 && response.data?.status === 'success') {
          setAllSiteData(response.data.data || []);
        } else {
          throw new Error(
            response.data?.message || 'Failed to fetch analytics data.',
          );
        }
      } else {
        const controller = new AbortController();

        const response = await getAnalyticsData({
          body: requestBody,
          signal: controller.signal,
        });

        if (response.status === 'success' && Array.isArray(response.data)) {
          setAllSiteData(response.data);
          setChartLoading(false);
        } else {
          throw new Error(
            response.message || 'Failed to fetch analytics data.',
          );
        }
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
