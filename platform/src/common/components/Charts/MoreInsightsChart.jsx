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
   */
  const processChartData = useCallback((data, selectedSiteIds) => {
    const combinedData = {};
    const siteIdToName = {};

    data.forEach((dataPoint) => {
      const { site_id, name, value, time } = dataPoint;
      if (!site_id || !name) return;

      siteIdToName[site_id] = name;

      // Parse and validate the time using the utility function
      const date = parseAndValidateISODate(time);
      if (!date) {
        console.warn(`Invalid date format for time: ${time}`);
        return;
      }

      // Only include data points from selected sites
      if (!selectedSiteIds.includes(site_id)) return;

      const rawTime = time;

      if (!combinedData[rawTime]) {
        combinedData[rawTime] = { time: rawTime };
      }

      // Assign value to the corresponding site_id
      combinedData[rawTime][site_id] = value;
    });

    // Convert the combined data object to an array and sort it by time
    const sortedData = Object.values(combinedData).sort(
      (a, b) => new Date(a.time) - new Date(b.time),
    );

    return { sortedData, siteIdToName };
  }, []);

  /**
   * Memoized processed chart data
   */
  const { sortedData: chartData, siteIdToName } = useMemo(() => {
    if (!data || data.length === 0) return { sortedData: [], siteIdToName: {} };
    return processChartData(data, selectedSites);
  }, [data, selectedSites, processChartData]);

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
   * Memoized WHO standard value based on pollutant type
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
   * Assume each label requires a minimum width
   */
  const calculateStep = useCallback(() => {
    const minLabelWidth = 40;
    if (containerWidth === 0) return 1;
    const maxLabels = Math.floor(containerWidth / minLabelWidth);
    const step = Math.ceil(chartData.length / maxLabels);
    return step;
  }, [containerWidth, chartData.length]);

  /**
   * Memoized step for labels
   */
  const step = useMemo(() => calculateStep(), [calculateStep]);

  /**
   * Render the chart or appropriate messages based on state
   */
  const renderChart = useMemo(() => {
    if (chartData.length === 0) {
      return (
        <div className="w-full flex flex-col justify-center items-center h-full text-gray-500">
          <p className="text-lg font-medium mb-2">No Data Available</p>
          <p className="text-sm mb-4 text-center">
            It seems there’s no data to display for the selected criteria. Try
            refreshing the chart or adjusting your filters.
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
            content={<CustomGraphTooltip activeIndex={activeIndex} />}
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
    ChartComponent,
    DataComponent,
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
