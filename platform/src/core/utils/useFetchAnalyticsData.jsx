import { useState, useEffect, useCallback, useRef } from 'react';
import { getAnalyticsData } from '@/core/apis/DeviceRegistry';
import axios from 'axios';
import { format } from 'date-fns';

const API_TIMEOUT = 30000;
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000;

const handleApiResponse = (response) => {
  // development response
  if (response?.data?.status === 'success') {
    return response.data.data || [];
  }

  // production response
  if (response?.status === 'success' && Array.isArray(response.data)) {
    return response.data;
  }

  throw new Error(
    response?.data?.message ||
      response?.message ||
      'Failed to fetch analytics data',
  );
};

const makeApiRequest = async (requestConfig) => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), API_TIMEOUT);
  });

  return Promise.race([requestConfig(), timeoutPromise]);
};

const fetchAnalytics = async (requestBody, token, signal, attempt = 1) => {
  const headers = {
    Authorization: `${token}`,
    'Content-Type': 'application/json',
  };

  try {
    let response;
    if (process.env.NODE_ENV === 'development') {
      response = await makeApiRequest(
        () =>
          axios.post('/api/proxy/analytics', requestBody, { headers, signal }),
        signal,
      );
    } else {
      response = await makeApiRequest(
        () => getAnalyticsData({ body: requestBody, signal }),
        signal,
      );
    }

    return handleApiResponse(response);
  } catch (error) {
    const shouldRetry =
      attempt < RETRY_ATTEMPTS &&
      error.name !== 'CanceledError' &&
      error.name !== 'AbortError';

    if (shouldRetry) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchAnalytics(requestBody, token, signal, attempt + 1);
    }
    throw error;
  }
};

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
  const [forceRefetch, setForceRefetch] = useState(0);

  const activeRequestRef = useRef(null);
  const dataRef = useRef(allSiteData);
  const isMounted = useRef(true);

  const cleanupRequest = useCallback(() => {
    if (activeRequestRef.current) {
      activeRequestRef.current = null;
    }
  }, []);

  const formatDate = useCallback((date) => {
    return format(new Date(date), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
  }, []);

  const fetchAnalyticsData = useCallback(
    async (signal) => {
      cleanupRequest();

      if (!isMounted.current) return;

      setChartLoading(true);
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

        const request = fetchAnalytics(requestBody, token, signal);
        activeRequestRef.current = request;

        const data = await request;

        if (isMounted.current) {
          dataRef.current = data;
          setAllSiteData(data);
          setChartLoading(false);
        }
      } catch (err) {
        if (!isMounted.current) return;
        if (err.name === 'CanceledError' || err.name === 'AbortError') return;

        console.error('Error fetching analytics data:', err);
        setError(err.message || 'An unexpected error occurred.');

        if (!dataRef.current) {
          setAllSiteData([]);
        }
        setChartLoading(false);
      } finally {
        if (!isMounted.current) {
          cleanupRequest();
        }
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
      cleanupRequest,
    ],
  );

  useEffect(() => {
    isMounted.current = true;
    const controller = new AbortController();

    fetchAnalyticsData(controller.signal);

    return () => {
      isMounted.current = false;
      controller.abort();
      cleanupRequest();
    };
  }, [fetchAnalyticsData, cleanupRequest, forceRefetch]);

  const refetch = useCallback(() => {
    if (isMounted.current) {
      setForceRefetch((prev) => prev + 1);
    }
  }, []);

  return { allSiteData, chartLoading, error, refetch };
};

export default useFetchAnalyticsData;
