'use client';

import React, { useMemo } from 'react';
import { format } from 'date-fns';
import {
  EmptyState,
  SegmentedTabs,
  type SegmentedTabOption,
} from '@/shared/components/ui';
import { ChartContainer, DynamicChart } from '@/shared/components/charts';
import type { NormalizedChartData } from '@/shared/components/charts/types';
import type { ApiKeyUsageTimeseriesData } from '@/shared/types/apiKeyUsage';

/** Series key for the aggregated remainder of all keys outside the top N. */
const OTHER_SERIES = 'otherKeys';
/** Series key for the all-keys total line. */
const TOTAL_SERIES = 'totalCalls';

const INTERVAL_OPTIONS: SegmentedTabOption<'day' | 'hour'>[] = [
  { value: 'day', label: 'Day' },
  { value: 'hour', label: 'Hour' },
];

export interface ApiKeyUsageChartProps {
  data?: ApiKeyUsageTimeseriesData;
  interval: 'day' | 'hour';
  onIntervalChange: (i: 'day' | 'hour') => void;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

/**
 * `day` labels are UTC calendar days (`YYYY-MM-DD`): formatting them as local
 * dates keeps the printed day identical in every timezone.
 * `hour` labels are UTC ISO instants, so they are converted to the viewer's
 * local time — all timestamps are displayed in local time.
 */
const formatAxisLabel = (value: string, interval: 'day' | 'hour'): string => {
  const parsed =
    interval === 'day' ? new Date(`${value}T00:00:00`) : new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return interval === 'day'
    ? format(parsed, 'MMM d')
    : format(parsed, 'MMM d, HH:mm');
};

const formatTooltipLabel = (
  value: string,
  interval: 'day' | 'hour'
): string => {
  const parsed =
    interval === 'day' ? new Date(`${value}T00:00:00`) : new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return interval === 'day'
    ? format(parsed, 'MMM d, yyyy')
    : format(parsed, 'MMM d, yyyy HH:mm');
};

/**
 * "Calls over time" for the busiest API keys. Presentational — the page owns
 * fetching and the day/hour interval. Renders the shared `ChartContainer` +
 * `DynamicChart` so axis, tooltip, legend and zoom behaviour match every other
 * analytics chart in the app.
 */
const ApiKeyUsageChart: React.FC<ApiKeyUsageChartProps> = ({
  data,
  interval,
  onIntervalChange,
  loading = false,
  error = null,
  onRefresh,
}) => {
  const { chartData, seriesLabels, hasCalls } = useMemo(() => {
    if (!data) {
      return {
        chartData: [] as NormalizedChartData[],
        seriesLabels: {} as Record<string, string>,
        hasCalls: false,
      };
    }

    const showOther =
      data.other !== null && data.other.some(value => value > 0);
    const labels: Record<string, string> = {};
    const rows: NormalizedChartData[] = [];

    data.labels.forEach((label, index) => {
      const row = (site: string, value: number) => {
        rows.push({ time: label, value, site, device_id: '' });
      };

      data.series.forEach(series => {
        row(series.client_id, series.data[index] ?? 0);
      });

      if (showOther && data.other) {
        row(OTHER_SERIES, data.other[index] ?? 0);
      }

      row(TOTAL_SERIES, data.total[index] ?? 0);
    });

    data.series.forEach(series => {
      labels[series.client_id] = series.owner_name
        ? `${series.label} — ${series.owner_name}`
        : series.label;
    });

    if (showOther) {
      labels[OTHER_SERIES] = 'Other keys';
    }
    labels[TOTAL_SERIES] = 'All keys';

    return {
      chartData: rows,
      seriesLabels: labels,
      hasCalls: data.total.some(value => value > 0),
    };
  }, [data]);

  // Never paint "No calls recorded" over a load that hasn't landed yet.
  const showEmptyState = !hasCalls && !(loading && !data);

  return (
    <ChartContainer
      title="API key calls over time"
      subtitle="Busiest keys, plus all keys combined"
      showMoreButton={false}
      showReferenceLines={false}
      loading={loading}
      error={error}
      onRefresh={onRefresh}
      minContentHeight="300px"
      toolbar={
        <SegmentedTabs
          ariaLabel="Usage interval"
          options={INTERVAL_OPTIONS}
          value={interval}
          onChange={onIntervalChange}
        />
      }
    >
      {showEmptyState ? (
        <EmptyState
          compact
          title="No calls recorded"
          description="Data starts from the day this feature was deployed, so earlier usage is not available."
        />
      ) : (
        <DynamicChart
          data={chartData}
          config={{
            type: 'area',
            showGrid: true,
            showTooltip: true,
            showLegend: true,
            height: 300,
            xAxisTickFormatter: value => formatAxisLabel(value, interval),
            tooltipDateFormatter: label =>
              formatTooltipLabel(String(label), interval),
          }}
          seriesLabels={seriesLabels}
          autoSelectType={false}
          yAxisLabel="Calls"
          tooltipValueSuffix=""
          tooltipValuePrecision={0}
          showAirQualityLevel={false}
        />
      )}
    </ChartContainer>
  );
};

export default ApiKeyUsageChart;
