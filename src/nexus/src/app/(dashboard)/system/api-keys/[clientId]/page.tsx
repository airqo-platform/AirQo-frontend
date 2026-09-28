'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format, startOfToday, subDays } from 'date-fns';
import { AqArrowLeft, AqRefreshCw05 } from '@airqo/icons-react';
import {
  Button,
  Card,
  EmptyState,
  LoadingState,
  PageHeading,
  toast,
  type DateRange,
} from '@/shared/components/ui';
import { ErrorBanner } from '@/shared/components/ui/banner';
import { PermissionGuard } from '@/shared/components';
import { AccessDenied } from '@/shared/components/AccessDenied';
import { ChartContainer, StatsPieChart } from '@/shared/components/charts';
import { type DataTableColumn } from '@/shared/components/ui/data-table';
import {
  isForbiddenError,
  isNotFoundError,
  getUserFriendlyErrorMessage,
} from '@/shared/utils/errorMessages';
import { refreshWithToast } from '@/shared/utils/refreshWithToast';
import { useApiKeyUsageDetail } from '@/shared/hooks/useApiKeyUsage';
import type {
  ApiKeyUsageIp,
  ApiKeyUsageRoute,
} from '@/shared/types/apiKeyUsage';
import ApiKeyUsageFilters from '../components/ApiKeyUsageFilters';
import {
  ApiKeyBarChartCard,
  ApiKeyBreakdownTable,
  ApiKeyOwnerCard,
  ApiKeyTotalsCards,
} from '../components/ApiKeyDetailSections';

const toApiDay = (date: Date | undefined): string | undefined =>
  date ? format(date, 'yyyy-MM-dd') : undefined;

const METHOD_BADGE =
  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground';

const ROUTE_COLUMNS: DataTableColumn<ApiKeyUsageRoute>[] = [
  {
    key: 'method',
    label: 'Method',
    sortable: false,
    render: route => <span className={METHOD_BADGE}>{route.method}</span>,
  },
  {
    key: 'path',
    label: 'Path',
    sortable: false,
    cellClassName: 'min-w-0 max-w-[24rem]',
    render: route => (
      <span className="block truncate font-mono text-xs" title={route.path}>
        {route.path}
      </span>
    ),
  },
  {
    key: 'calls',
    label: 'Calls',
    sortable: false,
    headerClassName: 'text-right',
    cellClassName: 'whitespace-nowrap text-right tabular-nums',
    render: route => route.calls.toLocaleString(),
  },
  {
    key: 'share_pct',
    label: 'Share',
    sortable: false,
    headerClassName: 'text-right',
    cellClassName: 'whitespace-nowrap text-right tabular-nums',
    render: route => `${route.share_pct.toFixed(1)}%`,
  },
];

const IP_COLUMNS: DataTableColumn<ApiKeyUsageIp>[] = [
  {
    key: 'ip',
    label: 'Source IP',
    sortable: false,
    render: ip => <span className="font-mono text-xs">{ip.ip}</span>,
  },
  {
    key: 'calls',
    label: 'Calls',
    sortable: false,
    headerClassName: 'text-right',
    cellClassName: 'whitespace-nowrap text-right tabular-nums',
    render: ip => ip.calls.toLocaleString(),
  },
];

