'use client';

import React from 'react';
import { Card } from '@/shared/components/ui';
import { Checkbox } from '@/shared/components/ui';
import { DatePicker } from '@/shared/components/calendar/components/DatePicker';
import { resolveMonthSelection } from '@/modules/usage/utils/format';

/**
 * Shared platform-Usage filters. Presentational — all state lives in the parent
 * page so the month/exclude/kind selections can be shared across the overview,
 * pages, users and retention sections without prop drilling or a context.
 *
 * Uses the reusable DatePicker component for consistent date selection UX. The
 * picker is day-granular but the dashboard is month-granular, so every pick is
 * resolved through `resolveMonthSelection`: any day normalises to its month
 * and future months clamp to the current UTC month — a selection ALWAYS
 * updates the dashboard.
 */
export interface UsageFiltersProps {
  month: string;
  onMonthChange: (month: string) => void;
  excludeInternal: boolean;
  onExcludeInternalChange: (checked: boolean) => void;
}

const monthStringToDate = (month: string): Date | undefined => {
  if (!month || !/^\d{4}-\d{2}$/.test(month)) return undefined;
  const [y, m] = month.split('-').map(Number);
  // Always the first of the month so the trigger reads the canonical
  // "Sep 1, 2026" instead of whichever day was last picked.
  return new Date(y, m - 1, 1);
};

/** Extracts the picked Date from any DatePicker onChange payload shape. */
const pickedDate = (
  value: Date | { from?: Date | string } | string | undefined
): Date | null => {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const rawFrom = value.from;
  if (!rawFrom) return null;
  const from = rawFrom instanceof Date ? rawFrom : new Date(rawFrom);
  return Number.isNaN(from.getTime()) ? null : from;
};

const UsageFilters: React.FC<UsageFiltersProps> = ({
  month,
  onMonthChange,
  excludeInternal,
  onExcludeInternalChange,
}) => (
  <Card className="p-4">
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-foreground">Filters</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Choose the reporting month and audience scope for every section below.
      </p>
    </div>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="usage-month"
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
          onChange={value => {
            const date = pickedDate(value);
            if (!date) return;
            onMonthChange(resolveMonthSelection(date));
          }}
          placeholder="Select month"
          mode="single"
          id="usage-month"
          className="w-[180px]"
        />
        <p id="usage-month-help" className="text-xs text-muted-foreground">
          Activity is grouped by UTC day.
        </p>
      </div>

      <div className="flex items-center gap-2 sm:pt-7">
        <Checkbox
          id="usage-exclude-internal"
          checked={excludeInternal}
          onCheckedChange={checked => onExcludeInternalChange(Boolean(checked))}
          label={
            <span className="text-sm text-foreground">
              Exclude internal users
            </span>
          }
        />
      </div>
    </div>
  </Card>
);

export default UsageFilters;
