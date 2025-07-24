// src/components/ChartContainer.js

import React, { useRef, useCallback, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import useOutsideClick from '@/core/hooks/useOutsideClick';
import { useChartDimensions } from './hooks/useChartDimensions';
import { useChartState } from './hooks/useChartState';
import ChartHeader from './components/ChartHeader';
import ChartContentWrapper from './components/ChartContentWrapper';
import ChartRefreshIndicator from './components/ChartRefreshIndicator';
import Card from '@/components/CardWrapper';
import { ChartExportUtils } from './utils/chartExportUtils';
import { CHART_CONFIG } from './config/chartConfig';

const ChartContainer = ({
  chartType,
  chartTitle,
  height,
  width,
  id,
  showTitle = true,
  data = [],
  chartLoading,
  error,
  refetch,
  isValidating,
  className = '',
  exportOptions = {},
}) => {
  // Refs
  const chartRef = useRef(null);
  const chartContentRef = useRef(null);
  const dropdownRef = useRef(null);

  // Theme
  const { theme, systemTheme } = useTheme();
  const isDark = useMemo(
    () => theme === 'dark' || (theme === 'system' && systemTheme === 'dark'),
    [theme, systemTheme],
  );

  // Redux selectors
  const { chartSites, timeFrame, pollutionType } = useSelector(
    (state) => state.chart,
  );

  // Custom hooks
  const chartDimensions = useChartDimensions(width, height, {
    defaultHeight: CHART_CONFIG.dimensions.defaultHeight,
    minHeight: CHART_CONFIG.dimensions.minHeight,
    maxHeight: CHART_CONFIG.dimensions.maxHeight,
    aspectRatio: CHART_CONFIG.dimensions.aspectRatio,
    containerPadding: CHART_CONFIG.spacing.containerPadding,
  });

  const {
    showSkeleton,
    isRefreshing,
    isManualRefresh,
    exportState,
    handleRefresh,
    handleExportStart,
    handleExportComplete,
    handleExportError,
    clearExportState,
  } = useChartState(chartLoading, isValidating, refetch, {
    skeletonDelay: CHART_CONFIG.animation.skeletonDelay,
    refreshTimeout: CHART_CONFIG.animation.refreshTimeout,
  });

  // Enhanced export handler
  const handleExport = useCallback(
    async (format, customOptions = {}) => {
      if (!chartContentRef.current) {
        handleExportError(format, 'Chart element not found');
        return;
      }
      try {
        handleExportStart(format);
        const mergedOptions = {
          ...exportOptions,
          ...customOptions,
          chartTitle: chartTitle || 'Air Quality Chart',
          chartType,
          timeFrame,
          pollutionType,
          isDark,
        };
        await ChartExportUtils.exportChart(
          chartContentRef.current,
          format,
          mergedOptions,
        );
        handleExportComplete(format);
      } catch (error) {
        console.error(`Chart export failed (${format}):`, error);
        handleExportError(format, error.message || 'Export failed');
      }
    },
    [
      chartContentRef,
      chartTitle,
      chartType,
      timeFrame,
      pollutionType,
      isDark,
      exportOptions,
      handleExportStart,
      handleExportComplete,
      handleExportError,
    ],
  );

  // Handle outside click for dropdown with improved cleanup
  useOutsideClick(
    dropdownRef,
    useCallback(() => {
      const dropdown = dropdownRef.current;
      if (dropdown?.classList.contains('show')) {
        dropdown.classList.remove('show');
        clearExportState();
      }
    }, [clearExportState]),
  );

  // Apply export styles when component mounts with cleanup
  useEffect(() => {
    let cleanup;
    const initializeExportStyles = async () => {
      try {
        cleanup = ChartExportUtils.applyExportStyles();
      } catch (error) {
        console.warn('Failed to apply export styles:', error);
      }
    };
    initializeExportStyles();
    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, []);

  // Enhanced error checking
  const shouldShowError = useMemo(
    () => error && chartSites.length === 0 && !chartLoading,
    [error, chartSites.length, chartLoading],
  );

  // Memoized class names for performance
  const cardClasses = useMemo(
    () =>
      `
      relative border rounded-lg shadow-sm transition-colors duration-200
      ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      ${className}
    `.trim(),
    [isDark, className],
  );

  const headerProps = useMemo(
    () => ({
      className: `
        pt-4 pb-2 px-6 flex items-center justify-between 
        border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} 
        rounded-t-lg
      `.trim(),
    }),
    [isDark],
  );

  const contentClassName = 'p-0 m-0 rounded-b-lg overflow-hidden';

  // Export state notification styling
  const exportNotificationClasses = useMemo(
    () =>
      `
      absolute bottom-4 right-4 px-4 py-2 rounded-lg text-sm z-50 
      transition-all duration-300 transform
      ${exportState.isExporting ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
      ${
        exportState.error
          ? isDark
            ? 'bg-red-900/20 text-red-300 border border-red-800'
            : 'bg-red-100 text-red-700 border border-red-200'
          : isDark
            ? 'bg-blue-900/20 text-blue-300 border border-blue-800'
            : 'bg-blue-100 text-blue-700 border border-blue-200'
      }
    `.trim(),
    [exportState.isExporting, exportState.error, isDark],
  );

  return (
    <div className="relative w-full" id={id} ref={chartRef}>
      {/* Enhanced Refresh Indicator */}
      <ChartRefreshIndicator
        isVisible={isManualRefresh && isRefreshing}
        message="Refreshing chart data..."
        position="top-left"
        isDark={isDark}
      />
      {/* Main Chart Card */}
      <Card
        header={
          <ChartHeader
            title={chartTitle}
            showTitle={showTitle}
            isDark={isDark}
            showSkeleton={showSkeleton}
            chartContentRef={chartContentRef}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            onExport={handleExport}
            exportState={exportState}
            dropdownRef={dropdownRef}
          />
        }
        padding="p-0"
        width="w-full"
        overflow={false}
        className={cardClasses}
        contentClassName={contentClassName}
        headerProps={headerProps}
      >
        {/* Chart Content Container with proper chart-container class */}
        <div
          className="chart-container w-full h-full flex items-center justify-center overflow-hidden"
          style={chartDimensions.containerStyle}
          data-chart-title={chartTitle}
          role="img"
          aria-label={`${chartTitle} chart`}
        >
          <div
            className="relative export-chart-container w-full h-full"
            style={chartDimensions.containerStyle}
          >
            <ChartContentWrapper
              chartContentRef={chartContentRef}
              data={data}
              chartSites={chartSites}
              chartType={chartType}
              timeFrame={timeFrame}
              id={id}
              pollutionType={pollutionType}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
              error={shouldShowError ? error : null}
              showSkeleton={showSkeleton}
              chartStyle={chartDimensions.chartStyle}
              isDark={isDark}
            />
          </div>
        </div>
      </Card>
      {/* Enhanced Export Status Notification */}
      {(exportState.isExporting || exportState.error) && (
        <div className={exportNotificationClasses}>
          {exportState.isExporting && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              <span>Exporting as {exportState.format?.toUpperCase()}...</span>
            </div>
          )}
          {exportState.error && (
            <div className="flex items-center space-x-2">
              <svg
                className="h-4 w-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{exportState.error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Performance optimization with memo and custom comparison
const ChartContainerMemo = React.memo(
  ChartContainer,
  (prevProps, nextProps) => {
    // Custom comparison for better performance
    const keysToCompare = [
      'chartType',
      'chartTitle',
      'height',
      'width',
      'id',
      'showTitle',
      'chartLoading',
      'error',
      'isValidating',
      'className',
    ];
    for (const key of keysToCompare) {
      if (prevProps[key] !== nextProps[key]) {
        return false;
      }
    }
    // Deep comparison for data array
    if (
      Array.isArray(prevProps.data) &&
      Array.isArray(nextProps.data) &&
      prevProps.data.length !== nextProps.data.length
    ) {
      return false;
    }
    return true;
  },
);
ChartContainerMemo.displayName = 'ChartContainer';
export default ChartContainerMemo;
