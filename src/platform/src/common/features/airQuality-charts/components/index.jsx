import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { Tooltip } from 'flowbite-react';
import { pollutantRanges, categoryDetails } from '../constants';

export const colors = ['#11225A', '#0A46EB', '#297EFF', '#B8D9FF'];

export const reduceDecimalPlaces = (num) =>
  Math.round((num + Number.EPSILON) * 10000) / 10000;

export const truncate = (str) =>
  str.length > 20 ? `${str.slice(0, 19)}…` : str;

/**
 * Returns air quality details for a given pollutant value and type.
 */
export const getAirQualityLevelText = (value, pollutionType) => {
  if (typeof value !== 'number' || isNaN(value) || value < 0) {
    return categoryDetails['Invalid'];
  }
  const ranges = pollutantRanges[pollutionType];
  if (!ranges) {
    console.error(`Invalid pollution type: ${pollutionType}`);
    return categoryDetails['Invalid'];
  }
  for (let i = 0; i < ranges.length; i++) {
    const current = ranges[i];
    const previous = ranges[i - 1];
    if (value >= current.limit && (!previous || value < previous.limit)) {
      return categoryDetails[current.category];
    }
  }
  return categoryDetails['Invalid'];
};

/**
 * Custom tooltip for the chart.
 */
export const CustomGraphTooltip = ({
  active,
  payload,
  activeIndex,
  pollutionType,
}) => {
  if (!active || !payload?.length) return null;
  const hoveredPoint = payload[activeIndex] || payload[0];
  const { value, payload: pointPayload } = hoveredPoint;
  const time = pointPayload?.time;
  const formattedDate = time ? format(new Date(time), 'MMMM dd, yyyy') : '';
  const {
    text,
    icon: AirQualityIcon,
    color: airQualityColor,
  } = getAirQualityLevelText(value, pollutionType);

  return (
    <div className="w-80 p-3 rounded-lg shadow-md border border-gray-200 dark:bg-gray-800 dark:border-gray-600 bg-white">
      <div className="text-sm mb-2 text-gray-400 dark:text-gray-300">
        {formattedDate}
      </div>
      <div className="space-y-2">
        {payload.map((point, index) => {
          const isHovered = index === activeIndex;
          return (
            <div
              key={index}
              className={`flex justify-between items-center p-2 rounded-md ${
                isHovered ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-2.5 h-2.5 rounded-full mr-3 ${
                    isHovered ? 'bg-blue-600' : 'bg-gray-400'
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isHovered ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  {truncate(point.name)}
                </span>
              </div>
              <span
                className={`text-sm ${
                  isHovered ? 'text-blue-600 font-medium' : 'text-gray-500'
                }`}
              >
                {reduceDecimalPlaces(point.value)} μg/m³
              </span>
            </div>
          );
        })}
      </div>
      {activeIndex !== null && payload[activeIndex] && (
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-300 dark:border-gray-600">
          <div className={`text-sm font-medium ${airQualityColor}`}>{text}</div>
          {AirQualityIcon && <AirQualityIcon width={24} height={24} />}
        </div>
      )}
    </div>
  );
};

CustomGraphTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  activeIndex: PropTypes.number,
  pollutionType: PropTypes.string,
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
        fill={fill || '#485972'}
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
  return <circle cx={cx} cy={cy} r={6} fill={fill} />;
};

CustomDot.propTypes = {
  cx: PropTypes.number,
  cy: PropTypes.number,
  fill: PropTypes.string,
  payload: PropTypes.object,
};

export const renderCustomizedLegend = ({ payload }) => {
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
    <div className="flex flex-wrap justify-end gap-2 w-full p-2">
      {sortedPayload.map((entry, index) => (
        <div
          key={index}
          className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap"
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {truncateLegend ? (
            <Tooltip content={entry.value} className="w-auto">
              <div className="truncate max-w-[100px]">{entry.value}</div>
            </Tooltip>
          ) : (
            <div>{entry.value}</div>
          )}
        </div>
      ))}
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
          className="flex justify-center text-center text-white text-sm bg-red-500"
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
        style={{ backgroundColor: fill }}
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
