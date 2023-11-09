import React, { useEffect, useState } from 'react';
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
} from 'recharts';
import GoodAir from '@/icons/Charts/GoodAir';
import Hazardous from '@/icons/Charts/Hazardous';
import Moderate from '@/icons/Charts/Moderate';
import Unhealthy from '@/icons/Charts/Unhealthy';
import UnhealthySG from '@/icons/Charts/UnhealthySG';
import VeryUnhealthy from '@/icons/Charts/VeryUnhealthy';
import { getAnalyticsData } from '@/core/apis/DeviceRegistry';
import { useSelector } from 'react-redux';
import Spinner from '@/components/Spinner';

const colors = ['#11225A', '#0A46EB', '#297EFF', '#B8D9FF'];

const reduceDecimalPlaces = (num) => {
  return Math.round((num + Number.EPSILON) * 10000) / 10000;
};

const truncate = (str) => {
  return str.length > 10 ? str.substr(0, 10 - 1) + '...' : str;
};

const CustomTooltipLineGraph = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const hoveredPoint = payload[0];
    const otherPoints = payload.slice(1);

    let airQualityText = '';
    let AirQualityIcon = null;
    let airQualityColor = '';

    if (hoveredPoint.value >= 0 && hoveredPoint.value <= 12) {
      airQualityText = 'Air Quality is Good';
      AirQualityIcon = GoodAir;
      airQualityColor = 'text-green-500';
    } else if (hoveredPoint.value > 12 && hoveredPoint.value <= 35.4) {
      airQualityText = 'Air Quality is Moderate';
      AirQualityIcon = Moderate;
      airQualityColor = 'text-yellow-500';
    } else if (hoveredPoint.value > 35.4 && hoveredPoint.value <= 55.4) {
      airQualityText = 'Air Quality is Unhealthy for Sensitive Groups';
      AirQualityIcon = UnhealthySG;
      airQualityColor = 'text-orange-500';
    } else if (hoveredPoint.value > 55.4 && hoveredPoint.value <= 150.4) {
      airQualityText = 'Air Quality is Unhealthy';
      AirQualityIcon = Unhealthy;
      airQualityColor = 'text-red-500';
    } else if (hoveredPoint.value > 150.4 && hoveredPoint.value <= 250.4) {
      airQualityText = 'Air Quality is Very Unhealthy';
      AirQualityIcon = VeryUnhealthy;
      airQualityColor = 'text-purple-500';
    } else if (hoveredPoint.value > 250.4 && hoveredPoint.value <= 500) {
      airQualityText = 'Air Quality is Hazardous';
      AirQualityIcon = Hazardous;
      airQualityColor = 'text-gray-500';
    }

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
            <p className='flex justify-between w-full mb-1 mt-2'>
              <div className='flex items-center text-xs font-medium leading-[14px] text-gray-600'>
                <div className='w-[10px] h-[10px] bg-blue-700 rounded-xl mr-2'></div>
                {truncate(hoveredPoint.name)}
              </div>
              <div className='text-xs font-medium leading-[14px] text-gray-600'>
                {reduceDecimalPlaces(hoveredPoint.value) + ' μg/m3'}
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
                  {truncate(point.name)}
                </div>
                <div className='text-xs font-medium leading-[14px] text-gray-400'>
                  {reduceDecimalPlaces(point.value) + ' μg/m3'}
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

    if (hoveredPoint.value >= 0 && hoveredPoint.value <= 12) {
      airQualityText = 'Air Quality is Good';
      AirQualityIcon = GoodAir;
      airQualityColor = 'text-green-500';
    } else if (hoveredPoint.value > 12 && hoveredPoint.value <= 35.4) {
      airQualityText = 'Air Quality is Moderate';
      AirQualityIcon = Moderate;
      airQualityColor = 'text-yellow-500';
    } else if (hoveredPoint.value > 35.4 && hoveredPoint.value <= 55.4) {
      airQualityText = 'Air Quality is Unhealthy for Sensitive Groups';
      AirQualityIcon = UnhealthySG;
      airQualityColor = 'text-orange-500';
    } else if (hoveredPoint.value > 55.4 && hoveredPoint.value <= 150.4) {
      airQualityText = 'Air Quality is Unhealthy';
      AirQualityIcon = Unhealthy;
      airQualityColor = 'text-red-500';
    } else if (hoveredPoint.value > 150.4 && hoveredPoint.value <= 250.4) {
      airQualityText = 'Air Quality is Very Unhealthy';
      AirQualityIcon = VeryUnhealthy;
      airQualityColor = 'text-purple-500';
    } else if (hoveredPoint.value > 250.4 && hoveredPoint.value <= 500) {
      airQualityText = 'Air Quality is Hazardous';
      AirQualityIcon = Hazardous;
      airQualityColor = 'text-gray-500';
    }

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
            <p className='flex justify-between w-full mb-1 mt-2'>
              <div className='flex items-center text-xs font-medium leading-[14px] text-gray-600'>
                <div className='w-[10px] h-[10px] bg-blue-700 rounded-xl mr-2'></div>
                {truncate(hoveredPoint.name)}
              </div>
              <div className='text-xs font-medium leading-[14px] text-gray-600'>
                {reduceDecimalPlaces(hoveredPoint.value) + ' μg/m3'}
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

