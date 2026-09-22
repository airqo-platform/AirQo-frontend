'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui';
import { LoadingState } from '@/shared/components/ui';
import { EmptyState } from '@/shared/components/ui';
import { ErrorBanner } from '@/shared/components/ui/banner';
import { SearchField } from '@/shared/components/ui';
import Select from '@/shared/components/ui/select';
import { Pagination } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/toast';
import { AqDownload01 } from '@airqo/icons-react';
import { isAbortError } from '@/shared/lib/retryPolicy';
import {
  DASH,
  formatNumber,
  formatDurationSec,
  formatCsvFilename,
  usersPagination,
  computeSparklineBars,
} from '@/modules/usage/utils/format';
import UsageSectionError from '@/modules/usage/components/platform/UsageSectionError';
import type {
  UsageOrder,
  UsageSort,
  UsageUsersResponse,
  UsageUserRow,
} from '@/shared/types/usage';

const SORT_OPTIONS: { value: UsageSort; label: string }[] = [
  { value: 'total_actions', label: 'Total actions' },
  { value: 'active_days', label: 'Active days' },
  { value: 'page_views', label: 'Page views' },
  { value: 'api_calls', label: 'API calls' },
  { value: 'sessions', label: 'Sessions' },
  { value: 'last_active', label: 'Last active' },
];

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
  onExport: () => void;
}

const identityOf = (row: UsageUserRow): string => {
  if (row.name && row.name.trim()) return row.name.trim();
  if (row.email && row.email.trim()) return row.email.trim();
  return row.user_id;
};

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

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      onSearchChange(value.trim());
    }, DEBOUNCE_MS);
  };

  const handleSearchClear = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setLocalSearch('');
    onSearchChange('');
  };

  const users = useMemo(() => data?.users ?? [], [data]);
  const pagination = usersPagination(
    page,
    pageSize,
    data?.total ?? 0,
    data?.pages ?? null
  );

  const handleExportClick = async () => {
    try {
      await onExport();
      toast.success(`Exported ${formatCsvFilename(month)}`);
    } catch (err) {
      if (isAbortError(err)) return;
      const message = err instanceof Error ? err.message : 'CSV export failed';
      toast.error(message);
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:flex-1">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="users-search"
              className="text-sm font-medium text-foreground"
            >
              Search
            </label>
            <SearchField
              id="users-search"
              value={localSearch}
              onChange={handleSearchInput}
              onClear={handleSearchClear}
              placeholder="Name, email, or id..."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="users-sort"
              className="text-sm font-medium text-foreground"
            >
              Sort by
            </label>
            <Select
              id="users-sort"
              value={sort}
              onChange={e => {
                const target = e.target as { value: UsageSort };
                onSortChange(target.value);
              }}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
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
            <Select
              id="users-order"
              value={order}
              onChange={e => {
                const target = e.target as { value: UsageOrder };
                onOrderChange(target.value);
              }}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="users-page-size"
              className="text-sm font-medium text-foreground"
            >
              Per page
            </label>
            <Select
              id="users-page-size"
              value={pageSize}
              onChange={e => {
                const target = e.target as { value: string };
                onPageSizeChange(Number(target.value) || pageSize);
              }}
            >
              {PAGE_SIZE_OPTIONS.map(n => (
                <option key={n} value={n}>
                  {n}
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
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  User
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Active days
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Actions
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Page views
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  API calls
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Sessions
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Total time
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Last active
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Activity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(row => (
                <tr key={row.user_id} className="hover:bg-muted/30">
                  <td className="py-2 pr-4 min-w-[180px]">
                    <div className="font-medium truncate">
                      {identityOf(row)}
                    </div>
                    {row.email && row.email !== identityOf(row) ? (
                      <div className="text-xs text-muted-foreground truncate">
                        {row.email}
                      </div>
                    ) : null}
                  </td>
                  <td className="py-2 pr-4 tabular-nums">
                    {formatNumber(row.active_days)}
                  </td>
                  <td className="py-2 pr-4 tabular-nums">
                    {formatNumber(row.total_actions)}
                  </td>
                  <td className="py-2 pr-4 tabular-nums">
                    {formatNumber(row.page_views)}
                  </td>
                  <td className="py-2 pr-4 tabular-nums">
                    {formatNumber(row.api_calls)}
                  </td>
                  <td className="py-2 pr-4 tabular-nums">
                    {formatNumber(row.sessions)}
                  </td>
                  <td className="py-2 pr-4 tabular-nums whitespace-nowrap">
                    {formatDurationSec(row.total_time_sec)}
                  </td>
                  <td className="py-2 pr-4 tabular-nums whitespace-nowrap">
                    {row.last_active_day ?? DASH}
                  </td>
                  <td className="py-2 pr-4">
                    <Sparkline values={row.sparkline ?? []} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{pagination.summary}</p>
        <Pagination
          currentPage={pagination.currentPage}
          pageSize={pageSize}
          totalItems={data?.total ?? 0}
          onPrevClick={() => onPageChange(pagination.prevPage)}
          onNextClick={() => onPageChange(pagination.nextPage)}
          onPageChange={onPageChange}
        />
      </div>
    </Card>
  );
};

export default UsageUsersSection;
