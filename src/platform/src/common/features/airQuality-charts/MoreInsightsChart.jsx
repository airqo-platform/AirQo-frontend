import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
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
import { useSelector } from 'react-redux';
import { MdRefresh } from 'react-icons/md';
import { MdSearchOff } from 'react-icons/md';

import useResizeObserver from '@/core/hooks/useResizeObserver';
import { parseAndValidateISODate } from '@/core/utils/dateUtils';
import { formatYAxisTick } from './utils';
import InfoMessage from '@/components/Messages/InfoMessage';
import {
  renderCustomizedLegend,
  CustomDot,
  CustomBar,
  CustomGraphTooltip,
  CustomReferenceLabel,
} from './components';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import { useOrganizationLoading } from '@/app/providers/OrganizationLoadingProvider';
import Button from '@/components/Button';

// Simplified responsive chart configuration
const CHART_CONFIG = {
  chartMargin: {
    top: 50,
    right: 20,
    bottom: 30,
  },
  // Minimal margins for exports to reduce whitespace
  exportMargin: {
    top: 5,
    right: 5,
    left: 15,
    bottom: 30,
  },
  exportStyles: {
    fontSize: 12,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  yAxisLabel: {
    fontSize: 12,
    fontWeight: '600',
    position: {
      dy: -40,
      dx: 5,
    },
  },
};

// Custom tick renderer with improved readability
const ImprovedAxisTick = ({ x, y, payload, fill, frequency }) => {
  const date = new Date(payload.value);
  let label;
  switch (frequency) {
    case 'hourly':
      label = date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      break;
    case 'daily':
      label = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      break;
    case 'weekly':
      label = `W${Math.ceil(date.getDate() / 7)} ${date.toLocaleDateString([], { month: 'short' })}`;
      break;
    case 'monthly':
      label = date.toLocaleDateString([], { month: 'short', year: '2-digit' });
      break;
    default:
      label = date.toLocaleDateString();
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="middle"
        fill={fill}
        fontSize={12} // Restored to readable size
        fontFamily={CHART_CONFIG.exportStyles.fontFamily}
        className="chart-tick-text"
      >
        {label}
      </text>
    </g>
  );
};

ImprovedAxisTick.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  payload: PropTypes.object,
  fill: PropTypes.string,
  frequency: PropTypes.oneOf(['hourly', 'daily', 'weekly', 'monthly']),
};

