'use client';

import React from 'react';
import { Card } from '@/shared/components/ui';
import { LoadingState } from '@/shared/components/ui';
import { EmptyState } from '@/shared/components/ui';
import { SegmentedTabs } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';
import { DATE_FORMATS, formatWithPattern } from '@/shared/utils';
import {
  buildCalendarGrid,
  calendarLevelClass,
} from '@/modules/usage/utils/calendar';
import { formatNumber } from '@/modules/usage/utils/format';
import UsageSectionError from '@/modules/usage/components/platform/UsageSectionError';
import type { UsageCalendarResponse, UsageMetric } from '@/shared/types/usage';

export interface UserUsageCalendarProps {
  data: UsageCalendarResponse | null;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  metric: UsageMetric;
  onMetricChange: (metric: UsageMetric) => void;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

const METRIC_OPTIONS: { value: UsageMetric; label: string }[] = [
  { value: 'activity', label: 'Activity' },
  { value: 'page_views', label: 'Page views' },
  { value: 'api_calls', label: 'API calls' },
];

const CELL = 'w-[14px] h-[14px] sm:w-4 sm:h-4 rounded-sm';

/**
 * GitHub-style activity heatmap for a single user. Day cells carry both a
 * colour intensity AND an accessible text label (via aria-label/title), so
 * meaning is never colour-only. Out-of-range padding cells are hidden from
 * assistive tech. Clicking a day with activity selects it for the timeline.
 */
const UserUsageCalendar: React.FC<UserUsageCalendarProps> = ({
  data,
  isLoading,
  error,
  onRetry,
  metric,
  onMetricChange,
  selectedDate,
  onSelectDate,
}) => {
  if (isLoading && !data) {
    return (
      <Card className="p-4">
        <LoadingState
          text="Loading activity calendar..."
          className="min-h-[160px]"
        />
      </Card>
    );
  }

  if (error && !data) {
    return (
      <UsageSectionError
        title="Failed to load activity calendar"
        message={error.message || 'An unexpected error occurred.'}
        onRetry={onRetry}
      />
    );
  }

  if (!data) {
    return (
      <Card className="p-4">
        <EmptyState
          title="No activity recorded"
          description="This user has no recorded activity for the requested period."
          compact
        />
      </Card>
    );
  }

  const grid = buildCalendarGrid(data.days, data.from, data.to);
  const hasActivity = data.total > 0;
  const fromLabel = formatWithPattern(
    data.from,
    DATE_FORMATS.READABLE_DATE_LONG
  );
  const toLabel = formatWithPattern(data.to, DATE_FORMATS.READABLE_DATE_LONG);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Activity Calendar
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Daily activity over the last year · {fromLabel} to {toLabel}
            {data.tz ? ` · ${data.tz}` : ''}
          </p>
        </div>
        <SegmentedTabs<UsageMetric>
          ariaLabel="Calendar metric"
          size="sm"
          options={METRIC_OPTIONS}
          value={metric}
          onChange={onMetricChange}
        />
      </div>

      {/* Text summary gives non-visual access to the headline numbers. */}
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {hasActivity ? (
          <>
            <span className="font-medium text-foreground">
              {formatNumber(data.total)}
            </span>{' '}
            actions across{' '}
            <span className="font-medium text-foreground">
              {formatNumber(data.active_days)}
            </span>{' '}
            active days · current streak{' '}
            <span className="font-medium text-foreground">
              {formatNumber(data.current_streak)}d
            </span>{' '}
            · longest{' '}
            <span className="font-medium text-foreground">
              {formatNumber(data.longest_streak)}d
            </span>
          </>
        ) : (
          'No activity recorded in this period — the user may be new or have not synced yet.'
        )}
      </p>

      {!hasActivity ? (
        <EmptyState
          title="No activity yet"
          description="Days with activity will fill in here as the user engages with the platform."
          compact
        />
      ) : (
        <div className="overflow-x-auto">
          <div
            className="inline-flex flex-col gap-1"
            role="figure"
            aria-label={`Daily activity heatmap from ${fromLabel} to ${toLabel}`}
          >
            {/* Month labels row, aligned above the week columns. */}
            <div className="flex" style={{ marginLeft: 36 }}>
              {Array.from({ length: grid.weeks.length }, (_, weekIndex) => {
                const labels = grid.monthLabels
                  .filter(label => label.weekIndex === weekIndex)
                  .map(label => label.label);
                return (
                  <div
                    key={weekIndex}
                    className="w-[18px] sm:w-5 shrink-0 text-[10px] text-muted-foreground"
                  >
                    {labels.join(' / ')}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-1">
              {/* Weekday labels column (every other row to reduce clutter). */}
              <div className="flex flex-col gap-1 pr-1 w-8">
                {grid.weekdays.map((name: string, i: number) => (
                  <div
                    key={name}
                    className={cn(
                      CELL,
                      'flex items-center justify-end text-[10px] text-muted-foreground'
                    )}
                  >
                    {i % 2 === 1 ? name : ''}
                  </div>
                ))}
              </div>

              {/* Week columns. */}
              {grid.weeks.map((column, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {column.map((cell, weekday) => {
                    if (!cell) {
                      // Padding cell — visible gap, hidden from AT.
                      return (
                        <div
                          key={weekday}
                          className={CELL}
                          aria-hidden="true"
                        />
                      );
                    }
                    const isSelected = cell.date === selectedDate;
                    const label = `${formatWithPattern(cell.date, DATE_FORMATS.READABLE_DATE_LONG)}: ${cell.count} actions, intensity level ${cell.level}`;
                    if (cell.count === 0) {
                      return (
                        <div
                          key={cell.date}
                          role="img"
                          aria-label={label}
                          title={label}
                          className={cn(CELL, calendarLevelClass(0))}
                        />
                      );
                    }
                    return (
                      <button
                        key={cell.date}
                        type="button"
                        aria-label={label}
                        aria-pressed={isSelected}
                        title={label}
                        onClick={() => onSelectDate(cell.date)}
                        className={cn(
                          CELL,
                          calendarLevelClass(cell.level),
                          'transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/50',
                          isSelected && 'ring-2 ring-primary'
                        )}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Accessible legend: intensity buckets with their thresholds. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>Less</span>
        {([0, 1, 2, 3, 4] as const).map(level => (
          <span
            key={level}
            role="img"
            aria-label={`Intensity level ${level}`}
            className={cn(CELL, calendarLevelClass(level))}
          />
        ))}
        <span>More</span>
        {data.thresholds && data.thresholds.length === 4 ? (
          <span className="ml-1">thresholds: {data.thresholds.join(', ')}</span>
        ) : null}
      </div>
    </Card>
  );
};

export default UserUsageCalendar;
