'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { PageHeading } from '@/shared/components/ui';
import { LoadingState } from '@/shared/components/ui';
import { PermissionGuard } from '@/shared/components';
import { isAbortError } from '@/shared/lib/retryPolicy';
import {
  useUsageOverview,
  useUsagePages,
  useUsageUsers,
  useUsageRetention,
  useUsageExportUsersCsv,
} from '@/modules/usage/hooks/useUsageQueries';
import { currentUtcMonth, normalizeKind } from '@/modules/usage/utils/format';
import UsageFilters from '@/modules/usage/components/platform/UsageFilters';
import UsageOverviewSection from '@/modules/usage/components/platform/UsageOverviewSection';
import UsagePagesSection from '@/modules/usage/components/platform/UsagePagesSection';
import UsageUsersSection from '@/modules/usage/components/platform/UsageUsersSection';
import UsageRetentionSection from '@/modules/usage/components/platform/UsageRetentionSection';
import UsageSectionError from '@/modules/usage/components/platform/UsageSectionError';
import type { UsageKind, UsageOrder, UsageSort } from '@/shared/types/usage';

const DEFAULT_SORT: UsageSort = 'total_actions';
const DEFAULT_ORDER: UsageOrder = 'desc';
const DEFAULT_PAGE_SIZE = 25;
const RETENTION_MONTHS = 6;

const isRealUsageError = (error: Error | null): boolean =>
  error !== null && !isAbortError(error);

/**
 * Platform Usage dashboard (admin-only). Orchestrates the shared filter state
 * and delegates all data fetching to the M1 React Query hooks — no ad-hoc
 * useEffect fetches. Each section is presentational and receives data via props.
 */
