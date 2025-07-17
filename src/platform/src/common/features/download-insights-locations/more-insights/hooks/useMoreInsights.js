import { useState, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useAnalyticsData } from '@/core/hooks/analyticHooks';
import formatDateRangeToISO from '@/core/utils/formatDateRangeToISO';
import { CustomToast } from '@/components/Toast/CustomToast';
import useMergeAbort from '../utils/mergeAbort';

export default function useMoreInsights() {
  const modalData = useSelector((s) => s.modal.modalType?.data);
  const chartData = useSelector((s) => s.chart);

  const allSites = useMemo(
    () => (Array.isArray(modalData) ? modalData : modalData ? [modalData] : []),
    [modalData],
  );

  /* ------------- state ------------- */
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [frequency, setFrequency] = useState('daily');
  const [chartType, setChartType] = useState('line');
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  const initialDateRange = useMemo(() => {
    const { startDateISO, endDateISO } = formatDateRangeToISO(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      new Date(),
    );
    return {
      startDate: startDateISO,
      endDate: endDateISO,
      label: 'Last 7 days',
    };
  }, []);
  const [dateRange, setDateRange] = useState(initialDateRange);

  const [dataLoadingSites, setDataLoadingSites] = useState(
    allSites.map((s) => s._id),
  );
  const [visibleSites, setVisibleSites] = useState(allSites.map((s) => s._id));

  /* ------------- abort helpers ------------- */
  const abortRef = useMergeAbort();

  /* ------------- data ------------- */
  const { allSiteData, chartLoading, isError, error, refetch, isValidating } =
    useAnalyticsData(
      {
        selectedSiteIds: dataLoadingSites,
        dateRange: {
          startDate: new Date(dateRange.startDate),
          endDate: new Date(dateRange.endDate),
        },
        chartType,
        frequency,
        pollutant: chartData.pollutionType,
        organisationName: chartData.organizationName,
      },
      {
        revalidateOnFocus: false,
        dedupingInterval: 10000,
        errorRetryCount: 2,
        onError: (err) => {
          if (err.name === 'AbortError') return;
          if (isManualRefresh) setIsManualRefresh(false);
        },
        onSuccess: () => {
          if (isManualRefresh) {
            setRefreshSuccess(true);
            setIsManualRefresh(false);
            clearTimeout(abortRef.current.success);
            abortRef.current.success = setTimeout(
              () => setRefreshSuccess(false),
              3000,
            );
          }
        },
      },
    );

  /* ------------- handlers ------------- */
  const handleSiteAction = useCallback(
    (siteId, action = 'toggle') => {
      if (!dataLoadingSites.includes(siteId)) {
        setDataLoadingSites((p) => [...p, siteId]);
        setVisibleSites((p) => [...p, siteId]);
        return true;
      }
      if (action === 'toggle') {
        setVisibleSites((p) => {
          if (p.length === 1 && p.includes(siteId)) {
            CustomToast({
              message: 'At least one location must remain selected.',
              type: 'warning',
            });
            return p;
          }
          return p.includes(siteId)
            ? p.filter((i) => i !== siteId)
            : [...p, siteId];
        });
        return true;
      }
      if (action === 'remove' && dataLoadingSites.length > 1) {
        setDataLoadingSites((p) => p.filter((i) => i !== siteId));
        setVisibleSites((p) => p.filter((i) => i !== siteId));
        return true;
      }
      return false;
    },
    [dataLoadingSites],
  );

  const handleManualRefresh = useCallback(async () => {
    if (isManualRefresh || isValidating) return;
    abortRef.current.abort?.abort();
    abortRef.current.abort = new AbortController();
    setIsManualRefresh(true);
    setRefreshSuccess(false);
    try {
      await refetch({ signal: abortRef.current.abort.signal });
    } catch {
      setIsManualRefresh(false);
    }
  }, [refetch, isManualRefresh, isValidating]);

  return {
    /* data */
    allSites,
    allSiteData,
    chartLoading,
    isError,
    error,
    isValidating,
    /* state */
    mobileSidebarVisible,
    setMobileSidebarVisible,
    frequency,
    setFrequency,
    chartType,
    setChartType,
    dateRange,
    setDateRange,
    dataLoadingSites,
    visibleSites,
    /* flags */
    isManualRefresh,
    refreshSuccess,
    /* handlers */
    handleSiteAction,
    handleManualRefresh,

    /* pollutant */
    pollutant: chartData.pollutionType,
  };
}
