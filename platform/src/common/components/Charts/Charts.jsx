import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
import {
  fetchAnalyticsData,
  setAnalyticsData,
} from '@/lib/store/services/charts/ChartData';
import {
  renderCustomizedLegend,
  CustomDot,
  CustomBar,
  CustomizedAxisTick,
  CustomGraphTooltip,
  CustomReferenceLabel,
  colors,
} from './components';
import PropTypes from 'prop-types';

const WHO_STANDARD_VALUES = {
  pm2_5: 15,
  pm10: 45,
  no2: 25,
};

// Custom hook for analytics data fetching
const useAnalyticsData = (customBody) => {
  const dispatch = useDispatch();
  const chartData = useSelector((state) => state.chart);
  const analyticsData = useSelector((state) => state.analytics.data);
  const refreshChart = useSelector((state) => state.chart.refreshChart);
  const preferencesLoading = useSelector(
    (state) => state.userDefaults.status === 'loading',
  );
  const isLoading = useSelector(
    (state) => state.analytics.status === 'loading',
  );
  const preferenceData =
    useSelector((state) => state.defaults.individual_preferences) || [];
  const siteData = useSelector((state) => state.grids.sitesSummary);

  const [error, setError] = useState(null);
  const [loadingTime, setLoadingTime] = useState(0);

  // Memoize helper functions to get site names
  const getSiteName = useCallback(
    (siteId) => {
      const site = preferenceData[0]?.selected_sites?.find(
        (site) => site._id === siteId,
      );
      return site ? site.name?.split(',')[0] : '';
    },
    [preferenceData],
  );

  const getExistingSiteName = useCallback(
    (siteId) => {
      const site = siteData?.sites?.find((site) => site._id === siteId);
      return site ? site.search_name : '';
    },
    [siteData],
  );

  // Function to fetch data
  const fetchData = useCallback(async () => {
    if (preferencesLoading || !preferenceData.length) return;

    const { selected_sites } = preferenceData[0];
    const chartSites = selected_sites?.map((site) => site['_id']);

    const defaultBody = {
      sites: chartSites,
      startDate: chartData.chartDataRange.startDate,
      endDate: chartData.chartDataRange.endDate,
      chartType: chartData.chartType,
      frequency: chartData.timeFrame,
      pollutant: chartData.pollutionType,
      organisation_name: chartData.organizationName,
    };

    const body = { ...defaultBody, ...customBody };

    try {
      setError(null);
      const startTime = Date.now();
      dispatch(setAnalyticsData(null));
      await dispatch(fetchAnalyticsData(body));
      setLoadingTime(Date.now() - startTime);
    } catch (err) {
      setError(err.message);
      dispatch(setAnalyticsData(null));
    } finally {
      dispatch(setRefreshChart(false));
    }
  }, [chartData, dispatch, preferenceData, customBody]);

  // Fetch data whenever dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData, refreshChart]);

  // Transform data for charts
  const transformedData = useMemo(() => {
    if (!analyticsData?.length) return { dataForChart: [], allKeys: new Set() };

    const newAnalyticsData = analyticsData.map((data) => ({
      ...data,
      name:
        getSiteName(data.site_id) ||
        getExistingSiteName(data.site_id) ||
        data.generated_name,
    }));

    const dataForChart = Object.values(
      newAnalyticsData.reduce((acc, curr) => {
        if (!acc[curr.time]) {
          acc[curr.time] = { time: curr.time };
        }
        acc[curr.time][curr.name] = curr.value;
        return acc;
      }, {}),
    );

    const allKeys = new Set(
      dataForChart.length > 0 ? Object.keys(dataForChart[0]) : [],
    );

    return { dataForChart, allKeys };
  }, [analyticsData, getSiteName, getExistingSiteName]);

  return { ...transformedData, isLoading, error, loadingTime };
};

