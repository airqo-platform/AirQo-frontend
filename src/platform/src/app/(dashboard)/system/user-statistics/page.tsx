'use client';

import React, { useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  LoadingState,
  PageHeading,
} from '@/shared/components/ui';
import { ErrorBanner } from '@/shared/components/ui/banner';
import { PermissionGuard } from '@/shared/components';
import { AccessDenied } from '@/shared/components/AccessDenied';
import { isForbiddenError } from '@/shared/utils/errorMessages';
import { toast } from '@/shared/components/ui/toast';
import { refreshWithToast } from '@/shared/utils/refreshWithToast';
import { useUserStatistics, useUsers } from '@/shared/hooks/useAdmin';
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

interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

const UserStatisticsPage: React.FC = () => {
  const {
    data: statsResponse,
    isLoading: statsLoading,
    error: statsError,
    mutate: mutateStats,
  } = useUserStatistics();

  const {
    data: usersResponse,
    isLoading: usersLoading,
    error: usersError,
    mutate: mutateUsers,
  } = useUsers();

  const isLoading = statsLoading || usersLoading;
  const error = statsError || usersError;

  const stats = useMemo(() => {
    const s = statsResponse?.users_stats;
    return {
      total: s?.users?.number ?? 0,
      active: s?.active_users?.number ?? 0,
      apiUsers: s?.api_users?.number ?? 0,
    };
  }, [statsResponse]);

  const users = useMemo(() => usersResponse?.users ?? [], [usersResponse]);

  const verifiedCount = useMemo(
    () => users.filter(u => u.verified).length,
    [users]
  );

  const statusData: ChartDataPoint[] = useMemo(
    () => [
      { name: 'Active', value: stats.active },
      { name: 'Inactive', value: stats.total - stats.active },
    ],
    [stats]
  );

  const verificationData: ChartDataPoint[] = useMemo(
    () => [
      { name: 'Verified', value: verifiedCount },
      { name: 'Unverified', value: stats.total - verifiedCount },
    ],
    [stats, verifiedCount]
  );

  const organizationData: ChartDataPoint[] = useMemo(() => {
    const counts = users.reduce<Record<string, number>>((acc, user) => {
      const org = user.organization?.trim() || 'Unknown';
      acc[org] = (acc[org] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [users]);

  const loginRangesData: ChartDataPoint[] = useMemo(() => {
    const ranges = [
      { name: '0', min: 0, max: 0 },
      { name: '1-5', min: 1, max: 5 },
      { name: '6-10', min: 6, max: 10 },
      { name: '11-20', min: 11, max: 20 },
      { name: '21+', min: 21, max: Infinity },
    ];
    return ranges.map(range => ({
      name: range.name,
      value: users.filter(
        u =>
          (u.loginCount ?? 0) >= range.min &&
          (range.max === Infinity || (u.loginCount ?? 0) <= range.max)
      ).length,
    }));
  }, [users]);

  const signupsOverTimeData: ChartDataPoint[] = useMemo(() => {
    const counts = users.reduce<Record<string, number>>((acc, user) => {
      const date = user.createdAt
        ? formatWithPattern(user.createdAt, 'yyyy-MM')
        : 'Unknown';
      acc[date] = (acc[date] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(-12);
  }, [users]);

  const topGroupsData: ChartDataPoint[] = useMemo(() => {
    const counts = users.reduce<Record<string, number>>((acc, user) => {
      (user.groups ?? []).forEach(group => {
        const title =
          group.grp_title?.trim() || group.organization_slug || 'Unknown';
        acc[title] = (acc[title] ?? 0) + 1;
      });
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [users]);

  const handleRefresh = useCallback(async () => {
    try {
      await refreshWithToast(
        () => Promise.all([mutateStats(), mutateUsers()]),
        'User statistics refreshed successfully'
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Unable to refresh user statistics'
      );
    }
  }, [mutateStats, mutateUsers]);

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
        <Button onClick={handleRefresh} Icon={AqRefreshCw05}>
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
                margin={{ top: 8, right: 16, left: 0, bottom: 32 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgb(226, 232, 240)"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 12, fill: 'rgb(100, 116, 139)' }}
                  tickLine={{ stroke: 'rgb(226, 232, 240)' }}
                  axisLine={{ stroke: 'rgb(226, 232, 240)' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: 'rgb(100, 116, 139)' }}
                  tickLine={{ stroke: 'rgb(226, 232, 240)' }}
                  axisLine={{ stroke: 'rgb(226, 232, 240)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'hsl(var(--card-foreground))',
                  }}
                />
                <Bar
                  dataKey="value"
                  fill={getPrimaryColor(0)}
                  radius={[4, 4, 0, 0]}
                />
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
                margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgb(226, 232, 240)"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: 'rgb(100, 116, 139)' }}
                  tickLine={{ stroke: 'rgb(226, 232, 240)' }}
                  axisLine={{ stroke: 'rgb(226, 232, 240)' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: 'rgb(100, 116, 139)' }}
                  tickLine={{ stroke: 'rgb(226, 232, 240)' }}
                  axisLine={{ stroke: 'rgb(226, 232, 240)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'hsl(var(--card-foreground))',
                  }}
                />
                <Bar
                  dataKey="value"
                  fill={getPrimaryColor(1)}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoDataState />
          )}
        </ChartContainer>

        <ChartContainer
          title="Signups Over Time"
          subtitle="New users by month"
          showMoreButton={false}
          loading={isLoading}
        >
          {signupsOverTimeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={signupsOverTimeData}
                margin={{ top: 8, right: 16, left: 0, bottom: 32 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgb(226, 232, 240)"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 12, fill: 'rgb(100, 116, 139)' }}
                  tickLine={{ stroke: 'rgb(226, 232, 240)' }}
                  axisLine={{ stroke: 'rgb(226, 232, 240)' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: 'rgb(100, 116, 139)' }}
                  tickLine={{ stroke: 'rgb(226, 232, 240)' }}
                  axisLine={{ stroke: 'rgb(226, 232, 240)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'hsl(var(--card-foreground))',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={getPrimaryColor(2)}
                  strokeWidth={2}
                  dot={{ r: 4, fill: getPrimaryColor(2) }}
                  activeDot={{ r: 6 }}
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
                margin={{ top: 8, right: 16, left: 0, bottom: 32 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgb(226, 232, 240)"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 12, fill: 'rgb(100, 116, 139)' }}
                  tickLine={{ stroke: 'rgb(226, 232, 240)' }}
                  axisLine={{ stroke: 'rgb(226, 232, 240)' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: 'rgb(100, 116, 139)' }}
                  tickLine={{ stroke: 'rgb(226, 232, 240)' }}
                  axisLine={{ stroke: 'rgb(226, 232, 240)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'hsl(var(--card-foreground))',
                  }}
                />
                <Bar
                  dataKey="value"
                  fill={getPrimaryColor(3)}
                  radius={[4, 4, 0, 0]}
                />
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
