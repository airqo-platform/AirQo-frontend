'use client';
import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { Tooltip } from 'flowbite-react';
import { pollutantRanges, categoryDetails } from '../constants';

/**
 * Reduces decimal places to 4 places for display
 * @param {number} num - The number to format
 * @returns {number} - Formatted number with 4 decimal places
 */
export const reduceDecimalPlaces = (num) =>
  Math.round((num + Number.EPSILON) * 10000) / 10000;

/**
 * Truncates a string if it's longer than 20 characters
 * @param {string} str - The string to truncate
 * @returns {string} - Truncated string
 */
export const truncate = (str) =>
  str.length > 20 ? `${str.slice(0, 19)}…` : str;

/**
 * Returns air quality details for a given pollutant value and type.
 * @param {number} value - The pollutant value
 * @param {string} pollutionType - The type of pollutant (e.g., 'pm2_5', 'pm10')
 * @returns {Object} - Air quality category details including text, icon, and color
 */
export const getAirQualityLevelText = (value, pollutionType) => {
  // Return invalid category for invalid values
  if (typeof value !== 'number' || isNaN(value) || value < 0) {
    return categoryDetails['Invalid'];
  }

  // Get ranges for the specified pollutant type
  const ranges = pollutantRanges[pollutionType];
  if (!ranges) {
    console.error(`Invalid pollution type: ${pollutionType}`);
    return categoryDetails['Invalid'];
  }

  // Find the appropriate category based on the value
  for (const { limit, category } of ranges) {
    if (value >= limit) {
      return categoryDetails[category];
    }
  }

  return categoryDetails['Invalid'];
};

/**
 * Custom tooltip component for the pollution charts
 */
export const CustomGraphTooltip = ({
  active,
  payload,
  activeIndex,
  pollutionType,
}) => {
  // If the tooltip is not active or there's no payload, don't render anything
  if (!active || !payload?.length) return null;

  // Get the currently hovered data point
  const hoveredPointIndex =
    activeIndex !== null && activeIndex < payload.length ? activeIndex : 0;
  const hoveredPoint = payload[hoveredPointIndex];

  // Extract data from the hovered point
  const { value, payload: pointPayload } = hoveredPoint;
  const time = pointPayload?.time;
  const formattedDate = time ? format(new Date(time), 'MMMM dd, yyyy') : '';

  // Get air quality information for the hovered value
  const airQualityInfo = getAirQualityLevelText(value, pollutionType);
  const { text, icon: AirQualityIcon, color: airQualityColor } = airQualityInfo;

  return (
    <div className="w-80 p-3 rounded-lg shadow-md border border-gray-200 dark:bg-gray-800 dark:border-gray-600 bg-white">
      <div className="text-sm mb-2 text-gray-400 dark:text-gray-300">
        {formattedDate}
      </div>
      <div className="space-y-2">
        {payload.map((point, index) => {
          const isHovered = index === hoveredPointIndex;
          return (
            <div
              key={index}
              className={`flex justify-between items-center p-2 rounded-md transition-colors ${
                isHovered ? 'bg-primary/10 dark:bg-primary/20' : ''
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-2.5 h-2.5 rounded-full mr-3 transition-colors ${
                    isHovered ? 'bg-primary' : 'bg-gray-400'
                  }`}
                />
                <span
                  className={`text-sm font-medium transition-colors ${
                    isHovered
                      ? 'text-primary'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {truncate(point.name)}
                </span>
              </div>
              <span
                className={`text-sm transition-colors ${
                  isHovered
                    ? 'text-primary font-medium'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {reduceDecimalPlaces(point.value)} μg/m³
              </span>
            </div>
          );
        })}
      </div>
      {AirQualityIcon && (
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-300 dark:border-gray-600">
          <div className={`text-sm font-medium ${airQualityColor}`}>{text}</div>
          <AirQualityIcon width={24} height={24} />
        </div>
      )}
    </div>
  );
};

CustomGraphTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  activeIndex: PropTypes.number,
  pollutionType: PropTypes.string.isRequired,
};

/**
 * Customized axis tick that accepts a frequency prop.
 */
export const CustomizedAxisTick = ({
  x,
  y,
  payload,
  fill,
  frequency = 'daily',
}) => {
  const date = new Date(payload.value);
  let formatted;
  switch (frequency) {
    case 'hourly':
      formatted = format(date, 'HH:mm');
      break;
    case 'daily':
    case 'weekly':
      formatted = format(date, 'MMM dd');
      break;
    case 'monthly':
      formatted = format(date, 'MMM yyyy');
      break;
    default:
      formatted = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
  }
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="middle"
        fill={fill || 'var(--color-primary)'}
        fontSize={12}
      >
        {formatted}
      </text>
    </g>
  );
};

