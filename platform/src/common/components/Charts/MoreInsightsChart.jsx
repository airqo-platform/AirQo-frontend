import React, { useState, useCallback, useMemo } from 'react';
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
import SkeletonLoader from './components/SkeletonLoader';

/**
 * MoreInsightsChart Component
 */
const MoreInsightsChart = React.memo(
  ({
    data,
    selectedSites, // Array of site IDs
    chartType = 'line',
    frequency = 'daily',
    width = '100%',
    height = '300px',
    id,
    pollutantType,
    isLoading = false,
  }) => {
    const [activeIndex, setActiveIndex] = useState(null);

    /**
     * Processes raw chart data by validating dates and organizing data by time and site.
     */
    const processChartData = useCallback((data, selectedSiteIds) => {
      const combinedData = {};
      const siteIdToName = {};

      // Build a mapping from site_id to site name
      data.forEach((dataPoint) => {
        const { site_id, name } = dataPoint;
        if (!siteIdToName[site_id]) {
          siteIdToName[site_id] = name || 'Unknown Location';
        }
      });

      // Process each data point
      data.forEach((dataPoint) => {
        const { value, time, site_id } = dataPoint;

        // Parse and validate the time using the utility function
        const date = parseAndValidateISODate(time);
        if (!date) {
          return;
        }

        // Only include data points from selected sites
        if (!selectedSiteIds.includes(site_id)) return;

        const rawTime = time;

        if (!combinedData[rawTime]) {
          combinedData[rawTime] = { time: rawTime };
        }

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
      if (!data || !selectedSites) return { sortedData: [], siteIdToName: {} };
      return processChartData(data, selectedSites);
    }, [data, selectedSites, processChartData]);

    /**
     * Unique data keys for plotting, which are site IDs.
     */
    const dataKeys = useMemo(() => {
      if (chartData.length === 0) return [];
      return Object.keys(chartData[0]).filter((key) => key !== 'time');
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
     * Calculates the interval for the X-axis ticks based on screen width.
     */
    const calculateXAxisInterval = useCallback(() => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 768) return Math.ceil(chartData.length / 4);
      if (screenWidth < 1024) return Math.ceil(chartData.length / 6);
      return Math.ceil(chartData.length / 8);
    }, [chartData.length]);

    /**
     * Memoized X-axis interval
     */
    const xAxisInterval = useMemo(
      () => calculateXAxisInterval(),
      [calculateXAxisInterval],
    );

    /**
     * Render the chart or appropriate messages based on state
     */
    const renderChart = useMemo(() => {
      if (chartData.length === 0 && !isLoading) {
        return (
          <div className="w-full flex flex-col justify-center items-center h-[380px] text-gray-500">
            <p className="text-lg font-medium mb-2">No Data Available</p>
            <p className="text-sm">
              Please select at least one location to view the air quality data.
            </p>
          </div>
        );
      }

      return (
        <ResponsiveContainer width={width} height={height}>
          <ChartComponent
            data={chartData}
            margin={{ top: 38, right: 10, left: -15, bottom: 10 }}
            style={{ cursor: 'pointer' }}
          >
            {/* Grid */}
            <CartesianGrid
              stroke="#ccc"
              strokeDasharray="5 5"
              vertical={false}
            />

            {/* X-Axis */}
            <XAxis
              dataKey="time"
              tickLine
              tick={({ x, y, payload, fill, index }) => (
                <CustomizedAxisTick
                  x={x}
                  y={y}
                  payload={payload}
                  fill={fill}
                  frequency={frequency}
                  index={index}
                  numTicks={chartData.length}
                />
              )}
              interval={xAxisInterval}
              axisLine={false}
              scale="point"
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
      xAxisInterval,
      getColor,
      handleMouseLeave,
      activeIndex,
      pollutantType,
      WHO_STANDARD_VALUE,
      dataKeys,
      renderCustomizedLegend,
      frequency,
      siteIdToName,
      isLoading,
    ]);

    return (
      <div id={id} className="pt-4">
        {isLoading ? (
          <SkeletonLoader width={width} height={height} />
        ) : (
          renderChart
        )}
      </div>
    );
  },
);

MoreInsightsChart.displayName = 'MoreInsightsChart';

export default MoreInsightsChart;
