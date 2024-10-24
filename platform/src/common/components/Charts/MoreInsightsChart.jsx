import React, { useState, useCallback, useMemo } from 'react';
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

import {
  renderCustomizedLegend,
  CustomDot,
  CustomBar,
  CustomizedAxisTick,
  CustomGraphTooltip,
  CustomReferenceLabel,
  colors,
} from './components';

/**
 * WHO standard values for reference lines.
 */
const WHO_STANDARD_VALUES = {
  pm2_5: 15,
  pm10: 45,
  no2: 25,
};

/**
 * Formats Y-axis ticks to display in 'K' or 'M' for thousands or millions.
 * @param {number} tick - The tick value.
 * @returns {string|number} - Formatted tick.
 */
const formatYAxisTick = (tick) => {
  if (tick >= 1_000_000) return `${(tick / 1_000_000).toFixed(1)}M`;
  if (tick >= 1_000) return `${(tick / 1_000).toFixed(1)}K`;
  return tick;
};

/**
 * ChartLoadingSkeleton Component
 * Displays a skeleton loader mimicking the chart structure.
 */
const ChartLoadingSkeleton = ({ width, height }) => {
  return (
    <div
      style={{
        width: width || '100%',
        height: height || '300px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        position: 'relative',
      }}
    >
      {/* Simple CSS-based skeleton */}
      <div className="animate-pulse w-3/4 h-3/4 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded-md"></div>
      <style>{`
        .animate-pulse {
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

ChartLoadingSkeleton.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

/**
 * MoreInsightsChart Component
 */
const MoreInsightsChart = React.memo(
  ({
    data,
    chartType = 'line',
    width = '100%',
    height = '300px',
    id,
    pollutionType,
    isLoading = false,
  }) => {
    const [activeIndex, setActiveIndex] = useState(null);
    const [dataError, setDataError] = useState(null);

    /**
     * Validate and sanitize data
     */
    const sanitizedData = useMemo(() => {
      if (!Array.isArray(data)) {
        setDataError('Data is not an array.');
        return [];
      }

      return data.map((item, index) => {
        const newItem = { ...item };
        if (!newItem.time) {
          console.warn(`Data item at index ${index} is missing 'time' field.`);
          newItem.time = 'N/A';
        } else {
          const date = new Date(newItem.time);
          if (isNaN(date.getTime())) {
            console.warn(
              `Invalid time value at index ${index}: ${newItem.time}`,
            );
            newItem.time = 'Invalid Date';
          } else {
            // Optionally format the time
            newItem.time = date.toLocaleString(); // Adjust formatting as needed
          }
        }
        return newItem;
      });
    }, [data]);

    /**
     * Memoized WHO standard value based on pollution type
     */
    const WHO_STANDARD_VALUE = useMemo(
      () => WHO_STANDARD_VALUES[pollutionType] || 0,
      [pollutionType],
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
     * Unique data keys for plotting, excluding the 'time' key.
     */
    const dataKeys = useMemo(() => {
      if (sanitizedData.length === 0) return [];
      return Object.keys(sanitizedData[0]).filter((key) => key !== 'time');
    }, [sanitizedData]);

    /**
     * Calculates the interval for the X-axis ticks based on screen width.
     */
    const calculateXAxisInterval = useCallback(() => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 768) return Math.ceil(data.length / 4);
      if (screenWidth < 1024) return Math.ceil(data.length / 6);
      return Math.ceil(data.length / 8);
    }, [data.length]);

    /**
     * Render the chart or appropriate messages based on state
     */
    const renderChart = useMemo(() => {
      if (dataError) {
        return (
          <div className="w-full flex flex-col justify-center items-center h-[380px] text-red-500">
            <p className="text-lg font-medium mb-2">Data Error</p>
            <p className="text-sm">{dataError}</p>
          </div>
        );
      }

      if (sanitizedData.length === 0) {
        return (
          <div className="w-full flex flex-col justify-center items-center h-[380px] text-gray-500">
            <p className="text-lg font-medium mb-2">No Data Available</p>
          </div>
        );
      }

      return (
        <ResponsiveContainer width={width} height={height}>
          <ChartComponent
            data={sanitizedData}
            margin={{ top: 38, right: 10, left: 10, bottom: 10 }}
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
              tick={<CustomizedAxisTick fill="#1C1D20" />}
              interval={calculateXAxisInterval()}
              axisLine={false}
              scale="point"
              padding={{ left: 30, right: 30 }}
            />

            {/* Y-Axis */}
            <YAxis
              axisLine={false}
              fontSize={12}
              tickLine={false}
              tick={{ fill: '#1C1D20' }}
              tickFormatter={formatYAxisTick}
            >
              <Label
                value={
                  pollutionType === 'pm2_5'
                    ? 'PM2.5 (µg/m³)'
                    : pollutionType === 'pm10'
                      ? 'PM10 (µg/m³)'
                      : 'Pollutant (µg/m³)'
                }
                position="insideTopRight"
                fill="#1C1D20"
                offset={0}
                fontSize={12}
                dy={-35}
                dx={34}
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
            {pollutionType && WHO_STANDARD_VALUE > 0 && (
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
      sanitizedData,
      dataKeys,
      height,
      width,
      chartType,
      getColor,
      handleMouseLeave,
      activeIndex,
      calculateXAxisInterval,
      pollutionType,
      WHO_STANDARD_VALUE,
      dataError,
    ]);

    return (
      <div id={id} className="pt-2">
        {isLoading ? (
          <ChartLoadingSkeleton width={width} height={height} />
        ) : (
          renderChart
        )}
      </div>
    );
  },
);

MoreInsightsChart.displayName = 'MoreInsightsChart';

MoreInsightsChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      time: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.instanceOf(Date),
      ]).isRequired,
      // Add other keys based on your data structure
    }),
  ).isRequired,
  chartType: PropTypes.oneOf(['line', 'bar']),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  id: PropTypes.string,
  pollutionType: PropTypes.oneOf(['pm2_5', 'pm10', 'no2', 'other']),
  isLoading: PropTypes.bool,
};

export default MoreInsightsChart;