const MoreInsightsChart = React.memo(function MoreInsightsChart({
  data,
  selectedSites,
  visibleSiteIds,
  chartType,
  frequency,
  id,
  pollutantType,
  refreshChart,
  isRefreshing,
  _width = '100%', // Underscore prefix to indicate unused
  height = '100%',
}) {
  const { theme, systemTheme } = useTheme();
  const { isOrganizationLoading } = useOrganizationLoading();
  const isDark =
    theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  const [activeIndex, setActiveIndex] = useState(null);
  const [legendLocked, setLegendLocked] = useState(false);
  const containerRef = useRef(null);
  const { width: containerWidth } = useResizeObserver(containerRef);
  const aqStandard = useSelector((state) => state.chart.aqStandard);
  // Use the height passed from parent (100% by default)
  const availableHeight = height;
  const chartRef = useRef(null);

  // Enhanced tick count calculation
  const tickCount = useMemo(() => {
    if (containerWidth < 480) return 4;
    if (containerWidth < 768) return 6;
    if (containerWidth < 1024) return 8;
    return 12;
  }, [containerWidth]);

  const getColor = useCallback(
    (idx) => {
      // SSR-safe guard
      if (typeof window === 'undefined') {
        return 'rgba(20,95,255,1)';
      }

      // Read the base primary color RGB values
      const css = window.getComputedStyle(document.documentElement);
      const raw = css.getPropertyValue('--color-primary-rgb').trim();
      const [r, g, b] = raw
        .split(',')
        .map((v) => parseInt(v, 10))
        .filter((n) => !isNaN(n));

      const shadeFactors = {
        950: 0.2, // Darkest shade
        800: 0.4, // Dark shade
        500: 0.7, // Medium shade
        200: 0.9, // Light shade
      };

      // Map index to shade variant
      const shadeKeys = [950, 800, 500, 200];
      const shade = shadeKeys[idx % shadeKeys.length];
      const factor = shadeFactors[shade];

      // Apply shade factor to create the specific shade
      const sr = Math.round(r * factor);
      const sg = Math.round(g * factor);
      const sb = Math.round(b * factor);
      const shadeColor = `rgb(${sr}, ${sg}, ${sb})`;

      // Apply inactive state if needed
      return activeIndex === null || activeIndex === idx
        ? shadeColor
        : 'rgba(204, 204, 204, 0.5)';
    },
    [activeIndex, theme, systemTheme],
  );

  // Normalize selected site IDs for consistent processing
  const normalizedSelectedIds = useMemo(() => {
    if (!selectedSites?.length) return [];
    return typeof selectedSites[0] === 'object'
      ? selectedSites.map((s) => s._id || s.id || s.site_id).filter(Boolean)
      : selectedSites;
  }, [selectedSites]);

  // Prepare chart data with improved performance
  const { chartData, siteIdToName } = useMemo(() => {
    if (!Array.isArray(data) || !normalizedSelectedIds.length)
      return { chartData: [], siteIdToName: {} };

    const combined = {};
    const names = {};

    // Use a single loop for better performance
    data.forEach(({ site_id, name, value, time }) => {
      if (value == null || !normalizedSelectedIds.includes(site_id)) return;

      names[site_id] = name;
      const date = parseAndValidateISODate(time);

      if (!date) return;
      const iso = date.toISOString();

      if (!combined[iso]) {
        combined[iso] = { time: iso };
      }

      combined[iso][site_id] = value;
    });

    // Create sorted array from the combined object
    const sorted = Object.values(combined).sort(
      (a, b) => new Date(a.time) - new Date(b.time),
    );

    return { chartData: sorted, siteIdToName: names };
  }, [data, normalizedSelectedIds]);

  // Calculate x-axis ticks for even distribution
  const xTicks = useMemo(() => {
    if (!chartData.length) return [];

    // Calculate step size for even distribution
    const step = Math.max(1, Math.ceil(chartData.length / tickCount));

    // Generate ticks at regular intervals
    const ticks = [];
    for (let i = 0; i < chartData.length; i += step) {
      ticks.push(chartData[i].time);
    }

    // Always include the last data point
    const last = chartData[chartData.length - 1].time;
    if (ticks[ticks.length - 1] !== last) {
      ticks.push(last);
    }

    return ticks;
  }, [chartData, tickCount]);

  // Determine which series to display based on visibility settings
  const seriesKeys = useMemo(() => {
    if (!chartData.length) return [];

    const activeIds = visibleSiteIds?.length
      ? visibleSiteIds
      : normalizedSelectedIds;

    return Object.keys(chartData[0] || {}).filter(
      (k) => k !== 'time' && activeIds.includes(k),
    );
  }, [chartData, visibleSiteIds, normalizedSelectedIds]);

  // Get WHO standard value for reference line
  const WHO_STANDARD_VALUE = aqStandard?.value?.[pollutantType] || 0;

  // Handle chart refresh
  const handleRefresh = useCallback(() => {
    if (!isRefreshing && refreshChart) refreshChart();
  }, [isRefreshing, refreshChart]);

  // Legend interaction handlers
  const handleLegendMouseEnter = useCallback(
    (index) => {
      if (!legendLocked) {
        setActiveIndex(index);
      }
    },
    [legendLocked],
  );

  const handleLegendMouseLeave = useCallback(() => {
    if (!legendLocked) {
      setActiveIndex(null);
    }
  }, [legendLocked]);

  const handleLegendClick = useCallback(
    (index) => {
      if (legendLocked && activeIndex === index) {
        // If clicking the already active legend item, unlock and reset
        setLegendLocked(false);
        setActiveIndex(null);
      } else {
        // Otherwise lock to this item
        setLegendLocked(true);
        setActiveIndex(index);
      }
    },
    [activeIndex, legendLocked],
  );

  // Handle series hover
  const handleSeriesMouseEnter = useCallback(
    (index) => {
      if (!legendLocked) {
        setActiveIndex(index);
      }
    },
    [legendLocked],
  );

  const handleSeriesMouseLeave = useCallback(() => {
    if (!legendLocked) {
      setActiveIndex(null);
    }
  }, [legendLocked]);

  // Render empty state with appropriate message
  const renderEmpty = () => {
    if (!normalizedSelectedIds.length) {
      // Show loading state during organization switching instead of "No sites selected"
      if (isOrganizationLoading) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 px-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
            <h4 className="mb-2 text-lg font-semibold">Loading...</h4>
            <p className="text-center">Please wait while we load your data.</p>
          </div>
        );
      }

      return (
        <InfoMessage
          title="No Sites Selected"
          description="Select sites to view chart data."
          variant="info"
          className="w-full h-full flex items-center justify-center"
        />
      );
    }
    if (!seriesKeys.length) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 px-6">
          <MdSearchOff className="text-5xl mb-3" />
          <h4 className="mb-2 text-lg font-semibold">No Data Available</h4>
          <p className="text-center">
            We couldn’t find any data matching your current selections.
          </p>
          <p className="text-center">
            Try adjusting the filters or choosing a different time range.
          </p>
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
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 disabled:opacity-50 flex items-center"
              >
                <MdRefresh className="mr-1" /> Refresh
              </Button>
            )
          }
          variant="info"
          className="w-full h-full flex items-center justify-center"
        />
      );
    }
    return null;
  };

  // Ensure chart is properly rendered for exports
  useEffect(() => {
    // Add specific styles for export context
    if (containerRef.current) {
      const parent = containerRef.current.closest('.exporting');
      if (parent) {
        // Force chart to be fully visible during export
        const style = document.createElement('style');
        style.textContent = `
          .recharts-wrapper {
            overflow: visible !important;
          }
          .recharts-legend-wrapper {
            overflow: visible !important;
          }
        `;
        document.head.appendChild(style);

        return () => {
          document.head.removeChild(style);
        };
      }
    }
  }, []);

  // Choose chart component based on chart type
  const ChartComponent = chartType === 'bar' ? BarChart : LineChart;
  const SeriesComponent = chartType === 'bar' ? Bar : Line;
  return (
    <div
      id={id}
      ref={containerRef}
      className="w-full h-full relative chart-container flex items-center justify-center"
      style={{
        padding: CHART_CONFIG.padding,
        marginTop: CHART_CONFIG.marginTop,
        boxSizing: 'border-box',
        // Let container height be controlled by parent
      }}
      data-chart-id={id}
    >
      {chartData.length && seriesKeys.length ? (
        <ResponsiveContainer width="100%" height={availableHeight}>
          <ChartComponent
            ref={chartRef}
            data={chartData}
            margin={CHART_CONFIG.chartMargin}
          >
            <CartesianGrid
              stroke={isDark ? '#555' : '#999'}
              strokeDasharray="2 2"
              vertical={true}
              horizontal={true}
              className="chart-grid"
              opacity={1}
              strokeWidth={1}
            />
            <XAxis
              dataKey="time"
              ticks={xTicks}
              tickLine={false}
              tick={(props) => (
                <ImprovedAxisTick
                  {...props}
                  fill={isDark ? '#E5E7EB' : '#485972'}
                  frequency={frequency}
                />
              )}
              axisLine={false}
              interval={0}
              angle={containerWidth < 480 ? -45 : -25}
              textAnchor="end"
              height={50} // Restored to reasonable size
              className="chart-x-axis"
              padding={{ left: 10, right: 10 }}
            />
            <YAxis
              domain={[0, 'auto']}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: isDark ? '#D1D5DB' : '#1C1D20',
                fontSize: 12, // Restored to readable size
                fontFamily: CHART_CONFIG.exportStyles.fontFamily,
              }}
              tickFormatter={formatYAxisTick}
              className="chart-y-axis"
              width={50} // Restored to reasonable size
            >
              <Label
                value={
                  pollutantType === 'pm2_5'
                    ? 'PM2.5 (μg/m³)'
                    : pollutantType === 'pm10'
                      ? 'PM10 (μg/m³)'
                      : 'Pollutant (μg/m³)'
                }
                position="insideTop"
                offset={CHART_CONFIG.yAxisLabel.position.dy}
                dx={CHART_CONFIG.yAxisLabel.position.dx}
                fill={isDark ? '#D1D5DB' : '#1C1D20'}
                fontSize={CHART_CONFIG.yAxisLabel.fontSize}
                fontWeight={CHART_CONFIG.yAxisLabel.fontWeight}
                fontFamily={CHART_CONFIG.exportStyles.fontFamily}
                style={{ textAnchor: 'start' }}
                className="chart-y-label"
              />
            </YAxis>
            <Legend
              content={(props) =>
                renderCustomizedLegend({
                  ...props,
                  activeIndex: activeIndex,
                  onMouseEnter: handleLegendMouseEnter,
                  onMouseLeave: handleLegendMouseLeave,
                  onClick: handleLegendClick,
                })
              }
              wrapperClassName="chart-legend-wrapper"
              margin={{ top: 8 }} // Restored reasonable margin
              verticalAlign="bottom"
              align="center"
            />
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
                      className: 'chart-cursor',
                    }
                  : {
                      fill: isDark ? '#444' : '#eee',
                      fillOpacity: 0.3,
                      className: 'chart-cursor',
                    }
              }
              className="chart-tooltip"
              animationDuration={200}
            />
            {seriesKeys.map((key, idx) => {
              const isActive = activeIndex === null || activeIndex === idx;

              return (
                <SeriesComponent
                  key={key}
                  dataKey={key}
                  name={siteIdToName[key] || key}
                  type={chartType === 'line' ? 'monotone' : undefined}
                  stroke={chartType === 'line' ? getColor(idx) : undefined}
                  fill={chartType === 'bar' ? getColor(idx) : undefined}
                  strokeWidth={
                    chartType === 'line' ? (isActive ? 3 : 2) : undefined
                  }
                  barSize={
                    chartType === 'bar' ? (isActive ? 12 : 8) : undefined
                  }
                  opacity={isActive ? 1 : 0.5}
                  dot={chartType === 'line' ? <CustomDot /> : undefined}
                  activeDot={chartType === 'line' ? { r: 6 } : undefined}
                  shape={chartType === 'bar' ? <CustomBar /> : undefined}
                  onMouseEnter={() => handleSeriesMouseEnter(idx)}
                  onMouseLeave={handleSeriesMouseLeave}
                  className={`chart-series chart-series-${idx} ${isActive ? 'chart-series-active' : 'chart-series-inactive'}`}
                  isAnimationActive={!document.querySelector('.exporting')} // Disable animations during export
                />
              );
            })}
            {WHO_STANDARD_VALUE > 0 && (
              <ReferenceLine
                y={WHO_STANDARD_VALUE}
                label={
                  <CustomReferenceLabel name={aqStandard?.name || 'WHO'} />
                }
                stroke="red"
                strokeDasharray="3 3"
                strokeWidth={2}
                ifOverflow="extendDomain"
                className="chart-reference-line"
              />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      ) : (
        renderEmpty()
      )}
    </div>
  );
});

MoreInsightsChart.propTypes = {
  data: PropTypes.array.isRequired,
  selectedSites: PropTypes.array.isRequired,
  visibleSiteIds: PropTypes.array,
  chartType: PropTypes.oneOf(['line', 'bar']),
  frequency: PropTypes.oneOf(['hourly', 'daily', 'weekly', 'monthly']),
  id: PropTypes.string,
  pollutantType: PropTypes.string.isRequired,
  refreshChart: PropTypes.func,
  isRefreshing: PropTypes.bool,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

MoreInsightsChart.defaultProps = {
  visibleSiteIds: [],
  chartType: 'line',
  frequency: 'daily',
  id: undefined,
  refreshChart: null,
  isRefreshing: false,
  width: '100%',
  height: '100%',
};

export default MoreInsightsChart;