const Charts = ({
  customBody,
  chartType = 'line',
  width = '100%',
  height = '100%',
  id,
}) => {
  const chartData = useSelector((state) => state.chart);
  const { dataForChart, allKeys, isLoading, error, loadingTime } =
    useAnalyticsData(customBody);
  const [showLoadingMessage, setShowLoadingMessage] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  const WHO_STANDARD_VALUE = WHO_STANDARD_VALUES[chartData.pollutionType] || 0;

  // Handle loading message based on loading time
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

  const handleMouseEnter = useCallback((_, index) => {
    setActiveIndex(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

  const calculateXAxisInterval = useCallback((dataLength) => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 768) return Math.ceil(dataLength / 4);
    if (screenWidth < 1024) return Math.ceil(dataLength / 6);
    return Math.ceil(dataLength / 8);
  }, []);

  const formatYAxisTick = useCallback((tick) => {
    if (tick >= 1000000) return `${tick / 1000000}M`;
    if (tick >= 1000) return `${tick / 1000}K`;
    return tick;
  }, []);

  const getLineColor = useCallback(
    (index, activeIndex, colors) =>
      index === activeIndex || activeIndex === null
        ? colors[index % colors.length]
        : '#ccc',
    [],
  );

  if (error) {
    return (
      <div className="ml-10 pr-10 flex justify-center text-center items-center w-full h-full text-sm">
        <p className="text-red-500 text-center">
          An error has occurred. Please try again later or reach out to our
          support team.
        </p>
      </div>
    );
  }

  if (isLoading || !hasLoaded) {
    return (
      <div className="ml-10 flex justify-center text-center items-center w-full h-full">
        <div className="text-blue-500">
          <Spinner />
          {showLoadingMessage && (
            <span className="text-yellow-500 mt-2">
              The data is currently being processed. We appreciate your
              patience.
            </span>
          )}
        </div>
      </div>
    );
  }

  if (hasLoaded && dataForChart.length === 0) {
    return (
      <div className="ml-10 pr-10 flex justify-center items-center w-full h-full text-center text-sm text-gray-600">
        No data found. Please try other time periods or customize using other
        locations.
      </div>
    );
  }

  const commonProps = {
    data: dataForChart,
    style: { cursor: 'pointer' },
    margin: { top: 38, right: 10 },
  };

  const commonComponents = [
    <CartesianGrid
      key="grid"
      stroke="#ccc"
      strokeDasharray="5 5"
      vertical={false}
    />,
    <XAxis
      key="xAxis"
      dataKey="time"
      tickLine={true}
      tick={<CustomizedAxisTick fill="#1C1D20" />}
      interval={calculateXAxisInterval(dataForChart.length)}
      axisLine={false}
      scale="point"
      padding={{ left: 30, right: 30 }}
    />,
    <YAxis
      key="yAxis"
      axisLine={false}
      fontSize={12}
      tickLine={false}
      tick={{ fill: '#1C1D20' }}
      tickFormatter={formatYAxisTick}
    >
      <Label
        value={chartData.pollutionType === 'pm2_5' ? 'PM2.5' : 'PM10'}
        position="insideTopRight"
        fill="#1C1D20"
        offset={0}
        fontSize={12}
        dy={-35}
        dx={12}
      />
    </YAxis>,
    <Legend key="legend" content={renderCustomizedLegend} />,
    <Tooltip
      key="tooltip"
      content={<CustomGraphTooltip activeIndex={activeIndex} />}
      cursor={
        chartType === 'line'
          ? {
              stroke: '#aaa',
              strokeOpacity: 0.3,
              strokeWidth: 2,
              strokeDasharray: '3 3',
            }
          : { fill: '#eee', fillOpacity: 0.3 }
      }
    />,
  ];

  const renderChart = () => {
    const ChartComponent = chartType === 'line' ? LineChart : BarChart;
    const DataComponent = chartType === 'line' ? Line : Bar;

    return (
      <ChartComponent {...commonProps}>
        {commonComponents}
        {Array.from(allKeys)
          .filter((key) => key !== 'time')
          .map((key, index) => (
            <DataComponent
              key={key}
              dataKey={key}
              {...(chartType === 'line'
                ? {
                    type: 'monotone',
                    stroke: getLineColor(index, activeIndex, colors),
                    strokeWidth: 4,
                    dot: <CustomDot />,
                    activeDot: { r: 6 },
                  }
                : {
                    fill: colors[index % colors.length],
                    barSize: 12,
                    shape: <CustomBar />,
                  })}
              onMouseEnter={(o) => handleMouseEnter(o, index)}
              onMouseLeave={handleMouseLeave}
            />
          ))}
        <ReferenceLine
          key="referenceLine"
          y={WHO_STANDARD_VALUE}
          label={CustomReferenceLabel}
          ifOverflow="extendDomain"
          stroke="red"
          strokeOpacity={1}
          strokeDasharray={0}
        />
      </ChartComponent>
    );
  };

  return (
    <div id={id} className="pt-2">
      <ResponsiveContainer width={width} height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

Charts.propTypes = {
  customBody: PropTypes.object,
  chartType: PropTypes.oneOf(['line', 'bar']),
  width: PropTypes.string,
  height: PropTypes.string,
  id: PropTypes.string,
};

export default React.memo(Charts);
