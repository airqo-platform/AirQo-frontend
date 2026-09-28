'use client';

import React, { useMemo } from 'react';
import { EmptyState } from '@/shared/components/ui';
import { ChartContainer, DynamicChart } from '@/shared/components/charts';
import { resolveDefaultSeriesColor } from '@/shared/components/charts/colors';
import type {
  ChartType,
  NormalizedChartData,
} from '@/shared/components/charts/types';

/** Series key used when a chart carries a single value series. */
const SINGLE_SERIES = 'value';

export interface UsageLabelOptions {
  /** `day` buckets are UTC calendar days; `hour` buckets are UTC instants. */
  interval: 'day' | 'hour';
  /** Overrides the default MMM d / MMM d, HH:mm tick label. */
  pattern?: string;
}

export interface ApiKeyChartCardProps {
  title: string;
  subtitle?: string;
  /** One point per bucket per series; series are keyed by `site`. */
  data: NormalizedChartData[];
  type?: Extract<ChartType, 'area' | 'bar' | 'line'>;
  /** Display names for each series key, applied to legend and tooltip. */
  seriesLabels?: Record<string, string>;
  /** Palette index for single-series charts. */
  colorIndex?: number;
  height?: number;
  valueLabel?: string;
  formatX?: (value: string) => string;
  /** Formats tooltip headers; falls back to the raw label. */
  formatTooltipLabel?: (value: string | number) => string;
  showLegend?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  toolbar?: React.ReactNode;
}

/**
 * Single card used by every API key usage chart. Wraps the shared
 * `ChartContainer` + `DynamicChart` pair so axis, tooltip, legend, zoom and
 * empty/loading behaviour are identical across the leaderboard and detail
 * views, and renders the shared `EmptyState` when a chart has no data.
 */
const ApiKeyChartCard: React.FC<ApiKeyChartCardProps> = ({
  title,
  subtitle,
  data,
  type = 'bar',
  seriesLabels,
  colorIndex = 0,
  height = 300,
  valueLabel,
  formatX,
  formatTooltipLabel,
  showLegend = true,
  emptyTitle = 'No calls recorded',
  emptyDescription,
  loading = false,
  error = null,
  onRefresh,
  toolbar,
}) => {
  const hasValues = useMemo(() => data.some(point => point.value > 0), [data]);

  return (
    <ChartContainer
      title={title}
      subtitle={subtitle}
      showMoreButton={false}
      showReferenceLines={false}
      loading={loading}
      error={error}
      onRefresh={onRefresh}
      minContentHeight={`${height + 20}px`}
      toolbar={toolbar}
    >
      {hasValues ? (
        <DynamicChart
          data={data}
          config={{
            type,
            showGrid: true,
            showTooltip: true,
            showLegend,
            height,
            // Single-series charts take the palette colour; multi-series
            // charts get one colour per series from the shared palette.
            ...(seriesLabels
              ? {}
              : { color: resolveDefaultSeriesColor(colorIndex) }),
            ...(formatX ? { xAxisTickFormatter: formatX } : {}),
            ...(formatTooltipLabel
              ? { tooltipDateFormatter: formatTooltipLabel }
              : {}),
          }}
          seriesLabels={seriesLabels}
          autoSelectType={false}
          yAxisLabel={valueLabel}
          tooltipValueSuffix=""
          tooltipValuePrecision={0}
          showAirQualityLevel={false}
        />
      ) : (
        <div className="flex items-center justify-center" style={{ height }}>
          {emptyDescription ? (
            <EmptyState
              compact
              title={emptyTitle}
              description={emptyDescription}
            />
          ) : (
            <p className="text-sm text-muted-foreground">{emptyTitle}</p>
          )}
        </div>
      )}
    </ChartContainer>
  );
};

export interface ApiKeyBarChartCardProps<
  T extends { name: string; value: number },
> {
  title: string;
  subtitle?: string;
  data: T[];
  colorIndex?: number;
  height?: number;
  valueLabel?: string;
  formatX?: (value: string) => string;
  emptyText?: string;
}

/**
 * Single-series breakdown chart (days in range, hour-of-day profile, …).
 * Values arrive as `{ name, value }` pairs and become one value series.
 */
export function ApiKeyBarChartCard<T extends { name: string; value: number }>({
  title,
  subtitle,
  data,
  colorIndex = 0,
  height = 280,
  valueLabel,
  formatX,
  emptyText,
}: ApiKeyBarChartCardProps<T>): React.ReactElement {
  const chartData = useMemo<NormalizedChartData[]>(
    () =>
      data.map(point => ({
        time: point.name,
        value: point.value,
        site: SINGLE_SERIES,
        device_id: '',
      })),
    [data]
  );

  return (
    <ApiKeyChartCard
      title={title}
      subtitle={subtitle}
      data={chartData}
      type="bar"
      colorIndex={colorIndex}
      height={height}
      valueLabel={valueLabel}
      formatX={formatX}
      showLegend={false}
      emptyTitle={emptyText ?? 'No data available'}
    />
  );
}

export default ApiKeyChartCard;
