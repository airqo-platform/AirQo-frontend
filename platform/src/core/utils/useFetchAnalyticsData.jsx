import { useState, useEffect, useCallback, useRef } from 'react';
import { getAnalyticsData } from '@/core/apis/DeviceRegistry';
import axios from 'axios';
import { format } from 'date-fns';

const CONFIG = {
  API_TIMEOUT: 150000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 2000,
  DATE_FORMAT: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
};

class ApiError extends Error {
  constructor(message, status, originalError) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.originalError = originalError;
  }
}

const createApiClient = () => {
  const handleResponse = (response) => {
    if (response?.data?.status === 'success') {
      return response.data.data || [];
    }
    if (response?.status === 'success' && Array.isArray(response.data)) {
      return response.data;
    }
    throw new ApiError(
      response?.data?.message || 'Failed to fetch analytics data',
      response?.status,
      null,
    );
  };

  const makeRequest = async (requestConfig) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, CONFIG.API_TIMEOUT);

    try {
      const response = await requestConfig(controller.signal);
      return handleResponse(response);
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const fetchWithRetry = async (requestConfig, attempt = 1) => {
    try {
      return await makeRequest(requestConfig);
    } catch (error) {
      if (
        attempt < CONFIG.RETRY_ATTEMPTS &&
        !error.name.includes('Abort') &&
        error.status !== 401 &&
        error.status !== 403
      ) {
        await new Promise((resolve) => setTimeout(resolve, CONFIG.RETRY_DELAY));
        return fetchWithRetry(requestConfig, attempt + 1);
      }
      throw error;
    }
  };

  return {
    fetch: async (requestBody, token) => {
      const headers = {
        Authorization: token,
        'Content-Type': 'application/json',
      };

      const requestConfig = async (signal) => {
        if (process.env.NODE_ENV === 'development') {
          return axios.post('/api/proxy/analytics', requestBody, {
            headers,
            signal,
          });
        }
        return getAnalyticsData({ body: requestBody, signal });
      };

      return fetchWithRetry(requestConfig);
    },
  };
};

const useFetchAnalyticsData = ({
  selectedSiteIds = [],
  dateRange = { startDate: new Date(), endDate: new Date() },
  chartType = 'line',
  frequency = 'daily',
  pollutant = 'pm2_5',
  organisationName = 'airqo',
}) => {
  const [state, setState] = useState({
    data: [],
    loading: true,
    error: null,
  });

  const mountedRef = useRef(true);
  const apiClient = useRef(createApiClient()).current;
  const lastRequest = useRef(null);

  const formatDate = useCallback((date) => {
    return format(new Date(date), CONFIG.DATE_FORMAT);
  }, []);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setState((prev) => ({
        ...prev,
        error: new Error('Authorization token missing'),
        loading: false,
      }));
      return;
    }

    try {
      lastRequest.current = apiClient.fetch(
        {
          sites: selectedSiteIds,
          startDate: formatDate(dateRange.startDate),
          endDate: formatDate(dateRange.endDate),
          chartType,
          frequency,
          pollutant,
          organisation_name: organisationName,
        },
        token,
      );

      const data = await lastRequest.current;

      if (mountedRef.current) {
        setState({ data, loading: false, error: null });
      }
    } catch (error) {
      if (mountedRef.current && !error.name.includes('Abort')) {
        setState((prev) => ({
          ...prev,
          error: new ApiError(
            error.message || 'Failed to fetch data',
            error.status,
            error,
          ),
          loading: false,
        }));
      }
    }
  }, [
    selectedSiteIds,
    dateRange.startDate,
    dateRange.endDate,
    chartType,
    frequency,
    pollutant,
    organisationName,
    formatDate,
    apiClient,
  ]);

  useEffect(() => {
    mountedRef.current = true;
    setState((prev) => ({ ...prev, loading: true }));
    fetchData();

    return () => {
      mountedRef.current = false;
      lastRequest.current = null;
    };
  }, [fetchData]);

  const refetch = useCallback(() => {
    if (mountedRef.current) {
      setState((prev) => ({ ...prev, loading: true }));
      fetchData();
    }
  }, [fetchData]);

  return {
    allSiteData: state.data,
    chartLoading: state.loading,
    error: state.error,
    refetch,
  };
};

export default useFetchAnalyticsData;
