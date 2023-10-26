import React from 'react';
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
  Rectangle,
} from 'recharts';
import GoodAir from '@/icons/Charts/GoodAir';
import Hazardous from '@/icons/Charts/Hazardous';
import Moderate from '@/icons/Charts/Moderate';
import Unhealthy from '@/icons/Charts/Unhealthy';
import UnhealthySG from '@/icons/Charts/UnhealthySG';
import VeryUnhealthy from '@/icons/Charts/VeryUnhealthy';

const data = [
  { date: '2023-10-18', Kampala: 35, Jinja: 18, Gulu: 22, Mbarara: 30 },
  { date: '2023-10-19', Kampala: 40, Jinja: 25, Gulu: 20, Mbarara: 32 },
  { date: '2023-10-20', Kampala: 38, Jinja: 27, Gulu: 23, Mbarara: 31 },
  { date: '2023-10-21', Kampala: 36, Jinja: 26, Gulu: 21, Mbarara: 33 },
  { date: '2023-10-22', Kampala: 37, Jinja: 28, Gulu: 22, Mbarara: 34 },
  { date: '2023-10-23', Kampala: 39, Jinja: 29, Gulu: 24, Mbarara: 35 },
  { date: '2023-10-24', Kampala: 35, Jinja: 30, Gulu: 25, Mbarara: 36 },
];

const colors = ['#11225A', '#0A46EB', '#297EFF', '#B8D9FF'];

