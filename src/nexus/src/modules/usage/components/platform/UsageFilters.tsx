'use client';

import React from 'react';
import { Checkbox } from '@/shared/components/ui';
import { Input } from '@/shared/components/ui';
import { currentUtcMonth } from '@/modules/usage/utils/format';

/**
 * Shared platform-Usage filters. Presentational — all state lives in the parent
 * page so the month/exclude/kind selections can be shared across the overview,
 * pages, users and retention sections without prop drilling or a context.
 *
 * The month input is a native `<input type="month">` which natively disables
 * future months via its `max` attribute (the backend also 400s future months).
 */
export interface UsageFiltersProps {
  month: string;
  onMonthChange: (month: string) => void;
  excludeInternal: boolean;
  onExcludeInternalChange: (checked: boolean) => void;
}

const UsageFilters: React.FC<UsageFiltersProps> = ({
  month,
  onMonthChange,
  excludeInternal,
  onExcludeInternalChange,
}) => {
  const maxMonth = currentUtcMonth();
  // Native month inputs operate on local semantics, so we cap at the current
  // UTC month string; the `max` attribute blocks native forward navigation.
  // The backend also 400s future months, so this guard is purely a UX aid.

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="usage-month"
          className="text-sm font-medium text-foreground"
        >
          Month (UTC)
        </label>
        <Input
          id="usage-month"
          type="month"
          value={month}
          max={maxMonth}
          onChange={e => {
            const next = e.target.value as string;
            if (!next) return;
            // Reject future months defensively even if the browser's native
            // guard is bypassed programmatically.
            if (next > maxMonth) {
              return;
            }
            onMonthChange(next);
          }}
          aria-describedby="usage-month-help"
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
  );
};

export default UsageFilters;
