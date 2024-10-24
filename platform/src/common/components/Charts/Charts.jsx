// src/components/Charts.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
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

import { useAnalyticsData } from './functions';
import {
  renderCustomizedLegend,
  CustomDot,
  CustomBar,
  CustomizedAxisTick,
  CustomGraphTooltip,
  CustomReferenceLabel,
  colors,
} from './components';
import SkeletonLoader from './components/SkeletonLoader';
import { WHO_STANDARD_VALUES } from './constants';

// Main Chart Component
const Charts = ({
  customBody,
  chartType = 'line',
  width = '100%',
  height = '100%',
  id,
}) => {
  const { dataForChart, allKeys, isLoading, error, pollutionType } =
    useAnalyticsData(customBody);

  const [showLoadingMessage, setShowLoadingMessage] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  const WHO_STANDARD_VALUE = WHO_STANDARD_VALUES[pollutionType] || 0;

  /**
   * useEffect to handle the loading state and show a loading message
   * if data fetching takes longer than 5 seconds.
   */
  useEffect(() => {
    let timeoutId;

    if (isLoading) {
      timeoutId = setTimeout(() => setShowLoadingMessage(true), 5000);
    } else {
      setShowLoadingMessage(false);
      setHasLoaded(true);
    }

    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  /**
   * Handler to reset the active index when the mouse leaves a data point.
   */
  const handleMouseLeave = useCallback(() => setActiveIndex(null), []);

  /**
   * Calculates the interval for the X-axis ticks based on screen width.
   * This helps in responsive design.
   */
  const calculateXAxisInterval = useCallback((dataLength) => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 768) return Math.ceil(dataLength / 4);
    if (screenWidth < 1024) return Math.ceil(dataLength / 6);
    return Math.ceil(dataLength / 8);
  }, []);

  /**
   * Formats the Y-axis ticks to display in 'K' or 'M' for thousands or millions.
   */
  const formatYAxisTick = useCallback((tick) => {
    if (tick >= 1_000_000) return `${tick / 1_000_000}M`;
    if (tick >= 1_000) return `${tick / 1_000}K`;
    return tick;
  }, []);

  /**
   * Determines the color of the line or bar based on the active index.
   * If no index is active, all lines/bars use their default colors.
   * If an index is active, only the active one retains its color while others fade.
   */
  const getLineColor = useCallback(
    (index) =>
      activeIndex === null || index === activeIndex
        ? colors[index % colors.length]
        : '#ccc',
    [activeIndex],
  );

  /**
   * Memoizes common Recharts components to prevent unnecessary re-creations
   * on each render, enhancing performance.
   */
  const commonComponents = useMemo(
    () => [
      <CartesianGrid
        key="grid"
        stroke="#ccc"
        strokeDasharray="5 5"
        vertical={false}
      />,
      <XAxis
        key="xAxis"
        dataKey="time"
        tick={<CustomizedAxisTick fill="#1C1D20" />}
        interval={calculateXAxisInterval(dataForChart.length)}
        axisLine={false}
        scale="point"
        padding={{ left: 30, right: 30 }}
      />,
      <YAxis
        key="yAxis"
        axisLine={false}
        fontSize={12}
        tickFormatter={formatYAxisTick}
        tickLine={false}
        tick={{ fill: '#1C1D20' }}
      >
        <Label
          value={pollutionType === 'pm2_5' ? 'PM2.5' : 'PM10'}
          position="insideTopRight"
          fill="#1C1D20"
          offset={0}
          fontSize={12}
          dy={-35}
          dx={12}
        />
      </YAxis>,
      <Legend key="legend" content={renderCustomizedLegend} />,
      <Tooltip
        key="tooltip"
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
      />,
    ],
    [
      chartType,
      calculateXAxisInterval,
      dataForChart.length,
      formatYAxisTick,
      pollutionType,
      activeIndex,
    ],
  );

  const ChartComponent = chartType === 'line' ? LineChart : BarChart;
  const DataComponent = chartType === 'line' ? Line : Bar;

  /**
   * Memoizes the data keys to prevent unnecessary re-computations.
   */
  const dataKeys = useMemo(() => Array.from(allKeys), [allKeys]);

  /**
   * Conditional Rendering Logic:
   * 1. If there's an error, display the error message.
   * 2. If data is loading or hasn't loaded yet, display the skeleton loader and potentially the loading message.
   * 3. If data has loaded but is empty, inform the user that no data was found.
   * 4. Otherwise, display the chart.
   */
  if (error) {
    return (
      <div className="flex justify-center items-center w-full h-full text-sm text-center">
        <p className="text-red-500">
          An error occurred while fetching data. Please try again later or
          refresh the page.
        </p>
      </div>
    );
  }

  if (isLoading || !hasLoaded) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-full">
        <SkeletonLoader width={width} height={height} />
        {showLoadingMessage && (
          <span className="text-yellow-500 mt-2 text-center px-4">
            The data is currently being processed. We appreciate your patience.
          </span>
        )}
      </div>
    );
  }

  if (hasLoaded && dataForChart.length === 0) {
    return (
      <div className="flex justify-center items-center w-full h-full text-center text-sm text-gray-600 px-4">
        No data found. Please try other time periods or customize using other
        locations.
      </div>
    );
  }

  return (
    <div id={id} className="pt-2">
      <ResponsiveContainer width={width} height={height}>
        <ChartComponent
          data={dataForChart}
          margin={{ top: 38, right: 10 }}
          style={{ cursor: 'pointer' }}
        >
          {commonComponents}
          {dataKeys.map((key, index) => (
            <DataComponent
              key={key}
              dataKey={key}
              {...(chartType === 'line'
                ? {
                    type: 'monotone',
                    stroke: getLineColor(index),
                    strokeWidth: 4,
                    dot: <CustomDot />,
                    activeDot: { r: 6 },
                  }
                : {
                    fill: colors[index % colors.length],
                    barSize: 12,
                    shape: <CustomBar />,
                  })}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={handleMouseLeave}
            />
          ))}
          <ReferenceLine
            y={WHO_STANDARD_VALUE}
            label={<CustomReferenceLabel />}
            ifOverflow="extendDomain"
            stroke="red"
            strokeOpacity={1}
            strokeDasharray="0"
          />
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

Charts.propTypes = {
  customBody: PropTypes.object,
  chartType: PropTypes.oneOf(['line', 'bar']),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  id: PropTypes.string.isRequired,
};

export default React.memo(Charts);
