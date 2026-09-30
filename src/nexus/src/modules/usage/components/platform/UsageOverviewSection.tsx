'use client';

import React, { useMemo } from 'react';
import { Card } from '@/shared/components/ui';
import { LoadingState } from '@/shared/components/ui';
import { EmptyState } from '@/shared/components/ui';
import { ChartContainer } from '@/shared/components/charts';
import { DynamicChart } from '@/shared/components/charts';
import type { NormalizedChartData } from '@/shared/components/charts/types';
import { formatWithPattern } from '@/shared/utils/dateUtils';
import { formatNumber, formatPercent } from '@/modules/usage/utils/format';
import UsageSectionError from '@/modules/usage/components/platform/UsageSectionError';
import UsageChangeBadge from '@/modules/usage/components/shared/UsageChangeBadge';
import UsageMetricCard from '@/modules/usage/components/shared/UsageMetricCard';
import type { UsageOverviewResponse } from '@/shared/types/usage';

/**
 * Overview section: headline KPIs, a daily activity area chart, and the
 * lifecycle breakdown. All data comes from `useUsageOverview` via props.
 */
export interface UsageOverviewSectionProps {
  data: UsageOverviewResponse | null;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  onRetry: () => void;
}

/** Series keys for the daily activity chart (each becomes one area). */
const SERIES_ACTIVE_USERS = 'activeUsers';
const SERIES_PAGE_VIEWS = 'pageViews';

const SERIES_LABELS: Record<string, string> = {
  [SERIES_ACTIVE_USERS]: 'Active users',
  [SERIES_PAGE_VIEWS]: 'Page views',
};

const LifecycleItem: React.FC<{ label: string; value: number }> = ({
  label,
  value,
}) => (
  <div className="flex items-center justify-between py-1.5 text-sm">
    <span className="capitalize text-muted-foreground">{label}</span>
    <span className="font-medium tabular-nums">{formatNumber(value)}</span>
  </div>
);

const UsageOverviewSection: React.FC<UsageOverviewSectionProps> = ({
  data,
  isLoading,
  isFetching,
  error,
  onRetry,
}) => {
  // One NormalizedChartData point per (day, series): the shared DynamicChart
  // groups by the `site` field and pivots each site into its own area series.
  const chartData = useMemo<NormalizedChartData[]>(
    () =>
      (data?.daily ?? []).flatMap(day => [
        {
          time: day.date,
          value: day.active_users,
          site: SERIES_ACTIVE_USERS,
          device_id: '',
        },
        {
          time: day.date,
          value: day.page_views,
          site: SERIES_PAGE_VIEWS,
          device_id: '',
        },
      ]),
    [data]
  );

  if (isLoading && !data) {
    return (
      <LoadingState
        text="Loading usage overview..."
        className="min-h-[200px]"
      />
    );
  }

  if (error && !data) {
    return (
      <UsageSectionError
        title="Failed to load usage overview"
        message={error.message || 'An unexpected error occurred.'}
        onRetry={onRetry}
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="No usage data yet"
        description="Once platform activity is recorded, the overview will appear here."
      />
    );
  }

  const change = data.change_pct ?? {};
  const lifecycle = data.lifecycle ?? {};

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <UsageMetricCard
          label="Monthly Active Users"
          value={formatNumber(data.mau)}
          hint={<UsageChangeBadge value={change.mau} />}
        />
        <UsageMetricCard
          label="Avg Daily Active Users"
          value={formatNumber(data.avg_dau)}
        />
        <UsageMetricCard
          label="Stickiness"
          value={formatPercent(data.stickiness_pct)}
          hint={
            <span className="mt-1 block text-xs font-medium text-muted-foreground">
              DAU / MAU
            </span>
          }
        />
        <UsageMetricCard
          label="Page Views"
          value={formatNumber(data.page_views)}
          hint={<UsageChangeBadge value={change.page_views} />}
        />
        <UsageMetricCard
          label="API Calls"
          value={formatNumber(data.api_calls)}
          hint={<UsageChangeBadge value={change.api_calls} />}
        />
        <UsageMetricCard
          label="Sessions"
          value={formatNumber(data.sessions)}
          hint={<UsageChangeBadge value={change.sessions} />}
        />
      </div>

      {/* Daily activity chart */}
      <ChartContainer
        title="Daily Activity"
        subtitle="Per UTC day"
        loading={isFetching}
        showMoreButton={false}
        minContentHeight="250px"
        showReferenceLines={false}
      >
        {chartData.length > 0 ? (
          <DynamicChart
            data={chartData}
            config={{
              type: 'area',
              showGrid: true,
              showTooltip: true,
              showLegend: true,
              height: 250,
              // The x values are ISO day strings — compact "MMM dd" axis
              // ticks and a full "MMM dd, yyyy" tooltip header.
              xAxisTickFormatter: value => formatWithPattern(value, 'MMM dd'),
              tooltipDateFormatter: label =>
                formatWithPattern(String(label), 'MMM dd, yyyy'),
            }}
            seriesLabels={SERIES_LABELS}
            autoSelectType={false}
            yAxisLabel="Count"
            tooltipValueSuffix=""
            tooltipValuePrecision={0}
            showAirQualityLevel={false}
          />
        ) : (
          <div className="flex items-center justify-center min-h-[200px] text-sm text-muted-foreground">
            No daily data for this period.
          </div>
        )}
      </ChartContainer>

      {/* Lifecycle */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">
          User Lifecycle
        </h3>
        <div className="divide-y divide-border">
          <LifecycleItem label="New" value={lifecycle.new ?? 0} />
          <LifecycleItem label="Returning" value={lifecycle.returning ?? 0} />
          <LifecycleItem
            label="Resurrected"
            value={lifecycle.resurrected ?? 0}
          />
          <LifecycleItem label="Dormant" value={lifecycle.dormant ?? 0} />
        </div>
      </Card>

      {data.basis ? (
        <p className="text-xs text-muted-foreground">Basis: {data.basis}</p>
      ) : null}
    </div>
  );
};

export default UsageOverviewSection;
