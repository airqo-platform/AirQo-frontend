import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  LineChart,
  BarChart,
  Line,
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
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import useResizeObserver from '@/core/hooks/useResizeObserver';

// utils / hooks / config
import { CHART_CONFIG } from './config/chartConfig';
import { useColorResolver } from './utils/colorUtils';
import useChartData from './hooks/useChartData';
import useChartTicks from './hooks/useChartTicks';
import useLegendState from './hooks/useLegendState';
import { formatYAxisTick } from './utils/formatters';

// components
import ImprovedAxisTick from './components/AxisTicks/ImprovedAxisTick';
import EmptyChart from './components/EmptyStates/EmptyChart';
import CustomReferenceLabel from './components/Reference/CustomReferenceLabel';
import CustomDot from './components/Series/CustomDot';
import CustomGraphTooltip from './components/Tooltip/CustomGraphTooltip';
import CustomLegend from './components/Legend/CustomLegend';

const MoreInsightsChart = React.memo(function MoreInsightsChart({
  data,
  selectedSites,
  visibleSiteIds,
  chartType = 'line',
  frequency = 'daily',
  id,
  pollutantType,
  refreshChart,
  isRefreshing,
  height = '100%',
}) {
  const { theme, systemTheme } = useTheme();
  const isDark =
    theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  const containerRef = useRef(null);
  const { width: containerWidth } = useResizeObserver(containerRef);
  const chartRef = useRef(null);

  const aqStandard = useSelector((state) => state.chart.aqStandard);
  const WHO_STANDARD_VALUE = aqStandard?.value?.[pollutantType] || 0;

  const { chartData, siteIdToName, seriesKeys } = useChartData(
    data,
    selectedSites,
    visibleSiteIds,
  );
  const xTicks = useChartTicks(chartData, containerWidth);
  const legendState = useLegendState();
  const getColor = useColorResolver(
    legendState.activeIndex,
    theme,
    systemTheme,
  );

  // export style injection
  useEffect(() => {
    const parent = containerRef.current?.closest('.exporting');
    if (!parent) return;

    const style = document.createElement('style');
    style.textContent = `
      .exporting .recharts-wrapper,
      .exporting .recharts-legend-wrapper { 
        overflow: visible !important; 
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      .exporting .recharts-legend-item {
        display: inline-block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      .exporting .legend,
      .exporting [class*="legend"] {
        display: flex !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Chart type selection
  const ChartComponent = chartType === 'bar' ? BarChart : LineChart;
  const SeriesComponent = chartType === 'bar' ? Bar : Line;

  if (!chartData.length || !seriesKeys.length)
    return (
      <EmptyChart
        normalizedSelectedIds={selectedSites}
        seriesKeys={seriesKeys}
        refreshChart={refreshChart}
        isRefreshing={isRefreshing}
        handleRefresh={legendState.handleLegendClick}
      />
    );

  return (
    <div
      id={id}
      ref={containerRef}
      className="w-full h-full relative chart-container flex items-center justify-center"
      data-chart-id={id}
    >
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent
          ref={chartRef}
          data={chartData}
          margin={CHART_CONFIG.chartMargin}
        >
          <CartesianGrid
            stroke={isDark ? '#555' : '#999'}
            strokeDasharray="2 2"
            className="chart-grid"
            opacity={CHART_CONFIG.chart.gridOpacity}
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
            height={50}
            className="chart-x-axis"
            padding={{ left: 10, right: 10 }}
          />
          <YAxis
            domain={[0, 'auto']}
            axisLine={false}
            tickLine={false}
            tick={{
              fill: isDark ? '#D1D5DB' : '#1C1D20',
              fontSize: 12,
              fontFamily: CHART_CONFIG.exportStyles.fontFamily,
            }}
            tickFormatter={formatYAxisTick}
            className="chart-y-axis"
            width={50}
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
          <Tooltip
            content={
              <CustomGraphTooltip
                pollutionType={pollutantType}
                activeIndex={legendState.activeIndex}
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
          <Legend
            content={(props) => (
              <CustomLegend
                {...props}
                activeIndex={legendState.activeIndex}
                onMouseEnter={legendState.handleLegendMouseEnter}
                onMouseLeave={legendState.handleLegendMouseLeave}
                onClick={legendState.handleLegendClick}
              />
            )}
            wrapperClassName="chart-legend-wrapper"
            margin={{ top: 8 }}
            verticalAlign="bottom"
            align="center"
          />
          {seriesKeys.map((key, idx) => {
            const isActive =
              legendState.activeIndex === null ||
              legendState.activeIndex === idx;

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
                barSize={chartType === 'bar' ? (isActive ? 12 : 8) : undefined}
                opacity={isActive ? 1 : 0.5}
                dot={chartType === 'line' ? <CustomDot /> : undefined}
                activeDot={chartType === 'line' ? { r: 6 } : undefined}
                onMouseEnter={() => legendState.handleLegendMouseEnter(idx)}
                onMouseLeave={legendState.handleLegendMouseLeave}
                className={`chart-series chart-series-${idx} ${
                  isActive ? 'chart-series-active' : 'chart-series-inactive'
                }`}
                isAnimationActive={!document.querySelector('.exporting')}
              />
            );
          })}

          {/* Add Legend component for proper export */}
          <Legend
            content={
              <CustomLegend
                payload={seriesKeys.map((key, idx) => ({
                  dataKey: key,
                  value: siteIdToName[key] || key,
                  color: getColor(idx),
                }))}
                onMouseEnter={legendState.handleLegendMouseEnter}
                onMouseLeave={legendState.handleLegendMouseLeave}
                onClick={legendState.handleLegendClick}
                activeIndex={legendState.activeIndex}
              />
            }
            wrapperStyle={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginTop: '20px',
            }}
          />

          {WHO_STANDARD_VALUE > 0 && (
            <ReferenceLine
              y={WHO_STANDARD_VALUE}
              label={<CustomReferenceLabel name={aqStandard?.name || 'WHO'} />}
              stroke="red"
              strokeDasharray="3 3"
              strokeWidth={2}
              ifOverflow="extendDomain"
              className="chart-reference-line"
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
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

export default MoreInsightsChart;
