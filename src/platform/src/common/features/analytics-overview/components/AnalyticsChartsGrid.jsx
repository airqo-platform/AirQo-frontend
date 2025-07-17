import React from 'react';
import ChartContainer from '@/features/airQuality-charts/ChartContainer/ChartContainer';

// Optimized chart configuration with consistent styling
const CHART_CONFIG = {
  height: '400px', // Reduced from 500px to 400px as requested
  chartTypes: {
    line: {
      title: 'Air Pollution Trends Over Time',
      id: 'air-pollution-line-chart',
    },
    bar: {
      title: 'Air Pollution Levels Distribution',
      id: 'air-pollution-bar-chart',
    },
  },
};

/**
 * AnalyticsChartsGrid - Optimized component for analytics overview
 * Renders responsive grid with line and bar charts
 */
const AnalyticsChartsGrid = ({
  allSiteData,
  isChartLoading,
  isError,
  error,
  refetch,
  apiDateRange,
}) => {
  // Shared chart props for consistency
  const baseChartProps = {
    height: CHART_CONFIG.height,
    data: allSiteData,
    chartLoading: isChartLoading,
    error: isError ? error : null,
    refetch,
    dateRange: apiDateRange,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Line Chart - Optimized */}
      <ChartContainer
        {...baseChartProps}
        chartType="line"
        chartTitle={CHART_CONFIG.chartTypes.line.title}
        id={CHART_CONFIG.chartTypes.line.id}
      />

      {/* Bar Chart - Optimized */}
      <ChartContainer
        {...baseChartProps}
        chartType="bar"
        chartTitle={CHART_CONFIG.chartTypes.bar.title}
        id={CHART_CONFIG.chartTypes.bar.id}
      />
    </div>
  );
};

export default AnalyticsChartsGrid;
