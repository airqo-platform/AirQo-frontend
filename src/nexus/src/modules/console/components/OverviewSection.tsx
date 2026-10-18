'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  LoadingState,
  MetricCard,
  MultiSelectTable,
  toast,
} from '@/shared/components/ui';
import {
  AqArrowUpRight,
  AqBarChartSquareUp,
  AqBookOpen01,
  AqPlus,
  AqReceipt,
} from '@airqo/icons-react';
import { clientService } from '@/shared/services/clientService';
import { subscriptionService } from '@/shared/services/subscriptionService';
import { apiKeyUsageService } from '@/shared/services/apiKeyUsageService';
import { isAbortError } from '@/shared/lib/retryPolicy';
import { formatDate } from '@/shared/utils';
import { DATE_FORMATS, formatWithPattern } from '@/shared/utils/dateUtils';
import { formatNumber } from '@/modules/usage/utils/format';
import type { ApiUsage, Client } from '@/shared/types/api';
import type { UserSubscription } from '@/shared/types/api';

const DOCS_URL = 'https://platform.airqo.net/docs/api/intro/';

interface ExtendedSessionUser {
  id?: string;
  _id?: string;
}

/** UTC `YYYY-MM-DD` bounds for the current calendar month (UTC). */
const currentMonthRange = () => {
  const now = new Date();
  const from = `${now.getUTCFullYear()}-${String(
    now.getUTCMonth() + 1
  ).padStart(2, '0')}-01`;
  const to = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(
    2,
    '0'
  )}-${String(now.getUTCDate()).padStart(2, '0')}`;
  return { from, to };
};

const formatShortDate = (iso: string | null | undefined) => {
  if (!iso) return null;
  try {
    return formatDate(iso, { month: 'short', day: 'numeric' });
  } catch {
    return null;
  }
};

/**
 * Table row for the overview "Recent clients" table. `createdAt` is returned
 * by the API but not declared on the shared `Client` type, hence optional.
 */
type RecentClientRow = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  [key: string]: unknown;
};

const recentClientColumns = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
  },
  {
    key: 'isActive',
    label: 'Status',
    sortable: false,
    render: (_value: unknown, item: RecentClientRow) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          item.isActive
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
        }`}
      >
        {item.isActive ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    key: 'createdAt',
    label: 'Created',
    sortable: true,
    render: (_value: unknown, item: RecentClientRow) =>
      formatWithPattern(item.createdAt, DATE_FORMATS.READABLE_DATE_LONG),
  },
];

