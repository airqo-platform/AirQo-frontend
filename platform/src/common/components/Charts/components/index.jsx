import React from 'react';
import GoodAir from '@/icons/Charts/GoodAir';
import Hazardous from '@/icons/Charts/Hazardous';
import Moderate from '@/icons/Charts/Moderate';
import Unhealthy from '@/icons/Charts/Unhealthy';
import UnhealthySG from '@/icons/Charts/UnhealthySG';
import VeryUnhealthy from '@/icons/Charts/VeryUnhealthy';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import PropTypes from 'prop-types';

export const colors = ['#11225A', '#0A46EB', '#297EFF', '#B8D9FF'];

export const reduceDecimalPlaces = (num) => {
  return Math.round((num + Number.EPSILON) * 10000) / 10000;
};

export const truncate = (str) => {
  return str.length > 20 ? str.substr(0, 20 - 1) + '...' : str;
};

/**
 * @param {Number} value
 * @returns {Object}
 * @description Get air quality level text, icon and color based on the value
 * @returns {Object} { airQualityText, AirQualityIcon, airQualityColor }
 */
export const getAirQualityLevelText = (value) => {
  let airQualityText = '';
  let AirQualityIcon = null;
  let airQualityColor = '';

  if (value >= 0 && value <= 12) {
    airQualityText = 'Air Quality is Good';
    AirQualityIcon = GoodAir;
    airQualityColor = 'text-green-500';
  } else if (value > 12 && value <= 35.4) {
    airQualityText = 'Air Quality is Moderate';
    AirQualityIcon = Moderate;
    airQualityColor = 'text-yellow-500';
  } else if (value > 35.4 && value <= 55.4) {
    airQualityText = 'Air Quality is Unhealthy for Sensitive Groups';
    AirQualityIcon = UnhealthySG;
    airQualityColor = 'text-orange-500';
  } else if (value > 55.4 && value <= 150.4) {
    airQualityText = 'Air Quality is Unhealthy';
    AirQualityIcon = Unhealthy;
    airQualityColor = 'text-red-500';
  } else if (value > 150.4 && value <= 250.4) {
    airQualityText = 'Air Quality is Very Unhealthy';
    AirQualityIcon = VeryUnhealthy;
    airQualityColor = 'text-purple-500';
  } else if (value > 250.4 && value <= 500) {
    airQualityText = 'Air Quality is Hazardous';
    AirQualityIcon = Hazardous;
    airQualityColor = 'text-gray-500';
  }

  return { airQualityText, AirQualityIcon, airQualityColor };
};

/**
 * @param {Object} props
 * @returns {JSX.Element}
 * @description Custom tooltip component for line graph
 */
const CustomGraphTooltip = ({ active, payload, activeIndex }) => {
  const chartData = useSelector((state) => state.chart);
  const { timeFrame } = chartData;

  const formatDate = (value) => {
    const date = new Date(value);
    switch (timeFrame) {
      case 'hourly':
        return format(date, 'MMMM dd, yyyy, hh:mm a');
      default:
        return format(date, 'MMMM dd, yyyy');
    }
  };

  if (active && payload && payload.length) {
    const hoveredPoint = payload[0];

    const { airQualityText, AirQualityIcon, airQualityColor } =
      getAirQualityLevelText(hoveredPoint.value);

    return (
      <div className="bg-white border border-gray-200 rounded-md shadow-lg w-72 outline-none">
        <div className="flex flex-col space-y-1">
          <span className="text-sm text-gray-300 p-2">
            {formatDate(hoveredPoint.payload.time)}
          </span>
          {payload.map((point, index) => (
            <div key={index}>
              {activeIndex === index ? (
                <div className="flex flex-col items-start justify-between w-full h-auto p-2">
                  <div className="flex justify-between w-full mb-1 mt-2">
                    <div className="flex items-center text-xs font-medium leading-[14px] text-gray-600">
                      <div
                        className={`w-[10px] h-[10px] rounded-xl mr-2 ${
                          activeIndex === index ? 'bg-blue-700' : 'bg-gray-400'
                        }`}
                      ></div>
                      {truncate(point.name)}
                    </div>
                    <div className="text-xs font-medium leading-[14px] text-gray-600">
                      {reduceDecimalPlaces(point.value) + ' μg/m3'}
                    </div>
                  </div>
                  <div className="flex justify-between items-center w-full">
                    <div
                      className={`${airQualityColor} text-xs font-medium leading-[14px] `}
                    >
                      {airQualityText}
                    </div>
                    <AirQualityIcon width={30} height={30} />
                  </div>
                </div>
              ) : (
                <div className="flex justify-between w-full mb-1 mt-2 p-2">
                  <div className="flex items-center text-xs font-medium leading-[14px] text-gray-600">
                    <div
                      className={`w-[10px] h-[10px] rounded-xl mr-2 ${
                        activeIndex === index ? 'bg-blue-700' : 'bg-gray-400'
                      }`}
                    ></div>
                    {truncate(point.name)}
                  </div>
                  <div className="text-xs font-medium leading-[14px] text-gray-600">
                    {reduceDecimalPlaces(point.value) + ' μg/m3'}
                  </div>
                </div>
              )}
              {index < payload.length - 1 && (
                <div className="w-full h-[2px] bg-transparent my-1 border-t border-dotted border-gray-300" />
              )}
            </div>
          ))}
        </div>
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
          <span
            className={`${shouldTruncate ? 'truncate max-w-[100px] group' : ''}`}
            title={shouldTruncate ? entry.value : null}
          >
            {entry.value}
          </span>

          {/* Tooltip appears only if truncation is applied */}
          {shouldTruncate && (
            <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center">
              <span className="text-xs text-white bg-gray-700 px-2 py-1 rounded-md shadow-md">
                {entry.value}
              </span>
              <span className="w-2 h-2 bg-gray-700 rotate-45 transform -translate-y-1/2"></span>
            </div>
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
  const { viewBox } = props;
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
          WHO
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
