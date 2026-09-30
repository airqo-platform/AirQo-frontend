'use client';

import React, { useMemo } from 'react';
import { DatePicker, type DateRange } from '@/shared/components/ui';
import { toDateInputString, toLocalDate } from '../lib/format';

interface BillingDateRangeProps {
  id: string;
  label?: string;
  /** `yyyy-MM-dd` boundaries, as the Billing API date filters expect. */
  from?: string;
  to?: string;
  onChange: (range: { from: string; to: string }) => void;
  className?: string;
  placeholder?: string;
  /** Set false when a surrounding toolbar renders the label itself. */
  showLabel?: boolean;
}

/**
 * Date-range filter built on the shared `DatePicker` (presets included), so the
 * dashboard and payments list share one control instead of two hand-rolled
 * native date inputs each.
 */
const BillingDateRange: React.FC<BillingDateRangeProps> = ({
  id,
  label = 'Date range',
  from,
  to,
  onChange,
  className = 'w-full sm:w-[260px]',
  placeholder = 'Select date range',
  showLabel = true,
}) => {
  const value = useMemo<DateRange>(
    () => ({ from: toLocalDate(from), to: toLocalDate(to) }),
    [from, to]
  );

  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      {showLabel && (
        <label
          htmlFor={id}
          className="text-xs font-medium text-muted-foreground"
        >
          {label}
        </label>
      )}
      <DatePicker
        id={id}
        value={value}
        onChange={next => {
          const range = next as DateRange;
          onChange({
            from: toDateInputString(range?.from),
            to: toDateInputString(range?.to ?? range?.from),
          });
        }}
        mode="range"
        returnFormat="date"
        placeholder={placeholder}
        className={className}
      />
    </div>
  );
};

export default BillingDateRange;
