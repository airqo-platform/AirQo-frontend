'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Card, MetricCard } from '@/shared/components/ui';
import {
  DataTable,
  type DataTableColumn,
} from '@/shared/components/ui/data-table';
import { formatWithPattern } from '@/shared/utils/dateUtils';
import type {
  ApiKeyUsageDetailTotals,
  ApiKeyUsageKey,
} from '@/shared/types/apiKeyUsage';
import ApiKeyStatusBadges from './ApiKeyStatusBadges';

const noop = () => undefined;

/**
 * Identity card for one API key: what the key is, its status, when it expires,
 * and who owns it (linked to that user's usage pages).
 */
export const ApiKeyOwnerCard: React.FC<{ apiKey: ApiKeyUsageKey }> = ({
  apiKey,
}) => {
  const owner = apiKey.owner;

  return (
    <Card className="space-y-4 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3
            className="truncate text-base font-semibold text-foreground"
            title={apiKey.key_name}
          >
            {apiKey.key_name || '—'}
          </h3>
          <p
            className="truncate text-sm text-muted-foreground"
            title={apiKey.client_name}
          >
            {apiKey.client_name}
          </p>
          <p
            className="truncate text-xs text-muted-foreground"
            title={apiKey.client_id}
          >
            {apiKey.client_id}
          </p>
        </div>

        <ApiKeyStatusBadges
          apiKey={apiKey}
          showTier
          className="flex flex-wrap gap-1.5"
        />
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
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Owner
            </p>
            <p className="text-sm font-medium text-foreground">
              {owner.name ?? 'No name set'}
            </p>
            {owner.email && (
              <p className="truncate text-sm text-muted-foreground">
                {owner.email}
              </p>
            )}
          </div>

          {owner.organisations?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {owner.organisations.map((organisation, index) => (
                <span
                  key={organisation.group_id}
                  title={index === 0 ? 'Primary organisation' : undefined}
                  className={
                    index === 0
                      ? 'inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'
                      : 'inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground'
                  }
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

/** Stat cards summarising a key's usage in the selected range. */
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

export interface ApiKeyBreakdownTableProps<T> {
  title: string;
  subtitle?: string;
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (item: T) => string;
  emptyText?: string;
}

/**
 * Static breakdown table (routes, source IPs) in a card. Sorting is
 * caller-owned — the shared DataTable runs in its non-interactive controlled
 * mode, since these lists are already ranked by the API.
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
    <Card className="space-y-3 p-4">
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
