'use client';

import React, { useMemo, useState, useCallback, useRef } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Curve,
  Customized,
  useIsTooltipActive,
  useActiveTooltipCoordinate,
  useActiveTooltipDataPoints,
  useYAxisScale,
} from 'recharts';
import type { LegendPayload } from 'recharts';
import {
  DynamicChartProps,
  ChartType,
  NormalizedChartData,
  TooltipData,
} from '../../types';
import { CustomTooltip } from '../ui/CustomTooltip';
import { CustomReferenceLine } from '../ui/CustomReferenceLine';
import type { AqiConfig } from '@/shared/types/aqi';
import {
  autoSelectChartType,
  groupDataBySite,
  convertToMultiSeriesFormat,
  formatTimestampByFrequency,
  getPollutantLabel,
  getPollutantUnits,
} from '../../utils';
import {
  getPrimaryColor,
  DEFAULT_CHART_CONFIG,
  BAR_CHART_CONFIG,
  GRID_CONFIG,
  AXIS_CONFIG,
  CHART_ANIMATIONS,
} from '../../constants';
import { cn } from '@/shared/lib/utils';

/**
 * Wraps the custom tooltip so the chart can learn the hovered data index
 * (recharts 3 passes `activeIndex` to tooltip content). The index drives the
 * "focus one item, blur the rest" emphasis on lines, bars and points.
 */
interface HoverAwareTooltipProps extends TooltipData {
  onHoverChange: (index: number | null) => void;
  focusedDataKey?: string | null;
  className?: string;
  showAirQualityLevel?: boolean;
  frequency?: string;
  pollutant?: 'pm2_5' | 'pm10';
  aqiConfig?: AqiConfig | null;
}

const HoverAwareTooltip: React.FC<HoverAwareTooltipProps> = ({
  onHoverChange,
  focusedDataKey,
  ...tooltipProps
}) => {
  const { active, activeIndex } = tooltipProps;

  React.useEffect(() => {
    onHoverChange(
      active && typeof activeIndex === 'number' ? activeIndex : null
    );
  }, [active, activeIndex, onHoverChange]);

  return (
    <CustomTooltip {...tooltipProps} focusedDataKey={focusedDataKey} />
  );
};

/** Dimming rules: 1 = full, lower = blurred (see the focus/blur design below) */
const FULL_OPACITY = 1;
const SOFT_BLUR = 0.6;
/** Opacity of grayed-out (non-focused) series/bars */
const GRAYED_OPACITY = 0.55;
/** "Skeleton" gray applied to non-focused series when one is focused */
const GRAYED_SERIES_COLOR = 'rgb(var(--muted-foreground))';

interface HoverFocusControllerProps {
  seriesKeys: string[];
  onFocus: (key: string) => void;
}

/**
 * Proximity-based series focus (ECharts `emphasis.focus: 'series'` pattern).
 * Rendered inside the chart via recharts' public hooks: whenever the tooltip
 * is active (cursor anywhere over the plot — recharts snaps to the nearest
 * X index), each series' value at that index is mapped to a pixel Y and the
 * series closest to the cursor is focused. This makes hovering a LINE focus
 * it even when the pointer isn't exactly on the 2px path — the whole line
 * becomes the hover target. Only reports a NEW key (no repeated state sets).
 */
const HoverFocusController: React.FC<HoverFocusControllerProps> = ({
  seriesKeys,
  onFocus,
}) => {
  const isActive = useIsTooltipActive();
  const coordinate = useActiveTooltipCoordinate();
  const dataPoints = useActiveTooltipDataPoints();
  const yScale = useYAxisScale();
  const lastReportedRef = useRef<string | null>(null);

  React.useEffect(() => {
    if (!isActive || !coordinate || !yScale || !dataPoints || dataPoints.length === 0) {
      return;
    }
    const row = dataPoints[0] as Record<string, unknown>;
    let best: string | null = null;
    let bestDistance = Infinity;

    seriesKeys.forEach(key => {
      const value = row[key];
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        return;
      }
      const y = yScale(value);
      if (typeof y !== 'number' || !Number.isFinite(y)) {
        return;
      }
      const distance = Math.abs(y - coordinate.y);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = key;
      }
    });

    if (best && best !== lastReportedRef.current) {
      lastReportedRef.current = best;
      onFocus(best);
    }
  }, [isActive, coordinate, dataPoints, seriesKeys, yScale, onFocus]);

  return null;
};

