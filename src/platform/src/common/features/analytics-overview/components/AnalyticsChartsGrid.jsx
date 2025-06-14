import React from 'react';
import ChartContainer from '@/features/airQuality-charts/ChartContainer';

/**
 * AnalyticsChartsGrid component renders the chart grid for analytics overview
 * Displays line and bar charts with the provided data and configurations
 */
const AnalyticsChartsGrid = ({
  allSiteData,
  isChartLoading,
  isError,
  error,
  refetch,
  apiDateRange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Line Chart */}
      <ChartContainer
        chartType="line"
        chartTitle="Air Pollution Trends Over Time"
        height={380}
        id="air-pollution-line-chart"
        data={allSiteData}
        chartLoading={isChartLoading}
        error={isError ? error : null}
        refetch={refetch}
        dateRange={apiDateRange}
      />

      {/* Bar Chart */}
      <ChartContainer
        chartType="bar"
        chartTitle="Air Pollution Levels Distribution"
        height={380}
        id="air-pollution-bar-chart"
        data={allSiteData}
        chartLoading={isChartLoading}
        error={isError ? error : null}
        refetch={refetch}
        dateRange={apiDateRange}
      />
    </div>
  );
};

export default AnalyticsChartsGrid;
