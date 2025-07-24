import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for managing chart state including loading, refresh, and skeleton states
 * @param {boolean} chartLoading - External loading state
 * @param {boolean} isValidating - External validation state
 * @param {Function} refetch - Refetch function
 * @param {Object} options - Configuration options
 * @returns {Object} State and handlers
 */
export const useChartState = (
  chartLoading,
  isValidating,
  refetch,
  options = {},
) => {
  const {
    skeletonDelay = 500,
    refreshTimeout = 10000,
    autoHideRefreshIndicator = true,
  } = options;

  const refreshTimerRef = useRef(null);

  const [showSkeleton, setShowSkeleton] = useState(chartLoading);
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exportState, setExportState] = useState({
    loadingFormat: null,
    downloadComplete: null,
    error: null,
  });

  // Handle skeleton visibility based on loading state
  useEffect(() => {
    let timer;
    if (!chartLoading) {
      timer = setTimeout(() => setShowSkeleton(false), skeletonDelay);
    } else {
      setShowSkeleton(true);
    }
    return () => timer && clearTimeout(timer);
  }, [chartLoading, skeletonDelay]);

  // Handle refresh indicator state
  useEffect(() => {
    if (!isManualRefresh || !autoHideRefreshIndicator) return;

    let timer;
    if (chartLoading || (isValidating && !chartLoading)) {
      setIsRefreshing(true);
    } else if (!isValidating && !chartLoading && isRefreshing) {
      timer = setTimeout(() => {
        setIsRefreshing(false);
        setIsManualRefresh(false);
      }, skeletonDelay);
    }
    return () => timer && clearTimeout(timer);
  }, [
    isValidating,
    chartLoading,
    isRefreshing,
    isManualRefresh,
    skeletonDelay,
    autoHideRefreshIndicator,
  ]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    setIsManualRefresh(true);
    setIsRefreshing(true);
    refetch();

    // Cleanup any existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    // Set timeout for auto-resetting refresh state
    refreshTimerRef.current = setTimeout(() => {
      setIsRefreshing(false);
      setIsManualRefresh(false);
    }, refreshTimeout);
  }, [refetch, refreshTimeout]);

  // Export state handlers
  const handleExportStart = useCallback((format) => {
    setExportState((prev) => ({
      ...prev,
      loadingFormat: format,
      downloadComplete: null,
      error: null,
    }));
  }, []);

  const handleExportComplete = useCallback((format) => {
    setExportState((prev) => ({
      ...prev,
      loadingFormat: null,
      downloadComplete: format,
      error: null,
    }));
  }, []);

  const handleExportError = useCallback((format, error) => {
    setExportState((prev) => ({
      ...prev,
      loadingFormat: null,
      downloadComplete: null,
      error: error || `Failed to export ${format}`,
    }));
  }, []);

  const clearExportState = useCallback(() => {
    setExportState({
      loadingFormat: null,
      downloadComplete: null,
      error: null,
    });
  }, []);

  // Reset refresh state manually
  const resetRefreshState = useCallback(() => {
    setIsRefreshing(false);
    setIsManualRefresh(false);
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
  }, []);

  return {
    // Loading states
    showSkeleton,
    isRefreshing,
    isManualRefresh,

    // Export states
    exportState,

    // Handlers
    handleRefresh,
    handleExportStart,
    handleExportComplete,
    handleExportError,
    clearExportState,
    resetRefreshState,

    // Utilities
    isLoading: chartLoading || isValidating,
    canInteract: !chartLoading && !isValidating && !isRefreshing,
  };
};