const OverviewSection: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const sessionUser = session?.user as ExtendedSessionUser | undefined;
  const userId = sessionUser?._id || sessionUser?.id || null;

  const [clients, setClients] = useState<Client[] | null>(null);
  const [usage, setUsage] = useState<ApiUsage | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null
  );
  const [series, setSeries] = useState<{ label: string; requests: number }[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();
    const { signal } = controller;

    // Every request below is scoped to the signed-in user. There is no
    // platform-wide fallback: when the session does not expose a user id we
    // skip all of them and render the empty states.
    const load = async () => {
      if (!userId) {
        setClients([]);
        setUsage(null);
        setSubscription(null);
        setSeries([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setClients(null);
      setUsage(null);
      setSubscription(null);
      setSeries([]);

      let hardFailure = false;

      const [clientsResult, usageResult, subscriptionResult, timeseriesResult] =
        await Promise.allSettled([
          clientService.getClientsByUserId(userId, { signal }),
          subscriptionService.getUsage({ signal }),
          subscriptionService.getSubscription({ signal }),
          apiKeyUsageService.getTimeseries(
            { ...currentMonthRange(), interval: 'day', user_id: userId },
            signal
          ),
        ]);

      if (!isActive || signal.aborted) {
        return;
      }

      if (clientsResult.status === 'fulfilled') {
        setClients(clientsResult.value.clients || []);
      } else {
        hardFailure = true;
        setClients([]);
      }

      if (usageResult.status === 'fulfilled') {
        setUsage(usageResult.value.usage || null);
      } else if (!isAbortError(usageResult.reason)) {
        hardFailure = true;
      }

      if (subscriptionResult.status === 'fulfilled') {
        setSubscription(subscriptionResult.value.data || null);
      } else if (!isAbortError(subscriptionResult.reason)) {
        hardFailure = true;
      }

      if (timeseriesResult.status === 'fulfilled') {
        const payload = timeseriesResult.value;
        const points = payload.labels.map((label, index) => ({
          label,
          requests: payload.total[index] ?? 0,
        }));
        setSeries(points);
      } else if (!isAbortError(timeseriesResult.reason)) {
        hardFailure = true;
        setSeries([]);
      }

      if (hardFailure) {
        toast.error('Some overview data could not be loaded.');
      }

      setLoading(false);
    };

    void load();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [userId]);

  const requestUsed = usage?.monthly?.used ?? null;
  const requestLimit = usage?.monthly?.limit ?? null;
  const usagePct =
    requestUsed !== null && requestLimit
      ? Math.min(100, Math.round((requestUsed / requestLimit) * 100))
      : null;

  const activeClients = (clients || []).filter(
    client => client.isActive
  ).length;
  const totalClients = clients?.length ?? null;

  const planTier = subscription?.tier ?? null;
  const renewalLabel = useMemo(() => {
    if (!subscription) return null;
    const access = formatShortDate(subscription.nextBillingDate);
    if (subscription.status === 'cancelled') {
      return access ? `Access through ${access}` : 'Subscription ended';
    }
    if (subscription.automaticRenewal && access) {
      return `Renews ${access}`;
    }
    if (access) return `Access through ${access}`;
    return null;
  }, [subscription]);

  const hasUsageData = series.some(point => point.requests > 0);

  const recentClientRows = useMemo<RecentClientRow[]>(
    () =>
      (clients || [])
        .map((client): RecentClientRow => {
          // The API returns `createdAt` on clients even though the shared
          // `Client` type does not declare it.
          const createdAt =
            'createdAt' in client && typeof client.createdAt === 'string'
              ? client.createdAt
              : undefined;
          return { ...client, id: client._id, createdAt };
        })
        .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')),
    [clients]
  );

  if (loading) {
    return <LoadingState text="Loading console overview..." />;
  }

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Requests this month"
          value={requestUsed !== null ? formatNumber(requestUsed) : '—'}
          hint={
            <span className="text-xs text-muted-foreground">
              {usagePct !== null && requestLimit !== null
                ? `${usagePct}% of ${formatNumber(requestLimit)} allowed`
                : 'Usage data is loading or unavailable'}
            </span>
          }
        />
        <MetricCard
          label="API clients"
          value={totalClients !== null ? formatNumber(totalClients) : '—'}
          hint={
            <span className="text-xs text-muted-foreground">
              {totalClients !== null
                ? `${formatNumber(activeClients)} active`
                : 'Clients are loading or unavailable'}
            </span>
          }
        />
        <MetricCard
          label="Current plan"
          value={planTier ?? '—'}
          valueClassName="text-xl"
          hint={
            <span className="text-xs text-muted-foreground">
              {renewalLabel ?? 'Plan details unavailable'}
            </span>
          }
        />
      </div>

      {/* Request volume */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AqBarChartSquareUp className="h-4 w-4 text-primary" />
            Request volume
          </CardTitle>
          <CardDescription>
            Daily request volume from your API clients this month (UTC).
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {hasUsageData ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={series}
                  margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="consoleUsageFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="rgb(var(--primary))"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="100%"
                        stopColor="rgb(var(--primary))"
                        stopOpacity={0.04}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fontSize: 11,
                      fill: 'rgb(var(--muted-foreground))',
                    }}
                    interval="preserveStartEnd"
                    tickFormatter={value => formatWithPattern(value, 'MMM d')}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fontSize: 11,
                      fill: 'rgb(var(--muted-foreground))',
                    }}
                    width={48}
                  />
                  <Tooltip
                    cursor={{
                      stroke: 'rgb(var(--primary))',
                      strokeOpacity: 0.2,
                    }}
                    contentStyle={{
                      backgroundColor: 'rgb(var(--card))',
                      border: '1px solid rgb(var(--border))',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={value => [
                      formatNumber(Number(value)),
                      'Requests',
                    ]}
                    labelFormatter={value =>
                      formatWithPattern(value, DATE_FORMATS.READABLE_DATE_LONG)
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="requests"
                    stroke="rgb(var(--primary))"
                    strokeWidth={2}
                    fill="url(#consoleUsageFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              compact
              title="No request activity yet this month"
              description={
                requestUsed !== null && requestLimit
                  ? `You have used ${formatNumber(requestUsed)} of ${formatNumber(
                      requestLimit
                    )} allowed requests.`
                  : 'Once your API clients start making requests, their volume will appear here.'
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick actions</CardTitle>
          <CardDescription>
            Jump straight to the most common console tasks.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              Icon={AqPlus}
              size="sm"
              onClick={() => router.push('/console/clients')}
            >
              Create API client
            </Button>
            <Button
              variant="outlined"
              Icon={AqReceipt}
              size="sm"
              onClick={() => router.push('/console/subscriptions')}
            >
              Compare plans
            </Button>
            <a
              href={DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <AqBookOpen01 className="h-4 w-4" />
              Read the docs
              <AqArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Recent clients */}
      <MultiSelectTable
        title="Recent clients"
        data={recentClientRows}
        columns={recentClientColumns}
        searchable={true}
        sortable={true}
        showPagination={true}
        pageSize={5}
        emptyComponent={
          <EmptyState
            compact
            title="No API clients yet"
            description="Create your first client to start calling the AirQo API."
          />
        }
      />
    </div>
  );
};

export default OverviewSection;
