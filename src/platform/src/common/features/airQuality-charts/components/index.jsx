import React from 'react';
import { pollutantRanges, categoryDetails } from '../constants';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { Tooltip } from 'flowbite-react';

export const colors = ['#11225A', '#0A46EB', '#297EFF', '#B8D9FF'];

export const reduceDecimalPlaces = (num) =>
  Math.round((num + Number.EPSILON) * 10000) / 10000;

export const truncate = (str) =>
  str.length > 20 ? str.slice(0, 19) + '…' : str;

/**
 * Get air quality details based on pollutant value and type.
 */
export const getAirQualityLevelText = (value, pollutionType) => {
  if (typeof value !== 'number' || isNaN(value) || value < 0) {
    return {
      airQualityText: categoryDetails['Invalid'].text,
      AirQualityIcon: categoryDetails['Invalid'].icon,
      airQualityColor: categoryDetails['Invalid'].color,
    };
  }
  const ranges = pollutantRanges[pollutionType];
  if (!ranges) {
    console.error(`Invalid pollution type: ${pollutionType}`);
    return {
      airQualityText: categoryDetails['Invalid'].text,
      AirQualityIcon: categoryDetails['Invalid'].icon,
      airQualityColor: categoryDetails['Invalid'].color,
    };
  }
  for (const range of ranges) {
    if (
      value >= range.limit &&
      (!ranges[ranges.indexOf(range) - 1] ||
        value < ranges[ranges.indexOf(range) - 1].limit)
    ) {
      const { text, icon, color } = categoryDetails[range.category];
      return {
        airQualityText: text,
        AirQualityIcon: icon,
        airQualityColor: color,
      };
    }
  }
  return {
    airQualityText: categoryDetails['Invalid'].text,
    AirQualityIcon: categoryDetails['Invalid'].icon,
    airQualityColor: categoryDetails['Invalid'].color,
  };
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
  if (!active || !payload || !payload.length) return null;
  const hoveredPoint = payload[activeIndex] || payload[0];
  const { value, payload: pointPayload } = hoveredPoint;
  const time = pointPayload?.time;
  const formatDate = (val) => format(new Date(val), 'MMMM dd, yyyy');
  const { airQualityText, AirQualityIcon, airQualityColor } =
    getAirQualityLevelText(value, pollutionType);
  return (
    <div className="w-80 p-3 rounded-lg shadow-md border border-gray-200 dark:bg-gray-800 dark:border-gray-600 bg-white">
      <div className="text-sm mb-2 text-gray-400 dark:text-gray-300">
        {formatDate(time)}
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
                  className={`text-sm font-medium ${isHovered ? 'text-blue-600' : 'text-gray-600'}`}
                >
                  {truncate(point.name)}
                </span>
              </div>
              <span
                className={`text-sm ${isHovered ? 'text-blue-600 font-medium' : 'text-gray-500'}`}
              >
                {reduceDecimalPlaces(point.value)} μg/m³
              </span>
            </div>
          );
        })}
      </div>
      {activeIndex !== null && payload[activeIndex] && (
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-300 dark:border-gray-600">
          <div className={`text-sm font-medium ${airQualityColor}`}>
            {airQualityText}
          </div>
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
 * Customized axis tick for the chart.
 */
export const CustomizedAxisTick = ({ x, y, payload, fill }) => {
  const { timeFrame } = useSelector((state) => state.chart);
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

CustomizedAxisTick.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  payload: PropTypes.object,
  fill: PropTypes.string,
};

/**
 * Custom dot for line charts.
 */
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

/**
 * Customized legend for the chart.
 */
export const renderCustomizedLegend = ({ payload }) => {
  const shouldTruncate = payload.length > 3;
  const sortedPayload = React.useMemo(() => {
    return [...payload].sort((a, b) => {
      const toGray = (color) => {
        if (!color) return 0;
        const hex = color.replace('#', '');
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      return toGray(a.color) - toGray(b.color);
    });
  }, [payload]);
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
          {shouldTruncate ? (
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

/**
 * Customized label for ReferenceLine.
 */
export const CustomReferenceLabel = ({ viewBox, name }) => {
  const x = viewBox.width + viewBox.x - 10;
  const y = viewBox.y + 3;
  return (
    <g>
      <foreignObject x={x - 30} y={y - 14} width={40} height={25}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          className="rounded px-1 py-1 flex justify-center text-center text-white text-sm bg-red-500"
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

/**
 * Customized bar for bar charts.
 */
export const CustomBar = (props) => {
  const { fill, x, y, width, height } = props;
  return (
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
};

CustomBar.propTypes = {
  fill: PropTypes.string,
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
};
