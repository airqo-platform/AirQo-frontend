import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Label,
  Legend,
  ReferenceLine,
} from 'recharts';

import {
  renderCustomizedLegend,
  CustomDot,
  CustomBar,
  CustomGraphTooltip,
  CustomReferenceLabel,
  colors,
} from './components';

import { parseAndValidateISODate } from '@/core/utils/dateUtils';
import { WHO_STANDARD_VALUES } from './constants';
import { formatYAxisTick, CustomizedAxisTick } from './utils';
import useResizeObserver from '@/core/utils/useResizeObserver';

/**
 * MoreInsightsChart Component
 *
 * Renders a responsive chart (line or bar) based on the provided data and configurations.
 * Displays user-friendly messages when no sites are selected or when there's no data to display.
 *
 * @param {object} props - Component properties.
 * @param {Array} props.data - Array of data points for the chart.
 * @param {Array} props.selectedSites - Array of selected site IDs or site objects.
 * @param {string} props.chartType - Type of chart ('line' or 'bar').
 * @param {string} props.frequency - Frequency of data points (e.g., 'daily', 'weekly').
 * @param {string|number} props.width - Width of the chart container.
 * @param {string|number} props.height - Height of the chart container.
 * @param {string} props.id - HTML ID for the chart container.
 * @param {string} props.pollutantType - Type of pollutant (e.g., 'pm2_5', 'pm10').
 * @param {Function} props.refreshChart - Function to refresh chart data.
 */
