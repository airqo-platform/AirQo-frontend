'use client';

import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { LegendPayload } from 'recharts';
import type { ChartSeriesModel, VisualizerChartConfig } from '../types';
import {
  mapAqiCategoryToLevel,
  getAirQualityColor,
} from '@/shared/utils/airQuality';
import {
  formatColumnLabel,
  formatMeasurementLabel,
} from '../utils/measurementLabels';
import { cn } from '@/shared/lib/utils';
import { REFERENCE_LINES } from '@/shared/utils/airQuality';

interface VisualizerChartProps {
  model: ChartSeriesModel;
  config: VisualizerChartConfig;
  className?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    color?: string;
    dataKey?: string | number;
    name?: string | number;
    value?: string | number;
  }>;
  label?: string | number;
  /** Index of the hovered data point (recharts 3 passes this to tooltip content) */
  activeIndex?: number | undefined;
  /**
   * When set, only entries of this series are shown — hover focus mode.
   * The rest of the chart is blurred to match.
   */
  focusedDataKey?: string | null;
}

interface ReferenceLineDescriptor {
  value: number;
  label: string;
  color: string;
}

type RgbColor = [number, number, number];

const DEFAULT_PRIMARY_RGB: RgbColor = [20, 95, 255];
const WHITE_RGB: RgbColor = [255, 255, 255];
const BLACK_RGB: RgbColor = [0, 0, 0];
const ORANGE_RGB: RgbColor = [249, 115, 22];
const PURPLE_RGB: RgbColor = [124, 58, 237];
const TEAL_RGB: RgbColor = [15, 118, 110];
const CHART_AXIS_COLOR = '#64748b';
const CHART_GRID_COLOR = '#e2e8f0';

const clampColorChannel = (value: number) =>
  Math.max(0, Math.min(255, Math.round(value)));

const parseRgbTriplet = (value: string | null | undefined): RgbColor | null => {
  if (!value) {
    return null;
  }

  const parts = value.match(/\d+(\.\d+)?/g);

  if (!parts || parts.length < 3) {
    return null;
  }

  const channels = parts.slice(0, 3).map(part => Number(part));

  if (channels.some(channel => !Number.isFinite(channel))) {
    return null;
  }

  return [
    clampColorChannel(channels[0]),
    clampColorChannel(channels[1]),
    clampColorChannel(channels[2]),
  ];
};

const mixRgb = (
  source: RgbColor,
  target: RgbColor,
  amount: number
): RgbColor => [
  clampColorChannel(source[0] + (target[0] - source[0]) * amount),
  clampColorChannel(source[1] + (target[1] - source[1]) * amount),
  clampColorChannel(source[2] + (target[2] - source[2]) * amount),
];

const rgbToString = ([red, green, blue]: RgbColor) =>
  `rgb(${red}, ${green}, ${blue})`;

const buildPrimaryPalette = (primary: RgbColor) => [
  rgbToString(primary),
  rgbToString(mixRgb(primary, BLACK_RGB, 0.3)),
  rgbToString(mixRgb(primary, BLACK_RGB, 0.5)),
  rgbToString(mixRgb(primary, BLACK_RGB, 0.7)),
  rgbToString(mixRgb(primary, WHITE_RGB, 0.22)),
  rgbToString(mixRgb(primary, WHITE_RGB, 0.42)),
  rgbToString(mixRgb(primary, WHITE_RGB, 0.62)),
  rgbToString(mixRgb(primary, ORANGE_RGB, 0.22)),
  rgbToString(mixRgb(primary, PURPLE_RGB, 0.22)),
  rgbToString(mixRgb(primary, TEAL_RGB, 0.18)),
];

const getCurrentPrimaryRgb = (): RgbColor => {
  if (typeof window === 'undefined') {
    return DEFAULT_PRIMARY_RGB;
  }

  const rootStyles = window.getComputedStyle(document.documentElement);
  return (
    parseRgbTriplet(rootStyles.getPropertyValue('--primary')) ??
    DEFAULT_PRIMARY_RGB
  );
};

const usePrimaryChartPalette = () => {
  const [palette, setPalette] = React.useState(() =>
    buildPrimaryPalette(DEFAULT_PRIMARY_RGB)
  );

  React.useEffect(() => {
    const refreshPalette = () =>
      setPalette(buildPrimaryPalette(getCurrentPrimaryRgb()));

    refreshPalette();

    const observer = new MutationObserver(refreshPalette);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    return () => observer.disconnect();
  }, []);

  return palette;
};

