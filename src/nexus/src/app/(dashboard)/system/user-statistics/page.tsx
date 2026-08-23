'use client';

import React, { useMemo, useCallback, useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  LoadingState,
  PageHeading,
  Select,
} from '@/shared/components/ui';
import { ErrorBanner } from '@/shared/components/ui/banner';
import { PermissionGuard } from '@/shared/components';
import { AccessDenied } from '@/shared/components/AccessDenied';
import { isForbiddenError } from '@/shared/utils/errorMessages';
import { toast } from '@/shared/components/ui/toast';
import { refreshWithToast } from '@/shared/utils/refreshWithToast';
import {
  useUserStatistics,
  useUserStatsBreakdown,
} from '@/shared/hooks/useAdmin';
import { formatWithPattern } from '@/shared/utils/dateUtils';
import { ChartContainer, StatsPieChart } from '@/shared/components/charts';
import { getPrimaryColor } from '@/shared/components/charts/constants';
import {
  AqUsers01,
  AqUsersCheck,
  AqKey01,
  AqMail01,
  AqRefreshCw05,
  AqArrowRight,
} from '@airqo/icons-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const AXIS_STYLE = {
  tick: { fontSize: 12, fill: 'rgb(100, 116, 139)' },
  tickLine: { stroke: 'rgb(226, 232, 240)' },
  axisLine: { stroke: 'rgb(226, 232, 240)' },
};

const AXIS_LABEL_STYLE = {
  textAnchor: 'start' as const,
  fontSize: 12,
  fill: 'rgb(100, 116, 139)',
};

const TOOLTIP_STYLE = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '12px',
  color: 'hsl(var(--card-foreground))',
};

interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

const MONTHS_OPTIONS = [3, 6, 12, 24];
const DEFAULT_MONTHS = 12;

interface GrowthBadge {
  text: string;
  className: string;
}

const formatGrowthBadge = (
  percentChange: number | undefined
): GrowthBadge | null => {
  if (typeof percentChange !== 'number' || !Number.isFinite(percentChange)) {
    return null;
  }
  const rounded = Math.round(percentChange);
  if (rounded === 0) {
    return { text: '0% vs last 30 days', className: 'text-muted-foreground' };
  }
  return rounded > 0
    ? { text: `+${rounded}% vs last 30 days`, className: 'text-green-600' }
    : { text: `${rounded}% vs last 30 days`, className: 'text-red-600' };
};

