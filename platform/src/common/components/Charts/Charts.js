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
  ReferenceLine,
} from 'recharts';
import { useSelector, useDispatch } from 'react-redux';
import Spinner from '@/components/Spinner';
import { setRefreshChart } from '@/lib/store/services/charts/ChartSlice';
import { fetchAnalyticsData, setAnalyticsData } from '@/lib/store/services/charts/ChartData';
import {
  renderCustomizedLegend,
  CustomDot,
  CustomBar,
  CustomizedAxisTick,
  CustomTooltipLineGraph,
  CustomTooltipBarGraph,
  renderCustomizedLabel,
  colors,
} from './components';

/**
 * @description Custom hook to fetch analytics data
 * @returns {Object} isLoading, error, loadingTime
 */
export const useAnalytics = () => {
  const dispatch = useDispatch();
  const chartData = useSelector((state) => state.chart);
  const refreshChart = useSelector((state) => state.chart.refreshChart);
  const preferencesLoading = useSelector((state) => state.userDefaults.status === 'loading');
  const isLoading = useSelector((state) => state.analytics.status === 'loading');
  const [error, setError] = useState(null);
  const [loadingTime, setLoadingTime] = useState(0);
  const preferenceData = useSelector((state) => state.defaults.individual_preferences) || [];

  useEffect(() => {
    if (preferencesLoading || !preferenceData.length) return;
    const { selected_sites } = preferenceData[0];
    const chartSites = selected_sites?.map((site) => site['_id']);

    const fetchData = async () => {
      try {
        setError(null);
        const startTime = Date.now();
        setLoadingTime(startTime);
        await dispatch(
          fetchAnalyticsData({
            sites: chartSites,
            startDate: chartData.chartDataRange.startDate,
            endDate: chartData.chartDataRange.endDate,
            chartType: chartData.chartType,
            frequency: chartData.timeFrame,
            pollutant: chartData.pollutionType,
            organisation_name: chartData.organizationName,
          }),
        );
      } catch (err) {
        setError(err.message);
        dispatch(setAnalyticsData(null));
      } finally {
        dispatch(setRefreshChart(false));
        setLoadingTime(Date.now() - loadingTime);
      }
    };

    fetchData();
  }, [chartData, refreshChart, preferenceData]);

  return { isLoading, error, loadingTime };
};

/**
 * @description Custom hook to transform analytics data for chart
 * @returns {Object} dataForChart, allKeys
 */
