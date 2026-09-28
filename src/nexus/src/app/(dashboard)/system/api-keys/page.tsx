'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AqRefreshCw05 } from '@airqo/icons-react';
import {
  Button,
  LoadingState,
  MetricCard,
  PageHeading,
  toast,
  type DateRange,
} from '@/shared/components/ui';
import { ErrorBanner } from '@/shared/components/ui/banner';
import {
  isForbiddenError,
  getUserFriendlyErrorMessage,
} from '@/shared/utils/errorMessages';
import { refreshWithToast } from '@/shared/utils/refreshWithToast';
import {
  API_KEY_USAGE_DEFAULT_LIMIT,
  useApiKeyUsageLeaderboard,
  useApiKeyUsageTimeseries,
} from '@/shared/hooks/useApiKeyUsage';
import type { ApiKeyUsageLeaderboardParams } from '@/shared/types/apiKeyUsage';
import ApiKeyUsageFilters from './components/ApiKeyUsageFilters';
import ApiKeyUsageChart from './components/ApiKeyUsageChart';
import ApiKeyUsageTable from './components/ApiKeyUsageTable';
import ApiKeyUsageGuard, {
  ApiKeyUsageAccessDenied,
} from './components/ApiKeyUsageGuard';
import ExportApiKeyUsageButton from './components/ExportApiKeyUsageButton';
import {
  clampUsageRange,
  defaultUsageRange,
  maxDaysForInterval,
  toApiDay,
  usageRangeLimitMessage,
} from './utils';

type SortOption = NonNullable<ApiKeyUsageLeaderboardParams['sort']>;
type Interval = 'day' | 'hour';