const formatAxisTick = (value: string | number) => {
  const text = String(value ?? '');
  const parsed = Date.parse(text);

  if (!Number.isNaN(parsed)) {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
    }).format(new Date(parsed));
  }

  return text.length > 18 ? `${text.slice(0, 18)}...` : text;
};

const formatNumber = (value: unknown) => {
  if (typeof value !== 'number') {
    return String(value ?? '');
  }

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value);
};

const ChartTooltip = ({
  active,
  payload,
  label,
  focusedDataKey = null,
}: ChartTooltipProps) => {
  if (!active || !payload?.length) {
    return null;
  }

  const visiblePayload = focusedDataKey
    ? payload.filter(entry => String(entry.dataKey) === focusedDataKey)
    : payload;

  if (visiblePayload.length === 0) {
    return null;
  }

  return (
    <div className="max-w-xs rounded-md border border-border bg-card p-3 text-sm shadow-lg">
      <div className="mb-2 font-medium text-foreground">
        {formatAxisTick(String(label ?? ''))}
      </div>
      <div className="space-y-1.5">
        {visiblePayload.map((entry, index) => (
          <div
            key={`${entry.dataKey ?? entry.name}-${index}`}
            className="flex items-center justify-between gap-4"
          >
            <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="truncate">{String(entry.name)}</span>
            </span>
            <span className="shrink-0 font-medium text-foreground">
              {formatNumber(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface HoverAwareTooltipProps extends ChartTooltipProps {
  onHoverChange: (index: number | null) => void;
}

/**
 * Wraps the tooltip so the chart can learn the hovered data index
 * (recharts 3 passes `activeIndex` to tooltip content). The index drives the
 * "focus one item, blur the rest" emphasis on lines, bars and points.
 */
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

  return <ChartTooltip {...tooltipProps} focusedDataKey={focusedDataKey} />;
};

/** Dimming rules: 1 = full, lower = blurred (see the focus/blur design below) */
const FULL_OPACITY = 1;
const SOFT_BLUR = 0.6;
/** Opacity of grayed-out (non-focused) series/bars */
const GRAYED_OPACITY = 0.55;
/** "Skeleton" gray applied to non-focused series when one is focused */
const GRAYED_SERIES_COLOR = 'rgb(var(--muted-foreground))';

const getCustomReferenceLine = (
  config: VisualizerChartConfig
): ReferenceLineDescriptor[] => {
  if (
    typeof config.referenceValue !== 'number' ||
    !Number.isFinite(config.referenceValue)
  ) {
    return [];
  }

  return [
    {
      value: config.referenceValue,
      label: config.referenceLabel || 'Reference',
      color: config.referenceColor || '#DC2626',
    },
  ];
};

const getReferenceLines = (
  config: VisualizerChartConfig
): ReferenceLineDescriptor[] => {
  if (!config.showReferenceLines) {
    return [];
  }

  const customLines = getCustomReferenceLine(config);

  if (config.type === 'histogram') {
    return customLines;
  }

  const pollutant = /pm\s*10|pm10|pm_?10/i.test(config.metricColumn)
    ? 'pm10'
    : /pm\s*2[\W_]*5|pm25|pm_?2_?5/i.test(config.metricColumn)
      ? 'pm2_5'
      : null;

  if (!pollutant) {
    return customLines;
  }

  const standard = REFERENCE_LINES[config.standards];
  const annual =
    pollutant === 'pm10' ? standard.PM10_ANNUAL : standard.PM25_ANNUAL;
  const daily = pollutant === 'pm10' ? standard.PM10_24HR : standard.PM25_24HR;
  const standardsLabel = config.standards.replace('NEMA_', 'NEMA ');

  return [
    {
      value: annual,
      label: `${standardsLabel} annual`,
      color: '#DC2626',
    },
    {
      value: daily,
      label: `${standardsLabel} 24h`,
      color: '#F97316',
    },
    ...customLines,
  ];
};

const getNumericSeriesValues = (model: ChartSeriesModel) =>
  model.data.flatMap(point =>
    model.seriesKeys
      .map(key => point[key])
      .filter((value): value is number => typeof value === 'number')
  );

const getYAxisDomain = (
  model: ChartSeriesModel,
  referenceLines: ReferenceLineDescriptor[]
) => {
  const values = [
    ...getNumericSeriesValues(model),
    ...referenceLines.map(line => line.value),
  ].filter(value => Number.isFinite(value));

  if (values.length === 0) {
    return ['auto', 'auto'];
  }

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const span = Math.max(1, maxValue - minValue);
  const includeZero = minValue > 0 && minValue / Math.max(maxValue, 1) > 0.4;
  const min = includeZero ? 0 : Math.floor(minValue - span * 0.08);
  const max = Math.ceil(maxValue + span * 0.12);

  return [min, max];
};

interface ReferenceLineLabelProps {
  viewBox?: {
    x?: number;
    y?: number;
    width?: number;
  };
  value?: string;
  color: string;
  offset?: number;
}

const ReferenceLineLabel = ({
  viewBox,
  value,
  color,
  offset = 0,
}: ReferenceLineLabelProps) => {
  if (!viewBox || !value) {
    return null;
  }

  const { x = 0, y = 0, width = 0 } = viewBox;
  const labelWidth = Math.min(160, Math.max(78, value.length * 6.2));
  const labelX = x + width - labelWidth - 4;
  const labelY = Math.max(4, y - 10 - offset);

  return (
    <g>
      <rect
        x={labelX}
        y={labelY}
        width={labelWidth}
        height={18}
        fill={color}
        rx={4}
        ry={4}
        stroke={color}
        strokeWidth={1}
      />
      <text
        x={labelX + labelWidth / 2}
        y={labelY + 12.5}
        textAnchor="middle"
        fill="#ffffff"
        fontSize="10"
        fontWeight={600}
      >
        {value}
      </text>
    </g>
  );
};

export const VisualizerChart: React.FC<VisualizerChartProps> = ({
  model,
  config,
  className,
}) => {
  const primaryPalette = usePrimaryChartPalette();
  const [hiddenSeries, setHiddenSeries] = React.useState<Set<string>>(
    () => new Set()
  );

  // Hover focus state: `activeIndex` is the hovered data point (any series);
  // `activeKey` narrows the focus to ONE series (its line/bar under the
  // cursor). Everything else is blurred while either is set.
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [activeKey, setActiveKey] = React.useState<string | null>(null);

  const handleHoverIndexChange = React.useCallback((index: number | null) => {
    setActiveIndex(index);
  }, []);

  const clearHover = React.useCallback(() => {
    setActiveIndex(null);
    setActiveKey(null);
  }, []);

  // Reset the emphasis when the dataset changes so stale hover state can't
  // leave the chart blurred after a data refresh.
  React.useEffect(() => {
    clearHover();
  }, [model.data, clearHover]);

  React.useEffect(() => {
    setHiddenSeries(current => {
      const available = new Set(model.seriesKeys);
      const next = new Set(
        Array.from(current).filter(key => available.has(key))
      );

      return next.size === current.size ? current : next;
    });
  }, [model.seriesKeys]);

  // Active dot rendered at the hovered point. Hovering a dot narrows the
  // focus to that series (the rest of the chart grays out).
  const renderActiveDot = React.useCallback(
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
          onMouseEnter={() => setActiveKey(dotKey)}
          onMouseLeave={() => setActiveKey(null)}
        />
      );
    },
    [activeKey]
  );

  if (model.emptyReason || model.data.length === 0) {
    return (
      <div
        className={cn(
          'flex min-h-[320px] items-center justify-center text-center text-muted-foreground',
          className
        )}
      >
        <div>
          <p className="text-sm font-medium text-foreground">No chart data</p>
          <p className="mt-1 text-sm">
            {model.emptyReason || 'Adjust the chart columns and try again.'}
          </p>
        </div>
      </div>
    );
  }

  const getChartSeriesColor = (key: string, index: number) =>
    config.seriesColors[key] || primaryPalette[index % primaryPalette.length];
  const getChartPieColor = (label: string, index: number) =>
    config.seriesColors[label] ||
    (() => {
      const level = mapAqiCategoryToLevel(label);
      return level === 'no-value'
        ? primaryPalette[index % primaryPalette.length]
        : getAirQualityColor(level);
    })();
  const grid = config.showGrid ? (
    <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
  ) : null;
  const tooltip = (
    <Tooltip
      content={
        <HoverAwareTooltip
          onHoverChange={handleHoverIndexChange}
          focusedDataKey={activeKey}
        />
      }
    />
  );
  const handleLegendClick = (entry: LegendPayload) => {
    const seriesKey = String(entry.dataKey ?? entry.value ?? '').trim();
    if (!seriesKey) {
      return;
    }

    setHiddenSeries(current => {
      const next = new Set(current);
      if (next.has(seriesKey)) {
        next.delete(seriesKey);
      } else {
        next.add(seriesKey);
      }
      return next;
    });
  };
  const formatLegendLabel = (
    value: string | number | undefined,
    entry: LegendPayload
  ) => {
    const seriesKey = String(entry.dataKey ?? entry.value ?? '').trim();
    const isHidden = seriesKey ? hiddenSeries.has(seriesKey) : false;

    return (
      <span
        className={cn('text-foreground', isHidden && 'opacity-50 line-through')}
      >
        {String(value ?? '')}
      </span>
    );
  };
  const legend = config.showLegend ? (
    <Legend
      align="right"
      verticalAlign="bottom"
      layout="horizontal"
      iconType="circle"
      iconSize={8}
      wrapperStyle={{
        paddingTop: 18,
        paddingBottom: 8,
        fontSize: '12px',
        cursor: 'pointer',
      }}
      formatter={formatLegendLabel}
      onClick={handleLegendClick}
    />
  ) : null;
  const referenceLines = getReferenceLines(config);
  const yAxisDomain = getYAxisDomain(model, referenceLines);
  const showXAxisLabel = config.showXAxisLabel !== false;
  const showYAxisLabel = config.showYAxisLabel !== false;
  const xAxisLabel =
    (config.xAxisLabel || formatColumnLabel(config.xColumn))
      .trim()
      .slice(0, 80) || 'Record order';
  const yAxisLabel =
    (
      config.yAxisLabel ||
      formatMeasurementLabel(model.yLabel || config.metricColumn)
    )
      .trim()
      .slice(0, 80) || 'Value';
  const cartesianMargin = {
    top: 34,
    right: 28,
    bottom: showXAxisLabel
      ? config.showLegend
        ? 42
        : 30
      : config.showLegend
        ? 24
        : 16,
    left: showYAxisLabel ? 10 : 6,
  };
  const renderReferenceLines = () =>
    referenceLines.map((line, index) => (
      <ReferenceLine
        key={`${line.label}-${line.value}`}
        y={line.value}
        stroke={line.color}
        strokeDasharray="5 5"
        strokeWidth={2}
        ifOverflow="extendDomain"
        label={
          <ReferenceLineLabel
            value={`${line.label}: ${line.value}`}
            color={line.color}
            offset={index * 18}
          />
        }
      />
    ));

  // Render series for line/area charts. The best-practice "emphasis focus"
  // pattern (ECharts `focus: 'series'`, Nivo highlight): hovering anywhere on
  // the chart reveals per-point dots; moving onto a LINE (its dots) focuses
  // that series — it stays vivid and slightly thicker while every other
  // series is grayed out in a skeleton tone. The tooltip then concentrates
  // on the focused series and you can walk along its points for details.
  const renderLineSeries = () =>
    model.seriesKeys.map((key, index) => {
      const color = getChartSeriesColor(key, index);
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
      const strokeWidth = 2 + (state === 'focused' ? 1 : 0);

      // Resting dots double as per-series hover targets: an invisible fat
      // hit circle makes the whole line hoverable (recharts has no per-line
      // mouse events, so the dots are the hit area — same trick ECharts uses
      // with emphasis symbols).
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
              onMouseEnter={() => setActiveKey(key)}
              onMouseLeave={() => setActiveKey(null)}
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
        <Line
          key={key}
          type="monotone"
          dataKey={key}
          name={model.seriesLabels[key] ?? key}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeOpacity={strokeOpacity}
          dot={renderSeriesDot}
          activeDot={renderActiveDot}
          connectNulls={false}
          hide={hiddenSeries.has(key)}
        />
      );
    });

  const renderAreaSeries = () =>
    model.seriesKeys.map((key, index) => {
      const color = getChartSeriesColor(key, index);
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
      const strokeWidth = 2 + (state === 'focused' ? 1 : 0);

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
              onMouseEnter={() => setActiveKey(key)}
              onMouseLeave={() => setActiveKey(null)}
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
        <Area
          key={key}
          type="monotone"
          dataKey={key}
          name={model.seriesLabels[key] ?? key}
          stroke={strokeColor}
          fill={strokeColor}
          fillOpacity={0.16 * strokeOpacity}
          strokeOpacity={strokeOpacity}
          strokeWidth={strokeWidth}
          dot={renderSeriesDot}
          activeDot={renderActiveDot}
          connectNulls={false}
          hide={hiddenSeries.has(key)}
        />
      );
    });

  // Render series for bar charts. Hovering a specific bar keeps it at full
  // color with rounded corners + outline; every other bar (other series and
  // other time slots) is grayed out in a skeleton tone.
  const renderBarSeries = () =>
    model.seriesKeys.map((key, index) => {
      const color = getChartSeriesColor(key, index);

      return (
        <Bar
          key={key}
          dataKey={key}
          name={model.seriesLabels[key] ?? key}
          fill={color}
          maxBarSize={72}
          hide={hiddenSeries.has(key)}
          onMouseEnter={(_data: unknown, itemIndex: number) => {
            setActiveKey(key);
            setActiveIndex(itemIndex);
          }}
          onMouseLeave={() => {
            setActiveKey(null);
          }}
        >
          {model.data.map((_, cellIndex) => {
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

  const renderCartesianAxes = (isScatter = false) => (
    <>
      <XAxis
        dataKey={model.xKey}
        type={isScatter ? 'number' : 'category'}
        height={showXAxisLabel ? 52 : 38}
        tick={{ fontSize: '12px', fill: CHART_AXIS_COLOR }}
        tickLine={{ stroke: CHART_GRID_COLOR }}
        axisLine={{ stroke: CHART_GRID_COLOR }}
        tickFormatter={formatAxisTick}
        interval={isScatter ? undefined : 'preserveStartEnd'}
        label={
          showXAxisLabel
            ? {
                value: xAxisLabel,
                position: 'insideBottom',
                offset: -8,
                style: {
                  textAnchor: 'middle',
                  fill: CHART_AXIS_COLOR,
                  fontSize: '12px',
                  fontWeight: 500,
                },
              }
            : undefined
        }
      />
      <YAxis
        width={showYAxisLabel ? 54 : 42}
        tick={{ fontSize: '12px', fill: CHART_AXIS_COLOR }}
        tickLine={{ stroke: CHART_GRID_COLOR }}
        axisLine={{ stroke: CHART_GRID_COLOR }}
        domain={yAxisDomain}
        label={
          showYAxisLabel
            ? {
                value: yAxisLabel,
                angle: -90,
                position: 'insideLeft',
                offset: 6,
                style: {
                  textAnchor: 'middle',
                  fill: CHART_AXIS_COLOR,
                  fontSize: '12px',
                  fontWeight: 500,
                },
              }
            : undefined
        }
      />
    </>
  );

  const renderChart = () => {
    if (config.type === 'pie') {
      const valueKey = model.seriesKeys[0];

      return (
        <PieChart>
          {tooltip}
          {legend}
          <Pie
            data={model.data}
            dataKey={valueKey}
            nameKey={model.xKey}
            name={model.seriesLabels[valueKey] ?? valueKey}
            cx="50%"
            cy="50%"
            outerRadius={120}
            label={({ name, value }) => `${name}: ${formatNumber(value)}`}
          >
            {model.data.map((entry, index) => {
              const label = String(entry[model.xKey] ?? `Segment ${index + 1}`);

              return <Cell key={label} fill={getChartPieColor(label, index)} />;
            })}
          </Pie>
        </PieChart>
      );
    }

    if (config.type === 'radar') {
      return (
        <RadarChart
          data={model.data}
          margin={{ top: 20, right: 40, bottom: 20, left: 40 }}
        >
          <PolarGrid stroke={CHART_GRID_COLOR} />
          <PolarAngleAxis
            dataKey={model.xKey}
            tick={{ fontSize: '12px', fill: CHART_AXIS_COLOR }}
          />
          <PolarRadiusAxis
            tick={{ fontSize: '11px', fill: CHART_AXIS_COLOR }}
          />
          {tooltip}
          {legend}
          {model.seriesKeys.map((key, index) => {
            const color = getChartSeriesColor(key, index);

            return (
              <Radar
                key={key}
                dataKey={key}
                name={model.seriesLabels[key] ?? key}
                stroke={color}
                fill={color}
                fillOpacity={0.16}
                hide={hiddenSeries.has(key)}
              />
            );
          })}
        </RadarChart>
      );
    }

    if (config.type === 'scatter') {
      return (
        <ScatterChart data={model.data} margin={cartesianMargin} onMouseLeave={clearHover}>
          {grid}
          {renderCartesianAxes(true)}
          {tooltip}
          {legend}
          {renderReferenceLines()}
          {model.seriesKeys.map((key, index) => {
            const seriesData = model.data.filter(point => point[key] !== null);
            const color = getChartSeriesColor(key, index);
            return (
              <Scatter
                key={key}
                data={seriesData}
                dataKey={key}
                name={model.seriesLabels[key] ?? key}
                fill={color}
                hide={hiddenSeries.has(key)}
              >
                {seriesData.map((_, pointIndex) => {
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
        </ScatterChart>
      );
    }

    if (config.type === 'area') {
      return (
        <AreaChart data={model.data} margin={cartesianMargin} onMouseLeave={clearHover}>
          {grid}
          {renderCartesianAxes()}
          {tooltip}
          {legend}
          {renderAreaSeries()}
          {renderReferenceLines()}
        </AreaChart>
      );
    }

    if (config.type === 'bar' || config.type === 'histogram') {
      return (
        <BarChart data={model.data} margin={cartesianMargin} onMouseLeave={clearHover}>
          {grid}
          {renderCartesianAxes()}
          {tooltip}
          {legend}
          {renderBarSeries()}
          {renderReferenceLines()}
        </BarChart>
      );
    }

    if (config.type === 'composed') {
      return (
        <ComposedChart data={model.data} margin={cartesianMargin} onMouseLeave={clearHover}>
          {grid}
          {renderCartesianAxes()}
          {tooltip}
          {legend}
          {renderReferenceLines()}
          {model.seriesKeys.map((key, index) => {
            const color = getChartSeriesColor(key, index);
            const name = model.seriesLabels[key] ?? key;

            if (index === 0) {
              return (
                <Bar
                  key={key}
                  dataKey={key}
                  name={name}
                  fill={color}
                  fillOpacity={0.72}
                  maxBarSize={64}
                  hide={hiddenSeries.has(key)}
                  onMouseEnter={(_data: unknown, itemIndex: number) => {
                    setActiveKey(key);
                    setActiveIndex(itemIndex);
                  }}
                  onMouseLeave={() => {
                    setActiveKey(null);
                  }}
                >
                  {model.data.map((_, cellIndex) => {
                    const focusedCell =
                      activeKey === key && activeIndex === cellIndex;
                    const dimmed = activeKey !== null && !focusedCell;
                    return (
                      <Cell
                        key={`cell-${key}-${cellIndex}`}
                        fill={dimmed ? GRAYED_SERIES_COLOR : color}
                        fillOpacity={dimmed ? GRAYED_OPACITY * 0.72 : FULL_OPACITY * 0.72}
                        radius={
                          focusedCell
                            ? ([6, 6, 0, 0] as [number, number, number, number] as unknown as number)
                            : 0
                        }
                        stroke={focusedCell ? color : 'none'}
                        strokeWidth={focusedCell ? 1.5 : 0}
                      />
                    );
                  })}
                </Bar>
              );
            }

            const isFocused = activeKey === key;
            const state =
              activeIndex === null
                ? 'idle'
                : activeKey === null
                  ? 'band'
                  : isFocused
                    ? 'focused'
                    : 'dimmed';
            const strokeColor =
              state === 'dimmed' ? GRAYED_SERIES_COLOR : color;
            const strokeOpacity =
              state === 'dimmed' ? GRAYED_OPACITY : state === 'band' ? SOFT_BLUR : FULL_OPACITY;
            const strokeWidth = 2 + (state === 'focused' ? 1 : 0);

            const renderSeriesDot = (dotProps: {
              dataKey?: unknown;
              cx?: number;
              cy?: number;
              index?: number;
            }) => {
              if (
                activeIndex === null ||
                dotProps.cx == null ||
                dotProps.cy == null
              ) {
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
                    onMouseEnter={() => setActiveKey(key)}
                    onMouseLeave={() => setActiveKey(null)}
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
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={name}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeOpacity={strokeOpacity}
                dot={renderSeriesDot}
                activeDot={renderActiveDot}
                hide={hiddenSeries.has(key)}
              />
            );
          })}
        </ComposedChart>
      );
    }

    return (
      <LineChart data={model.data} margin={cartesianMargin} onMouseLeave={clearHover}>
        {grid}
        {renderCartesianAxes()}
        {tooltip}
        {legend}
        {renderLineSeries()}
        {renderReferenceLines()}
      </LineChart>
    );
  };

  return (
    <div className={cn('min-w-0', className)} style={{ height: config.height }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};