const UsagePage: React.FC = () => {
  const [month, setMonth] = useState<string>(currentUtcMonth);
  const [excludeInternal, setExcludeInternal] = useState(false);
  const [kind, setKind] = useState<UsageKind>('page');

  // Users-table local filter state.
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<UsageSort>(DEFAULT_SORT);
  const [order, setOrder] = useState<UsageOrder>(DEFAULT_ORDER);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Reset to first page whenever the users-table filters change.
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((value: UsageSort) => {
    setSort(value);
    setPage(1);
  }, []);

  const handleOrderChange = useCallback((value: UsageOrder) => {
    setOrder(value);
    setPage(1);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(Math.max(1, Math.min(100, size)));
    setPage(1);
  }, []);

  const handlePageChange = useCallback((next: number) => {
    setPage(Math.max(1, next));
  }, []);

  const handleMonthChange = useCallback((value: string) => {
    setMonth(value);
    setPage(1);
  }, []);

  const handleExcludeInternalChange = useCallback((value: boolean) => {
    setExcludeInternal(value);
    setPage(1);
  }, []);

  // M1 hooks — all reads go through React Query with stable memoized keys.
  const overviewParams = useMemo(
    () => ({ month, exclude_internal: excludeInternal }),
    [month, excludeInternal]
  );
  const pagesParams = useMemo(
    () => ({
      month,
      kind: normalizeKind(kind),
      limit: 50,
      exclude_internal: excludeInternal,
    }),
    [month, kind, excludeInternal]
  );
  const usersParams = useMemo(
    () => ({
      month,
      sort,
      order,
      search,
      page,
      limit: pageSize,
      exclude_internal: excludeInternal,
    }),
    [month, sort, order, search, page, pageSize, excludeInternal]
  );
  const retentionParams = useMemo(
    () => ({ months: RETENTION_MONTHS, exclude_internal: excludeInternal }),
    [excludeInternal]
  );

  const overview = useUsageOverview(overviewParams);
  const pages = useUsagePages(pagesParams);
  const users = useUsageUsers(usersParams);
  const retention = useUsageRetention(retentionParams);

  const {
    exportUsers,
    isExporting,
    error: exportError,
  } = useUsageExportUsersCsv();

  // AbortController for the CSV export — aborted on unmount so a component
  // teardown never leaves a fetch in flight or surfaces a stale error toast.
  const exportAbortRef = useRef<AbortController | null>(null);
  useEffect(() => {
    return () => {
      exportAbortRef.current?.abort();
    };
  }, []);

  const handleExport = useCallback(async () => {
    exportAbortRef.current?.abort();
    const controller = new AbortController();
    exportAbortRef.current = controller;
    await exportUsers(
      {
        month,
        sort,
        order,
        search,
        exclude_internal: excludeInternal,
      },
      controller.signal
    );
  }, [exportUsers, month, sort, order, search, excludeInternal]);

  // Only block the whole page on the overview (hero) query; the rest render
  // their own per-section error/empty states for resilience.
  const overviewBlocked =
    overview.isLoading && !overview.data && !overview.error;

  const handleGlobalRetry = useCallback(() => {
    overview.refetch();
  }, [overview]);

  const pageSubtitle =
    'Platform-wide activity: active users, page views, API usage, top ' +
    'content, per-user detail, and cohort retention. All metrics are ' +
    'aggregated by UTC day.';

  if (overviewBlocked) {
    return (
      <LoadingState
        className="h-[calc(100vh-200px)]"
        text="Loading usage overview..."
      />
    );
  }

  if (isRealUsageError(overview.error) && !overview.data) {
    return (
      <UsageSectionError
        stacked
        title="Failed to load Usage dashboard"
        message={
          overview.error?.message ||
          'An unexpected error occurred while loading usage data.'
        }
        onRetry={handleGlobalRetry}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="Platform Analytics"
        subtitle={pageSubtitle}
        action={
          <span className="text-xs text-muted-foreground">
            {overview.data?.scope
              ? `Scope: ${overview.data.scope}`
              : 'Admin only'}
          </span>
        }
      />

      <UsageFilters
        month={month}
        onMonthChange={handleMonthChange}
        excludeInternal={excludeInternal}
        onExcludeInternalChange={handleExcludeInternalChange}
      />

      {overview.error && overview.data ? (
        <UsageSectionError
          title="Showing stale usage overview"
          message={overview.error.message}
          onRetry={handleGlobalRetry}
          actionLabel="Refresh"
        />
      ) : null}

      <UsageOverviewSection
        data={overview.data ?? null}
        isLoading={overview.isLoading}
        isFetching={overview.isFetching}
        error={isRealUsageError(overview.error) ? overview.error : null}
        onRetry={overview.refetch}
      />

      <UsagePagesSection
        kind={normalizeKind(kind)}
        onKindChange={setKind}
        data={pages.data ?? null}
        isLoading={pages.isLoading}
        error={isRealUsageError(pages.error) ? pages.error : null}
        onRetry={pages.refetch}
      />

      <UsageUsersSection
        data={users.data ?? null}
        isLoading={users.isLoading}
        error={isRealUsageError(users.error) ? users.error : null}
        onRetry={users.refetch}
        search={search}
        onSearchChange={handleSearchChange}
        sort={sort}
        order={order}
        onSortChange={handleSortChange}
        onOrderChange={handleOrderChange}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        month={month}
        isExporting={isExporting}
        exportError={exportError}
        onExport={handleExport}
      />

      <UsageRetentionSection
        data={retention.data ?? null}
        isLoading={retention.isLoading}
        error={isRealUsageError(retention.error) ? retention.error : null}
        onRetry={retention.refetch}
      />
    </div>
  );
};

const ProtectedUsagePage: React.FC = () => {
  return (
    <PermissionGuard
      requireAirQoAdmin
      accessDeniedTitle="Access Denied"
      accessDeniedMessage="You need system administrator permissions to view the Usage dashboard."
    >
      <UsagePage />
    </PermissionGuard>
  );
};

export default ProtectedUsagePage;
