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
import { MdInfoOutline, MdRefresh } from 'react-icons/md';
import useResizeObserver from '@/core/utils/useResizeObserver';
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
import { useTheme } from '@/features/theme-customizer/hooks/useTheme';
import Button from '@/components/Button';

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
        fontSize={12}
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
  width = '100%',
  height = '100%',
}) {
  const { theme, systemTheme } = useTheme();
  const isDark =
    theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  const [activeIndex, setActiveIndex] = useState(null);
  const [legendLocked, setLegendLocked] = useState(false);
  const containerRef = useRef(null);
  const { width: containerWidth } = useResizeObserver(containerRef);
  const aqStandard = useSelector((state) => state.chart.aqStandard);
  const chartRef = useRef(null);
  const opacities = [0, 0.15, 0.3, 0.85]; // darkness steps

  const getColor = useCallback(
    (idx) => {
      // SSR‐safe guard
      if (typeof window === 'undefined') {
        return 'rgba(20,95,255,1)';
      }

      // Read the up‑to‑date CSS variable each time
      const css = window.getComputedStyle(document.documentElement);
      const raw = css.getPropertyValue('--color-primary-rgb').trim();
      const [r, g, b] = raw
        .split(',')
        .map((v) => parseInt(v, 10))
        .filter((n) => !isNaN(n));

      // Compute a darkness factor from opacities
      const pct = opacities[idx % opacities.length];
      const factor = 1 - pct;

      const dr = Math.round(r * factor);
      const dg = Math.round(g * factor);
      const db = Math.round(b * factor);
      const activeColor = `rgb(${dr}, ${dg}, ${db})`;

      return activeIndex === null || activeIndex === idx
        ? activeColor
        : 'rgba(204, 204, 204, 0.5)';
    },
    [activeIndex, theme, systemTheme],
  );
  // Enhanced tick count calculation
  const tickCount = useMemo(() => {
    if (containerWidth < 480) return 4;
    if (containerWidth < 768) return 6;
    if (containerWidth < 1024) return 8;
    return 12;
  }, [containerWidth]);

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
      return (
        <InfoMessage
          title="No Sites Selected"
          description="Select sites to view."
          variant="info"
          className="w-full h-full flex items-center justify-center"
        />
      );
    }
    if (!seriesKeys.length) {
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
      className="w-full h-full pt-4 relative chart-container"
      data-chart-id={id}
    >
      {chartData.length && seriesKeys.length ? (
        <ResponsiveContainer width={width} height={height}>
          <ChartComponent
            ref={chartRef}
            data={chartData}
            margin={{ top: 25, right: 10, left: -20, bottom: 10 }}
            className="chart-component"
          >
            <CartesianGrid
              stroke={isDark ? '#555' : '#ccc'}
              strokeDasharray="5 5"
              vertical={false}
              className="chart-grid"
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
              height={60}
              className="chart-x-axis"
            />
            <YAxis
              domain={[0, 'auto']}
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#D1D5DB' : '#1C1D20' }}
              tickFormatter={formatYAxisTick}
              className="chart-y-axis"
            >
              <Label
                value={
                  pollutantType === 'pm2_5'
                    ? 'PM2.5'
                    : pollutantType === 'pm10'
                      ? 'PM10'
                      : 'Pollutant'
                }
                position="insideTopLeft"
                fill={isDark ? '#D1D5DB' : '#1C1D20'}
                fontSize={12}
                dy={-30}
                dx={28}
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
                    chartType === 'line' ? (isActive ? 3 : 1.5) : undefined
                  }
                  barSize={chartType === 'bar' ? (isActive ? 8 : 6) : undefined}
                  opacity={isActive ? 1 : 0.5}
                  dot={chartType === 'line' ? <CustomDot /> : undefined}
                  activeDot={chartType === 'line' ? { r: 5 } : undefined}
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
