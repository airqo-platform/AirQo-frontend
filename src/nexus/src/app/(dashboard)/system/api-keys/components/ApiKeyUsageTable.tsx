'use client';

import React, { memo, useMemo } from 'react';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { EmptyState } from '@/shared/components/ui';
import { formatWithPattern } from '@/shared/utils/dateUtils';
import type {
  ApiKeyUsageLeaderboardKey,
  ApiKeyUsageMeta,
  ApiKeyUsageOwner,
} from '@/shared/types/apiKeyUsage';
import ApiKeyStatusBadges from './ApiKeyStatusBadges';
import { ownerDisplayName, ownerPrimaryOrganisation } from '../utils';

/** Row-count choices, matching the other admin analytics tables. */
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const DASH = '—';

/**
 * MultiSelectTable keys rows by `id`; client_id is unique per dataset, so it
 * doubles as the row key.
 */
type LeaderboardRow = ApiKeyUsageLeaderboardKey & { id: string };

/**
 * ServerSideTable only forwards search props when BOTH are defined, and
 * MultiSelectTable treats a defined handler as "server-side search" — which is
 * what keeps the full server page from being sliced to its internal page size.
 * This API has no text-search param, so the box stays hidden.
 */
const noop = () => undefined;

export interface ApiKeyUsageTableProps {
  keys: ApiKeyUsageLeaderboardKey[];
  meta?: ApiKeyUsageMeta;
  loading: boolean;
  isRefreshing?: boolean;
  page: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  onRowClick: (clientId: string) => void;
}

const OwnerCell: React.FC<{ owner: ApiKeyUsageOwner | null }> = ({ owner }) => {
  if (!owner) {
    return <span className="text-muted-foreground">{DASH}</span>;
  }

  const team = ownerPrimaryOrganisation(owner);
  const primary = ownerDisplayName(owner);

  return (
    <div className="min-w-0 max-w-[18rem]">
      <div className="truncate font-medium text-foreground" title={primary}>
        {primary}
      </div>
      {owner.name && owner.email && (
        <div
          className="truncate text-xs text-muted-foreground"
          title={owner.email}
        >
          {owner.email}
        </div>
      )}
      {team && (
        <div className="truncate text-xs text-muted-foreground" title={team}>
          {team}
        </div>
      )}
    </div>
  );
};

/**
 * Leaderboard table for API key usage. Presentational: the page owns
 * fetching and pagination state, this component only wires it to the shared
 * ServerSideTable.
 *
 * Search is deliberately disabled (`searchable={false}`) while still passing
 * a controlled `searchTerm`/`onSearchChange`. That pair is the supported
 * server-pagination escape hatch: MultiSelectTable only skips its own
 * client-side page slice when search is controlled, so without it a 20/25/50
 * -row server page would silently render just the first 10 rows. The API has
 * no text-search parameter, so the box itself stays hidden.
 */
const ApiKeyUsageTable: React.FC<ApiKeyUsageTableProps> = memo(
  ({
    keys,
    meta,
    loading,
    isRefreshing,
    page,
    limit,
    onPageChange,
    onLimitChange,
    onRowClick,
  }) => {
    const rows = useMemo(
      () => keys.map(key => ({ ...key, id: key.client_id })),
      [keys]
    );

    const columns = useMemo(
      () => [
        {
          key: 'rank',
          label: '#',
          sortable: false,
          width: '3.5rem',
          render: (_value: unknown, item: LeaderboardRow) => (
            <span className="tabular-nums text-muted-foreground">
              {item.rank}
            </span>
          ),
        },
        {
          key: 'key_name',
          label: 'Key',
          sortable: false,
          render: (_value: unknown, item: LeaderboardRow) => (
            <div className="min-w-0 max-w-[20rem]">
              <div
                className="truncate font-medium text-foreground"
                title={item.key_name}
              >
                {item.key_name || DASH}
              </div>
              <div
                className="truncate text-xs text-muted-foreground"
                title={item.client_name}
              >
                {item.client_name}
              </div>
              <ApiKeyStatusBadges
                apiKey={item}
                className="mt-1 flex flex-wrap gap-1"
              />
            </div>
          ),
        },
        {
          key: 'owner',
          label: 'Owner',
          sortable: false,
          render: (_value: unknown, item: LeaderboardRow) => (
            <OwnerCell owner={item.owner} />
          ),
        },
        {
          key: 'calls',
          label: 'Calls',
          sortable: false,
          cellClassName: 'whitespace-nowrap text-right tabular-nums',
          headerClassName: 'text-right',
          render: (_value: unknown, item: LeaderboardRow) =>
            item.calls.toLocaleString(),
        },
        {
          key: 'share_pct',
          label: 'Share',
          sortable: false,
          cellClassName: 'whitespace-nowrap text-right tabular-nums',
          headerClassName: 'text-right',
          render: (_value: unknown, item: LeaderboardRow) =>
            `${item.share_pct.toFixed(1)}%`,
        },
        {
          key: 'active_days',
          label: 'Active days',
          sortable: false,
          cellClassName: 'whitespace-nowrap text-right tabular-nums',
          headerClassName: 'text-right',
          render: (_value: unknown, item: LeaderboardRow) =>
            item.active_days.toLocaleString(),
        },
        {
          key: 'peak_day_calls',
          label: 'Peak day',
          sortable: false,
          cellClassName: 'whitespace-nowrap text-right tabular-nums',
          headerClassName: 'text-right',
          render: (_value: unknown, item: LeaderboardRow) =>
            item.peak_day_calls.toLocaleString(),
        },
        {
          key: 'last_seen',
          label: 'Last seen',
          sortable: false,
          cellClassName: 'whitespace-nowrap',
          render: (_value: unknown, item: LeaderboardRow) =>
            item.last_seen
              ? formatWithPattern(item.last_seen, 'MMM d, yyyy HH:mm')
              : '—',
        },
      ],
      []
    );

    return (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          Ranked by call volume for the selected range. Select a row to open
          that key&apos;s detail view.
        </p>

        {/*
        `ServerSideTable` renders the shared `MultiSelectTable`, which already
        supplies its own card, header band and server-pagination footer — so it
        is used bare here (same as system/users) instead of being nested in
        another Card. The `title` fills that header band; leaving it empty
        renders a blank strip.
      */}
        <ServerSideTable<LeaderboardRow>
          title="Top API keys"
          data={rows}
          columns={columns}
          loading={loading}
          isRefreshing={isRefreshing}
          currentPage={meta?.page ?? page}
          totalPages={meta?.pages ?? 0}
          pageSize={meta?.limit ?? limit}
          totalItems={meta?.total ?? 0}
          onPageChange={onPageChange}
          onPageSizeChange={onLimitChange}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onRowClick={item => onRowClick(item.client_id)}
          emptyComponent={
            <EmptyState
              title="No API key calls in this range"
              description="API key history starts from the day this feature was deployed, so earlier usage cannot be shown."
              className="min-h-[240px] border-0 bg-transparent"
            />
          }
          searchable={false}
          searchTerm=""
          onSearchChange={noop}
        />
      </div>
    );
  }
);

ApiKeyUsageTable.displayName = 'ApiKeyUsageTable';

export default ApiKeyUsageTable;