const UserStatisticsPage: React.FC = () => {
  const [months, setMonths] = useState(DEFAULT_MONTHS);

  const {
    data: statsResponse,
    isLoading: statsLoading,
    error: statsError,
    mutate: mutateStats,
  } = useUserStatistics();

  const {
    data: breakdownResponse,
    isLoading: breakdownLoading,
    error: breakdownError,
    mutate: mutateBreakdown,
  } = useUserStatsBreakdown(months);

  const isLoading = statsLoading || breakdownLoading;
  const error = statsError || breakdownError;

  const stats = useMemo(() => {
    const s = statsResponse?.users_stats;
    return {
      total: s?.users?.number ?? 0,
      active: s?.active_users?.number ?? 0,
      apiUsers: s?.api_users?.number ?? 0,
    };
  }, [statsResponse]);

  const breakdown = breakdownResponse?.data;

  const statusData: ChartDataPoint[] = useMemo(
    () => [
      { name: 'Active', value: breakdown?.accountStatus?.active ?? 0 },
      { name: 'Inactive', value: breakdown?.accountStatus?.inactive ?? 0 },
    ],
    [breakdown]
  );

  const verifiedCount = breakdown?.verificationStatus?.verified ?? 0;

  const verificationData: ChartDataPoint[] = useMemo(
    () => [
      { name: 'Verified', value: verifiedCount },
      {
        name: 'Unverified',
        value: breakdown?.verificationStatus?.unverified ?? 0,
      },
    ],
    [breakdown, verifiedCount]
  );

  const organizationData: ChartDataPoint[] = useMemo(
    () =>
      (breakdown?.organizations ?? []).map(org => ({
        name: org.organization,
        value: org.count,
      })),
    [breakdown]
  );

  const loginRangesData: ChartDataPoint[] = useMemo(
    () =>
      (breakdown?.loginActivity ?? []).map(activity => ({
        name: activity.range,
        value: activity.count,
      })),
    [breakdown]
  );

  const signupsOverTimeData: ChartDataPoint[] = useMemo(
    () =>
      (breakdown?.signupsOverTime ?? []).map(signup => ({
        name: signup.period,
        value: signup.count,
      })),
    [breakdown]
  );

  const topGroupsData: ChartDataPoint[] = useMemo(
    () =>
      (breakdown?.topGroups ?? []).map(group => ({
        name: group.group,
        value: group.count,
      })),
    [breakdown]
  );

  const rolesData: ChartDataPoint[] = useMemo(
    () =>
      (breakdown?.roles ?? []).map(role => ({
        name: role.role,
        value: role.count,
      })),
    [breakdown]
  );

  const geographyData: ChartDataPoint[] = useMemo(
    () =>
      (breakdown?.geography ?? []).map(country => ({
        name: country.country,
        value: country.count,
      })),
    [breakdown]
  );

  const verificationTrendData: ChartDataPoint[] = useMemo(
    () =>
      (breakdown?.verificationFunnel?.byCohort ?? []).map(cohort => ({
        name: cohort.period,
        value: cohort.verificationRate,
      })),
    [breakdown]
  );

  const unverifiedAgingData: ChartDataPoint[] = useMemo(
    () =>
      (breakdown?.verificationFunnel?.unverifiedAging ?? []).map(aging => ({
        name: aging.range,
        value: aging.count,
      })),
    [breakdown]
  );

  const newUsersBadge = formatGrowthBadge(
    breakdown?.growth?.newUsers?.percentChange
  );
  const activeUsersBadge = formatGrowthBadge(
    breakdown?.growth?.activeUsers?.percentChange
  );

  const handleRefresh = useCallback(async () => {
    try {
      await refreshWithToast(
        () => Promise.all([mutateStats(), mutateBreakdown()]),
        'User statistics refreshed successfully'
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Unable to refresh user statistics'
      );
    }
  }, [mutateStats, mutateBreakdown]);

  if (isLoading) {
    return (
      <LoadingState
        className="h-[calc(100vh-200px)]"
        text="Loading user statistics..."
      />
    );
  }

  if (error) {
    if (isForbiddenError(error)) {
      return (
        <AccessDenied
          title="Access Denied"
          message="You do not have the required permissions to view user statistics."
        />
      );
    }
    return (
      <div className="p-6 space-y-4">
        <ErrorBanner
          title="Failed to load user statistics"
          message={error?.message || 'An error occurred while loading the data'}
        />
        <Button
          onClick={handleRefresh}
          Icon={AqRefreshCw05}
          loading={isLoading}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="User Statistics"
        subtitle="High-level insights and analytics across all platform users"
        action={
          <div className="flex items-center gap-2">
            <Select
              label="Months"
              value={months}
              onChange={event =>
                setMonths(Number(event.target.value) || DEFAULT_MONTHS)
              }
              disabled={isLoading}
              className="w-24"
              containerClassName="!mb-0 w-24"
            >
              {MONTHS_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            <Button
              variant="outlined"
              onClick={handleRefresh}
              Icon={AqRefreshCw05}
              loading={isLoading}
            >
              Refresh
            </Button>
            <Link href="/system/users">
              <Button Icon={AqArrowRight}>Manage Users</Button>
            </Link>
          </div>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
              {newUsersBadge && (
                <span
                  className={`text-xs font-medium mt-1 block ${newUsersBadge.className}`}
                >
                  {newUsersBadge.text}
                </span>
              )}
            </div>
            <div className="p-2.5 rounded-full bg-blue-100 text-blue-700">
              <AqUsers01 className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold mt-1">{stats.active}</p>
              {activeUsersBadge && (
                <span
                  className={`text-xs font-medium mt-1 block ${activeUsersBadge.className}`}
                >
                  {activeUsersBadge.text}
                </span>
              )}
            </div>
            <div className="p-2.5 rounded-full bg-green-100 text-green-700">
              <AqUsersCheck className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Verified Users</p>
              <p className="text-2xl font-bold mt-1">{verifiedCount}</p>
            </div>
            <div className="p-2.5 rounded-full bg-purple-100 text-purple-700">
              <AqMail01 className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">API Users</p>
              <p className="text-2xl font-bold mt-1">{stats.apiUsers}</p>
            </div>
            <div className="p-2.5 rounded-full bg-amber-100 text-amber-700">
              <AqKey01 className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer
          title="Account Status"
          subtitle="Active vs inactive users"
          showMoreButton={false}
          loading={isLoading}
        >
          <StatsPieChart data={statusData} />
        </ChartContainer>

        <ChartContainer
          title="Verification Status"
          subtitle="Verified vs unverified users"
          showMoreButton={false}
          loading={isLoading}
        >
          <StatsPieChart data={verificationData} />
        </ChartContainer>

        <ChartContainer
          title="Users by Organization"
          subtitle="Top organizations by user count"
          showMoreButton={false}
          loading={isLoading}
        >
          {organizationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={organizationData}
                margin={{ top: 8, right: 16, left: 20, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgb(226, 232, 240)"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  tick={AXIS_STYLE.tick}
                  tickLine={AXIS_STYLE.tickLine}
                  axisLine={AXIS_STYLE.axisLine}
                />
                <YAxis
                  allowDecimals={false}
                  label={{
                    value: 'Users',
                    angle: -90,
                    position: 'insideLeft',
                    offset: -10,
                    style: AXIS_LABEL_STYLE,
                  }}
                  tick={AXIS_STYLE.tick}
                  tickLine={AXIS_STYLE.tickLine}
                  axisLine={AXIS_STYLE.axisLine}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="value" fill={getPrimaryColor(0)} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoDataState />
          )}
        </ChartContainer>

        <ChartContainer
          title="Login Activity"
          subtitle="Users grouped by login count"
          showMoreButton={false}
          loading={isLoading}
        >
          {loginRangesData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={loginRangesData}
                margin={{ top: 8, right: 16, left: 20, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgb(226, 232, 240)"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  tick={AXIS_STYLE.tick}
                  tickLine={AXIS_STYLE.tickLine}
                  axisLine={AXIS_STYLE.axisLine}
                />
                <YAxis
                  allowDecimals={false}
                  label={{
                    value: 'Users',
                    angle: -90,
                    position: 'insideLeft',
                    offset: -10,
                    style: AXIS_LABEL_STYLE,
                  }}
                  tick={AXIS_STYLE.tick}
                  tickLine={AXIS_STYLE.tickLine}
                  axisLine={AXIS_STYLE.axisLine}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="value" fill={getPrimaryColor(1)} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoDataState />
          )}
        </ChartContainer>

        <ChartContainer
          title="Signups Over Time"
          subtitle={`New users in the last ${months} months`}
          showMoreButton={false}
          loading={isLoading}
        >
          {signupsOverTimeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={signupsOverTimeData}
                margin={{ top: 8, right: 16, left: 20, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgb(226, 232, 240)"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  tick={AXIS_STYLE.tick}
                  tickLine={AXIS_STYLE.tickLine}
                  axisLine={AXIS_STYLE.axisLine}
                  tickFormatter={value =>
                    formatWithPattern(String(value), 'MMM yyyy')
                  }
                />
                <YAxis
                  allowDecimals={false}
                  label={{
                    value: 'New Users',
                    angle: -90,
                    position: 'insideLeft',
                    offset: -10,
                    style: AXIS_LABEL_STYLE,
                  }}
                  tick={AXIS_STYLE.tick}
                  tickLine={AXIS_STYLE.tickLine}
                  axisLine={AXIS_STYLE.axisLine}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={getPrimaryColor(2)}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <NoDataState />
          )}
        </ChartContainer>

        <ChartContainer
          title="Top Groups"
          subtitle="Groups with the most members"
          showMoreButton={false}
          loading={isLoading}
        >
          {topGroupsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topGroupsData}
                margin={{ top: 8, right: 16, left: 20, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgb(226, 232, 240)"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  tick={AXIS_STYLE.tick}
                  tickLine={AXIS_STYLE.tickLine}
                  axisLine={AXIS_STYLE.axisLine}
                />
                <YAxis
                  allowDecimals={false}
                  label={{
                    value: 'Members',
                    angle: -90,
                    position: 'insideLeft',
                    offset: -10,
                    style: AXIS_LABEL_STYLE,
                  }}
                  tick={AXIS_STYLE.tick}
                  tickLine={AXIS_STYLE.tickLine}
                  axisLine={AXIS_STYLE.axisLine}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="value" fill={getPrimaryColor(3)} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoDataState />
          )}
        </ChartContainer>

        <ChartContainer
          title="Users by Role"
          subtitle="Users grouped by assigned role"
          showMoreButton={false}
          loading={isLoading}
        >
          {rolesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={rolesData}
                margin={{ top: 8, right: 16, left: 20, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgb(226, 232, 240)"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  tick={AXIS_STYLE.tick}
                  tickLine={AXIS_STYLE.tickLine}
                  axisLine={AXIS_STYLE.axisLine}
                />
                <YAxis
                  allowDecimals={false}
                  label={{
                    value: 'Users',
                    angle: -90,
                    position: 'insideLeft',
                    offset: -10,
                    style: AXIS_LABEL_STYLE,
                  }}
                  tick={AXIS_STYLE.tick}
                  tickLine={AXIS_STYLE.tickLine}
                  axisLine={AXIS_STYLE.axisLine}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="value" fill={getPrimaryColor(4)} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoDataState />
          )}
        </ChartContainer>

        <ChartContainer
          title="Users by Country"
          subtitle="Top countries by user count"
          showMoreButton={false}
          loading={isLoading}
        >
          {geographyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={geographyData}
                margin={{ top: 8, right: 16, left: 20, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgb(226, 232, 240)"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  tick={AXIS_STYLE.tick}
                  tickLine={AXIS_STYLE.tickLine}
                  axisLine={AXIS_STYLE.axisLine}
                />
                <YAxis
                  allowDecimals={false}
                  label={{
                    value: 'Users',
                    angle: -90,
                    position: 'insideLeft',
                    offset: -10,
                    style: AXIS_LABEL_STYLE,
                  }}
                  tick={AXIS_STYLE.tick}
                  tickLine={AXIS_STYLE.tickLine}
                  axisLine={AXIS_STYLE.axisLine}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="value" fill={getPrimaryColor(5)} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoDataState />
          )}
        </ChartContainer>

        <ChartContainer
          title="Verification Trend"
          subtitle="Verification rate by signup cohort"
          showMoreButton={false}
          loading={isLoading}
        >
          {verificationTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={verificationTrendData}
                margin={{ top: 8, right: 16, left: 20, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgb(226, 232, 240)"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  tick={AXIS_STYLE.tick}
                  tickLine={AXIS_STYLE.tickLine}
                  axisLine={AXIS_STYLE.axisLine}
                  tickFormatter={value =>
                    formatWithPattern(String(value), 'MMM yyyy')
                  }
                />
                <YAxis
                  domain={[0, 100]}
                  label={{
                    value: 'Verification Rate (%)',
                    angle: -90,
                    position: 'insideLeft',
                    offset: -10,
                    style: AXIS_LABEL_STYLE,
                  }}
                  tick={AXIS_STYLE.tick}
                  tickLine={AXIS_STYLE.tickLine}
                  axisLine={AXIS_STYLE.axisLine}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={getPrimaryColor(6)}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <NoDataState />
          )}
        </ChartContainer>

        <ChartContainer
          title="Unverified Backlog"
          subtitle="Unverified users by account age"
          showMoreButton={false}
          loading={isLoading}
        >
          {unverifiedAgingData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={unverifiedAgingData}
                margin={{ top: 8, right: 16, left: 20, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgb(226, 232, 240)"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  tick={AXIS_STYLE.tick}
                  tickLine={AXIS_STYLE.tickLine}
                  axisLine={AXIS_STYLE.axisLine}
                />
                <YAxis
                  allowDecimals={false}
                  label={{
                    value: 'Users',
                    angle: -90,
                    position: 'insideLeft',
                    offset: -10,
                    style: AXIS_LABEL_STYLE,
                  }}
                  tick={AXIS_STYLE.tick}
                  tickLine={AXIS_STYLE.tickLine}
                  axisLine={AXIS_STYLE.axisLine}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="value" fill={getPrimaryColor(7)} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoDataState />
          )}
        </ChartContainer>
      </div>
    </div>
  );
};

const NoDataState: React.FC = () => (
  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
    <div className="text-center">
      <AqUsers01 className="w-10 h-10 mx-auto mb-2 opacity-50" />
      <p className="text-sm">No data available</p>
    </div>
  </div>
);

const ProtectedUserStatisticsPage: React.FC = () => {
  return (
    <PermissionGuard
      requiredPermissions={['SYSTEM_ADMIN']}
      accessDeniedTitle="Access Denied"
      accessDeniedMessage="You need system administrator permissions to view user statistics."
    >
      <UserStatisticsPage />
    </PermissionGuard>
  );
};

export default ProtectedUserStatisticsPage;
