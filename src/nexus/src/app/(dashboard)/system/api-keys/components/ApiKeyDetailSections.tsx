'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Button, Card, MetricCard } from '@/shared/components/ui';
import {
  DataTable,
  type DataTableColumn,
} from '@/shared/components/ui/data-table';
import { ChartContainer, DynamicChart } from '@/shared/components/charts';
import { resolveDefaultSeriesColor } from '@/shared/components/charts/colors';
import type { NormalizedChartData } from '@/shared/components/charts/types';
import { formatWithPattern } from '@/shared/utils/dateUtils';
import type {
  ApiKeyUsageDetailTotals,
  ApiKeyUsageKey,
} from '@/shared/types/apiKeyUsage';

const BADGE_BASE =
  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium';

const noop = () => undefined;

const sectionLabel =
  'text-xs font-medium uppercase tracking-wide text-muted-foreground';

const primaryChip =
  'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-primary/30 bg-primary/10 text-primary';

const secondaryChip =
  'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-border bg-muted text-muted-foreground';

/**
 * Identity card for one API key: what the key is, its status badges, when it
 * expires, and who owns it (with a link into that user's usage pages).
 */
export const ApiKeyOwnerCard: React.FC<{ apiKey: ApiKeyUsageKey }> = ({
  apiKey,
}) => {
  const owner = apiKey.owner;
  // Everyone belongs to `airqo`, which is always listed last — so the first
  // organisation is the one that identifies the owner's team, which is why
  // the chip at index 0 gets the primary (emphasised) styling.

  return (
    <Card className="p-4 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3
            className="text-base font-semibold text-foreground truncate"
            title={apiKey.key_name}
          >
            {apiKey.key_name || '—'}
          </h3>
          <p
            className="text-sm text-muted-foreground truncate"
            title={apiKey.client_name}
          >
            {apiKey.client_name}
          </p>
          <p
            className="text-xs text-muted-foreground truncate"
            title={apiKey.client_id}
          >
            {apiKey.client_id}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className={`${BADGE_BASE} bg-primary/10 text-primary`}>
            {apiKey.tier}
          </span>
          {!apiKey.client_active && (
            <span className={`${BADGE_BASE} bg-amber-100 text-amber-800`}>
              Inactive
            </span>
          )}
          {apiKey.auto_suspended && (
            <span className={`${BADGE_BASE} bg-red-100 text-red-800`}>
              Suspended
            </span>
          )}
          {apiKey.deleted && (
            <span className={`${BADGE_BASE} bg-gray-100 text-gray-800`}>
              Deleted
            </span>
          )}
        </div>
      </div>

      <div className="text-sm">
        <span className="text-muted-foreground">Key expires: </span>
        <span className="text-foreground">
          {apiKey.key_expires
            ? formatWithPattern(apiKey.key_expires, 'MMM d, yyyy')
            : 'Never'}
        </span>
      </div>

      {owner ? (
        <div className="space-y-3 border-t border-border pt-4">
          <div className="space-y-0.5">
            <p className={sectionLabel}>Owner</p>
            <p className="text-sm font-medium text-foreground">
              {owner.name ?? 'No name set'}
            </p>
            {owner.email && (
              <p className="text-sm text-muted-foreground truncate">
                {owner.email}
              </p>
            )}
          </div>

          {owner.organisations.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {owner.organisations.map((organisation, index) => (
                <span
                  key={organisation.group_id}
                  className={index === 0 ? primaryChip : secondaryChip}
                >
                  {organisation.title}
                </span>
              ))}
            </div>
          )}

          <Link href={`/system/users/${owner.user_id}`}>
            <Button variant="outlined" size="sm">
              View user usage
            </Button>
          </Link>
        </div>
      ) : (
        <p className="border-t border-border pt-4 text-sm text-muted-foreground">
          Owner account no longer exists. Usage is retained.
        </p>
      )}
    </Card>
  );
};

