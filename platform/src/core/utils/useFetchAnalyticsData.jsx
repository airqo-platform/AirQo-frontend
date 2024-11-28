import { useState, useEffect, useCallback, useRef } from 'react';
import { getAnalyticsData } from '@/core/apis/DeviceRegistry';
import axios from 'axios';
import { format } from 'date-fns';

const API_TIMEOUT = 30000; // 30 seconds timeout
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds between retries

/**
 * Enhanced function to fetch analytics data with retry logic and timeout
 */
const fetchAnalytics = async (requestBody, token, signal, attempt = 1) => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Request timeout'));
    }, API_TIMEOUT);
  });

  try {
    const headers = {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    };

    let response;
    if (process.env.NODE_ENV === 'development') {
      response = await Promise.race([
        axios.post('/api/proxy/analytics', requestBody, {
          headers,
          signal,
        }),
        timeoutPromise,
      ]);

      if (response.status === 200 && response.data?.status === 'success') {
        return response.data.data || [];
      }
    } else {
      response = await Promise.race([
        getAnalyticsData({
          body: requestBody,
          signal,
        }),
        timeoutPromise,
      ]);

      if (response.status === 'success' && Array.isArray(response.data)) {
        return response.data;
      }
    }

    throw new Error(
      response?.data?.message ||
        response?.message ||
        'Failed to fetch analytics data',
    );
  } catch (error) {
    if (
      attempt < RETRY_ATTEMPTS &&
      error.name !== 'CanceledError' &&
      error.name !== 'AbortError'
    ) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchAnalytics(requestBody, token, signal, attempt + 1);
    }
    throw error;
  }
};

/**
 * Enhanced custom hook for fetching analytics data with improved error handling and loading states
 */
const useFetchAnalyticsData = ({
  selectedSiteIds = [],
  dateRange = { startDate: new Date(), endDate: new Date() },
  chartType = 'line',
  frequency = 'daily',
  pollutant = 'pm2_5',
  organisationName = 'airqo',
  onError = null,
}) => {
  const [allSiteData, setAllSiteData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refetchId, setRefetchId] = useState(0);

  // Refs for tracking mount state and previous data
  const isMounted = useRef(true);
  const prevDataRef = useRef(null);
  const activeRequestRef = useRef(null);

  // Format date using memoization
  const formatDate = useCallback((date) => {
    return format(new Date(date), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
  }, []);

  const fetchAnalyticsData = useCallback(
    async (signal) => {
      // Don't set loading state if we have previous data
      if (!prevDataRef.current) {
        setChartLoading(true);
      }
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authorization token is missing.');

        const requestBody = {
          sites: selectedSiteIds,
          startDate: formatDate(dateRange.startDate),
          endDate: formatDate(dateRange.endDate),
          chartType,
          frequency,
          pollutant,
          organisation_name: organisationName,
        };

        // Store the request promise in ref for potential cancellation
        activeRequestRef.current = fetchAnalytics(requestBody, token, signal);
        const data = await activeRequestRef.current;

        // Only update state if component is still mounted
        if (isMounted.current) {
          setAllSiteData(data);
          prevDataRef.current = data;
          setChartLoading(false);
        }
      } catch (err) {
        if (!isMounted.current) return;
        if (err.name === 'CanceledError' || err.name === 'AbortError') return;

        console.error('Error fetching analytics data:', err);
        const errorMessage = err.message || 'An unexpected error occurred.';
        setError(errorMessage);

        // Call error callback if provided
        if (onError) {
          onError(errorMessage);
        }

        // Keep previous data on error if available
        if (!prevDataRef.current) {
          setAllSiteData([]);
        }

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
      formatDate,
      onError,
    ],
  );

  useEffect(() => {
    isMounted.current = true;
    const controller = new AbortController();

    fetchAnalyticsData(controller.signal);

    return () => {
      isMounted.current = false;
      controller.abort();
      // Clean up active request
      if (activeRequestRef.current) {
        activeRequestRef.current = null;
      }
    };
  }, [fetchAnalyticsData, refetchId]);

  const refetch = useCallback(() => {
    setRefetchId((prev) => prev + 1);
  }, []);

  return {
    allSiteData,
    chartLoading,
    error,
    refetch,
    isInitialLoading: chartLoading && !prevDataRef.current,
    isRefetching: chartLoading && Boolean(prevDataRef.current),
  };
};

export default useFetchAnalyticsData;
