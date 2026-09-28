'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui';
import { LoadingState } from '@/shared/components/ui';
import { EmptyState } from '@/shared/components/ui';
import { ErrorBanner } from '@/shared/components/ui/banner';
import Select from '@/shared/components/ui/select';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { toast } from '@/shared/components/ui/toast';
import { AqDownload01 } from '@airqo/icons-react';
import { isAbortError } from '@/shared/lib/retryPolicy';
import {
  DASH,
  formatNumber,
  formatDurationSec,
  formatCsvFilename,
  computeSparklineBars,
} from '@/modules/usage/utils/format';
import UsageSectionError from '@/modules/usage/components/platform/UsageSectionError';
import type {
  UsageOrder,
  UsageSort,
  UsageUsersResponse,
  UsageUserRow,
} from '@/shared/types/usage';

/**
 * Sort keys the users endpoint accepts. The "Sort by" + "Order" selects below
 * drive the SERVER sort through the parent-owned state (the shared table's
 * header sort is client-side only, so the users table keeps all columns
 * non-sortable and owns server sorting here). The response's echoed `sort`
 * (e.g. `last_active` coming back as `last_active_day`) is never used for
 * header state.
 */
const SERVER_SORT_KEYS: readonly UsageSort[] = [
  'total_actions',
  'active_days',
  'page_views',
  'api_calls',
  'sessions',
  'last_active',
];

const SERVER_SORT_LABELS: Record<UsageSort, string> = {
  total_actions: 'Actions',
  active_days: 'Active days',
  page_views: 'Page views',
  api_calls: 'API calls',
  sessions: 'Sessions',
  last_active: 'Last active',
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const DEBOUNCE_MS = 400;

/**
 * Inline sparkline — tiny dependency-free SVG bars from the per-day activity
 * array. Geometry comes from `computeSparklineBars` which guarantees all bars
 * stay inside the `width x height` viewBox regardless of input length.
 * Color tracks the theme primary via CSS variable.
 */
const Sparkline: React.FC<{ values: number[]; width?: number }> = ({
  values,
  width = 96,
}) => {
  const height = 24;
  const bars = computeSparklineBars(values, width, height);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      className="text-primary"
    >
      {bars.map((bar, i) => (
        <rect
          key={i}
          x={bar.x}
          y={bar.y}
          width={bar.width}
          height={bar.height}
          fill="currentColor"
          opacity={0.6}
          rx={1}
        />
      ))}
    </svg>
  );
};

/**
 * Users table section. Search is debounced; pagination, sort, page size, and
 * CSV export all flow through the parent-owned filter state and the M1 hooks.
 * Rendering delegates to the shared `ServerSideTable` (built-in server
 * pagination/footer + controlled search) — no hand-rolled pagination here.
 */
export interface UsageUsersSectionProps {
  data: UsageUsersResponse | null;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  sort: UsageSort;
  order: UsageOrder;
  onSortChange: (sort: UsageSort) => void;
  onOrderChange: (order: UsageOrder) => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  month: string;
  isExporting: boolean;
  exportError: Error | null;
  onExport: () => Promise<void>;
}

const identityOf = (row: UsageUserRow): string => {
  if (row.name && row.name.trim()) return row.name.trim();
  if (row.email && row.email.trim()) return row.email.trim();
  return row.user_id;
};

const orderOptions: { value: UsageOrder; label: string }[] = [
  { value: 'desc', label: 'Descending' },
  { value: 'asc', label: 'Ascending' },
];