const ApiKeyUsageDetailPage: React.FC = () => {
  const router = useRouter();
  const clientId = (useParams()?.clientId as string) ?? '';

  const [range, setRange] = useState<DateRange>({
    from: subDays(startOfToday(), 6),
    to: startOfToday(),
  });

  const detailParams = useMemo(
    () => ({ from: toApiDay(range.from), to: toApiDay(range.to) }),
    [range.from, range.to]
  );

  const {
    data,
    isLoading,
    isValidating,
    error,
    mutate: mutateDetail,
  } = useApiKeyUsageDetail(clientId || null, detailParams);

  const handleRefresh = useCallback(async () => {
    try {
      await refreshWithToast(() => mutateDetail(), 'API key usage refreshed');
    } catch (err) {
      toast.error(getUserFriendlyErrorMessage(err));
    }
  }, [mutateDetail]);

  const handleRangeChange = useCallback((next: DateRange) => {
    setRange(next);
  }, []);

  if (isForbiddenError(error)) {
    return (
      <AccessDenied
        title="Access Denied"
        message="You do not have the required permissions to view API key usage."
      />
    );
  }

  if (isNotFoundError(error)) {
    return (
      <EmptyState
        title="No usage recorded for this key"
        description="The key may not exist, or it has no recorded calls. History starts from the day this feature was deployed."
      />
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 space-y-4">
        <ErrorBanner
          title="Failed to load API key usage"
          message={error.message || 'An error occurred while loading the data'}
        />
        <Button
          onClick={handleRefresh}
          Icon={AqRefreshCw05}
          loading={isValidating}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <LoadingState
        className="h-[calc(100vh-200px)]"
        text="Loading API key usage..."
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="No usage data yet"
        description="Once this key makes calls, its usage will appear here."
      />
    );
  }

  const { key, totals, daily, services, routes, hours_utc, ips } = data;

  const dailyPoints = daily.map(point => ({
    name: point.day,
    value: point.calls,
  }));
  const servicePoints = services.map(entry => ({
    name: entry.service,
    value: entry.calls,
  }));
  const hourPoints = hours_utc.map(entry => ({
    name: String(entry.hour).padStart(2, '0'),
    value: entry.calls,
  }));

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        Icon={AqArrowLeft}
        onClick={() => router.push('/system/api-keys')}
      >
        Back to API key usage
      </Button>

      <PageHeading
        title={key.key_name || key.client_name || clientId}
        subtitle={`${key.client_name} · ${key.client_id}`}
      />

      <ApiKeyUsageFilters
        range={range}
        onRangeChange={handleRangeChange}
        onRefresh={handleRefresh}
        isRefreshing={isValidating}
        title="Filters"
        description="Date range applies to every section below. Day buckets are UTC."
      />

      <ApiKeyOwnerCard apiKey={key} />
      <ApiKeyTotalsCards totals={totals} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ApiKeyBarChartCard
          title="Daily calls"
          data={dailyPoints}
          formatX={name => format(new Date(`${name}T00:00:00`), 'MMM d')}
          valueLabel="Calls"
        />

        {services.length > 0 ? (
          <ChartContainer
            title="Calls by service"
            subtitle="Split across gateway services"
            showMoreButton={false}
            showReferenceLines={false}
            minContentHeight="300px"
          >
            <StatsPieChart data={servicePoints} />
          </ChartContainer>
        ) : (
          <Card className="flex min-h-[300px] items-center justify-center p-4">
            <p className="text-sm text-muted-foreground">No service data</p>
          </Card>
        )}

        <ApiKeyBarChartCard
          title="Hour of day profile"
          subtitle="Buckets are UTC"
          data={hourPoints}
          valueLabel="Calls"
        />

        <ApiKeyBreakdownTable
          title="Source IPs"
          subtitle="Top 20 by calls"
          columns={IP_COLUMNS}
          rows={ips}
          rowKey={ip => ip.ip}
        />

        {/* Long endpoint paths need the full row on wide screens. */}
        <div className="lg:col-span-2">
          <ApiKeyBreakdownTable
            title="Top routes"
            subtitle="Most-called endpoints (top 50)"
            columns={ROUTE_COLUMNS}
            rows={routes}
            rowKey={route => `${route.method} ${route.path}`}
          />
        </div>
      </div>
    </div>
  );
};

const ProtectedApiKeyUsageDetailPage: React.FC = () => (
  <PermissionGuard
    requiredPermissions={['AUDIT_VIEW', 'SYSTEM_ADMIN', 'SUPER_ADMIN']}
    accessDeniedTitle="Access Denied"
    accessDeniedMessage="You do not have the required permissions to view API key usage."
  >
    <ApiKeyUsageDetailPage />
  </PermissionGuard>
);

export default ProtectedApiKeyUsageDetailPage;
