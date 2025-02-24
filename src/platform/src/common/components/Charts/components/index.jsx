import React from 'react';
import { pollutantRanges, categoryDetails } from '../constants';

import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { Tooltip } from 'flowbite-react';

export const colors = ['#11225A', '#0A46EB', '#297EFF', '#B8D9FF'];

export const reduceDecimalPlaces = (num) => {
  return Math.round((num + Number.EPSILON) * 10000) / 10000;
};

export const truncate = (str) => {
  return str.length > 20 ? str.substr(0, 20 - 1) + '...' : str;
};

/**
 * @param {Number} value - The pollutant value.
 * @param {String} pollutionType - The type of pollutant (e.g., 'pm2_5', 'pm10', etc.).
 * @returns {Object} - { airQualityText, AirQualityIcon, airQualityColor }
 * @description Get air quality level text, icon, and color based on the value.
 */
export const getAirQualityLevelText = (value, pollutionType) => {
  // Validate input
  if (typeof value !== 'number' || isNaN(value) || value < 0) {
    return {
      airQualityText: categoryDetails['Invalid'].text,
      AirQualityIcon: categoryDetails['Invalid'].icon,
      airQualityColor: categoryDetails['Invalid'].color,
    };
  }

  // Get ranges for the specified pollution type
  const ranges = pollutantRanges[pollutionType];
  if (!ranges) {
    console.error(`Invalid pollution type: ${pollutionType}`);
    return {
      airQualityText: categoryDetails['Invalid'].text,
      AirQualityIcon: categoryDetails['Invalid'].icon,
      airQualityColor: categoryDetails['Invalid'].color,
    };
  }

  // Correct range logic: Iterate through the ranges
  for (const range of ranges) {
    // If the value is greater than or equal to the lower bound and less than the upper bound
    if (
      value >= range.limit &&
      (!ranges[ranges.indexOf(range) - 1] ||
        value < ranges[ranges.indexOf(range) - 1].limit)
    ) {
      const category = range.category;
      const { text, icon, color } = categoryDetails[category];
      return {
        airQualityText: text,
        AirQualityIcon: icon,
        airQualityColor: color,
      };
    }
  }

  // Fallback to Invalid
  return {
    airQualityText: categoryDetails['Invalid'].text,
    AirQualityIcon: categoryDetails['Invalid'].icon,
    airQualityColor: categoryDetails['Invalid'].color,
  };
};

/**
 * @param {Object} props
 * @returns {JSX.Element}
 * @description Custom tooltip component for line graph
 */
