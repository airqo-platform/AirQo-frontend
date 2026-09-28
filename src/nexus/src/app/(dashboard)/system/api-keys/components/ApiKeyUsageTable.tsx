'use client';

import React, { useCallback, useMemo } from 'react';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { Card, EmptyState } from '@/shared/components/ui';
import { formatWithPattern } from '@/shared/utils/dateUtils';
import type {
  ApiKeyUsageLeaderboardKey,
  ApiKeyUsageMeta,
} from '@/shared/types/apiKeyUsage';

/** Row-count choices, matching the other admin analytics tables. */
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

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

/**
 * MultiSelectTable keys rows by `id`; client_id is unique per dataset.
 * The index signature mirrors ServerSideTable's `TableItem` constraint —
 * plain interfaces don't get one implicitly.
 */
type LeaderboardRow = ApiKeyUsageLeaderboardKey & {
  id: string;
  [key: string]: unknown;
};

const BADGE_BASE =
  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium';

const BADGE_SUSPENDED = `${BADGE_BASE} bg-red-100 text-red-800`;
const BADGE_DELETED = `${BADGE_BASE} bg-gray-100 text-gray-800`;
const BADGE_INACTIVE = `${BADGE_BASE} bg-amber-100 text-amber-800`;

const OwnerCell: React.FC<{ owner: ApiKeyUsageLeaderboardKey['owner'] }> = ({
  owner,
}) => {
  if (!owner) {
    return <span className="text-muted-foreground">—</span>;
  }

  // `airqo` is always the last organisation, so index 0 is the owner's team.
  const team = owner.organisations?.[0]?.title;
  const primary = owner.name || owner.email || '—';

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
 * a controlled `searchTerm`/`onSearchChange` — MultiSelectTable only skips
 * its client-side page slicing when search is controlled, so this is what
 * lets a full 20-row server page render instead of the built-in first 10.
 */
const ApiKeyUsageTable: React.FC<ApiKeyUsageTableProps> = ({
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

  // Stable identity: ServerSideTable only forwards search props when BOTH
  // are defined, and MultiSelectTable treats a defined handler as
  // "server-side search" (no client-side slicing).
  const stableNoop = useCallback(() => undefined, []);

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
              {item.key_name || '—'}
            </div>
            <div
              className="truncate text-xs text-muted-foreground"
              title={item.client_name}
            >
              {item.client_name}
            </div>
            {(item.auto_suspended ||
              item.deleted ||
              item.client_active === false) && (
              <div className="mt-1 flex flex-wrap gap-1">
                {item.auto_suspended && (
                  <span className={BADGE_SUSPENDED}>Suspended</span>
                )}
                {item.deleted && <span className={BADGE_DELETED}>Deleted</span>}
                {item.client_active === false && (
                  <span className={BADGE_INACTIVE}>Inactive</span>
                )}
              </div>
            )}
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
    <Card className="space-y-4 p-4">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-foreground">Top API keys</h2>
        <p className="text-xs text-muted-foreground">
          Ranked by call volume for the selected range. Select a row for that
          key&apos;s detail view.
        </p>
      </div>

      <ServerSideTable<LeaderboardRow>
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
        onSearchChange={stableNoop}
      />
    </Card>
  );
};

export default ApiKeyUsageTable;
