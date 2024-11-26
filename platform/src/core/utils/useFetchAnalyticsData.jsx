import { useState, useEffect, useCallback } from 'react';
import { getAnalyticsData } from '@/core/apis/DeviceRegistry';
import axios from 'axios';
import { format } from 'date-fns';

/**
 * Function to fetch analytics data from the API.
 */
const fetchAnalytics = async (requestBody, token, signal) => {
  const headers = {
    Authorization: `${token}`,
    'Content-Type': 'application/json',
  };

  if (process.env.NODE_ENV === 'development') {
    const response = await axios.post('/api/proxy/analytics', requestBody, {
      headers,
      signal, // Axios supports signal for cancellation in recent versions
    });

    if (response.status === 200 && response.data?.status === 'success') {
      return response.data.data || [];
    } else {
      throw new Error(
        response.data?.message || 'Failed to fetch analytics data.',
      );
    }
  } else {
    const response = await getAnalyticsData({
      body: requestBody,
      signal,
    });

    if (response.status === 'success' && Array.isArray(response.data)) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch analytics data.');
    }
  }
};

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
  const [refetchId, setRefetchId] = useState(0);

  const fetchAnalyticsData = useCallback(
    async (signal) => {
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

        const data = await fetchAnalytics(requestBody, token, signal);
        setAllSiteData(data);
      } catch (err) {
        if (err.name === 'CanceledError' || err.name === 'AbortError') return; // Request was cancelled
        console.error('Error fetching analytics data:', err);
        setError(err.message || 'An unexpected error occurred.');
        setAllSiteData([]);
      } finally {
        setChartLoading(false);
      }
    },
    [
      selectedSiteIds,
      dateRange.startDate,
      dateRange.endDate,
      chartType,
      frequency,
      pollutant,
      organisationName,
    ],
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchAnalyticsData(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchAnalyticsData, refetchId]);

  /**
   * Refetch function to manually trigger data fetching.
   */
  const refetch = useCallback(() => {
    setRefetchId((prevId) => prevId + 1);
  }, []);

  return { allSiteData, chartLoading, error, refetch };
};

export default useFetchAnalyticsData;
