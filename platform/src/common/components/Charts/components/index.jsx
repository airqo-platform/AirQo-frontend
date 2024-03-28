import React, { useState } from 'react';
import GoodAir from '@/icons/Charts/GoodAir';
import Hazardous from '@/icons/Charts/Hazardous';
import Moderate from '@/icons/Charts/Moderate';
import Unhealthy from '@/icons/Charts/Unhealthy';
import UnhealthySG from '@/icons/Charts/UnhealthySG';
import VeryUnhealthy from '@/icons/Charts/VeryUnhealthy';

export const colors = ['#11225A', '#0A46EB', '#297EFF', '#B8D9FF'];

export const reduceDecimalPlaces = (num) => {
  return Math.round((num + Number.EPSILON) * 10000) / 10000;
};

export const truncate = (str) => {
  return str.length > 10 ? str.substr(0, 10 - 1) + '...' : str;
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
export const CustomTooltipLineGraph = ({ active, payload }) => {
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
            <span className='text-sm text-gray-300'>
              {new Date(hoveredPoint.payload.time).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <div className='flex justify-between w-full mb-1 mt-2'>
              <div className='flex items-center text-xs font-medium leading-[14px] text-gray-600'>
                <div className='w-[10px] h-[10px] bg-blue-700 rounded-xl mr-2'></div>
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
                  <div key={index} className='flex justify-between w-full mb-1'>
                    <div className='flex items-center text-xs font-medium leading-[14px] text-gray-400'>
                      <div className='w-[10px] h-[10px] bg-gray-400 rounded-xl mr-2'></div>
                      {truncate(point.name)}
                    </div>
                    <div className='text-xs font-medium leading-[14px] text-gray-400'>
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
  return '';
};

/**
 * @param {Object} props
 * @returns {JSX.Element}
 * @description Custom tooltip component for bar graph
 */
export const CustomTooltipBarGraph = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const date = new Date(payload[0].payload.time).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div className='bg-white border border-gray-200 rounded-md shadow-lg w-72 outline-none'>
        <span className='text-sm text-gray-300 px-2'>{date}</span>
        {payload.map((hoveredPoint, index) => {
          const { airQualityText, AirQualityIcon, airQualityColor } = getAirQualityLevelText(
            hoveredPoint.value,
          );
          const barColor = colors[index % colors.length];

          return (
            <div className='flex flex-col space-y-1' key={hoveredPoint.dataKey}>
              <div className='flex flex-col items-start justify-between w-full h-auto p-2'>
                <div className='flex justify-between w-full mb-1 mt-2'>
                  <div className='flex items-center text-xs font-medium leading-[14px] text-gray-600'>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: barColor,
                        borderRadius: '50%',
                        marginRight: '2px',
                      }}></div>
                    {truncate(hoveredPoint.dataKey)}
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
            </div>
          );
        })}
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
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor='middle' fill='#666' fontSize={12}>
        {new Date(payload.value).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}
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
    <div className='p-2 flex flex-wrap justify-start md:justify-end items-center w-full'>
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