const CustomTooltip = ({ tooltipText, children, direction, themeClass }) => {
  const [visible, setVisible] = useState(false);

  const tooltipClass = {
    top: 'bottom-full mb-3',
    bottom: 'top-full mt-3',
  }[direction];

  return (
    <div
      className='relative'
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}>
      {children}
      {visible && (
        <div
          className={`absolute ${tooltipClass} ${
            themeClass ? themeClass : 'bg-white text-center text-gray-700'
          } p-2 w-48 rounded-md shadow-lg z-10`}>
          <p className='text-sm'>{tooltipText}</p>
        </div>
      )}
    </div>
  );
};

const renderCustomizedLegend = (props) => {
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
    <div className='p-2 md:p-0 flex flex-wrap flex-col md:flex-row md:justify-end mt-2 space-y-2 md:space-y-0 md:space-x-4'>
      {sortedPayload.map((entry, index) => (
        <CustomTooltip key={`item-${index}`} tooltipText={entry.value} direction='top'>
          <div style={{ color: entry.color }} className='flex space-x-2 items-center text-sm'>
            <div
              className='w-[10px] h-[10px] rounded-xl mr-1 ml-1'
              style={{ backgroundColor: entry.color }}></div>
            {truncate(entry.value)}
          </div>
        </CustomTooltip>
      ))}
    </div>
  );
};

// Custom hook to fetch analytics data
const useAnalytics = () => {
  const chartData = useSelector((state) => state.chart);
  const status = useSelector((state) => state.userDefaults.status);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      if (!chartData || status === 'loading') return;

      const body = {
        sites: chartData.chartSites,
        startDate: new Date(chartData.chartDataRange.startDate).toISOString(),
        endDate: new Date(chartData.chartDataRange.endDate).toISOString(),
        chartType: chartData.chartType,
        frequency: chartData.timeFrame,
        pollutant: chartData.pollutionType,
        organisation_name: chartData.organizationName,
      };

      const allPropertiesSet = Object.values(body).every(
        (property) => property !== undefined && property !== null,
      );

      if (allPropertiesSet) {
        setIsLoading(true);
        try {
          const response = await getAnalyticsData(body);
          if (!isCancelled) {
            setAnalyticsData(response.data.length > 0 ? response.data : null);
          }
        } catch (error) {
          if (!isCancelled) {
            console.error(`Error getting analytics data: ${error}`);
          }
        } finally {
          if (!isCancelled) {
            setIsLoading(false);
          }
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [chartData, status]);

  return { analyticsData, isLoading };
};

const Charts = ({ chartType = 'line', width = '100%', height = '100%' }) => {
  const chartData = useSelector((state) => state.chart);
  const { analyticsData, isLoading } = useAnalytics();

  // Loading state
  if (isLoading) {
    return (
      <div className='ml-10 flex justify-center items-center w-full h-full'>
        <Spinner />
      </div>
    );
  }

  // No data for this time range
  if (analyticsData === null) {
    return (
      <div className='ml-10 flex justify-center items-center w-full h-full'>
        No data for this time range
      </div>
    );
  }

  const transformedData = analyticsData.reduce((acc, curr) => {
    if (!acc[curr.time]) {
      acc[curr.time] = {
        time: curr.time,
      };
    }
    acc[curr.time][curr.name] = curr.value;
    return acc;
  }, {});

  const dataForChart = Object.values(transformedData);

  let allKeys = new Set();
  if (dataForChart.length > 0) {
    allKeys = new Set(Object.keys(dataForChart[0]));
  }

  const renderChart = () => {
    if (chartType === 'line') {
      return (
        <LineChart
          data={dataForChart}
          style={{ cursor: 'pointer' }}
          margin={{
            top: 38,
            right: 10,
          }}>
          {Array.from(allKeys)
            .filter((key) => key !== 'time')
            .map((key, index) => (
              <Line
                key={key}
                dataKey={key}
                type='monotone'
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={<CustomDot />}
                activeDot={{ r: 6 }}
              />
            ))}
          <CartesianGrid stroke='#ccc' strokeDasharray='5 5' vertical={false} />
          <XAxis
            dataKey='time'
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
            <Label
              value={chartData.pollutionType === 'pm2_5' ? 'PM2.5' : 'PM10'}
              position='insideTopRight'
              offset={0}
              fontSize={12}
              dy={-35}
            />
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
          data={dataForChart}
          style={{ cursor: 'pointer' }}
          margin={{
            top: 38,
            right: 10,
          }}>
          {Array.from(allKeys)
            .filter((key) => key !== 'time')
            .map((key, index) => (
              <Bar key={key} dataKey={key} fill={colors[index % colors.length]} barSize={15} />
            ))}
          <CartesianGrid stroke='#ccc' strokeDasharray='5 5' vertical={false} />
          <XAxis dataKey='time' tickLine={false} tick={<CustomizedAxisTick />} axisLine={false} />
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
            <Label
              value={chartData.pollutionType === 'pm2_5' ? 'PM2.5' : 'PM10'}
              position='insideTopRight'
              offset={0}
              fontSize={12}
              dy={-35}
            />
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
