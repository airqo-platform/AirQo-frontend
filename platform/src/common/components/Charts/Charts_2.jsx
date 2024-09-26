import React, { useState, useCallback } from 'react';
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
  if (tick >= 1_000_000) return `${tick / 1_000_000}M`;
  if (tick >= 1_000) return `${tick / 1_000}K`;
  return tick;
};

/**
 * FlexibleChart Component
 */
const Charts_2 = ({
  data,
  chartType = 'line',
  width = '100%',
  height = '300px',
  id,
  pollutionType,
}) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const WHO_STANDARD_VALUE = WHO_STANDARD_VALUES[pollutionType] || 0;

  /**
   * Handler to reset the active index when the mouse leaves a data point.
   */
  const handleMouseLeave = useCallback(() => setActiveIndex(null), []);

  /**
   * Determines the color of the line or bar based on the active index.
   * If no index is active, all lines/bars use their default colors.
   * If an index is active, only the active one retains its color while others fade.
   */
  const getColor = (index) =>
    activeIndex === null || index === activeIndex
      ? colors[index % colors.length]
      : '#ccc';

  /**
   * Determines which chart component and data component to use based on the 'chartType' prop.
   */
  const ChartComponent = chartType === 'line' ? LineChart : BarChart;
  const DataComponent = chartType === 'line' ? Line : Bar;

  /**
   * Extracts unique data keys for plotting, excluding the 'time' key.
   */
  const dataKeys =
    data.length > 0 ? Object.keys(data[0]).filter((key) => key !== 'time') : [];

  /**
   * Calculates the interval for the X-axis ticks based on screen width.
   * This helps in responsive design.
   */
  const calculateXAxisInterval = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 768) return Math.ceil(data.length / 4);
    if (screenWidth < 1024) return Math.ceil(data.length / 6);
    return Math.ceil(data.length / 8);
  };

  return (
    <div id={id} className="pt-2">
      <ResponsiveContainer width={width} height={height}>
        <ChartComponent
          data={data}
          margin={{ top: 38, right: 10 }}
          style={{ cursor: 'pointer' }}
        >
          {/* Grid */}
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" vertical={false} />

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
          {pollutionType && (
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
    </div>
  );
};

Charts_2.propTypes = {
  /**
   * The data to be displayed in the chart.
   * Should be an array of objects with a 'time' key and pollutant keys.
   */
  data: PropTypes.arrayOf(PropTypes.object).isRequired,

  /**
   * The type of chart to render: 'line' or 'bar'.
   */
  chartType: PropTypes.oneOf(['line', 'bar']),

  /**
   * The width of the chart. Can be a string (e.g., '100%') or a number.
   */
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  /**
   * The height of the chart. Can be a string (e.g., '300px') or a number.
   */
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  /**
   * The unique identifier for the chart container.
   */
  id: PropTypes.string.isRequired,

  /**
   * The type of pollutant to determine the WHO standard reference line.
   */
  pollutionType: PropTypes.oneOf(['pm2_5', 'pm10', 'no2']),
};

export default React.memo(Charts_2);