const CustomTooltipLineGraph = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const hoveredPoint = payload[0];
    const otherPoints = payload.slice(1);

    let airQualityText = '';
    let AirQualityIcon = null;
    let airQualityColor = '';

    if (hoveredPoint.value <= 12) {
      airQualityText = 'Air Quality is Good';
      AirQualityIcon = GoodAir;
      airQualityColor = 'text-green-500';
    } else if (hoveredPoint.value <= 35.4) {
      airQualityText = 'Air Quality is Moderate';
      AirQualityIcon = Moderate;
      airQualityColor = 'text-yellow-500';
    } else if (hoveredPoint.value <= 55.4) {
      airQualityText = 'Air Quality is Unhealthy for Sensitive Groups';
      AirQualityIcon = UnhealthySG;
      airQualityColor = 'text-orange-500';
    } else if (hoveredPoint.value <= 150.4) {
      airQualityText = 'Air Quality is Unhealthy';
      AirQualityIcon = Unhealthy;
      airQualityColor = 'text-red-500';
    } else if (hoveredPoint.value <= 250.4) {
      airQualityText = 'Air Quality is Very Unhealthy';
      AirQualityIcon = VeryUnhealthy;
      airQualityColor = 'text-purple-500';
    } else {
      airQualityText = 'Air Quality is Hazardous';
      AirQualityIcon = Hazardous;
      airQualityColor = 'text-gray-500';
    }

    return (
      <div className='bg-white border border-gray-200 rounded-md shadow-lg w-72 outline-none'>
        <div className='flex flex-col space-y-1'>
          <div className='flex flex-col items-start justify-between w-full h-auto p-2'>
            <span className='text-sm text-gray-300'>
              {new Date(hoveredPoint.payload.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <p className='flex justify-between w-full mb-1 mt-2'>
              <div className='flex items-center text-xs font-medium leading-[14px] text-gray-600'>
                <div className='w-[10px] h-[10px] bg-blue-700 rounded-xl mr-2'></div>
                {hoveredPoint.name}
              </div>
              <div className='text-xs font-medium leading-[14px] text-gray-600'>
                {hoveredPoint.value + ' μg/m3'}
              </div>
            </p>
            <div className='flex justify-between items-center w-full'>
              <div className={`${airQualityColor} text-xs font-medium leading-[14px] `}>
                {airQualityText}
              </div>
              <AirQualityIcon width={30} height={30} />
            </div>
          </div>
          <div className='w-full h-[2px] bg-transparent my-1 border-t border-dotted border-gray-300' />
          <div className='p-2 space-y-1'>
            {otherPoints.map((point, index) => (
              <p key={index} className='flex justify-between w-full mb-1'>
                <div className='flex items-center text-xs font-medium leading-[14px] text-gray-400'>
                  <div className='w-[10px] h-[10px] bg-gray-400 rounded-xl mr-2'></div>
                  {point.name}
                </div>
                <div className='text-xs font-medium leading-[14px] text-gray-400'>
                  {point.value + ' μg/m3'}
                </div>
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomTooltipBarGraph = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const hoveredPoint = payload[0];

    let airQualityText = '';
    let AirQualityIcon = null;
    let airQualityColor = '';

    if (hoveredPoint.value <= 12) {
      airQualityText = 'Air Quality is Good';
      AirQualityIcon = GoodAir;
      airQualityColor = 'text-green-500';
    } else if (hoveredPoint.value <= 35.4) {
      airQualityText = 'Air Quality is Moderate';
      AirQualityIcon = Moderate;
      airQualityColor = 'text-yellow-500';
    } else if (hoveredPoint.value <= 55.4) {
      airQualityText = 'Air Quality is Unhealthy for Sensitive Groups';
      AirQualityIcon = UnhealthySG;
      airQualityColor = 'text-orange-500';
    } else if (hoveredPoint.value <= 150.4) {
      airQualityText = 'Air Quality is Unhealthy';
      AirQualityIcon = Unhealthy;
      airQualityColor = 'text-red-500';
    } else if (hoveredPoint.value <= 250.4) {
      airQualityText = 'Air Quality is Very Unhealthy';
      AirQualityIcon = VeryUnhealthy;
      airQualityColor = 'text-purple-500';
    } else {
      airQualityText = 'Air Quality is Hazardous';
      AirQualityIcon = Hazardous;
      airQualityColor = 'text-gray-500';
    }

    return (
      <div className='bg-white border border-gray-200 rounded-md shadow-lg w-72 outline-none'>
        <div className='flex flex-col space-y-1'>
          <div className='flex flex-col items-start justify-between w-full h-auto p-2'>
            <span className='text-sm text-gray-300'>
              {new Date(hoveredPoint.payload.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <p className='flex justify-between w-full mb-1 mt-2'>
              <div className='flex items-center text-xs font-medium leading-[14px] text-gray-600'>
                <div className='w-[10px] h-[10px] bg-blue-700 rounded-xl mr-2'></div>
                {hoveredPoint.name}
              </div>
              <div className='text-xs font-medium leading-[14px] text-gray-600'>
                {hoveredPoint.value + ' μg/m3'}
              </div>
            </p>
            <div className='flex justify-between items-center w-full'>
              <div className={`${airQualityColor} text-xs font-medium leading-[14px] `}>
                {airQualityText}
              </div>
              <AirQualityIcon width={30} height={30} />
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomizedAxisTick = ({ x, y, payload }) => {
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

const CustomDot = (props) => {
  const { cx, cy, fill, payload } = props;

  if (!payload.active) {
    return null;
  }

  return <circle cx={cx} cy={cy} r={6} fill={fill} />;
};

const renderCustomizedLegend = (props) => {
  const { payload } = props;

  // Sort the payload array from darkest to lightest color
  const sortedPayload = payload.sort((a, b) => {
    // Convert color to grayscale for comparison
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
    <div className='p-2 md:p-0 flex flex-col md:flex-row md:justify-end mt-2 space-y-2 md:space-y-0 md:space-x-4'>
      {sortedPayload.map((entry, index) => (
        <div
          key={`item-${index}`}
          style={{ color: entry.color }}
          className='flex space-x-2 items-center text-sm'>
          <div
            className='w-[10px] h-[10px] rounded-xl mr-1'
            style={{ backgroundColor: entry.color }}></div>
          {entry.value}
        </div>
      ))}
    </div>
  );
};

const Charts = ({ chartType = 'line', width = '100%', height = '100%' }) => {
  const renderChart = () => {
    if (chartType === 'line') {
      return (
        <LineChart
          data={data}
          width={width}
          height={height}
          style={{ cursor: 'pointer' }}
          margin={{
            top: 38,
            right: 10,
          }}>
          {Object.keys(data[0]).map((key, index) => {
            if (key !== 'date') {
              return (
                <Line
                  key={index}
                  type='monotone'
                  dataKey={key}
                  stroke={colors[index]}
                  strokeWidth={3}
                  dot={<CustomDot />}
                  activeDot={{ r: 8 }}
                />
              );
            }
          })}
          <CartesianGrid stroke='#ccc' strokeDasharray='5 5' vertical={false} />
          <XAxis
            dataKey='date'
            tick={<CustomizedAxisTick />}
            tickLine={false}
            axisLine={false}
            padding={{ left: 30, right: 30 }}
          />
          <YAxis
            axisLine={false}
            fontSize={12}
            tickLine={false}
            tickFormatter={(tick) => {
              if (tick >= 1000 && tick < 1000000) {
                return tick / 1000 + 'K';
              } else if (tick >= 1000000) {
                return tick / 1000000 + 'M';
              } else {
                return tick;
              }
            }}>
            <Label value='PM2.5' position='insideTopRight' offset={0} fontSize={12} dy={-35} />
          </YAxis>
          <Legend
            content={renderCustomizedLegend}
            wrapperStyle={{ bottom: 0, right: 0, position: 'absolute' }}
          />
          <Tooltip
            content={<CustomTooltipLineGraph />}
            cursor={{
              stroke: '#aaa',
              strokeOpacity: 0.3,
              strokeWidth: 2,
              strokeDasharray: '3 3',
            }}
          />
        </LineChart>
      );
    } else if (chartType === 'bar') {
      return (
        <BarChart
          data={data}
          width={width}
          height={height}
          style={{ cursor: 'pointer' }}
          margin={{
            top: 38,
            right: 10,
          }}>
          {Object.keys(data[0])
            .filter((key) => key !== 'date')
            .map((key, index) => (
              <Bar key={index} dataKey={key} fill={colors[index]} barSize={15} />
            ))}
          <CartesianGrid stroke='#ccc' strokeDasharray='5 5' vertical={false} />
          <XAxis dataKey='date' tickLine={false} tick={<CustomizedAxisTick />} axisLine={false} />
          <YAxis
            axisLine={false}
            fontSize={12}
            tickLine={false}
            tickFormatter={(tick) => {
              if (tick >= 1000 && tick < 1000000) {
                return tick / 1000 + 'K';
              } else if (tick >= 1000000) {
                return tick / 1000000 + 'M';
              } else {
                return tick;
              }
            }}>
            <Label value='PM2.5' position='insideTopRight' offset={0} fontSize={12} dy={-35} />
          </YAxis>
          <Legend
            content={renderCustomizedLegend}
            wrapperStyle={{ bottom: 0, right: 0, position: 'absolute' }}
          />
          <Tooltip
            content={<CustomTooltipBarGraph />}
            cursor={{ fill: '#eee', fillOpacity: 0.3 }}
          />
        </BarChart>
      );
    }
  };

  return (
    <ResponsiveContainer width={width} height={height}>
      {renderChart()}
    </ResponsiveContainer>
  );
};

export default Charts;
