'use client';
import React, { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import useOutsideClick from '@/core/hooks/useOutsideClick';

// Custom hooks
import { useChartDimensions } from '../hooks/useChartDimensions';
import { useChartState } from '../hooks/useChartState';

// Components
import ChartHeader from './components/ChartHeader';
import ChartContentWrapper from './components/ChartContentWrapper';
import ChartRefreshIndicator from './components/ChartRefreshIndicator';
import Card from '@/components/CardWrapper';

// Utils
import { ChartExportUtils } from '../utils/chartExportUtils';
import { CHART_CONFIG } from '../config/chartConfig';

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
}) => {
  // Refs
  const chartRef = useRef(null);
  const chartContentRef = useRef(null);
  const dropdownRef = useRef(null);

  // Theme
  const { theme, systemTheme } = useTheme();
  const isDark =
    theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
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

  // Handle outside click for dropdown
  useOutsideClick(dropdownRef, () => {
    dropdownRef.current?.classList.remove('show');
    clearExportState();
  });

  // Apply export styles when component mounts
  useEffect(() => {
    const cleanup = ChartExportUtils.applyExportStyles(isDark);
    return cleanup;
  }, [isDark]);

  // Card styling
  const cardClasses = `
    relative border rounded-lg shadow-sm transition-colors duration-200
    ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
    ${className}
  `;

  const headerProps = {
    className: `
      pt-4 pb-2 px-6 flex items-center justify-between 
      border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} 
      rounded-t-lg
    `,
  };

  const contentClassName = 'p-0 m-0 rounded-b-lg overflow-hidden';

  const shouldShowError = error && chartSites.length === 0;

  return (
    <div className="relative w-full" id={id} ref={chartRef}>
      {/* Refresh Indicator */}
      <ChartRefreshIndicator
        isVisible={isManualRefresh && isRefreshing}
        message="Refreshing data"
        position="top-left"
      />

      {/* Main Card */}
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
            onExportStart={handleExportStart}
            onExportComplete={handleExportComplete}
            onExportError={handleExportError}
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
        {/* Chart Content Container */}
        <div
          className="chart-container w-full h-full flex items-center justify-center overflow-hidden"
          style={chartDimensions.containerStyle}
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

      {/* Export Error Display */}
      {exportState.error && (
        <div
          className={`
            absolute bottom-2 right-2 px-3 py-1 rounded text-sm z-50 
            transition-opacity duration-200
            ${
              isDark
                ? 'bg-red-900/20 text-red-300 border border-red-800'
                : 'bg-red-100 text-red-700 border border-red-200'
            }
          `}
        >
          {exportState.error}
        </div>
      )}
    </div>
  );
};

export default React.memo(ChartContainer);