const CustomGraphTooltip = ({
  active,
  payload,
  activeIndex,
  pollutionType,
}) => {
  if (active && payload && payload.length) {
    const hoveredPoint = payload[activeIndex] || payload[0];
    const { value, payload: pointPayload } = hoveredPoint;
    const time = pointPayload?.time;

    // Format the date
    const formatDate = (value) => {
      const date = new Date(value);
      return format(date, 'MMMM dd, yyyy');
    };

    // Get air quality details
    const { airQualityText, AirQualityIcon, airQualityColor } =
      getAirQualityLevelText(value, pollutionType);

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-md w-80 p-3">
        {/* Date Section */}
        <div className="text-gray-400 text-sm mb-2">{formatDate(time)}</div>

        {/* Location Details */}
        <div className="space-y-2">
          {payload.map((point, index) => {
            const isHovered = index === activeIndex;
            return (
              <div
                key={index}
                className={`flex justify-between items-center p-2 rounded-md ${
                  isHovered ? 'bg-gray-100' : ''
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-2.5 h-2.5 rounded-full mr-3 ${
                      isHovered ? 'bg-blue-600' : 'bg-gray-400'
                    }`}
                  ></div>
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

        {/* Air Quality Details */}
        {activeIndex !== null && payload[activeIndex] && (
          <div className="flex justify-between items-center mt-4 p-2 border-t border-gray-300 pt-3">
            <div className={`text-sm font-medium ${airQualityColor}`}>
              {airQualityText}
            </div>
            {AirQualityIcon && <AirQualityIcon width={24} height={24} />}
          </div>
        )}
      </div>
    );
  }
  return null;
};

/**
 * @param {Object} props
 * @returns {JSX.Element}
 * @description Custom axis tick component for line chart
 */
const CustomizedAxisTick = ({ x, y, payload, fill }) => {
  const chartData = useSelector((state) => state.chart);
  const { timeFrame } = chartData;

  const formatDate = (value) => {
    const date = new Date(value);
    switch (timeFrame) {
      case 'hourly':
        return format(date, 'HH:mm');
      case 'daily':
        return format(date, 'MMM dd');
      case 'weekly':
        return format(date, 'MMM dd');
      case 'monthly':
        return format(date, 'MMM yyyy');
      default:
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
    }
  };

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
        {formatDate(payload.value)}
      </text>
    </g>
  );
};

/**
 * @param {Object} props
 * @returns {JSX.Element}
 * @description Custom dot component for line chart
 */
const CustomDot = (props) => {
  const { cx, cy, fill, payload } = props;

  if (!payload.active) {
    return null;
  }

  return <circle cx={cx} cy={cy} r={6} fill={fill} />;
};

/**
 * Customized legend component
 * @param {Object} props
 */
const renderCustomizedLegend = ({ payload }) => {
  // Determine if truncation is needed based on the number of locations
  const shouldTruncate = payload.length > 3;

  // Sort the payload array from darkest to lightest color
  const sortedPayload = React.useMemo(() => {
    return [...payload].sort((a, b) => {
      const colorToGrayscale = (color) => {
        if (color) {
          const hex = color.replace('#', '');
          const r = parseInt(hex.slice(0, 2), 16);
          const g = parseInt(hex.slice(2, 4), 16);
          const b = parseInt(hex.slice(4, 6), 16);
          return 0.2126 * r + 0.7152 * g + 0.0722 * b; // ITU-R BT.709 formula
        }
        return 0;
      };
      return colorToGrayscale(a.color) - colorToGrayscale(b.color);
    });
  }, [payload]);

  return (
    <div className="relative flex flex-wrap justify-end gap-2 w-full p-2">
      {sortedPayload.map((entry, index) => (
        <div
          key={index}
          className="flex items-center gap-1 text-xs text-gray-700 whitespace-nowrap relative"
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          ></span>

          {/* Only truncate and add tooltip if shouldTruncate is true */}

          {shouldTruncate ? (
            <Tooltip content={entry.value} className="w-auto">
              <div className="truncate max-w-[100px] group">{entry.value}</div>
            </Tooltip>
          ) : (
            <div>{entry.value}</div>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Customized label component for ReferenceLine
 * @param {Object} props
 */
const CustomReferenceLabel = (props) => {
  const { viewBox, name } = props;
  const x = viewBox.width + viewBox.x - 10;
  const y = viewBox.y + 3;

  return (
    <g>
      <foreignObject x={x - 30} y={y - 14} width={40} height={25}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{ backgroundColor: 'red' }}
          className="rounded-[2px] py-[4px] px-[6px] flex justify-center text-center text-white text-[14px] tracking-[0.16px] font-normal leading-[16px]"
        >
          {name}
        </div>
      </foreignObject>
    </g>
  );
};

/**
 * Customized bar component for bar chart
 * @param {Object} props
 */
const CustomBar = (props) => {
  const { fill, x, y, width, height } = props;

  return (
    <g>
      <foreignObject x={x} y={y} width={width} height={height}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            backgroundColor: fill,
            width: '100%',
            height: '100%',
            borderRadius: '5px',
          }}
        />
      </foreignObject>
    </g>
  );
};

export {
  CustomBar,
  CustomReferenceLabel,
  renderCustomizedLegend,
  CustomDot,
  CustomizedAxisTick,
  CustomGraphTooltip,
};

CustomGraphTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  activeIndex: PropTypes.number,
};

CustomizedAxisTick.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  payload: PropTypes.object,
  fill: PropTypes.string,
};

CustomDot.propTypes = {
  cx: PropTypes.number,
  cy: PropTypes.number,
  fill: PropTypes.string,
  payload: PropTypes.object,
};

CustomBar.propTypes = {
  fill: PropTypes.string,
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
};

CustomReferenceLabel.propTypes = {
  viewBox: PropTypes.object,
};

renderCustomizedLegend.propTypes = {
  payload: PropTypes.array,
};