const MoreInsightsChart = ({
  data = [],
  selectedSites = [],
  chartType = 'line',
  frequency = 'daily',
  width = '100%',
  height = '300px',
  id,
  pollutantType,
  refreshChart,
}) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const containerRef = useRef(null);
  const { width: containerWidth } = useResizeObserver(containerRef);

  /**
   * Processes raw chart data by validating dates and organizing data by time and site.
   *
   * @param {Array} data - Raw data array.
   * @param {Array} selectedSiteIds - Array of selected site IDs.
   * @returns {object} Processed data including sorted data and site ID to name mapping.
   */
  const processChartData = useCallback((data, selectedSiteIds) => {
    const combinedData = {};
    const siteIdToName = {};

    data.forEach((dataPoint) => {
      const { site_id, name, value, time } = dataPoint;

      // Verify that site_id and name exist
      if (!site_id || !name) {
        console.warn(`Data point missing site_id or name:`, dataPoint);
        return;
      }

      // Build site ID to name mapping
      siteIdToName[site_id] = name;

      // Only include data points from selected sites
      if (!selectedSiteIds.includes(site_id)) {
        return;
      }

      // Parse and validate the time using the utility function
      const date = parseAndValidateISODate(time);
      if (!date) {
        console.warn(`Invalid date format for time: ${time}`);
        return;
      }

      // Use formatted time as key
      const formattedTime = date.toISOString();

      if (!combinedData[formattedTime]) {
        combinedData[formattedTime] = { time: formattedTime };
      }

      // Assign value to the corresponding site_id
      combinedData[formattedTime][site_id] = value;
    });

    // Convert the combined data object to an array and sort it by time
    const sortedData = Object.values(combinedData).sort(
      (a, b) => new Date(a.time) - new Date(b.time),
    );

    return { sortedData, siteIdToName };
  }, []);

  /**
   * Ensures selectedSites is an array of site IDs.
   * If selectedSites contains objects, it maps them to their respective IDs.
   *
   * @returns {Array} Array of selected site IDs.
   */
  const selectedSiteIds = useMemo(() => {
    if (!selectedSites || selectedSites.length === 0) return [];

    // If selectedSites is an array of objects, map to IDs
    if (typeof selectedSites[0] === 'object') {
      return selectedSites
        .map((site) => site.site_id || site.id)
        .filter(Boolean);
    }

    // Assume selectedSites is already an array of IDs
    return selectedSites;
  }, [selectedSites]);

  /**
   * Memoized processed chart data.
   */
  const { sortedData: chartData, siteIdToName } = useMemo(() => {
    if (!data || data.length === 0) return { sortedData: [], siteIdToName: {} };
    return processChartData(data, selectedSiteIds);
  }, [data, selectedSiteIds, processChartData]);

  /**
   * Unique data keys for plotting, which are site IDs.
   */
  const dataKeys = useMemo(() => {
    if (chartData.length === 0) return [];
    // Extract all unique keys excluding 'time'
    const keys = new Set();
    chartData.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (key !== 'time') keys.add(key);
      });
    });
    return Array.from(keys);
  }, [chartData]);

  /**
   * Memoized WHO standard value based on pollutant type.
   */
  const WHO_STANDARD_VALUE = useMemo(
    () => WHO_STANDARD_VALUES[pollutantType] || 0,
    [pollutantType],
  );

  /**
   * Handler to reset the active index when the mouse leaves a data point.
   */
  const handleMouseLeave = useCallback(() => setActiveIndex(null), []);

  /**
   * Determines the color of the line or bar based on the active index.
   *
   * @param {number} index - Index of the data series.
   * @returns {string} Color code.
   */
  const getColor = useCallback(
    (index) =>
      activeIndex === null || index === activeIndex
        ? colors[index % colors.length]
        : '#ccc',
    [activeIndex],
  );

  /**
   * Determines which chart component and data component to use based on the 'chartType' prop.
   */
  const ChartComponent = chartType === 'line' ? LineChart : BarChart;
  const DataComponent = chartType === 'line' ? Line : Bar;

  /**
   * Calculate step based on container width and number of ticks.
   * Assumes each label requires a minimum width.
   *
   * @returns {number} Step value for X-axis labels.
   */
  const calculateStep = useCallback(() => {
    const minLabelWidth = 25;
    if (containerWidth === 0) return 1;
    const maxLabels = Math.floor(containerWidth / minLabelWidth);
    const step = Math.ceil(chartData.length / maxLabels);
    return step;
  }, [containerWidth, chartData.length]);

  /**
   * Memoized step for labels.
   */
  const step = useMemo(() => calculateStep(), [calculateStep]);

  /**
   * Render the chart or appropriate messages based on state.
   */
  const renderChart = useMemo(() => {
    // If no sites are selected, prompt the user to select sites.
    if (selectedSiteIds.length === 0) {
      return (
        <div className="w-full flex flex-col justify-center items-center h-full text-gray-500 p-4">
          <p className="text-lg font-medium mb-2">No Sites Selected</p>
          <p className="text-sm mb-4 text-center">
            Please select one or more sites to view the chart.
          </p>
        </div>
      );
    }

    // If there is no data to display for the selected sites, inform the user.
    if (chartData.length === 0) {
      return (
        <div className="w-full flex flex-col justify-center items-center h-full text-gray-500 p-4">
          <p className="text-lg font-medium mb-2">No Data Available</p>
          <p className="text-sm mb-4 text-center">
            There’s no data to display for the selected criteria. Try adjusting
            your filters or refreshing the chart.
          </p>
          <button
            onClick={refreshChart}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Chart
          </button>
        </div>
      );
    }

    // If data is available, render the chart.
    return (
      <ResponsiveContainer width={width} height={height}>
        <ChartComponent
          data={chartData}
          margin={{ top: 38, right: 10, left: -15, bottom: 20 }}
          style={{ cursor: 'pointer' }}
        >
          {/* Grid */}
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" vertical={false} />

          {/* X-Axis */}
          <XAxis
            dataKey="time"
            tickLine={false}
            tick={({ x, y, payload, fill, index }) => (
              <CustomizedAxisTick
                x={x}
                y={y}
                payload={payload}
                fill={fill}
                frequency={frequency}
                index={index}
                step={step}
              />
            )}
            axisLine={false}
            scale="auto"
            interval={step}
            padding={{ left: 30, right: 30 }}
          />

          {/* Y-Axis */}
          <YAxis
            domain={[0, 'auto']}
            axisLine={false}
            fontSize={12}
            tickLine={false}
            tick={{ fill: '#1C1D20' }}
            tickFormatter={formatYAxisTick}
          >
            <Label
              value={
                pollutantType === 'pm2_5'
                  ? 'PM2.5'
                  : pollutantType === 'pm10'
                    ? 'PM10'
                    : 'Pollutant'
              }
              position="top"
              fill="#1C1D20"
              fontSize={12}
              angle={0}
              dx={0}
              dy={-20}
              style={{
                textAnchor: 'start',
              }}
            />
          </YAxis>

          {/* Legend */}
          <Legend content={renderCustomizedLegend} />

          {/* Tooltip */}
          <Tooltip
            content={
              <CustomGraphTooltip
                pollutantType={pollutantType}
                activeIndex={activeIndex}
              />
            }
            cursor={
              chartType === 'line'
                ? {
                    stroke: '#aaa',
                    strokeOpacity: 0.3,
                    strokeWidth: 2,
                    strokeDasharray: '3 3',
                  }
                : { fill: '#eee', fillOpacity: 0.3 }
            }
          />

          {/* Data Lines/Bars */}
          {dataKeys.map((key, index) => (
            <DataComponent
              key={key}
              dataKey={key}
              name={siteIdToName[key] || 'Unknown Location'}
              type={chartType === 'line' ? 'monotone' : undefined}
              stroke={chartType === 'line' ? getColor(index) : undefined}
              strokeWidth={chartType === 'line' ? 4 : undefined}
              fill={chartType === 'bar' ? getColor(index) : undefined}
              barSize={chartType === 'bar' ? 12 : undefined}
              dot={chartType === 'line' ? <CustomDot /> : undefined}
              activeDot={chartType === 'line' ? { r: 6 } : undefined}
              shape={chartType === 'bar' ? <CustomBar /> : undefined}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={handleMouseLeave}
            />
          ))}

          {/* Reference Line */}
          {WHO_STANDARD_VALUE && (
            <ReferenceLine
              y={WHO_STANDARD_VALUE}
              label={<CustomReferenceLabel />}
              ifOverflow="extendDomain"
              stroke="red"
              strokeOpacity={1}
              strokeDasharray="0"
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    );
  }, [
    selectedSiteIds.length,
    selectedSiteIds,
    chartData,
    chartType,
    width,
    height,
    step,
    getColor,
    handleMouseLeave,
    activeIndex,
    pollutantType,
    WHO_STANDARD_VALUE,
    dataKeys,
    renderCustomizedLegend,
    frequency,
    siteIdToName,
    refreshChart,
  ]);

  return (
    <div id={id} ref={containerRef} className="w-auto h-full pt-4">
      {renderChart}
    </div>
  );
};

export default React.memo(MoreInsightsChart);
