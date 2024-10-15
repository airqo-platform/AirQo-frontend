import { useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { setRefreshChart } from '@/lib/store/services/charts/ChartSlice';
import {
  fetchAnalyticsData,
  setAnalyticsData,
} from '@/lib/store/services/charts/ChartData';

/**
 * Custom hook to fetch and manage analytics data.
 */
const useAnalyticsData = (customBody = {}) => {
  const dispatch = useDispatch();

  const {
    chartDataRange,
    chartType,
    timeFrame,
    pollutionType,
    organizationName,
    refreshChart,
  } = useSelector((state) => state.chart, shallowEqual);

  const analyticsData = useSelector(
    (state) => state.analytics.data,
    shallowEqual,
  );
  const isLoading = useSelector(
    (state) => state.analytics.status === 'loading',
    shallowEqual,
  );
  const error = useSelector((state) => state.analytics.error, shallowEqual);
  const preferenceData =
    useSelector(
      (state) => state.defaults.individual_preferences,
      shallowEqual,
    ) || [];
  const siteData = useSelector(
    (state) => state.grids.sitesSummary,
    shallowEqual,
  );

  /**
   * Retrieves the site name based on the site ID from user preferences.
   */
  const getSiteName = useCallback(
    (siteId) => {
      const site = preferenceData[0]?.selected_sites?.find(
        (site) => site._id === siteId,
      );
      return site ? site.name?.split(',')[0] : '';
    },
    [preferenceData],
  );

  /**
   * Retrieves the existing site name based on the site ID from site data.
   */
  const getExistingSiteName = useCallback(
    (siteId) => {
      const site = siteData?.sites?.find((site) => site._id === siteId);
      return site ? site.search_name : '';
    },
    [siteData],
  );

  /**
   * Fetches analytics data based on user preferences and custom parameters.
   */
  const fetchData = useCallback(async () => {
    if (!preferenceData.length) return;

    const { selected_sites } = preferenceData[0];
    const chartSites = selected_sites?.map((site) => site['_id']) || [];

    const defaultBody = {
      sites: chartSites,
      startDate: chartDataRange.startDate,
      endDate: chartDataRange.endDate,
      chartType,
      frequency: timeFrame,
      pollutant: pollutionType,
      organisation_name: organizationName,
    };

    const body = { ...defaultBody, ...customBody };

    try {
      dispatch(setAnalyticsData(null));
      await dispatch(fetchAnalyticsData(body)).unwrap();
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
      dispatch(setAnalyticsData(null));
    } finally {
      dispatch(setRefreshChart(false));
    }
  }, [
    chartDataRange,
    chartType,
    timeFrame,
    pollutionType,
    organizationName,
    dispatch,
    preferenceData,
    customBody,
  ]);

  /**
   * useEffect to fetch data when dependencies change, including the refresh flag.
   */
  useEffect(() => {
    fetchData();
  }, [fetchData, refreshChart]);

  /**
   * Transforms the fetched analytics data into a format suitable for Recharts.
   */
  const transformedData = useMemo(() => {
    if (!analyticsData?.length) return { dataForChart: [], allKeys: new Set() };

    const newAnalyticsData = analyticsData.map((data) => ({
      ...data,
      name:
        getSiteName(data.site_id) ||
        getExistingSiteName(data.site_id) ||
        data.generated_name,
    }));

    const dataForChart = Object.values(
      newAnalyticsData.reduce((acc, curr) => {
        if (!acc[curr.time]) {
          acc[curr.time] = { time: curr.time };
        }
        acc[curr.time][curr.name] = curr.value;
        return acc;
      }, {}),
    );

    const allKeys = new Set(
      dataForChart.length > 0
        ? Object.keys(dataForChart[0]).filter((key) => key !== 'time')
        : [],
    );

    return { dataForChart, allKeys };
  }, [analyticsData, getSiteName, getExistingSiteName]);

  return { ...transformedData, isLoading, error, pollutionType };
};

export default useAnalyticsData;
