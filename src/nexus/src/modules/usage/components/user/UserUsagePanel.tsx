'use client';

import React, { useMemo, useState } from 'react';
import { Card, PageHeading } from '@/shared/components/ui';
import { DatePicker } from '@/shared/components/calendar';
import type { DatePickerProps } from '@/shared/components/calendar';
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
  resolveMonthSelection,
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

/** Payload type emitted by the shared DatePicker's onChange callback. */
type DatePickerValue = Parameters<NonNullable<DatePickerProps['onChange']>>[0];

/** Extracts the picked Date from any DatePicker onChange payload shape. */
const pickedDate = (value: DatePickerValue): Date | null => {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const range = value as { from?: Date | string };
  const rawFrom = range.from;
  if (!rawFrom) return null;
  const from = rawFrom instanceof Date ? rawFrom : new Date(rawFrom);
  return Number.isNaN(from.getTime()) ? null : from;
};

const monthStringToDate = (month: string): Date | undefined => {
  if (!month || !/^\d{4}-\d{2}$/.test(month)) return undefined;
  const [y, m] = month.split('-').map(Number);
  // Always the first of the month so the trigger reads the canonical
  // "Sep 1, 2026" instead of whichever day was last picked.
  return new Date(y, m - 1, 1);
};

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

  const handleMonthChange = (value: DatePickerValue) => {
    const date = pickedDate(value);
    if (!date) return;
    setMonth(resolveMonthSelection(date));
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
          {/* key={month} remounts the picker on every applied month so its
              internal value (and trigger label) resets to the canonical
              first-of-month instead of lingering on the picked day. */}
          <DatePicker
            key={month}
            value={monthStringToDate(month)}
            onChange={handleMonthChange}
            placeholder="Select month"
            mode="single"
            id="profile-usage-month"
            className="w-[180px]"
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
