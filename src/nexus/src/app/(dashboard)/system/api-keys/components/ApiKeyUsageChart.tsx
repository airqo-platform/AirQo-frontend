'use client';

import React, { memo, useMemo } from 'react';
import { SegmentedTabs, type SegmentedTabOption } from '@/shared/components/ui';
import type { ApiKeyUsageTimeseriesData } from '@/shared/types/apiKeyUsage';
import ApiKeyChartCard from './ApiKeyChartCard';
import { buildUsageSeries, formatUsageLabel } from '../utils';

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
 * The endpoint returns one value per label for every series, which
 * `buildUsageSeries` pivots into the long format the shared `DynamicChart`
 * consumes. The endpoint's own caps bound the payload (92 daily buckets, 336
 * hourly) and the shared chart decimates above its render budget, so this stays
 * cheap regardless of how many keys are charted.
 *
 * Areas are only used for a single series: with several un-stacked series,
 * overlapping filled areas misrepresent the values, so lines are used instead.
 * Hourly buckets are UTC instants rendered in local time; day buckets keep
 * their UTC calendar day.
 */
const ApiKeyUsageChart: React.FC<ApiKeyUsageChartProps> = memo(
  ({
    data,
    interval,
    onIntervalChange,
    loading = false,
    error = null,
    onRefresh,
  }) => {
    const {
      data: chartData,
      labels,
      seriesCount,
    } = useMemo(
      () =>
        data
          ? buildUsageSeries(data)
          : { data: [], labels: {}, seriesCount: 0 },
      [data]
    );

    return (
      <ApiKeyChartCard
        title="API key calls over time"
        subtitle="Busiest keys, plus all keys combined"
        data={chartData}
        type={seriesCount > 1 ? 'line' : 'area'}
        seriesLabels={labels}
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
  }
);

ApiKeyUsageChart.displayName = 'ApiKeyUsageChart';

export default ApiKeyUsageChart;
