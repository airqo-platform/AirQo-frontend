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
import { MdInfoOutline, MdRefresh } from 'react-icons/md';
import InfoMessage from '../Modal/dataDownload/components/InfoMessage';

/**
 * MoreInsightsChart Component
 *
 * Renders a responsive chart (line or bar) based on the provided data and configurations.
 */
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
  const [activeIndex, setActiveIndex] = useState(null);
  const containerRef = useRef(null);
  const { width: containerWidth } = useResizeObserver(containerRef);
  const aqStandard = useSelector((state) => state.chart.aqStandard);

  /**
   * Determine which site IDs to display in the chart
   */
  const effectiveVisibleSiteIds = useMemo(() => {
    if (visibleSiteIds && visibleSiteIds.length > 0) {
      return visibleSiteIds;
    }
    // Extract IDs from selectedSites if they're objects
    if (selectedSites && selectedSites.length > 0) {
      if (typeof selectedSites[0] === 'object') {
        return selectedSites
          .map((site) => site._id || site.id || site.site_id)
          .filter(Boolean);
      }
      return selectedSites;
    }
    return [];
  }, [selectedSites, visibleSiteIds]);

  /**
   * Process raw chart data
   */
  const processChartData = useCallback((rawData, selectedSiteIds) => {
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      return { sortedData: [], siteIdToName: {} };
    }

    const combinedData = {};
    const siteIdToName = {};

    // Build site ID to name mapping
    rawData.forEach((dataPoint) => {
      const { site_id, name } = dataPoint;
      if (site_id && name && selectedSiteIds.includes(site_id)) {
        siteIdToName[site_id] = name;
      }
    });

    // Combine data points
    rawData.forEach((dataPoint) => {
      const { site_id, value, time } = dataPoint;
      // Skip invalid or unselected sites
      if (!site_id || value === undefined || !time) return;
      if (!selectedSiteIds.includes(site_id)) return;

      const date = parseAndValidateISODate(time);
      if (!date) return;
      const formattedTime = date.toISOString();

      if (!combinedData[formattedTime]) {
        combinedData[formattedTime] = { time: formattedTime };
      }
      combinedData[formattedTime][site_id] = value;
    });

    // Convert to array & sort by time
    const sortedData = Object.values(combinedData).sort(
      (a, b) => new Date(a.time) - new Date(b.time),
    );

    return { sortedData, siteIdToName };
  }, []);

  /**
   * Normalize selected sites to always be an array of IDs
   */
  const selectedSiteIds = useMemo(() => {
    if (!selectedSites || selectedSites.length === 0) return [];
    if (typeof selectedSites[0] === 'object') {
      return selectedSites
        .map((site) => site._id || site.id || site.site_id)
        .filter(Boolean);
    }
    return selectedSites;
  }, [selectedSites]);

  /**
   * Memoized processed chart data
   */
  const { sortedData: chartData, siteIdToName } = useMemo(() => {
    return processChartData(data, selectedSiteIds);
  }, [data, selectedSiteIds, processChartData]);

  /**
   * Extract unique data keys (site IDs) for plotting, filtered by visibility
   */
  const dataKeys = useMemo(() => {
    if (chartData.length === 0) return [];
    const allKeys = new Set();
    chartData.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (key !== 'time') allKeys.add(key);
      });
    });
    return Array.from(allKeys).filter((key) =>
      effectiveVisibleSiteIds.includes(key),
    );
  }, [chartData, effectiveVisibleSiteIds]);

  /**
   * WHO standard value
   */
  const WHO_STANDARD_VALUE = useMemo(
    () => aqStandard?.value?.[pollutantType] || 0,
    [pollutantType, aqStandard],
  );

  /**
   * Mouse event handlers
   */
  const handleMouseLeave = useCallback(() => setActiveIndex(null), []);
  const getColor = useCallback(
    (index) =>
      activeIndex === null || index === activeIndex
        ? colors[index % colors.length]
        : '#ccc',
    [activeIndex],
  );

  /**
   * Calculate step for X-axis labels
   */
  const calculateStep = useCallback(() => {
    const minLabelWidth = 25; // Minimum width needed per label
    if (containerWidth <= 0 || chartData.length === 0) return 1;
    const maxLabels = Math.floor(containerWidth / minLabelWidth);
    return Math.max(1, Math.ceil(chartData.length / maxLabels));
  }, [containerWidth, chartData.length]);

  const step = useMemo(() => calculateStep(), [calculateStep]);

  /**
   * Chart component types
   */
  const ChartComponent = chartType === 'line' ? LineChart : BarChart;
  const DataComponent = chartType === 'line' ? Line : Bar;

  /**
   * Handle refresh button click with debounce protection
   */
  const handleRefreshClick = useCallback(() => {
    if (!isRefreshing && refreshChart) {
      refreshChart();
    }
  }, [isRefreshing, refreshChart]);

  /**
   * Render chart content based on state
   */
  const renderChart = useMemo(() => {
    // No sites selected
    if (selectedSiteIds.length === 0) {
      return (
        <InfoMessage
          title="No Sites Selected"
          description="
            Please select one or more sites to view the chart."
          variant="info"
          className="w-full h-full flex justify-center items-center flex-col"
        />
      );
    }

    // All sites hidden
    if (effectiveVisibleSiteIds.length === 0) {
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

    // No data
    if (chartData.length === 0) {
      return (
        <div className="flex flex-col justify-center items-center h-full p-4 text-gray-500">
          <MdInfoOutline className="text-4xl mb-2" />
          <p className="text-lg font-medium mb-1">No Data Available</p>
          <p className="text-sm text-center mb-4">
            There&apos;s no data to display for the selected criteria. Try
            adjusting your filters or refreshing the chart.
          </p>
          {refreshChart && (
            <button
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center ${
                isRefreshing ? 'opacity-75 cursor-not-allowed' : ''
              }`}
              aria-label="Refresh chart data"
            >
              {isRefreshing && (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              <MdRefresh className="h-5 w-5 mr-1" />
              Refresh Chart
            </button>
          )}
        </div>
      );
    }

    // Render the actual chart
    return (
      <ResponsiveContainer width={width} height={height}>
        <ChartComponent
          data={chartData}
          margin={{ top: 38, right: 10, left: -15, bottom: 20 }}
          style={{ cursor: 'pointer' }}
        >
          {/* Grid */}
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" vertical={false} />

          {/* X-Axis */}
          <XAxis
            dataKey="time"
            tickLine={false}
            tick={({ x, y, payload, fill, index }) => (
              <CustomizedAxisTick
                x={x}
                y={y}
                payload={payload}
                fill={fill}
                frequency={frequency}
                index={index}
                step={step}
              />
            )}
            axisLine={false}
            scale="auto"
            interval={step}
            padding={{ left: 30, right: 30 }}
          />

          {/* Y-Axis */}
          <YAxis
            domain={[0, 'auto']}
            axisLine={false}
            fontSize={12}
            tickLine={false}
            tick={{ fill: '#1C1D20' }}
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
              fill="#1C1D20"
              fontSize={12}
              angle={0}
              dx={0}
              dy={-20}
              style={{
                textAnchor: 'start',
              }}
            />
          </YAxis>

          {/* Legend */}
          <Legend content={renderCustomizedLegend} />

          {/* Tooltip */}
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
                    stroke: '#aaa',
                    strokeOpacity: 0.3,
                    strokeWidth: 2,
                    strokeDasharray: '3 3',
                  }
                : { fill: '#eee', fillOpacity: 0.3 }
            }
          />

          {/* Data Lines/Bars */}
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

          {/* Reference Line for WHO Standard */}
          {WHO_STANDARD_VALUE > 0 && (
            <ReferenceLine
              y={WHO_STANDARD_VALUE}
              label={<CustomReferenceLabel name={aqStandard?.name || 'WHO'} />}
              ifOverflow="extendDomain"
              stroke="red"
              strokeOpacity={1}
              strokeDasharray="0"
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
  ]);

  return (
    <div id={id} ref={containerRef} className="w-auto h-full pt-4 relative">
      {renderChart}
    </div>
  );
};

export default React.memo(MoreInsightsChart);