const UsageUsersSection: React.FC<UsageUsersSectionProps> = ({
  data,
  isLoading,
  error,
  onRetry,
  search,
  onSearchChange,
  sort,
  order,
  onSortChange,
  onOrderChange,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  month,
  isExporting,
  exportError,
  onExport,
}) => {
  // Local (instant) search box value, debounced into the query param.
  const [localSearch, setLocalSearch] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleSearchInput = (value: string) => {
    setLocalSearch(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      onSearchChange(value.trim());
    }, DEBOUNCE_MS);
  };

  const users = useMemo(
    () => (data?.users ?? []).map(user => ({ ...user, id: user.user_id })),
    [data]
  );

  const totalItems = data?.total ?? 0;
  const totalPages = useMemo(() => {
    const resp = data?.pages ?? null;
    if (resp && resp > 0) return Math.floor(resp);
    return Math.max(1, Math.ceil(totalItems / pageSize));
  }, [data, totalItems, pageSize]);

  const columns = useMemo(
    () => [
      {
        key: 'user',
        label: 'User',
        cellClassName: 'min-w-[180px]',
        render: (_value: unknown, row: UsageUserRow) => (
          <>
            <div className="font-medium truncate">{identityOf(row)}</div>
            {row.email && row.email !== identityOf(row) ? (
              <div className="text-xs text-muted-foreground truncate">
                {row.email}
              </div>
            ) : null}
          </>
        ),
      },
      {
        key: 'active_days',
        label: 'Active days',
        cellClassName: 'tabular-nums',
        render: (_value: unknown, row: UsageUserRow) =>
          formatNumber(row.active_days),
      },
      {
        key: 'total_actions',
        label: 'Actions',
        cellClassName: 'tabular-nums',
        render: (_value: unknown, row: UsageUserRow) =>
          formatNumber(row.total_actions),
      },
      {
        key: 'page_views',
        label: 'Page views',
        cellClassName: 'tabular-nums',
        render: (_value: unknown, row: UsageUserRow) =>
          formatNumber(row.page_views),
      },
      {
        key: 'api_calls',
        label: 'API calls',
        cellClassName: 'tabular-nums',
        render: (_value: unknown, row: UsageUserRow) =>
          formatNumber(row.api_calls),
      },
      {
        key: 'sessions',
        label: 'Sessions',
        cellClassName: 'tabular-nums',
        render: (_value: unknown, row: UsageUserRow) =>
          formatNumber(row.sessions),
      },
      {
        key: 'total_time_sec',
        label: 'Total time',
        cellClassName: 'tabular-nums',
        render: (_value: unknown, row: UsageUserRow) =>
          formatDurationSec(row.total_time_sec),
      },
      {
        key: 'last_active',
        label: 'Last active',
        cellClassName: 'tabular-nums',
        render: (_value: unknown, row: UsageUserRow) =>
          row.last_active_day ?? DASH,
      },
      {
        key: 'activity',
        label: 'Activity',
        render: (_value: unknown, row: UsageUserRow) => (
          <Sparkline values={row.sparkline ?? []} />
        ),
      },
    ],
    []
  );

  const handleSortChange = (event: { target: { value: unknown } }) => {
    onSortChange(event.target.value as UsageSort);
  };

  const handleOrderChange = (event: { target: { value: unknown } }) => {
    onOrderChange(event.target.value as UsageOrder);
  };

  const handleExportClick = async () => {
    try {
      await onExport();
      toast.success(`Exported ${formatCsvFilename(month)}`);
    } catch (err) {
      if (isAbortError(err)) return;
    }
  };

  if (isLoading && !data) {
    return <LoadingState text="Loading users..." className="min-h-[160px]" />;
  }

  if (error && !data) {
    return (
      <UsageSectionError
        title="Failed to load users"
        message={error.message || 'An unexpected error occurred.'}
        onRetry={onRetry}
      />
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex-1">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="users-sort"
              className="text-sm font-medium text-foreground"
            >
              Sort by
            </label>
            <Select id="users-sort" value={sort} onChange={handleSortChange}>
              {SERVER_SORT_KEYS.map(key => (
                <option key={key} value={key}>
                  {SERVER_SORT_LABELS[key]}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="users-order"
              className="text-sm font-medium text-foreground"
            >
              Order
            </label>
            <Select id="users-order" value={order} onChange={handleOrderChange}>
              {orderOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex items-end">
          <Button
            variant="outlined"
            Icon={AqDownload01}
            loading={isExporting}
            onClick={handleExportClick}
            aria-label="Export users CSV"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {exportError && !isAbortError(exportError) ? (
        <ErrorBanner
          title="CSV export failed"
          message={exportError.message || 'Could not export the user list.'}
        />
      ) : null}

      {data && users.length === 0 ? (
        <EmptyState
          title="No users match the current filters"
          description="Try clearing the search or changing the month."
          compact
        />
      ) : (
        <ServerSideTable
          data={users}
          columns={columns}
          className="max-h-[480px] overflow-y-auto"
          searchTerm={localSearch}
          onSearchChange={handleSearchInput}
          searchableColumns={['name', 'email', 'user_id']}
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
        />
      )}
    </Card>
  );
};

export default UsageUsersSection;
