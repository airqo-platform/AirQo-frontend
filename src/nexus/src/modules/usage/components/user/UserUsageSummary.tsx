'use client';

import React from 'react';
import { Card } from '@/shared/components/ui';
import { LoadingState } from '@/shared/components/ui';
import { EmptyState } from '@/shared/components/ui';
import {
  DASH,
  formatNumber,
  formatDurationSec,
} from '@/modules/usage/utils/format';
import UsageSectionError from '@/modules/usage/components/platform/UsageSectionError';
import UsageChangeBadge from '@/modules/usage/components/shared/UsageChangeBadge';
import UsageMetricCard from '@/modules/usage/components/shared/UsageMetricCard';
import type { UsageSummaryResponse } from '@/shared/types/usage';

export interface UserUsageSummaryProps {
  data: UsageSummaryResponse | null;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
}

const UserUsageSummary: React.FC<UserUsageSummaryProps> = ({
  data,
  isLoading,
  error,
  onRetry,
}) => {
  if (isLoading && !data) {
    return (
      <LoadingState text="Loading usage summary..." className="min-h-[160px]" />
    );
  }

  if (error && !data) {
    return (
      <UsageSectionError
        title="Failed to load usage summary"
        message={error.message || 'An unexpected error occurred.'}
        onRetry={onRetry}
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="No usage summary yet"
        description="Once this user records activity, their monthly summary will appear here."
        compact
      />
    );
  }

  const change = data.change_pct ?? {};

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-foreground">
          Monthly Summary
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Activity for {data.month} · {data.active_days} of {data.days_in_month}{' '}
          days active
          {data.tz ? ` · times in ${data.tz}` : ''}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <UsageMetricCard
          label="Total actions"
          value={formatNumber(data.total_actions)}
          hint={<UsageChangeBadge value={change.total_actions} />}
        />
        <UsageMetricCard
          label="Page views"
          value={formatNumber(data.page_views)}
        />
        <UsageMetricCard
          label="API calls"
          value={formatNumber(data.api_calls)}
        />
        <UsageMetricCard
          label="Active days"
          value={formatNumber(data.active_days)}
        />
        <UsageMetricCard label="Sessions" value={formatNumber(data.sessions)} />
        <UsageMetricCard
          label="Avg session"
          value={formatDurationSec(data.avg_session_sec)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Current streak</p>
          <p className="text-xl font-bold tabular-nums">
            {formatNumber(data.current_streak)}d
          </p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Longest streak</p>
          <p className="text-xl font-bold tabular-nums">
            {formatNumber(data.longest_streak)}d
          </p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-sm text-muted-foreground">First seen</p>
          <p className="text-sm font-medium tabular-nums">
            {data.first_seen ?? DASH}
          </p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Last seen</p>
          <p className="text-sm font-medium tabular-nums">
            {data.last_seen ?? DASH}
          </p>
        </Card>
      </div>

      {data.session_metrics_basis ? (
        <p className="text-xs text-muted-foreground">
          Session metrics basis: {data.session_metrics_basis}
        </p>
      ) : null}
    </div>
  );
};

export default UserUsageSummary;
