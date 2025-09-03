import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAnalyticsData } from '@/core/hooks/analyticHooks';
import formatDateRangeToISO from '@/core/utils/formatDateRangeToISO';
import CustomToast from '@/components/Toast/CustomToast';
import useMergeAbort from '../utils/mergeAbort';
import {
  setMoreInsightsSites,
  selectMoreInsightsSites,
  clearMoreInsightsData,
} from '@/lib/store/services/moreInsights';

export default function useMoreInsights() {
  const dispatch = useDispatch();
  const modalData = useSelector((s) => s.modal.modalType?.data);
  const modalType = useSelector((s) => s.modal.modalType?.type);
  const isModalOpen = useSelector((s) => s.modal.openModal);
  const chartData = useSelector((s) => s.chart);
  const moreInsightsSites = useSelector(selectMoreInsightsSites);

  // Use More Insights sites if available, otherwise fall back to modal data
  const allSites = useMemo(() => {
    if (moreInsightsSites.length > 0) {
      return moreInsightsSites;
    }
    // Fallback to modal data for initial load
    return Array.isArray(modalData) ? modalData : modalData ? [modalData] : [];
  }, [moreInsightsSites, modalData]);

  // Track the last modal data to detect changes
  const lastModalDataRef = useRef(null);
  const lastModalStateRef = useRef({ isOpen: false, type: null });

  // Cleanup when modal closes or changes type away from inSights
  useEffect(() => {
    const currentModalState = { isOpen: isModalOpen, type: modalType };
    const lastModalState = lastModalStateRef.current;

    // If modal was open with inSights but now closed or different type
    if (
      lastModalState.isOpen &&
      lastModalState.type === 'inSights' &&
      (!isModalOpen || modalType !== 'inSights')
    ) {
      // Clear state when leaving More Insights
      dispatch(clearMoreInsightsData());
      lastModalDataRef.current = null;
      // Ensure mobile sidebar overlay is closed when leaving the modal
      setMobileSidebarVisible(false);
    }

    lastModalStateRef.current = currentModalState;
  }, [isModalOpen, modalType, dispatch]);

  // Initialize or update More Insights sites when modal data changes
  useEffect(() => {
    if (modalData) {
      const sitesToSet = Array.isArray(modalData) ? modalData : [modalData];

      // Check if modal data has actually changed (different card selected)
      const modalDataChanged =
        !lastModalDataRef.current ||
        JSON.stringify(lastModalDataRef.current) !== JSON.stringify(modalData);

      if (modalDataChanged && sitesToSet.length > 0) {
        dispatch(setMoreInsightsSites(sitesToSet));
        lastModalDataRef.current = modalData;
      }
    }
  }, [modalData, dispatch]);

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

  const [dataLoadingSites, setDataLoadingSites] = useState([]);
  const [visibleSites, setVisibleSites] = useState([]);
  // Pagination / visualization limits
  const [sitesPerPage, setSitesPerPage] = useState(5); // default to 5 for visualization
  const [currentPage, setCurrentPage] = useState(1);

  // Derived visible site ids for charting based on pagination
  const visibleSiteIds = useMemo(() => {
    if (!visibleSites || visibleSites.length === 0) return [];
    const start = (currentPage - 1) * sitesPerPage;
    const end = start + sitesPerPage;
    return visibleSites.slice(start, end);
  }, [visibleSites, sitesPerPage, currentPage]);

  // Update data loading sites and visible sites when allSites changes
  // Update data loading sites and visible sites when allSites changes (consolidated)
  useEffect(() => {
    if (allSites.length > 0) {
      const siteIds = allSites.map((s) => s._id);
      setDataLoadingSites(siteIds);
      setVisibleSites(siteIds);
    } else {
      // Reset when no sites available
      setDataLoadingSites([]);
      setVisibleSites([]);
    }
  }, [allSites]);

  /* ------------- abort helpers ------------- */
  const abortRef = useMergeAbort();

  /* ------------- data ------------- */
  // Add a condition to prevent API calls when modal is not open or not the right modal type
  const modalState = useSelector((state) => state.modal);
  const shouldFetchData =
    modalState.openModal &&
    modalState.modalType?.type === 'inSights' &&
    dataLoadingSites.length > 0;

  const analyticsParams = shouldFetchData
    ? {
        // Only request analytics for the currently visible page of sites to
        // keep payloads reasonable. Backend supports multiple site ids.
        selectedSiteIds: visibleSiteIds.length
          ? visibleSiteIds
          : dataLoadingSites,
        dateRange: {
          startDate: new Date(dateRange.startDate),
          endDate: new Date(dateRange.endDate),
        },
        chartType,
        frequency,
        pollutant: chartData.pollutionType,
        organisationName: chartData.organizationName,
      }
    : null;

  const { allSiteData, chartLoading, isError, error, refetch, isValidating } =
    useAnalyticsData(analyticsParams, {
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
    });

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
          const newVisibleSites = p.includes(siteId)
            ? p.filter((i) => i !== siteId)
            : [...p, siteId];

          // Update Redux state to keep it in sync
          const newSites = allSites.filter((site) =>
            newVisibleSites.includes(site._id),
          );
          dispatch(setMoreInsightsSites(newSites));

          // Adjust current page if necessary after deselection
          const totalPages = Math.max(
            1,
            Math.ceil(newVisibleSites.length / sitesPerPage),
          );
          if (currentPage > totalPages) {
            setCurrentPage(totalPages);
          }

          return newVisibleSites;
        });
        return true;
      }
      if (action === 'remove' && dataLoadingSites.length > 1) {
        setDataLoadingSites((p) => p.filter((i) => i !== siteId));
        setVisibleSites((p) => {
          const newVisibleSites = p.filter((i) => i !== siteId);

          // Update Redux state to keep it in sync
          const newSites = allSites.filter((site) =>
            newVisibleSites.includes(site._id),
          );
          dispatch(setMoreInsightsSites(newSites));

          // Adjust current page if necessary after removal
          const totalPages = Math.max(
            1,
            Math.ceil(newVisibleSites.length / sitesPerPage),
          );
          if (currentPage > totalPages) {
            setCurrentPage(totalPages);
          }

          return newVisibleSites;
        });
        return true;
      }
      return false;
    },
    [
      dataLoadingSites,
      allSites,
      dispatch,
      sitesPerPage,
      currentPage,
      setCurrentPage,
    ],
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
  }, [refetch, isManualRefresh, isValidating, abortRef]);

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
    visibleSiteIds,
    sitesPerPage,
    setSitesPerPage,
    currentPage,
    setCurrentPage,
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
