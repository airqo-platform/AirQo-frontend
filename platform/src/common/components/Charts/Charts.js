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
import { useSelector, useDispatch } from 'react-redux';
import Spinner from '@/components/Spinner';
import { setRefreshChart } from '@/lib/store/services/charts/ChartSlice';
import { fetchAnalyticsData, setAnalyticsData } from '@/lib/store/services/charts/ChartData';
import {
  renderCustomizedLegend,
  CustomDot,
  CustomizedAxisTick,
  CustomTooltipLineGraph,
  CustomTooltipBarGraph,
  colors,
} from './components';

/**
 * @description Custom hook to fetch analytics data
 * @returns {Object} analyticsData, isLoading, error, loadingTime
 */
const useAnalytics = () => {
  const dispatch = useDispatch();
  const chartData = useSelector((state) => state.chart);
  const refreshChart = useSelector((state) => state.chart.refreshChart);
  const preferencesLoading = useSelector((state) => state.userDefaults.status === 'loading');
  const isLoading = useSelector((state) => state.analytics.status === 'loading');
  const analyticsData = useSelector((state) => state.analytics.data);
  const [error, setError] = useState(null);
  const [loadingTime, setLoadingTime] = useState(0);

  useEffect(() => {
    if (preferencesLoading) return;

    const fetchData = async () => {
      try {
        setError(null);
        setLoadingTime(Date.now());
        await dispatch(
          fetchAnalyticsData({
            sites: chartData.chartSites,
            startDate: chartData.chartDataRange.startDate,
            endDate: chartData.chartDataRange.endDate,
            chartType: chartData.chartType,
            frequency: chartData.timeFrame,
            pollutant: chartData.pollutionType,
            organisation_name: chartData.organizationName,
          }),
        );
        dispatch(setRefreshChart(false));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingTime(Date.now() - loadingTime);
      }
    };

    fetchData();
  }, [chartData, refreshChart]);

  return { analyticsData, isLoading, error, loadingTime };
};

/**
 * @description Charts component
 * @param {String} chartType - Type of chart to render
 * @param {String} width - Width of the chart
 * @param {String} height - Height of the chart
 * @returns {React.Component} Charts
 */
const Charts = ({ chartType = 'line', width = '100%', height = '100%', id }) => {
  const chartData = useSelector((state) => state.chart);
  const { analyticsData, isLoading, error, loadingTime } = useAnalytics();
  const [showLoadingMessage, setShowLoadingMessage] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const preferenceData = useSelector((state) => state.defaults.individual_preferences) || [];

  useEffect(() => {
    let timeoutId;
    if (isLoading && loadingTime > 5000) {
      timeoutId = setTimeout(() => setShowLoadingMessage(true), 5000);
    } else if (!isLoading) {
      setShowLoadingMessage(false);
      setHasLoaded(true);
    }
    return () => clearTimeout(timeoutId);
  }, [isLoading, loadingTime]);

  const renderErrorMessage = () => (
    <div className='ml-10 flex justify-center text-center items-center w-full h-full'>
      <p className='text-red-500'>
        An error has occurred. Please try again later or reach out to our support team for
        assistance.
      </p>
    </div>
  );

  const renderLoadingMessage = () => (
    <div className='ml-10 flex justify-center text-center items-center w-full h-full'>
      <div className='text-blue-500'>
        <Spinner />
        {showLoadingMessage && (
          <span className='text-yellow-500 mt-2'>
            The data is currently being processed. We appreciate your patience.
          </span>
        )}
      </div>
    </div>
  );

  // No data for this time range
  if (hasLoaded && (analyticsData === null || analyticsData.length === 0)) {
    return (
      <div className='ml-10 flex justify-center items-center w-full h-full'>
        There is no data available for the selected time range.
      </div>
    );
  }
  // console.log('analyticsData', analyticsData)

  const newAnalyticsData = analyticsData.map((data) => {
    const name = getSiteName(data.site_id);
    return { ...data, name };
  });

  const renderNoDataMessage = () => (
    <div className='ml-10 flex justify-center items-center w-full h-full'>
      There is no data available for the selected time range.
    </div>
  );

  const transformedData =
    newAnalyticsData?.reduce((acc, curr) => {
      if (!acc[curr.time]) {
        acc[curr.time] = {
          time: curr.time,
        };
      }
      acc[curr.time][curr.name] = curr.value;
      return acc;
    }, {}) || {};

  const dataForChart = Object.values(transformedData);

  const allKeys = new Set(dataForChart.length > 0 ? Object.keys(dataForChart[0]) : []);

  if (error) {
    return renderErrorMessage();
  }

  if (isLoading || !hasLoaded) {
    return renderLoadingMessage();
  }

  if (hasLoaded && (analyticsData === null || analyticsData.length === 0)) {
    return renderNoDataMessage();
  }

  // Render the chart
  const renderChart = () => {
    if (chartType === 'line') {
      return (
        <LineChart
          data={dataForChart}
          style={{ cursor: 'pointer' }}
          margin={{
            top: 38,
            right: 10,
          }}
        >
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
            tickLine={true}
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
            }}
          >
            <Label
              value={chartData.pollutionType === 'pm2_5' ? 'PM2.5 (µg/m³)' : 'PM10 (µg/m³)'}
              position='insideTopRight'
              offset={0}
              fontSize={12}
              dy={-35}
              dx={60}
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
          }}
        >
          {Array.from(allKeys)
            .filter((key) => key !== 'time')
            .map((key, index) => (
              <Bar key={key} dataKey={key} fill={colors[index % colors.length]} barSize={15} />
            ))}
          <CartesianGrid stroke='#ccc' strokeDasharray='5 5' vertical={false} />
          <XAxis dataKey='time' tickLine={true} tick={<CustomizedAxisTick />} axisLine={false} />
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
            }}
          >
            <Label
              value={chartData.pollutionType === 'pm2_5' ? 'PM2.5 (µg/m³)' : 'PM10 (µg/m³)'}
              position='insideTopRight'
              offset={0}
              fontSize={12}
              dy={-35}
              dx={60}
            />
          </YAxis>
          <Legend
            content={renderCustomizedLegend}
            wrapperStyle={{ bottom: 0, right: 0, position: 'absolute' }}
          />
          <Tooltip
            content={<CustomTooltipLineGraph />}
            cursor={{ fill: '#eee', fillOpacity: 0.3 }}
          />
        </BarChart>
      );
    }
  };

  return (
    <div id={id} className='pt-2'>
      <ResponsiveContainer width={width} height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default Charts;
