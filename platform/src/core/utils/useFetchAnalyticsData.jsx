import { useSelector } from 'react-redux';
import { useState, useCallback, useEffect } from 'react';
import { getAnalyticsData } from '@/core/apis/DeviceRegistry';

/**
 * Custom hook to fetch analytics data based on selected sites, date range, frequency, and chart type.
 * Includes error handling and data validation.
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
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState(null);
  const { refreshChart } = useSelector((state) => state.chart);

  /**
   * Validates and converts input dates to ISO strings.
   *
   * @returns {Object} - Contains ISO strings for startDate and endDate.
   * @throws Will throw an error if dates are invalid.
   */
  const getValidDateRange = useCallback(() => {
    let { startDate, endDate } = dateRange;

    // Convert to Date objects if they're not already
    if (!(startDate instanceof Date)) {
      startDate = new Date(startDate);
    }
    if (!(endDate instanceof Date)) {
      endDate = new Date(endDate);
    }

    // Validate dates
    if (isNaN(startDate)) {
      throw new Error('Invalid startDate provided.');
    }
    if (isNaN(endDate)) {
      throw new Error('Invalid endDate provided.');
    }

    // Ensure startDate is not after endDate
    if (startDate > endDate) {
      throw new Error('Start date must be before the end date.');
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  }, [dateRange]);

  /**
   * Fetches analytics data based on selected sites, date range, frequency, and chart type.
   * Includes robust error handling and date validations.
   */
  const fetchAnalyticsData = useCallback(async () => {
    if (selectedSiteIds.length === 0) {
      setAllSiteData([]);
      setError(null);
      return;
    }

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

      // Set loading states before initiating the API call
      setChartLoading(true);
      setError(null);

      const response = await getAnalyticsData(requestBody);

      if (response.status === 'success') {
        if (Array.isArray(response.data)) {
          setAllSiteData(response.data);
        } else {
          throw new Error('Unexpected data format received from the server.');
        }
      } else {
        throw new Error(response.message || 'Failed to fetch analytics data.');
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(
        err.message || 'An error occurred while fetching analytics data.',
      );
      setAllSiteData([]);
    } finally {
      setChartLoading(false);
    }
  }, [
    // selectedSiteIds,
    getValidDateRange,
    frequency,
    pollutant,
    // organisationName,
    refreshChart,
  ]);

  // Fetch data whenever dependencies change
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  return { allSiteData, chartLoading, error };
};

export default useFetchAnalyticsData;