const useAnalyticsData = () => {
  const analyticsData = useSelector((state) => state.analytics.data);
  const [dataForChart, setDataForChart] = useState([]);
  const [allKeys, setAllKeys] = useState(new Set());
  const preferenceData = useSelector((state) => state.defaults.individual_preferences) || [];
  const siteData = useSelector((state) => state.grids.sitesSummary);

  // Helper functions
  const getSiteName = (siteId, preferenceData) => {
    if (!preferenceData?.length) return '';
    const site = preferenceData[0]?.selected_sites?.find((site) => site._id === siteId);
    return site ? site.name?.split(',')[0] : '';
  };

  const getExistingSiteName = (siteId, siteData) => {
    const site = siteData?.sites?.find((site) => site._id === siteId);
    return site ? site.search_name : '';
  };

  // Effect to transform analytics data whenever it changes
  useEffect(() => {
    const transformData = (analyticsData) => {
      const newAnalyticsData = analyticsData.map((data) => {
        const name =
          getSiteName(data.site_id, preferenceData) ||
          getExistingSiteName(data.site_id, siteData) ||
          data.generated_name;
        return { ...data, name };
      });

      const transformedData = newAnalyticsData.reduce((acc, curr) => {
        if (!acc[curr.time]) {
          acc[curr.time] = { time: curr.time };
        }
        acc[curr.time][curr.name] = curr.value;
        return acc;
      }, {});

      setDataForChart(Object.values(transformedData));
      setAllKeys(
        new Set(
          Object.values(transformedData).length > 0
            ? Object.keys(Object.values(transformedData)[0])
            : [],
        ),
      );
    };

    if (analyticsData?.length) {
      transformData(analyticsData);
    }
  }, [analyticsData]);

  return { dataForChart, allKeys };
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
  const { isLoading, error, loadingTime } = useAnalytics();
  const { dataForChart, allKeys } = useAnalyticsData();
  const analyticsData = useSelector((state) => state.analytics.data);
  const [showLoadingMessage, setShowLoadingMessage] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const WHO_STANDARD_VALUE =
    chartData.pollutionType === 'pm2_5'
      ? 5
      : chartData.pollutionType === 'pm10'
      ? 15
      : chartData.pollutionType === 'no2'
      ? 10
      : chartData.pollutionType === 'ozone'
      ? 60
      : 0;

  const [activeIndex, setActiveIndex] = useState(null);
  const [activeKey, setActiveKey] = useState(null);

  const handleMouseEnter = (o, index, key) => {
    setActiveIndex(index);
    setActiveKey(key);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
    setActiveKey(null);
  };

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
    <div className='ml-10 pr-10 flex justify-center text-center items-center w-full h-full text-sm'>
      <p className='text-red-500 text-center'>
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
  const renderNoDataMessage = () => (
    <div className='ml-10 pr-10 flex justify-center items-center w-full h-full text-center text-sm text-gray-600'>
      No data found. Please try other time periods or customize using other locations
    </div>
  );

  if (error || analyticsData?.error?.message) {
    return renderErrorMessage();
  }

  if (isLoading || !hasLoaded) {
    return renderLoadingMessage();
  }

  if ((hasLoaded && !analyticsData) || analyticsData?.length === 0) {
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
          }}>
          {Array.from(allKeys)
            .filter((key) => key !== 'time')
            .map((key, index) => (
              <Line
                key={key}
                dataKey={key}
                type='monotone'
                stroke={
                  index === activeIndex || activeIndex === null
                    ? colors[index % colors.length]
                    : '#ccc'
                }
                strokeWidth={3}
                dot={<CustomDot />}
                activeDot={{ r: 6 }}
                onMouseEnter={(o) => handleMouseEnter(o, index)}
                onMouseLeave={handleMouseLeave}
              />
            ))}
          <ReferenceLine y={WHO_STANDARD_VALUE} label={renderCustomizedLabel} stroke='red' />
          <CartesianGrid stroke='#ccc' strokeDasharray='5 5' vertical={false} />
          <XAxis
            dataKey='time'
            tick={<CustomizedAxisTick />}
            tickLine={true}
            axisLine={false}
            scale='point'
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
              dx={12}
            />
          </YAxis>
          <Legend
            content={renderCustomizedLegend}
            wrapperStyle={{ bottom: 0, right: 0, position: 'absolute' }}
          />
          <Tooltip
            content={<CustomTooltipLineGraph activeIndex={activeIndex} />}
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
            .map(
              (key, index) => (
                console.log('key', key),
                (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={colors[index % colors.length]}
                    barSize={12}
                    shape={<CustomBar />}
                    onMouseEnter={(o) => handleMouseEnter(o, index)}
                    onMouseLeave={handleMouseLeave}
                  />
                )
              ),
            )}
          <ReferenceLine y={WHO_STANDARD_VALUE} label={renderCustomizedLabel} stroke='red' />
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
            }}>
            <Label
              value={chartData.pollutionType === 'pm2_5' ? 'PM2.5' : 'PM10'}
              position='insideTopRight'
              offset={0}
              fontSize={12}
              dy={-35}
              dx={12}
            />
          </YAxis>
          <Legend
            content={renderCustomizedLegend}
            wrapperStyle={{ bottom: 0, right: 0, position: 'absolute' }}
          />
          <Tooltip
            content={<CustomTooltipBarGraph activeIndex={activeIndex} />}
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
