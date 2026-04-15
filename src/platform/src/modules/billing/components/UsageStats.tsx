'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  InfoBanner,
  LoadingSpinner,
  WarningBanner,
} from '@/shared/components/ui';
import { AqRefreshCcw01 } from '@airqo/icons-react';
import { subscriptionService } from '@/shared/services/subscriptionService';
import type { ApiUsage } from '@/shared/types/api';

interface UsagePeriod {
  title: string;
  data: {
    used: number | null;
    limit: number | null;
    resetTime: string;
  };
  description: string;
}

const UsageStats: React.FC = () => {
  const [usage, setUsage] = useState<ApiUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const data = await subscriptionService.getUsage();
        if (data.success) {
          setUsage(data.usage || null);
        }
      } catch (error) {
        console.error('Error fetching usage stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
    const interval = setInterval(fetchUsage, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatResetTime = (resetTime: string): string => {
    const reset = new Date(resetTime);
    const now = new Date();
    const diff = reset.getTime() - now.getTime();

    if (diff < 0) return 'Resetting...';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `Resets in ${days} day${days > 1 ? 's' : ''}`;
    }
    if (hours > 0) {
      return `Resets in ${hours}h ${minutes}m`;
    }
    return `Resets in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  const getUsagePercentage = (
    used: number | null,
    limit: number | null
  ): number => {
    if (used === null || limit === null || !limit) {
      return 0;
    }

    return Math.min((used / limit) * 100, 100);
  };

  const formatUsageValue = (used: number | null): string => {
    if (used === null) {
      return '--';
    }

    return used.toLocaleString();
  };

  const formatLimitValue = (limit: number | null): string => {
    if (limit === null) {
      return '--';
    }

    return limit.toLocaleString();
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      </Card>
    );
  }

  if (!usage) {
    return null;
  }

  const usagePeriods: UsagePeriod[] = [
    {
      title: 'Hourly Usage',
      data: usage.hourly,
      description: 'API calls in the current hour',
    },
    {
      title: 'Daily Usage',
      data: usage.daily,
      description: 'API calls today',
    },
    {
      title: 'Monthly Usage',
      data: usage.monthly,
      description: 'API calls this month',
    },
  ];

  const hasUsageData = usagePeriods.some(period => period.data.used !== null);
  const nearLimit = hasUsageData
    ? usagePeriods.some(
        period => getUsagePercentage(period.data.used, period.data.limit) >= 90
      )
    : false;

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          API Usage Statistics
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Monitor your rate-limit usage across hourly, daily, and monthly
          windows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {usagePeriods.map(period => {
          const percentage = getUsagePercentage(
            period.data.used,
            period.data.limit
          );
          const progressColor = getProgressColor(percentage);

          return (
            <div
              key={period.title}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700"
            >
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                {period.title}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                {period.description}
              </p>

              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatUsageValue(period.data.used)}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    / {formatLimitValue(period.data.limit)}
                  </span>
                </div>

                <div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${progressColor} transition-all duration-500 ease-out rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {period.data.used === null
                        ? 'Usage data unavailable'
                        : `${percentage.toFixed(1)}% used`}
                    </span>
                    {period.data.used !== null && percentage >= 90 && (
                      <span className="text-xs font-medium text-red-600 dark:text-red-400">
                        Limit approaching
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {formatResetTime(period.data.resetTime)}
                    </span>
                    <AqRefreshCcw01
                      size={13}
                      className="text-gray-500 dark:text-gray-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {nearLimit && (
        <WarningBanner
          title="Usage Limit Warning"
          message="You are approaching one or more rate limits. Consider upgrading your subscription tier to avoid throttling."
          className="mt-6"
        />
      )}

      <InfoBanner
        title="Rate Limits"
        message="When rate limiting is enabled in your environment, requests above your tier limit may return HTTP 429. Implement backoff and retries in client integrations."
        className="mt-6"
      />
    </Card>
  );
};

export default UsageStats;
