import React from 'react';
import GoodAir from '@/icons/Charts/GoodAir';
import Hazardous from '@/icons/Charts/Hazardous';
import Moderate from '@/icons/Charts/Moderate';
import Unhealthy from '@/icons/Charts/Unhealthy';
import UnhealthySG from '@/icons/Charts/UnhealthySG';
import VeryUnhealthy from '@/icons/Charts/VeryUnhealthy';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';

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
export const CustomTooltipLineGraph = ({ active, payload, activeIndex }) => {
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
    const otherPoints = payload.slice(1);

    const { airQualityText, AirQualityIcon, airQualityColor } = getAirQualityLevelText(
      hoveredPoint.value,
    );

    return (
      <div className='bg-white border border-gray-200 rounded-md shadow-lg w-72 outline-none'>
        <div className='flex flex-col space-y-1'>
          <div className='flex flex-col items-start justify-between w-full h-auto p-2'>
            <span className='text-sm text-gray-300'>{formatDate(hoveredPoint.payload.time)}</span>
            <div className='flex justify-between w-full mb-1 mt-2'>
              <div className='flex items-center text-xs font-medium leading-[14px] text-gray-600'>
                <div
                  className={`w-[10px] h-[10px] rounded-xl mr-2 ${
                    activeIndex === 0 ? 'bg-blue-700' : 'bg-gray-400'
                  }`}></div>
                {truncate(hoveredPoint.name)}
              </div>
              <div className='text-xs font-medium leading-[14px] text-gray-600'>
                {reduceDecimalPlaces(hoveredPoint.value) + ' μg/m3'}
              </div>
            </div>
            <div className='flex justify-between items-center w-full'>
              <div className={`${airQualityColor} text-xs font-medium leading-[14px] `}>
                {airQualityText}
              </div>
              <AirQualityIcon width={30} height={30} />
            </div>
          </div>
          {otherPoints.length > 0 && (
            <>
              <div className='w-full h-[2px] bg-transparent my-1 border-t border-dotted border-gray-300' />
              <div className='p-2 space-y-1'>
                {otherPoints.map((point, index) => (
                  <div
                    key={index}
                    className={`flex justify-between w-full mb-1 ${
                      activeIndex === index + 1 ? 'text-black' : 'text-gray-400'
                    }`}>
                    <div className='flex items-center text-xs font-medium leading-[14px] text-black'>
                      <div
                        className={`w-[10px] h-[10px] rounded-xl mr-2 ${
                          activeIndex === index + 1 ? 'bg-blue-700' : 'bg-gray-400'
                        }`}></div>
                      {truncate(point.name)}
                    </div>
                    <div className='text-xs font-medium leading-[14px]'>
                      {reduceDecimalPlaces(point.value) + ' μg/m3'}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
  return null;
};

/**
 * @param {Object} props
 * @returns {JSX.Element}
 * @description Custom tooltip component for bar graph
 */
export const CustomTooltipBarGraph = ({ active, payload, activeIndex }) => {
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
    const otherPoints = payload.slice(1);

    const { airQualityText, AirQualityIcon, airQualityColor } = getAirQualityLevelText(
      hoveredPoint.value,
    );

    return (
      <div className='bg-white border border-gray-200 rounded-md shadow-lg w-72 outline-none'>
        <div className='flex flex-col space-y-1'>
          <div className='flex flex-col items-start justify-between w-full h-auto p-2'>
            <span className='text-sm text-gray-300'>{formatDate(hoveredPoint.payload.time)}</span>
            <div className='flex justify-between w-full mb-1 mt-2'>
              <div className='flex items-center text-xs font-medium leading-[14px] text-gray-600'>
                <div
                  className={`w-[10px] h-[10px] rounded-xl mr-2 ${
                    activeIndex === 0 ? 'bg-blue-700' : 'bg-gray-400'
                  }`}></div>
                {truncate(hoveredPoint.name)}
              </div>
              <div className='text-xs font-medium leading-[14px] text-gray-600'>
                {reduceDecimalPlaces(hoveredPoint.value) + ' μg/m3'}
              </div>
            </div>
            <div className='flex justify-between items-center w-full'>
              <div className={`${airQualityColor} text-xs font-medium leading-[14px] `}>
                {airQualityText}
              </div>
              <AirQualityIcon width={30} height={30} />
            </div>
          </div>
          {otherPoints.length > 0 && (
            <>
              <div className='w-full h-[2px] bg-transparent my-1 border-t border-dotted border-gray-300' />
              <div className='p-2 space-y-1'>
                {otherPoints.map((point, index) => (
                  <div
                    key={index}
                    className={`flex justify-between w-full mb-1 ${
                      activeIndex === index + 1 ? 'text-black' : 'text-gray-400'
                    }`}>
                    <div className='flex items-center text-xs font-medium leading-[14px] text-black'>
                      <div
                        className={`w-[10px] h-[10px] rounded-xl mr-2 ${
                          activeIndex === index + 1 ? 'bg-blue-700' : 'bg-gray-400'
                        }`}></div>
                      {truncate(point.name)}
                    </div>
                    <div className='text-xs font-medium leading-[14px]'>
                      {reduceDecimalPlaces(point.value) + ' μg/m3'}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
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
export const CustomizedAxisTick = ({ x, y, payload }) => {
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
      <text x={0} y={0} dy={16} textAnchor='middle' fill='#666' fontSize={12}>
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
export const CustomDot = (props) => {
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
export const renderCustomizedLegend = (props) => {
  const { payload } = props;

  // Sort the payload array from darkest to lightest color
  const sortedPayload = payload.sort((a, b) => {
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

  return (
    <div className='p-2 flex flex-wrap md:space-x-3 justify-start md:justify-end items-center w-full'>
      {sortedPayload.map((entry, index) => (
        <div
          key={index}
          style={{ color: '#485972' }}
          className='tooltip tooltip-top flex items-center text-sm outline-none'
          data-tip={entry.value}>
          <span
            className='w-[10px] h-[10px] rounded-xl mr-1 ml-1 outline-none'
            style={{ backgroundColor: entry.color }}></span>
          {truncate(entry.value)}
        </div>
      ))}
    </div>
  );
};

/**
 * Customized label component for ReferenceLine
 * @param {Object} props
 */
export const CustomReferenceLabel = (props) => {
  const { viewBox } = props;
  const x = viewBox.width + viewBox.x - 10;
  const y = viewBox.y + 3;

  return (
    <g>
      <foreignObject x={x - 30} y={y - 14} width={40} height={25}>
        <div
          xmlns='http://www.w3.org/1999/xhtml'
          style={{ backgroundColor: 'red' }}
          className='rounded-md py-[4px] px-[6px] flex justify-center text-center text-white text-[12px] font-semibold leading-[11px]'>
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
export const CustomBar = (props) => {
  const { fill, x, y, width, height } = props;

  return (
    <g>
      <foreignObject x={x} y={y} width={width} height={height}>
        <div
          xmlns='http://www.w3.org/1999/xhtml'
          style={{ backgroundColor: fill, width: '100%', height: '100%', borderRadius: '5px' }}
        />
      </foreignObject>
    </g>
  );
};
