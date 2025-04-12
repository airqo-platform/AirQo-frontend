'use client';
import React, { useState, useCallback, useMemo, useRef } from 'react';
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
import {
  renderCustomizedLegend,
  CustomDot,
  CustomBar,
  CustomGraphTooltip,
  CustomReferenceLabel,
  colors,
} from './components';
import { parseAndValidateISODate } from '@/core/utils/dateUtils';
import { formatYAxisTick, CustomizedAxisTick } from './utils';
import useResizeObserver from '@/core/utils/useResizeObserver';
import { useSelector } from 'react-redux';
import { MdInfoOutline } from 'react-icons/md';
import InfoMessage from '@/components/Messages/InfoMessage';
import { useTheme } from '@/features/theme-customizer/hooks/useTheme';

const MoreInsightsChart = ({
  data = [],
  selectedSites = [],
  visibleSiteIds = [],
  chartType = 'line',
  frequency = 'daily',
  width = '100%',
  height = '300px',
  id,
  pollutantType,
  refreshChart,
  isRefreshing = false,
}) => {
  const { theme, systemTheme } = useTheme();
  const isDark =
    theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  const [activeIndex, setActiveIndex] = useState(null);
  const containerRef = useRef(null);
  const { width: containerWidth } = useResizeObserver(containerRef);
  const aqStandard = useSelector((state) => state.chart.aqStandard);

  const effectiveVisibleSiteIds = useMemo(() => {
    if (visibleSiteIds.length) return visibleSiteIds;
    if (selectedSites.length) {
      return typeof selectedSites[0] === 'object'
        ? selectedSites
            .map((site) => site._id || site.id || site.site_id)
            .filter(Boolean)
        : selectedSites;
    }
    return [];
  }, [selectedSites, visibleSiteIds]);

  const processChartData = useCallback((rawData, selectedSiteIds) => {
    if (!Array.isArray(rawData) || rawData.length === 0)
      return { sortedData: [], siteIdToName: {} };
    const combinedData = {};
    const siteIdToName = {};
    rawData.forEach(({ site_id, name, value, time }) => {
      if (
        !site_id ||
        !name ||
        value === undefined ||
        !time ||
        !selectedSiteIds.includes(site_id)
      )
        return;
      siteIdToName[site_id] = name;
      const date = parseAndValidateISODate(time);
      if (!date) return;
      const formattedTime = date.toISOString();
      combinedData[formattedTime] = {
        ...combinedData[formattedTime],
        time: formattedTime,
        [site_id]: value,
      };
    });
    const sortedData = Object.values(combinedData).sort(
      (a, b) => new Date(a.time) - new Date(b.time),
    );
    return { sortedData, siteIdToName };
  }, []);

  const selectedSiteIds = useMemo(() => {
    if (!selectedSites.length) return [];
    return typeof selectedSites[0] === 'object'
      ? selectedSites
          .map((site) => site._id || site.id || site.site_id)
          .filter(Boolean)
      : selectedSites;
  }, [selectedSites]);

  const { sortedData: chartData, siteIdToName } = useMemo(
    () => processChartData(data, selectedSiteIds),
    [data, selectedSiteIds, processChartData],
  );

  const dataKeys = useMemo(() => {
    if (!chartData.length) return [];
    const keys = new Set();
    chartData.forEach((item) =>
      Object.keys(item).forEach((key) => key !== 'time' && keys.add(key)),
    );
    return Array.from(keys).filter((key) =>
      effectiveVisibleSiteIds.includes(key),
    );
  }, [chartData, effectiveVisibleSiteIds]);

  const WHO_STANDARD_VALUE = useMemo(
    () => aqStandard?.value?.[pollutantType] || 0,
    [aqStandard, pollutantType],
  );

  const handleMouseLeave = useCallback(() => setActiveIndex(null), []);

  const getColor = useCallback(
    (index) =>
      activeIndex === null || index === activeIndex
        ? colors[index % colors.length]
        : '#ccc',
    [activeIndex],
  );

  const calculateStep = useCallback(() => {
    const minLabelWidth = 25;
    if (containerWidth <= 0 || chartData.length === 0) return 1;
    return Math.max(
      1,
      Math.ceil(chartData.length / Math.floor(containerWidth / minLabelWidth)),
    );
  }, [containerWidth, chartData.length]);

  const step = useMemo(() => calculateStep(), [calculateStep]);

  const handleRefreshClick = useCallback(() => {
    if (!isRefreshing && refreshChart) refreshChart();
  }, [isRefreshing, refreshChart]);

  const renderChartContent = useMemo(() => {
    if (!selectedSiteIds.length) {
      return (
        <InfoMessage
          title="No Sites Selected"
          description="Please select one or more sites to view the chart."
          variant="info"
          className="w-full h-full flex justify-center items-center flex-col"
        />
      );
    }
    if (!effectiveVisibleSiteIds.length) {
      return (
        <div className="flex flex-col justify-center items-center h-full p-4 text-gray-500">
          <MdInfoOutline className="text-4xl mb-2" />
          <p className="text-lg font-medium mb-1">All Sites Hidden</p>
          <p className="text-sm text-center">
            All sites are currently hidden. Click on a site in the sidebar to
            show it on the chart.
          </p>
        </div>
      );
    }
    if (!chartData.length) {
      return (
        <InfoMessage
          title="No Data Available"
          description="There's no data to display for the selected criteria. Try adjusting your filters or refreshing the chart."
          variant="info"
          className="w-full h-full flex justify-center items-center flex-col"
          action={
            refreshChart && (
              <button
                onClick={handleRefreshClick}
                disabled={isRefreshing}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center ${
                  isRefreshing ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                aria-label="Refresh chart data"
              >
                <MdInfoOutline className="h-5 w-5 mr-1" />
                Refresh Chart
              </button>
            )
          }
        />
      );
    }
    const ChartComponent = chartType === 'line' ? LineChart : BarChart;
    const DataComponent = chartType === 'line' ? Line : Bar;
    return (
      <ResponsiveContainer width={width} height={height}>
        <ChartComponent
          data={chartData}
          margin={{ top: 38, right: 10, left: -15, bottom: 20 }}
          style={{ cursor: 'pointer' }}
        >
          <CartesianGrid
            stroke={isDark ? '#555' : '#ccc'}
            strokeDasharray="5 5"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            tickLine={false}
            tick={({ x, y, payload }) => (
              <CustomizedAxisTick
                x={x}
                y={y}
                payload={payload}
                fill={isDark ? '#E5E7EB' : '#485972'}
                frequency={frequency}
              />
            )}
            axisLine={false}
            interval={step}
            padding={{ left: 30, right: 30 }}
          />
          <YAxis
            domain={[0, 'auto']}
            axisLine={false}
            fontSize={12}
            tickLine={false}
            tick={{ fill: isDark ? '#D1D5DB' : '#1C1D20' }}
            tickFormatter={formatYAxisTick}
          >
            <Label
              value={
                pollutantType === 'pm2_5'
                  ? 'PM2.5'
                  : pollutantType === 'pm10'
                    ? 'PM10'
                    : 'Pollutant'
              }
              position="top"
              fill={isDark ? '#D1D5DB' : '#1C1D20'}
              fontSize={12}
              dy={-20}
              style={{ textAnchor: 'start' }}
            />
          </YAxis>
          <Legend content={renderCustomizedLegend} />
          <Tooltip
            content={
              <CustomGraphTooltip
                pollutionType={pollutantType}
                activeIndex={activeIndex}
              />
            }
            cursor={
              chartType === 'line'
                ? {
                    stroke: isDark ? '#888' : '#aaa',
                    strokeOpacity: 0.3,
                    strokeWidth: 2,
                    strokeDasharray: '3 3',
                  }
                : { fill: isDark ? '#444' : '#eee', fillOpacity: 0.3 }
            }
          />
          {dataKeys.map((key, index) => (
            <DataComponent
              key={key}
              dataKey={key}
              name={siteIdToName[key] || 'Unknown Location'}
              type={chartType === 'line' ? 'monotone' : undefined}
              stroke={chartType === 'line' ? getColor(index) : undefined}
              strokeWidth={chartType === 'line' ? 4 : undefined}
              fill={chartType === 'bar' ? getColor(index) : undefined}
              barSize={chartType === 'bar' ? 12 : undefined}
              dot={chartType === 'line' ? <CustomDot /> : undefined}
              activeDot={chartType === 'line' ? { r: 6 } : undefined}
              shape={chartType === 'bar' ? <CustomBar /> : undefined}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={handleMouseLeave}
            />
          ))}
          {WHO_STANDARD_VALUE > 0 && (
            <ReferenceLine
              y={WHO_STANDARD_VALUE}
              label={<CustomReferenceLabel name={aqStandard?.name || 'WHO'} />}
              ifOverflow="extendDomain"
              stroke="red"
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    );
  }, [
    selectedSiteIds.length,
    effectiveVisibleSiteIds.length,
    chartData,
    chartType,
    width,
    height,
    step,
    getColor,
    handleMouseLeave,
    activeIndex,
    pollutantType,
    WHO_STANDARD_VALUE,
    dataKeys,
    frequency,
    siteIdToName,
    refreshChart,
    isRefreshing,
    aqStandard?.name,
    handleRefreshClick,
    isDark,
  ]);

  return (
    <div id={id} ref={containerRef} className="w-auto h-full pt-4 relative">
      {renderChartContent}
    </div>
  );
};

export default React.memo(MoreInsightsChart);
