'use client';

import React, { useMemo, useState } from 'react';
import { Card, Input, PageHeading } from '@/shared/components/ui';
import { isAbortError } from '@/shared/lib/retryPolicy';
import {
  useUsageBreakdown,
  useUsageCalendar,
  useUsageSummary,
  useUsageTimeline,
} from '@/modules/usage/hooks/useUsageQueries';
import {
  currentUtcDate,
  currentUtcMonth,
  normalizeKind,
} from '@/modules/usage/utils/format';
import UserUsageBreakdown from './UserUsageBreakdown';
import UserUsageCalendar from './UserUsageCalendar';
import UserUsageSummary from './UserUsageSummary';
import UserUsageTimeline from './UserUsageTimeline';
import type { UsageKind, UsageMetric } from '@/shared/types/usage';

export interface UserUsagePanelProps {
  userId: string;
}

const usageError = (error: Error | null): Error | null =>
  error && !isAbortError(error) ? error : null;

/**
 * Composes the existing per-user usage views for the profile page. Keeping
 * query state here means each presentational component remains reusable in
 * admin/user contexts and only the active profile tab starts these reads.
 */
const UserUsagePanel: React.FC<UserUsagePanelProps> = ({ userId }) => {
  const [month, setMonth] = useState(currentUtcMonth);
  const [metric, setMetric] = useState<UsageMetric>('activity');
  const [kind, setKind] = useState<UsageKind>('page');
  const [timelineDate, setTimelineDate] = useState(currentUtcDate);

  const calendarYear = Number(month.slice(0, 4));
  const summaryParams = useMemo(() => ({ month, tz: 'UTC' }), [month]);
  const breakdownParams = useMemo(
    () => ({ month, kind: normalizeKind(kind), limit: 20 }),
    [month, kind]
  );
  const calendarParams = useMemo(
    () => ({ year: calendarYear, metric, tz: 'UTC' }),
    [calendarYear, metric]
  );

  const summary = useUsageSummary(userId, summaryParams);
  const breakdown = useUsageBreakdown(userId, breakdownParams);
  const calendar = useUsageCalendar(userId, calendarParams);
  const timeline = useUsageTimeline(userId, timelineDate, 'UTC');

  const handleMonthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    if (next && next <= currentUtcMonth()) {
      setMonth(next);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title="Usage"
        subtitle="Your activity, content usage, and daily engagement."
      />

      <Card className="flex flex-wrap items-end gap-4 p-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="profile-usage-month"
            className="text-sm font-medium text-foreground"
          >
            Month (UTC)
          </label>
          <Input
            id="profile-usage-month"
            type="month"
            value={month}
            max={currentUtcMonth()}
            onChange={handleMonthChange}
          />
        </div>
      </Card>

      <UserUsageSummary
        data={summary.data}
        isLoading={summary.isLoading}
        error={usageError(summary.error)}
        onRetry={summary.refetch}
      />

      <UserUsageCalendar
        data={calendar.data}
        isLoading={calendar.isLoading}
        error={usageError(calendar.error)}
        onRetry={calendar.refetch}
        metric={metric}
        onMetricChange={setMetric}
        selectedDate={timelineDate}
        onSelectDate={setTimelineDate}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <UserUsageBreakdown
          data={breakdown.data}
          isLoading={breakdown.isLoading}
          error={usageError(breakdown.error)}
          onRetry={breakdown.refetch}
          kind={kind}
          onKindChange={setKind}
        />
        <UserUsageTimeline
          data={timeline.data}
          isLoading={timeline.isLoading}
          error={usageError(timeline.error)}
          onRetry={timeline.refetch}
          date={timelineDate}
          onDateChange={setTimelineDate}
        />
      </div>
    </div>
  );
};

export default UserUsagePanel;
