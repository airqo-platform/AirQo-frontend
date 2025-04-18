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
} from './components';
import { parseAndValidateISODate } from '@/core/utils/dateUtils';
import { formatYAxisTick } from './utils';
import useResizeObserver from '@/core/utils/useResizeObserver';
import { useSelector } from 'react-redux';
import { MdInfoOutline, MdRefresh } from 'react-icons/md';
import InfoMessage from '@/components/Messages/InfoMessage';
import { useTheme } from '@/features/theme-customizer/hooks/useTheme';

// Formats timestamps for the X-axis based on frequency
const formatXAxisDate = (timestamp, frequency) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  switch (frequency) {
    case 'hourly':
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    case 'daily':
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    case 'weekly':
      return `W${Math.ceil(date.getDate() / 7)} ${date.toLocaleDateString([], { month: 'short' })}`;
    case 'monthly':
      return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
    default:
      return date.toLocaleDateString();
  }
};

// Custom tick for X-axis
const ImprovedAxisTick = ({ x, y, payload, fill, frequency }) => (
  <g transform={`translate(${x},${y})`}>
    <text x={0} y={0} dy={16} textAnchor="middle" fill={fill} fontSize={12}>
      {formatXAxisDate(payload.value, frequency)}
    </text>
  </g>
);

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

  // Determine how many ticks we can show
  const MAX_VISIBLE_TICKS = useMemo(() => {
    if (containerWidth <= 0) return 10;
    if (containerWidth < 600) return 6;
    if (containerWidth < 960) return 8;
    if (containerWidth < 1200) return 10;
    return 12;
  }, [containerWidth]);

  // Compute dynamic label angle for mobile
  const xAxisAngle = containerWidth < 480 ? -45 : -25;

  // Derive site IDs
  const selectedSiteIds = useMemo(() => {
    if (!selectedSites.length) return [];
    return typeof selectedSites[0] === 'object'
      ? selectedSites
          .map((site) => site._id || site.id || site.site_id)
          .filter(Boolean)
      : selectedSites;
  }, [selectedSites]);

  const effectiveVisibleSiteIds = useMemo(
    () => (visibleSiteIds.length ? visibleSiteIds : selectedSiteIds),
    [visibleSiteIds, selectedSiteIds],
  );

  // Organize raw data by timestamp
  const { sortedData: rawChartData, siteIdToName } = useMemo(() => {
    if (!Array.isArray(data) || !data.length || !selectedSiteIds.length) {
      return { sortedData: [], siteIdToName: {} };
    }
    const combined = {};
    const names = {};
    for (const { site_id, name, value, time } of data) {
      if (
        !site_id ||
        value == null ||
        !time ||
        !selectedSiteIds.includes(site_id)
      )
        continue;
      names[site_id] = name;
      const date = parseAndValidateISODate(time);
      if (!date) continue;
      const iso = date.toISOString();
      combined[iso] = { ...(combined[iso] || {}), time: iso, [site_id]: value };
    }
    const sorted = Object.values(combined).sort(
      (a, b) => new Date(a.time) - new Date(b.time),
    );
    return { sortedData: sorted, siteIdToName: names };
  }, [data, selectedSiteIds]);

  // Sample if too many points
  const chartData = useMemo(() => {
    if (rawChartData.length <= MAX_VISIBLE_TICKS * 2) return rawChartData;
    const step = Math.ceil(rawChartData.length / MAX_VISIBLE_TICKS);
    const sampled = rawChartData.filter((_, idx) => idx % step === 0);
    if (sampled[sampled.length - 1] !== rawChartData[rawChartData.length - 1]) {
      sampled.push(rawChartData[rawChartData.length - 1]);
    }
    return sampled;
  }, [rawChartData, MAX_VISIBLE_TICKS]);

  // Keys for series
  const dataKeys = useMemo(() => {
    const keys = new Set();
    for (const row of chartData) {
      Object.keys(row).forEach((k) => k !== 'time' && keys.add(k));
    }
    return Array.from(keys).filter((k) => effectiveVisibleSiteIds.includes(k));
  }, [chartData, effectiveVisibleSiteIds]);

  // WHO standard line
  const WHO_STANDARD_VALUE = useMemo(
    () => aqStandard?.value?.[pollutantType] || 0,
    [aqStandard, pollutantType],
  );

  // Opacity/color logic
  const opacities = [1, 0.9, 0.8, 0.7];
  const getColor = useCallback(
    (i) => {
      const alpha = opacities[i % opacities.length];
      const base = `rgba(var(--color-primary-rgb), ${alpha})`;
      return activeIndex === null || activeIndex === i ? base : '#ccc';
    },
    [activeIndex],
  );

  const handleMouseLeave = useCallback(() => setActiveIndex(null), []);

  // Refresh
  const handleRefreshClick = useCallback(() => {
    if (!isRefreshing && refreshChart) refreshChart();
  }, [isRefreshing, refreshChart]);

  // Determine tick count & interval
  const xAxisTickCount = useMemo(
    () => Math.min(MAX_VISIBLE_TICKS, chartData.length),
    [MAX_VISIBLE_TICKS, chartData.length],
  );

  const xAxisInterval = useMemo(
    () => Math.max(0, Math.floor(chartData.length / xAxisTickCount) - 1),
    [chartData.length, xAxisTickCount],
  );

  // Empty states
  const renderEmptyState = () => {
    if (!selectedSiteIds.length) {
      return (
        <InfoMessage
          title="No Sites Selected"
          description="Select sites to view."
          variant="info"
          className="w-full h-full flex items-center justify-center"
        />
      );
    }
    if (!effectiveVisibleSiteIds.length) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <MdInfoOutline className="text-4xl mb-2" />
          <p>All Sites Hidden</p>
        </div>
      );
    }
    if (!chartData.length) {
      return (
        <InfoMessage
          title="No Data"
          description="Try refreshing or adjusting filters."
          action={
            refreshChart && (
              <button
                onClick={handleRefreshClick}
                disabled={isRefreshing}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                <MdRefresh className="mr-1" /> Refresh
              </button>
            )
          }
          variant="info"
          className="w-full h-full flex items-center justify-center"
        />
      );
    }
    return null;
  };

  // Main rendering
  const renderChart = () => {
    if (!chartData.length || !effectiveVisibleSiteIds.length)
      return renderEmptyState();
    const Chart = chartType === 'line' ? LineChart : BarChart;
    const Series = chartType === 'line' ? Line : Bar;
    return (
      <ResponsiveContainer width={width} height={height}>
        <Chart
          data={chartData}
          margin={{ top: 38, right: 10, left: -15, bottom: 40 }}
          style={{ cursor: 'pointer' }}
          {...(chartType === 'bar' && { barGap: 8, barCategoryGap: '20%' })}
        >
          <CartesianGrid
            stroke={isDark ? '#555' : '#ccc'}
            strokeDasharray="5 5"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            tickLine={false}
            tick={(props) => (
              <ImprovedAxisTick
                {...props}
                fill={isDark ? '#E5E7EB' : '#485972'}
                frequency={frequency}
              />
            )}
            axisLine={false}
            interval={xAxisInterval}
            angle={xAxisAngle}
            textAnchor="end"
            height={60}
            padding={{ left: 30, right: 30 }}
          />
          <YAxis
            domain={[0, 'auto']}
            axisLine={false}
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
                siteIdToName={siteIdToName}
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
          {dataKeys.map((key, idx) => (
            <Series
              key={key}
              dataKey={key}
              name={siteIdToName[key] || key}
              type={chartType === 'line' ? 'monotone' : undefined}
              stroke={chartType === 'line' ? getColor(idx) : undefined}
              fill={chartType === 'bar' ? getColor(idx) : undefined}
              strokeWidth={chartType === 'line' ? 4 : undefined}
              barSize={chartType === 'bar' ? 12 : undefined}
              dot={chartType === 'line' ? <CustomDot /> : undefined}
              activeDot={chartType === 'line' ? { r: 6 } : undefined}
              shape={chartType === 'bar' ? <CustomBar /> : undefined}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={handleMouseLeave}
            />
          ))}
          {WHO_STANDARD_VALUE > 0 && (
            <ReferenceLine
              y={WHO_STANDARD_VALUE}
              label={<CustomReferenceLabel name={aqStandard?.name || 'WHO'} />}
              stroke="red"
              ifOverflow="extendDomain"
            />
          )}
        </Chart>
      </ResponsiveContainer>
    );
  };

  return (
    <div id={id} ref={containerRef} className="w-auto h-full pt-4 relative">
      {renderChart()}
    </div>
  );
};

MoreInsightsChart.displayName = 'MoreInsightsChart';
export default React.memo(MoreInsightsChart);
