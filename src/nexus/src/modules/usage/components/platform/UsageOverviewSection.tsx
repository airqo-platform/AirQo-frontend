'use client';

import React, { useMemo } from 'react';
import { Card } from '@/shared/components/ui';
import { LoadingState } from '@/shared/components/ui';
import { EmptyState } from '@/shared/components/ui';
import { ChartContainer } from '@/shared/components/charts';
import { getPrimaryColor } from '@/shared/components/charts/constants';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
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
  const chartData = useMemo(
    () =>
      (data?.daily ?? []).map(day => ({
        date: day.date,
        activeUsers: day.active_users,
        pageViews: day.page_views,
        apiCalls: day.api_calls,
        sessions: day.sessions,
      })),
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
        subtitle={`Per UTC day`}
        loading={isFetching}
        showMoreButton={false}
        minContentHeight="250px"
      >
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
              <defs>
                <linearGradient id="ov-active" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={getPrimaryColor(0)}
                    stopOpacity={0.6}
                  />
                  <stop
                    offset="95%"
                    stopColor={getPrimaryColor(0)}
                    stopOpacity={0.05}
                  />
                </linearGradient>
                <linearGradient id="ov-pv" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={getPrimaryColor(1)}
                    stopOpacity={0.6}
                  />
                  <stop
                    offset="95%"
                    stopColor={getPrimaryColor(1)}
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgb(226,232,240)"
                strokeOpacity={0.5}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: 'rgb(100,116,139)' }}
                tickLine={{ stroke: 'rgb(226,232,240)' }}
                axisLine={{ stroke: 'rgb(226,232,240)' }}
                tickFormatter={v => formatWithPattern(String(v), 'MMM dd')}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: 'rgb(100,116,139)' }}
                tickLine={{ stroke: 'rgb(226,232,240)' }}
                axisLine={{ stroke: 'rgb(226,232,240)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="activeUsers"
                name="Active users"
                stroke={getPrimaryColor(0)}
                fill="url(#ov-active)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="pageViews"
                name="Page views"
                stroke={getPrimaryColor(1)}
                fill="url(#ov-pv)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
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