/** Four stat cards summarising a key's usage in the selected range. */
export const ApiKeyTotalsCards: React.FC<{
  totals: ApiKeyUsageDetailTotals;
}> = ({ totals }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <MetricCard label="Calls" value={totals.calls.toLocaleString()} />
    <MetricCard
      label="Active days"
      value={totals.active_days.toLocaleString()}
    />
    <MetricCard
      label="Peak day"
      value={totals.peak_day_calls.toLocaleString()}
    />
    <MetricCard
      label="Last seen"
      value={
        totals.last_seen
          ? formatWithPattern(totals.last_seen, 'MMM d, yyyy HH:mm')
          : '—'
      }
      valueClassName="text-xl"
      hint={
        <span className="mt-1 block truncate text-xs text-muted-foreground">
          {totals.last_ip ?? 'No source IP recorded'}
        </span>
      }
    />
  </div>
);

/** Series key for the single value series drawn by the breakdown charts. */
const BREAKDOWN_SERIES = 'value';

export interface ApiKeyBarChartCardProps<
  T extends { name: string; value: number },
> {
  title: string;
  subtitle?: string;
  data: T[];
  /** Index into the shared chart palette (default 0). */
  colorIndex?: number;
  height?: number;
  /** Formats the x-axis tick labels (category names). */
  formatX?: (value: string) => string;
  /** Y-axis caption, e.g. "Calls". */
  valueLabel?: string;
  emptyText?: string;
}

/**
 * Single-series breakdown chart (days in range, hour-of-day profile…)
 * built on the shared `ChartContainer` + `DynamicChart`, so its axis, tooltip
 * and legend chrome matches every other analytics chart in the app.
 */
export function ApiKeyBarChartCard<T extends { name: string; value: number }>({
  title,
  subtitle,
  data,
  colorIndex = 0,
  height = 280,
  formatX,
  valueLabel,
  emptyText,
}: ApiKeyBarChartCardProps<T>): React.ReactElement {
  const isEmpty = data.every(point => point.value === 0);

  const chartData = useMemo<NormalizedChartData[]>(
    () =>
      data.map(point => ({
        time: point.name,
        value: point.value,
        site: BREAKDOWN_SERIES,
        device_id: '',
      })),
    [data]
  );

  return (
    <ChartContainer
      title={title}
      subtitle={subtitle}
      showMoreButton={false}
      showReferenceLines={false}
      minContentHeight={`${height + 20}px`}
    >
      {isEmpty ? (
        <div className="flex items-center justify-center" style={{ height }}>
          <p className="text-sm text-muted-foreground">
            {emptyText ?? 'No data available'}
          </p>
        </div>
      ) : (
        <DynamicChart
          data={chartData}
          config={{
            type: 'bar',
            showGrid: true,
            showTooltip: true,
            showLegend: false,
            color: resolveDefaultSeriesColor(colorIndex, false),
            height,
            ...(formatX ? { xAxisTickFormatter: formatX } : {}),
          }}
          autoSelectType={false}
          yAxisLabel={valueLabel}
          tooltipValueSuffix=""
          tooltipValuePrecision={0}
          showAirQualityLevel={false}
        />
      )}
    </ChartContainer>
  );
}

export interface ApiKeyBreakdownTableProps<T> {
  title: string;
  subtitle?: string;
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (item: T) => string;
  emptyText?: string;
}

/**
 * Static breakdown table (services, routes, hours, IPs) in a card. Sorting
 * is caller-owned, so the shared DataTable runs in its non-interactive
 * controlled-sort mode.
 */
export function ApiKeyBreakdownTable<T>({
  title,
  subtitle,
  columns,
  rows,
  rowKey,
  emptyText,
}: ApiKeyBreakdownTableProps<T>): React.ReactElement {
  return (
    <Card className="p-4 space-y-3">
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <DataTable
        data={rows}
        columns={columns}
        rowKey={rowKey}
        sortKey={null}
        sortDir="desc"
        onSortChange={noop}
        emptyState={
          <p className="py-6 text-center text-sm text-muted-foreground">
            {emptyText ?? 'No data available'}
          </p>
        }
      />
    </Card>
  );
}
