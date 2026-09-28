'use client';

import React, { useMemo } from 'react';
import { SegmentedTabs, type SegmentedTabOption } from '@/shared/components/ui';
import type { NormalizedChartData } from '@/shared/components/charts/types';
import type { ApiKeyUsageTimeseriesData } from '@/shared/types/apiKeyUsage';
import ApiKeyChartCard from './ApiKeyChartCard';
import { formatUsageLabel } from '../utils';

/** Series key for the aggregated remainder of all keys outside the top N. */
const OTHER_SERIES = 'otherKeys';
/** Series key for the all-keys total line. */
const TOTAL_SERIES = 'totalCalls';

const INTERVAL_OPTIONS: SegmentedTabOption<'day' | 'hour'>[] = [
  { value: 'day', label: 'Day' },
  { value: 'hour', label: 'Hour' },
];

const NO_CALLS_DESCRIPTION =
  'Data starts from the day this feature was deployed, so earlier usage is not available.';

export interface ApiKeyUsageChartProps {
  data?: ApiKeyUsageTimeseriesData;
  interval: 'day' | 'hour';
  onIntervalChange: (i: 'day' | 'hour') => void;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

/**
 * "Calls over time" for the busiest API keys. Presentational — the page owns
 * fetching and the day/hour interval.
 *
 * The endpoint returns per-label arrays, so each label is pivoted into one
 * point per series: every top key, the aggregated `other` remainder (when the
 * API reports it) and the all-keys total. Hourly buckets are UTC instants and
 * are rendered in local time; day buckets keep their UTC calendar day.
 */
const ApiKeyUsageChart: React.FC<ApiKeyUsageChartProps> = ({
  data,
  interval,
  onIntervalChange,
  loading = false,
  error = null,
  onRefresh,
}) => {
  const { chartData, seriesLabels } = useMemo(() => {
    if (!data) {
      return {
        chartData: [] as NormalizedChartData[],
        seriesLabels: {} as Record<string, string>,
      };
    }

    const includeOther = data.other !== null && data.other.some(v => v > 0);
    const rows: NormalizedChartData[] = [];
    const labels: Record<string, string> = {};

    data.labels.forEach((label, index) => {
      const push = (site: string, value: number) =>
        rows.push({ time: label, value, site, device_id: '' });

      data.series.forEach(series =>
        push(series.client_id, series.data[index] ?? 0)
      );
      if (includeOther && data.other)
        push(OTHER_SERIES, data.other[index] ?? 0);
      push(TOTAL_SERIES, data.total[index] ?? 0);
    });

    data.series.forEach(series => {
      labels[series.client_id] = series.owner_name
        ? `${series.label} — ${series.owner_name}`
        : series.label;
    });
    if (includeOther) labels[OTHER_SERIES] = 'Other keys';
    labels[TOTAL_SERIES] = 'All keys';

    return { chartData: rows, seriesLabels: labels };
  }, [data]);

  return (
    <ApiKeyChartCard
      title="API key calls over time"
      subtitle="Busiest keys, plus all keys combined"
      data={chartData}
      type="area"
      seriesLabels={seriesLabels}
      valueLabel="Calls"
      formatX={value => formatUsageLabel(value, { interval })}
      formatTooltipLabel={value =>
        formatUsageLabel(String(value), {
          interval,
          pattern: interval === 'day' ? 'MMM d, yyyy' : 'MMM d, yyyy HH:mm',
        })
      }
      emptyDescription={NO_CALLS_DESCRIPTION}
      loading={loading}
      error={error}
      onRefresh={onRefresh}
      toolbar={
        <SegmentedTabs
          ariaLabel="Usage interval"
          options={INTERVAL_OPTIONS}
          value={interval}
          onChange={onIntervalChange}
        />
      }
    />
  );
};

export default ApiKeyUsageChart;