const ApiKeyUsagePage: React.FC = () => {
  const router = useRouter();

  const [range, setRange] = useState<DateRange>(defaultUsageRange);
  const [service, setService] = useState('analytics');
  const [sort, setSort] = useState<SortOption>('calls');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(API_KEY_USAGE_DEFAULT_LIMIT);
  const [interval, setInterval] = useState<Interval>('day');

  const from = toApiDay(range.from);
  const to = toApiDay(range.to);

  const leaderboardParams = useMemo<ApiKeyUsageLeaderboardParams>(
    () => ({
      from,
      to,
      service: service || undefined,
      sort,
      order,
      page,
      limit,
    }),
    [from, to, service, sort, order, page, limit]
  );

  const timeseriesParams = useMemo(
    () => ({
      from,
      to,
      interval,
      top: 5,
      // Hourly buckets are not split by service — the API rejects the pair.
      service: interval === 'day' ? service || undefined : undefined,
    }),
    [from, to, interval, service]
  );

  const {
    data: leaderboardData,
    isLoading: lbLoading,
    isValidating: lbValidating,
    error: lbError,
    mutate: mutateLeaderboard,
  } = useApiKeyUsageLeaderboard(leaderboardParams);

  const {
    data: timeseriesData,
    isLoading: tsLoading,
    isValidating: tsValidating,
    error: tsError,
    mutate: mutateTimeseries,
  } = useApiKeyUsageTimeseries(timeseriesParams);

  const isRefreshing = lbValidating || tsValidating;

  const isInitialLoading =
    (lbLoading && !leaderboardData) || (tsLoading && !timeseriesData);

  const fatalError =
    (lbError && !leaderboardData) || (tsError && !timeseriesData);
  const hasStaleError = !fatalError && Boolean(lbError || tsError);

  /**
   * Applies a range, trimming it to the endpoint's cap for `nextInterval`.
   * `clampUsageRange` is pure, so the toast is raised here rather than inside a
   * state updater (which React may invoke twice).
   */
  const applyRange = useCallback(
    (next: DateRange, nextInterval: Interval, resetPage = true) => {
      const { range: clamped, clamped: wasClamped } = clampUsageRange(
        next,
        maxDaysForInterval(nextInterval)
      );

      if (wasClamped) {
        toast.info(
          usageRangeLimitMessage(nextInterval, maxDaysForInterval(nextInterval))
        );
      }

      setRange(clamped);
      if (resetPage) setPage(1);
    },
    []
  );

  const handleRangeChange = useCallback(
    (next: DateRange) => applyRange(next, interval),
    [applyRange, interval]
  );

  const handleIntervalChange = useCallback(
    (next: Interval) => {
      if (next === interval) return;
      setInterval(next);
      applyRange(range, next, false);
    },
    [applyRange, interval, range]
  );

  const handleRefresh = useCallback(async () => {
    try {
      await refreshWithToast(
        () => Promise.all([mutateLeaderboard(), mutateTimeseries()]),
        'API key usage refreshed'
      );
    } catch (err) {
      toast.error(getUserFriendlyErrorMessage(err));
    }
  }, [mutateLeaderboard, mutateTimeseries]);

  if (isForbiddenError(lbError) || isForbiddenError(tsError)) {
    return <ApiKeyUsageAccessDenied />;
  }

  if (isInitialLoading) {
    return (
      <LoadingState
        className="h-[calc(100vh-200px)]"
        text="Loading API key usage..."
      />
    );
  }

  if (fatalError) {
    return (
      <div className="p-6 space-y-4">
        <ErrorBanner
          title="Failed to load API key usage"
          message={
            (lbError || tsError)?.message ||
            'An error occurred while loading the data'
          }
        />
        <Button
          onClick={handleRefresh}
          Icon={AqRefreshCw05}
          loading={isRefreshing}
        >
          Retry
        </Button>
      </div>
    );
  }

  const totals = leaderboardData?.totals;
  const rangeDays = leaderboardData?.range.days;

  return (
    <div className="space-y-6">
      {hasStaleError && (
        <div className="space-y-2">
          <ErrorBanner
            title="Failed to refresh API key usage"
            message={
              (lbError || tsError)?.message ||
              'Showing the last successfully loaded data'
            }
          />
          <Button
            variant="outlined"
            onClick={handleRefresh}
            Icon={AqRefreshCw05}
            loading={isRefreshing}
          >
            Retry
          </Button>
        </div>
      )}

      <PageHeading
        title="API Key Usage"
        subtitle="Calls accepted by the gateway for each API key, ranked for the selected range. These are call counts only — BigQuery bytes are measured by the analytics service. Counts can lag by ~15 seconds."
      />

      <ApiKeyUsageFilters
        range={range}
        onRangeChange={handleRangeChange}
        service={service}
        onServiceChange={next => {
          setService(next);
          setPage(1);
        }}
        sort={sort}
        onSortChange={next => {
          setSort(next);
          setPage(1);
        }}
        order={order}
        onOrderChange={next => {
          setOrder(next);
          setPage(1);
        }}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        extraActions={
          <ExportApiKeyUsageButton
            params={leaderboardParams}
            disabled={!leaderboardData}
          />
        }
      />

      {leaderboardData && totals && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Days in range"
            value={rangeDays ?? 0}
            hint={
              <span className="mt-1 block text-xs text-muted-foreground">
                {leaderboardData.range.from} → {leaderboardData.range.to}
              </span>
            }
          />
          <MetricCard
            label="Keys with calls"
            value={totals.keys.toLocaleString()}
          />
          <MetricCard
            label="Calls in range"
            value={totals.calls.toLocaleString()}
            hint={
              <span className="mt-1 block text-xs text-muted-foreground">
                Counted by the API gateway
              </span>
            }
          />
          <MetricCard
            label="Service filter"
            value={service || 'All services'}
            valueClassName="text-lg"
            hint={
              <span className="mt-1 block text-xs text-muted-foreground">
                Hourly charts are not split by service
              </span>
            }
          />
        </div>
      )}

      <ApiKeyUsageChart
        interval={interval}
        onIntervalChange={handleIntervalChange}
        data={timeseriesData}
        loading={tsLoading}
        error={tsError?.message ?? null}
        onRefresh={handleRefresh}
      />

      <ApiKeyUsageTable
        keys={leaderboardData?.keys ?? []}
        meta={leaderboardData?.meta}
        loading={lbLoading}
        isRefreshing={lbValidating}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={next => {
          setLimit(next);
          setPage(1);
        }}
        onRowClick={clientId => router.push(`/system/api-keys/${clientId}`)}
      />
    </div>
  );
};

const ProtectedApiKeyUsagePage: React.FC = () => (
  <ApiKeyUsageGuard>
    <ApiKeyUsagePage />
  </ApiKeyUsageGuard>
);

export default ProtectedApiKeyUsagePage;
