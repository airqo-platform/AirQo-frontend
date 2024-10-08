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
const Charts_2 = React.memo(
  ({
    data,
    chartType = 'line',
    width = '100%',
    height = '300px',
    id,
    pollutionType,
  }) => {
    const [activeIndex, setActiveIndex] = useState(null);

    // Memoized WHO standard value based on pollution type
    const WHO_STANDARD_VALUE = useMemo(
      () => WHO_STANDARD_VALUES[pollutionType] || 0,
      [pollutionType],
    );

    /**
     * Handler to reset the active index when the mouse leaves a data point.
     * Memoized to avoid creating a new function on every render.
     */
    const handleMouseLeave = useCallback(() => setActiveIndex(null), []);

    /**
     * Determines the color of the line or bar based on the active index.
     * If no index is active, all lines/bars use their default colors.
     * Memoized to prevent unnecessary recalculations.
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
     * Memoized unique data keys for plotting, excluding the 'time' key.
     */
    const dataKeys = useMemo(() => {
      return data.length > 0
        ? Object.keys(data[0]).filter((key) => key !== 'time')
        : [];
    }, [data]);

    /**
     * Calculates the interval for the X-axis ticks based on screen width.
     * Memoized to ensure this is only calculated when the screen width or data changes.
     */
    const calculateXAxisInterval = useCallback(() => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 768) return Math.ceil(data.length / 4);
      if (screenWidth < 1024) return Math.ceil(data.length / 6);
      return Math.ceil(data.length / 8);
    }, [data.length]);

    return (
      <div id={id} className="pt-2">
        <ResponsiveContainer width={width} height={height}>
          <ChartComponent
            data={data}
            margin={{ top: 38, right: 10 }}
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
  },
);

Charts_2.displayName = 'Charts_2';

export default Charts_2;
