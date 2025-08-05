'use client';

import {
  useUnifiedGroup,
  useGetActiveGroup,
} from '@/app/providers/UnifiedGroupProvider';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import Card from '@/common/components/CardWrapper';
import DashboardPageSkeleton from '@/common/components/Skeleton/DashboardPageSkeleton';
import ErrorState from '@/common/components/ErrorState';
import { getGroupAnalyticsApi } from '@/core/apis/Account';
import PermissionDenied from '@/common/components/PermissionDenied';

import {
  AqUsers01,
  AqUsersCheck,
  AqShield02,
  AqActivity,
  AqTrendUp01,
  AqBarChart01,
} from '@airqo/icons-react';

const OrganizationDashboardPage = () => {
  const { activeGroup } = useUnifiedGroup();
  const { id: activeGroupId } = useGetActiveGroup();
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);
  const { data: session } = useSession();

  // For demo: isAdmin is always true. Replace with real logic as needed.
  const isAdmin = true;

  // Fetch group analytics with useCallback to prevent unnecessary re-renders
  const fetchAnalytics = useCallback(async () => {
    if (!activeGroupId) return;

    setAnalyticsLoading(true);
    setAnalyticsError(null);

    try {
      const data = await getGroupAnalyticsApi(activeGroupId);
      setAnalytics(data);
    } catch (err) {
      setAnalyticsError(err.message || 'Failed to fetch analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  }, [activeGroupId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Memoized data processing to prevent unnecessary recalculations
  const processedData = useMemo(() => {
    if (!analytics?.data?.data) return null;

    const analyticsData = analytics.data.data;
    const summary = analyticsData.summary || {};
    const quickStats = analyticsData.quick_stats || {};
    const roleOverview = analyticsData.role_overview || [];
    const dailyGrowth = quickStats.daily_growth || [];
    const groupInfo = analytics.data.group_info || {};
    const timeRange = analytics.data.time_range || '30d';

    // Calculate metrics
    const totalMembers = summary.total_members || 0;
    const activeMembers = summary.active_members || 0;
    const totalRoles = summary.total_roles || roleOverview.length || 0;
    const engagementScore = summary.engagement_score || 0;

    // Calculate recent growth (last 7 entries with valid dates)
    const validGrowthData = dailyGrowth.filter((item) => item._id !== null);
    const recentGrowth = validGrowthData
      .slice(-7)
      .reduce((sum, item) => sum + (item.new_members || 0), 0);

    // Calculate total new members from all daily growth data
    const totalNewMembers = dailyGrowth.reduce(
      (sum, item) => sum + (item.new_members || 0),
      0,
    );

    // Calculate active member percentage
    const activePercentage =
      totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

    // Process role data for better display names
    const processedRoles = roleOverview.map((role) => ({
      ...role,
      displayName: role._id
        .replace('AIRQO_', '')
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase()),
    }));

    return {
      totalMembers,
      activeMembers,
      totalRoles,
      engagementScore,
      recentGrowth,
      totalNewMembers,
      activePercentage,
      processedRoles,
      validGrowthData,
      dailyGrowth,
      groupInfo,
      timeRange,
    };
  }, [analytics]);

  // Get user's first name for welcome message
  const firstName = useMemo(() => {
    return (
      session?.user?.firstName || session?.user?.name?.split(' ')[0] || 'User'
    );
  }, [session]);

  // Show loading state
  if (!activeGroup || analyticsLoading) {
    return <DashboardPageSkeleton />;
  }

  // Handle permission errors
  if (
    analyticsError &&
    (analyticsError.includes('403') ||
      analyticsError.toLowerCase().includes('permission'))
  ) {
    return <PermissionDenied />;
  }

  // Handle analytics errors
  if (analyticsError) {
    return (
      <ErrorState
        type="server"
        title="Unable to load analytics"
        description={
          <>
            {analyticsError}
            <br />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Please try again or contact support if the issue persists.
            </span>
          </>
        }
        onPrimaryAction={fetchAnalytics}
        primaryAction="Retry"
        size="medium"
        variant="card"
      />
    );
  }

  if (!processedData) return null;

  const {
    totalMembers,
    activeMembers,
    totalRoles,
    engagementScore,
    recentGrowth,
    totalNewMembers,
    activePercentage,
    processedRoles,
    validGrowthData,
    dailyGrowth,
    groupInfo,
    timeRange,
  } = processedData;

  // Define stats cards with all available data
  const statsCards = [
    {
      id: 'total-members',
      title: 'Total Members',
      value: totalMembers.toLocaleString(),
      subtitle: `Registered team members (${timeRange})`,
      icon: AqUsers01,
      href: isAdmin ? '/organization/members' : null,
      trend: recentGrowth > 0 ? `+${recentGrowth} this week` : null,
      color: 'blue',
    },
    {
      id: 'active-members',
      title: 'Active Members',
      value: activeMembers.toLocaleString(),
      subtitle: `${activePercentage}% of total members`,
      icon: AqUsersCheck,
      percentage: activePercentage,
      color: 'green',
    },
    {
      id: 'total-roles',
      title: 'Role Types',
      value: totalRoles.toString(),
      subtitle: 'Different user roles',
      icon: AqShield02,
      color: 'purple',
    },
    {
      id: 'engagement-score',
      title: 'Engagement Score',
      value: `${engagementScore.toFixed(1)}`,
      subtitle: 'Team activity rating (out of 10)',
      icon: AqActivity,
      progress: (engagementScore / 10) * 100, // Convert to percentage for progress bar
      score: engagementScore,
      color: 'orange',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section - Professional Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">
                  {firstName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                Welcome back, {firstName}! 👋
              </h1>
              <p className="text-gray-300 text-lg">
                Monitor your organization&apos;s performance and analytics
              </p>
              {groupInfo.name && (
                <p className="text-gray-400 text-sm mt-1">
                  Organization:{' '}
                  <span className="text-white font-medium capitalize">
                    {groupInfo.name}
                  </span>
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-gray-400 text-sm">Data Period</div>
            <div className="text-white font-semibold text-xl">{timeRange}</div>
          </div>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card
              key={card.id}
              className={`group transition-all duration-200 hover:shadow-lg ${
                card.href ? 'cursor-pointer hover:-translate-y-1' : ''
              }`}
              padding="p-6"
              hoverable={!!card.href}
            >
              {card.href ? (
                <a href={card.href} className="block h-full">
                  <StatCardContent card={card} Icon={Icon} />
                </a>
              ) : (
                <StatCardContent card={card} Icon={Icon} />
              )}
            </Card>
          );
        })}
      </div>

      {/* Growth Analytics Section */}
      {dailyGrowth.length > 0 && (
        <Card padding="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <AqBarChart01 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Growth Analytics
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Member growth over time
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total New Members
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalNewMembers.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <GrowthMetric value={recentGrowth} label="Recent Growth (7 days)" />
            <GrowthMetric
              value={validGrowthData.length}
              label="Active Growth Days"
            />
            <GrowthMetric
              value={Math.round(
                totalNewMembers / Math.max(validGrowthData.length, 1),
              )}
              label="Avg. Daily Growth"
            />
            <GrowthMetric
              value={`${activePercentage}%`}
              label="Activity Rate"
            />
          </div>
        </Card>
      )}

      {/* Role Distribution Section */}
      {isAdmin && processedRoles.length > 0 && (
        <Card padding="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <AqShield02 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Role Distribution
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Member roles and permissions across your organization
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {processedRoles.map((role) => {
              const percentage =
                totalMembers > 0
                  ? Math.round((role.count / totalMembers) * 100)
                  : 0;
              return (
                <RoleCard key={role._id} role={role} percentage={percentage} />
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

// Fixed helper component for stat cards
const StatCardContent = ({ card, Icon }) => (
  <div className="h-full flex flex-col">
    {/* Icon and trend */}
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      {card.trend && (
        <div className="flex items-center gap-1">
          <AqTrendUp01 className="w-4 h-4 text-green-600" />
          <span className="text-xs font-medium text-green-600 whitespace-nowrap">
            {card.trend}
          </span>
        </div>
      )}
    </div>

    {/* Value and percentage/score */}
    <div className="flex items-end justify-between mb-3">
      <div className="text-3xl font-bold text-gray-900 dark:text-white truncate">
        {card.value}
      </div>
      {card.id === 'engagement-score' && card.score !== undefined && (
        <span
          className={`text-sm font-semibold px-2 py-1 rounded-full ml-2 shrink-0 ${
            card.score >= 8
              ? 'text-green-600 bg-green-50 dark:bg-green-900/30'
              : card.score >= 6
                ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30'
                : 'text-red-600 bg-red-50 dark:bg-red-900/30'
          }`}
        >
          /10
        </span>
      )}
      {card.percentage !== undefined && card.id !== 'engagement-score' && (
        <span className="text-sm font-semibold text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full ml-2 shrink-0">
          {card.percentage}%
        </span>
      )}
    </div>

    {/* Title and subtitle */}
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
        {card.title}
      </h3>
      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
        {card.subtitle}
      </p>
    </div>

    {/* Progress bars */}
    <div className="mt-auto space-y-2">
      {card.progress !== undefined && (
        <div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                card.id === 'engagement-score'
                  ? card.score >= 8
                    ? 'bg-green-500'
                    : card.score >= 6
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  : 'bg-primary'
              }`}
              style={{ width: `${Math.min(card.progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {card.percentage !== undefined && card.id === 'active-members' && (
        <div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${card.percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  </div>
);

// Helper component for growth metrics
const GrowthMetric = ({ value, label }) => (
  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
    <div className="text-xl font-bold text-gray-900 dark:text-white">
      {typeof value === 'number' ? value.toLocaleString() : value}
    </div>
    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{label}</div>
  </div>
);

// Helper component for role cards
const RoleCard = ({ role, percentage }) => (
  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <div className="text-xl font-bold text-gray-900 dark:text-white">
        {role.count.toLocaleString()}
      </div>
      <div className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
        {percentage}%
      </div>
    </div>
    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
      {role.displayName}
    </div>
    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
      {role.permissions.length} permissions
    </div>
    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
      <div
        className="bg-primary h-1.5 rounded-full transition-all duration-700 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
);

export default OrganizationDashboardPage;