export const DynamicChart: React.FC<DynamicChartProps> = ({
  data,
  config = {},
  autoSelectType = true,
  responsive = true,
  className,
  frequency = 'daily',
  pollutant = 'pm2_5',
  aqiConfig = null,
  showReferenceLines: controlledShowReferenceLines,
  standards = 'WHO',
  id,
  onReferenceLinesToggle,
}) => {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const [localShowReferenceLines, setLocalShowReferenceLines] = useState(
    controlledShowReferenceLines ?? false
  );

  // Hover focus state: `activeIndex` is the hovered data point (any series);
  // `activeKey` narrows the focus to ONE series (its line/bar under the
  // cursor). Everything else is blurred while either is set.
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const handleHoverIndexChange = useCallback((index: number | null) => {
    setActiveIndex(index);
  }, []);

  // Series focus is debounced on blur: clearing on every leave makes the
  // chart flicker while the pointer travels across the line, its dots and
  // the tooltip box. A short grace window keeps the focus stable and only
  // releases it once the pointer is truly off the series.
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const focusSeries = useCallback((key: string) => {
    if (focusTimerRef.current) {
      clearTimeout(focusTimerRef.current);
      focusTimerRef.current = null;
    }
    setActiveKey(key);
  }, []);

  const scheduleSeriesBlur = useCallback(() => {
    if (focusTimerRef.current) {
      clearTimeout(focusTimerRef.current);
    }
    focusTimerRef.current = setTimeout(() => {
      focusTimerRef.current = null;
      setActiveKey(null);
    }, 120);
  }, []);

  React.useEffect(
    () => () => {
      if (focusTimerRef.current) {
        clearTimeout(focusTimerRef.current);
      }
    },
    []
  );

  const clearHover = useCallback(() => {
    if (focusTimerRef.current) {
      clearTimeout(focusTimerRef.current);
      focusTimerRef.current = null;
    }
    setActiveIndex(null);
    setActiveKey(null);
  }, []);

  // Sync with controlled prop
  React.useEffect(() => {
    if (controlledShowReferenceLines !== undefined) {
      setLocalShowReferenceLines(controlledShowReferenceLines);
    }
  }, [controlledShowReferenceLines]);

  // Handle reference lines toggle - each chart instance manages its own state
  const handleReferenceLinesToggle = useCallback(() => {
    const newValue = !localShowReferenceLines;
    setLocalShowReferenceLines(newValue);
    onReferenceLinesToggle?.(newValue);
  }, [localShowReferenceLines, onReferenceLinesToggle]);

  // Store toggle function in a ref so parent components can access it
  const toggleRef = React.useRef(handleReferenceLinesToggle);
  toggleRef.current = handleReferenceLinesToggle;

  // Expose toggle function globally by ID for external access
  React.useEffect(() => {
    if (id && typeof window !== 'undefined') {
      const w = window as typeof window & {
        chartToggles?: Record<string, () => void>;
      };
      w.chartToggles = w.chartToggles || {};
      w.chartToggles[id] = toggleRef.current;
    }
  }, [id]);

  // Determine chart type
  const chartType: ChartType = useMemo(() => {
    if (config.type) return config.type;
    if (autoSelectType) return autoSelectChartType(data);
    return 'line';
  }, [config.type, autoSelectType, data]);

  // Prepare data for multi-series charts
  const { chartData, seriesKeys } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: [], seriesKeys: [] };
    }

    // Group data by site for multi-series
    const grouped = groupDataBySite(data);
    const keys = Object.keys(grouped);

    // For single series or pie charts, use original data
    if (keys.length === 1 || chartType === 'pie') {
      return { chartData: data, seriesKeys: [config.dataKey || 'value'] };
    }

    // For multi-series, convert to recharts format
    const converted = convertToMultiSeriesFormat(grouped);
    return { chartData: converted, seriesKeys: keys };
  }, [data, chartType, config.dataKey]);

  // Reset the emphasis when the dataset changes so stale hover state can't
  // leave the chart blurred after a data refresh.
  React.useEffect(() => {
    clearHover();
  }, [chartData, clearHover]);

  // Handle legend toggle using native Recharts legend events
  const handleLegendClick = useCallback((entry: LegendPayload) => {
    const seriesKey = String(entry.dataKey ?? entry.value ?? '').trim();
    if (!seriesKey) return;

    setHiddenSeries(prev => {
      const next = new Set(prev);
      if (next.has(seriesKey)) {
        next.delete(seriesKey);
      } else {
        next.add(seriesKey);
      }
      return next;
    });
  }, []);

  const formatLegendLabel = useCallback(
    (value: string | number | undefined, entry: LegendPayload) => {
      const seriesKey = String(entry.dataKey ?? entry.value ?? '').trim();
      const isHidden = seriesKey ? hiddenSeries.has(seriesKey) : false;
      const formattedValue = String(value ?? '').trim();

      return (
        <span
          className={cn(
            'text-foreground',
            isHidden && 'opacity-50 line-through'
          )}
        >
          {formattedValue}
        </span>
      );
    },
    [hiddenSeries]
  );

  // Chart configuration
  const chartConfig = {
    ...DEFAULT_CHART_CONFIG,
    ...config,
  };

  const resolvedMargin = useMemo(() => {
    const margin = {
      ...DEFAULT_CHART_CONFIG.margin,
      ...chartConfig.margin,
    };

    return {
      ...margin,
      right: Math.max(margin.right ?? 0, 16),
    };
  }, [chartConfig.margin]);

  const xAxisPadding = useMemo(() => {
    if (chartType === 'bar') {
      return { left: 8, right: 20 };
    }

    if (
      chartType === 'line' ||
      chartType === 'area' ||
      chartType === 'scatter'
    ) {
      return { left: 4, right: 16 };
    }

    return { left: 0, right: 0 };
  }, [chartType]);

  const xAxisInterval = useMemo(() => {
    if (chartData.length <= 6) {
      return 0;
    }

    return Math.max(Math.ceil(chartData.length / 6) - 1, 0);
  }, [chartData.length]);

  // Common props for all charts
  const commonProps = {
    data: chartData as unknown as NormalizedChartData[],
    margin: resolvedMargin,
    ...CHART_ANIMATIONS[chartType as keyof typeof CHART_ANIMATIONS],
  };

  // Render grid
  const renderGrid = () => {
    if (!chartConfig.showGrid) return null;
    return (
      <CartesianGrid
        strokeDasharray={GRID_CONFIG.strokeDasharray}
        stroke={GRID_CONFIG.stroke}
      />
    );
  };

  // Render axes
  const renderXAxis = () => (
    <XAxis
      dataKey={config.xAxisKey || 'time'}
      padding={xAxisPadding}
      interval={xAxisInterval}
      tick={AXIS_CONFIG.tick}
      tickLine={AXIS_CONFIG.tickLine}
      axisLine={AXIS_CONFIG.axisLine}
      tickFormatter={value =>
        formatTimestampByFrequency(String(value), frequency)
      }
    />
  );

  const renderYAxis = () => (
    <YAxis
      interval={0}
      tick={AXIS_CONFIG.tick}
      tickLine={AXIS_CONFIG.tickLine}
      axisLine={AXIS_CONFIG.axisLine}
      label={{
        value: `${getPollutantLabel(pollutant)} (${getPollutantUnits(pollutant)})`,
        angle: 0,
        position: 'top',
        offset: 30,
        style: {
          textAnchor: 'start',
          fontSize: '12px',
          fill: 'rgb(100, 116, 139)',
        },
      }}
    />
  );

  // Render tooltip
  const renderTooltip = () => {
    if (!chartConfig.showTooltip) return null;
    return (
      <Tooltip
        content={
          <HoverAwareTooltip
            onHoverChange={handleHoverIndexChange}
            focusedDataKey={activeKey}
            pollutant={pollutant}
            frequency={frequency}
            aqiConfig={aqiConfig}
          />
        }
        wrapperStyle={{ zIndex: 9999 }}
        wrapperClassName="recharts-tooltip"
      />
    );
  };

  // Render legend
  const renderLegend = () => {
    if (!chartConfig.showLegend || seriesKeys.length <= 1) return null;
    return (
      <Legend
        align="right"
        verticalAlign="bottom"
        layout="horizontal"
        iconType="circle"
        iconSize={8}
        wrapperStyle={{
          paddingTop: '20px',
          paddingBottom: '10px',
          fontSize: '12px',
          cursor: 'pointer',
        }}
        formatter={formatLegendLabel}
        onClick={handleLegendClick}
      />
    );
  };

  // Render reference lines for air quality standards
  const renderReferenceLines = () => {
    if (!localShowReferenceLines) return null;

    return (
      <CustomReferenceLine
        pollutant={pollutant}
        standards={standards}
        showReferenceLine={localShowReferenceLines}
      />
    );
  };

  // Active dot rendered at the hovered point. Hovering a dot narrows the
  // focus to that series (the rest of the chart grays out).
  const renderActiveDot = useCallback(
    (dotProps: {
      dataKey?: unknown;
      index?: number;
      cx?: number;
      cy?: number;
      fill?: string;
    }) => {
      if (dotProps.cx == null || dotProps.cy == null) {
        return null;
      }
      const dotKey = String(dotProps.dataKey ?? '');
      const isFocused = activeKey === dotKey;
      const isDimmed = activeKey !== null && !isFocused;
      return (
        <circle
          cx={dotProps.cx}
          cy={dotProps.cy}
          r={isFocused ? 6 : 4.5}
          fill={isDimmed ? GRAYED_SERIES_COLOR : dotProps.fill || '#145DFF'}
          stroke="hsl(var(--background))"
          strokeWidth={2}
          className="cursor-pointer"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.25))' }}
          onMouseEnter={() => focusSeries(dotKey)}
          onMouseLeave={scheduleSeriesBlur}
        />
      );
    },
    [activeKey, focusSeries, scheduleSeriesBlur]
  );

  // Custom line shape: renders a fat transparent hit path UNDER the visible
  // curve. Recharts attaches the Line's mouse events to the rendered curve,
  // so the wide invisible stroke makes the WHOLE line hoverable — hovering
  // anywhere along the line focuses that series (best-practice hit area,
  // same idea as ECharts' emphasis hit zones).
  const renderLineShape = useCallback(
    // Recharts' Line `shape` receives its full curve props (points, stroke,
    // events...) — typed loosely to match ActiveShape's own contract.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (shapeProps: Record<string, any>) => (
      <g>
        <Curve
          {...shapeProps}
          stroke="transparent"
          strokeWidth={14}
          strokeLinecap="round"
        />
        <Curve {...shapeProps} />
      </g>
    ),
    []
  );

  // Render series for line/area charts. The best-practice "emphasis focus"
  // pattern (ECharts `focus: 'series'`, Nivo highlight): hovering ON A LINE
  // focuses that series — it stays vivid and slightly thicker while every
  // other series is grayed out in a skeleton tone. The tooltip then
  // concentrates on the focused series and you can walk along its points
  // for details.
  const renderLineSeries = (Component: typeof Line | typeof Area) => {
    return seriesKeys.map((key, index) => {
      const isHidden = hiddenSeries.has(key);
      const color =
        config.seriesColors?.[key] || config.color || getPrimaryColor(index);
      const isFocused = activeKey === key;
      const state =
        activeIndex === null
          ? 'idle'
          : activeKey === null
            ? 'band'
            : isFocused
              ? 'focused'
              : 'dimmed';

      const strokeColor = state === 'dimmed' ? GRAYED_SERIES_COLOR : color;
      const strokeOpacity =
        state === 'dimmed' ? GRAYED_OPACITY : state === 'band' ? SOFT_BLUR : FULL_OPACITY;
      const strokeWidth =
        (config.strokeWidth || 2) + (state === 'focused' ? 1 : 0);
      const areaFillOpacity =
        Component === Area
          ? (config.fillOpacity || 0.1) * strokeOpacity
          : undefined;

      // Resting dots appear while the chart is hovered and mark the points
      // along the line; their invisible fat circles add extra hover targets
      // near the line and cover single-point series (no curve is drawn).
      const renderSeriesDot = (dotProps: {
        dataKey?: unknown;
        cx?: number;
        cy?: number;
        index?: number;
      }) => {
        if (activeIndex === null || dotProps.cx == null || dotProps.cy == null) {
          return null;
        }
        const isDimmed = activeKey !== null && !isFocused;
        return (
          <g>
            <circle
              cx={dotProps.cx}
              cy={dotProps.cy}
              r={16}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => focusSeries(key)}
              onMouseLeave={scheduleSeriesBlur}
            />
            <circle
              cx={dotProps.cx}
              cy={dotProps.cy}
              r={isFocused ? 3.5 : 2.5}
              fill={isDimmed ? GRAYED_SERIES_COLOR : color}
              stroke="none"
            />
          </g>
        );
      };

      return (
        <Component
          key={key}
          type="monotone"
          dataKey={key}
          stroke={strokeColor}
          fill={Component === Area ? strokeColor : undefined}
          fillOpacity={areaFillOpacity}
          strokeOpacity={strokeOpacity}
          strokeWidth={strokeWidth}
          dot={renderSeriesDot}
          activeDot={renderActiveDot}
          connectNulls={false}
          hide={isHidden}
          onMouseEnter={() => focusSeries(key)}
          onMouseLeave={scheduleSeriesBlur}
          {...(Component === Line ? { shape: renderLineShape } : {})}
        />
      );
    });
  };

  // Render series for bar charts. Hovering a specific bar keeps it at full
  // color with rounded corners + outline; every other bar (other series and
  // other time slots) is grayed out in a skeleton tone.
  const renderBarSeries = () => {
    return seriesKeys.map((key, index) => {
      const isHidden = hiddenSeries.has(key);
      const color =
        config.seriesColors?.[key] || config.color || getPrimaryColor(index);

      return (
        <Bar
          key={key}
          dataKey={key}
          fill={color}
          hide={isHidden}
          onMouseEnter={(_data: unknown, itemIndex: number) => {
            focusSeries(key);
            setActiveIndex(itemIndex);
          }}
          onMouseLeave={scheduleSeriesBlur}
        >
          {chartData.map((_, cellIndex) => {
            const focused = activeKey === key && activeIndex === cellIndex;
            const dimmed = activeKey !== null && !focused;
            return (
              <Cell
                key={`cell-${key}-${cellIndex}`}
                fill={dimmed ? GRAYED_SERIES_COLOR : color}
                fillOpacity={dimmed ? GRAYED_OPACITY : FULL_OPACITY}
                // Recharts types only allow `number` here; the tuple form is
                // valid at runtime (rounded top corners on the focused bar).
                radius={
                  focused
                    ? ([6, 6, 0, 0] as [number, number, number, number] as unknown as number)
                    : 0
                }
                stroke={focused ? color : 'none'}
                strokeWidth={focused ? 1.5 : 0}
              />
            );
          })}
        </Bar>
      );
    });
  };

  // Proximity focus — makes the WHOLE line the hover target (see
  // HoverFocusController). Line/area charts get it; bars already have
  // precise per-bar hover targets.
  const renderHoverFocusController = () =>
    chartType === 'line' || chartType === 'area' ? (
      <Customized
        component={
          <HoverFocusController seriesKeys={seriesKeys} onFocus={focusSeries} />
        }
      />
    ) : null;

  // Render chart based on type
  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps} onMouseLeave={clearHover}>
            {renderGrid()}
            {renderXAxis()}
            {renderYAxis()}
            {renderTooltip()}
            {renderLegend()}
            {renderLineSeries(Line)}
            {renderReferenceLines()}
            {renderHoverFocusController()}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps} onMouseLeave={clearHover}>
            {renderGrid()}
            {renderXAxis()}
            {renderYAxis()}
            {renderTooltip()}
            {renderLegend()}
            {renderLineSeries(Area)}
            {renderReferenceLines()}
            {renderHoverFocusController()}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart
            {...commonProps}
            onMouseLeave={clearHover}
            // Use configured values for optimal bar appearance
            barCategoryGap={BAR_CHART_CONFIG.barCategoryGap}
            barGap={BAR_CHART_CONFIG.barGap}
            maxBarSize={BAR_CHART_CONFIG.maxBarSize}
          >
            {renderGrid()}
            {renderXAxis()}
            {renderYAxis()}
            {renderTooltip()}
            {renderLegend()}
            {renderBarSeries()}
            {renderReferenceLines()}
          </BarChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps} onMouseLeave={clearHover}>
            {renderGrid()}
            {renderXAxis()}
            {renderYAxis()}
            {renderTooltip()}
            {renderLegend()}
            {seriesKeys.map((key, index) => {
              const isHidden = hiddenSeries.has(key);
              const color =
                config.seriesColors?.[key] ||
                config.color ||
                getPrimaryColor(index);

              return (
                <Scatter key={key} dataKey={key} fill={color} hide={isHidden}>
                  {chartData.map((_, pointIndex) => {
                    const dimmed =
                      activeIndex !== null && activeIndex !== pointIndex;
                    return (
                      <Cell
                        key={`scatter-cell-${key}-${pointIndex}`}
                        fill={dimmed ? GRAYED_SERIES_COLOR : color}
                        fillOpacity={dimmed ? GRAYED_OPACITY : FULL_OPACITY}
                      />
                    );
                  })}
                </Scatter>
              );
            })}
            {renderReferenceLines()}
          </ScatterChart>
        );

      case 'radar':
        const radarProps = {
          data: chartData as unknown as NormalizedChartData[],
          margin: { top: 20, right: 30, left: 20, bottom: 20 },
          ...CHART_ANIMATIONS.line,
        };
        return (
          <RadarChart {...radarProps}>
            <PolarGrid />
            <PolarAngleAxis dataKey={config.xAxisKey || 'time'} />
            <PolarRadiusAxis />
            {renderTooltip()}
            {renderLegend()}
            {seriesKeys.map((key, index) => {
              const isHidden = hiddenSeries.has(key);
              const color =
                config.seriesColors?.[key] ||
                config.color ||
                getPrimaryColor(index);

              return (
                <Radar
                  key={key}
                  dataKey={key}
                  stroke={color}
                  fill={color}
                  fillOpacity={config.fillOpacity || 0.1}
                  hide={isHidden}
                />
              );
            })}
          </RadarChart>
        );

      case 'pie':
        const pieProps = {
          data: chartData as unknown as NormalizedChartData[],
          margin: { top: 20, right: 30, left: 20, bottom: 20 },
          ...CHART_ANIMATIONS.line,
        };
        return (
          <PieChart {...pieProps}>
            {renderTooltip()}
            {renderLegend()}
            <Pie
              data={chartData}
              dataKey={config.dataKey || 'value'}
              nameKey={config.xAxisKey || 'site'}
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={({ name, value }) => `${name}: ${value}`}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    config.seriesColors?.[`cell-${index}`] ||
                    getPrimaryColor(index)
                  }
                />
              ))}
            </Pie>
          </PieChart>
        );

      default:
        return null;
    }
  };

  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-96 text-muted-foreground',
          className
        )}
      >
        <div className="text-center">
          <p className="text-lg font-medium">No data available</p>
          <p className="text-sm">Please check your data source or try again</p>
        </div>
      </div>
    );
  }

  const Container = responsive ? ResponsiveContainer : 'div';
  // Only apply a minWidth when an explicit numeric width is provided in config.
  // Defaulting to a hard-coded min-width caused horizontal overflow on narrow
  // screens (mobile). Let the chart shrink naturally in responsive mode and
  // allow the surrounding layout to control sizing. Add `min-w-0` to the
  // wrapper so flex children can shrink.
  const explicitMinWidth =
    chartConfig.width && typeof chartConfig.width === 'number'
      ? chartConfig.width
      : undefined;
  const responsiveWidth =
    typeof chartConfig.width === 'number'
      ? chartConfig.width
      : typeof chartConfig.width === 'string' &&
          /^\d+%$/.test(chartConfig.width)
        ? (chartConfig.width as `${number}%`)
        : ('100%' as const);

  const containerProps = responsive
    ? { width: responsiveWidth, height: chartConfig.height }
    : explicitMinWidth
      ? {
          style: {
            width: chartConfig.width || '100%',
            height: chartConfig.height,
            minWidth: explicitMinWidth,
          },
        }
      : {
          style: {
            width: chartConfig.width || '100%',
            height: chartConfig.height,
          },
        };

  const chart = renderChart();
  if (!chart) return null;

  return (
    <div className={cn('w-full min-h-[300px] min-w-0', className)}>
      <Container {...containerProps}>{chart}</Container>
    </div>
  );
};