CustomizedAxisTick.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  payload: PropTypes.object,
  fill: PropTypes.string,
  frequency: PropTypes.string,
};

export const CustomDot = ({ cx, cy, fill, payload }) => {
  if (!payload.active) return null;
  return <circle cx={cx} cy={cy} r={6} fill={fill || 'var(--color-primary)'} />;
};

CustomDot.propTypes = {
  cx: PropTypes.number,
  cy: PropTypes.number,
  fill: PropTypes.string,
  payload: PropTypes.object,
};

export const renderCustomizedLegend = ({
  payload,
  onMouseEnter,
  onMouseLeave,
  onClick,
  activeIndex,
}) => {
  const truncateLegend = payload.length > 3;
  const sortedPayload = [...payload].sort((a, b) => {
    const brightness = (color) => {
      if (!color) return 0;
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    return brightness(a.color) - brightness(b.color);
  });

  return (
    <div className="flex flex-wrap relative justify-end gap-2 w-full">
      {sortedPayload.map((entry, index) => {
        const isActive = activeIndex === null || activeIndex === index;

        return (
          <div
            key={index}
            className={`flex items-center gap-1 text-xs dark:text-gray-300 whitespace-nowrap cursor-pointer transition-opacity duration-200 ${!isActive ? 'opacity-50' : 'opacity-100'}`}
            onMouseEnter={() => onMouseEnter(index)}
            onMouseLeave={() => onMouseLeave()}
            onClick={() => onClick(index)}
          >
            <span
              className="w-3 h-3 rounded-full transition-transform duration-200"
              style={{
                backgroundColor: entry.color || 'var(--color-primary)',
                transform: isActive ? 'scale(1.2)' : 'scale(1)',
              }}
            />
            {truncateLegend ? (
              <Tooltip content={entry.value} className="w-auto">
                <div className="truncate max-w-[100px] text-gray-700 dark:text-gray-200">
                  {entry.value}
                </div>
              </Tooltip>
            ) : (
              <div className="text-gray-700 dark:text-gray-200">
                {entry.value}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

renderCustomizedLegend.propTypes = {
  payload: PropTypes.array,
};

export const CustomReferenceLabel = ({ viewBox, name }) => {
  const { x, y, width } = viewBox;
  return (
    <g>
      <foreignObject x={x + width - 40} y={y} width={40} height={25}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          className="flex justify-center items-center text-white text-sm bg-red-500"
          style={{
            width: '100%',
            height: '100%',
            padding: '0.25rem',
            fontSize: '0.875rem',
            lineHeight: '1.25rem',
          }}
        >
          {name}
        </div>
      </foreignObject>
    </g>
  );
};

CustomReferenceLabel.propTypes = {
  viewBox: PropTypes.object,
  name: PropTypes.string,
};

export const CustomBar = ({ fill, x, y, width, height }) => (
  <g>
    <foreignObject x={x} y={y} width={width} height={height}>
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        className="w-full h-full rounded"
        style={{ backgroundColor: fill || 'var(--color-primary)' }}
      />
    </foreignObject>
  </g>
);

CustomBar.propTypes = {
  fill: PropTypes.string,
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
};
