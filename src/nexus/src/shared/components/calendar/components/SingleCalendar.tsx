'use client';

import React, { useCallback } from 'react';
import { Calendar } from './Calendar';
import { DateRange } from '../types';

interface SingleCalendarProps {
  onApply?: (value: DateRange) => void;
  onCancel?: () => void;
  initialRange?: DateRange;
  minDate?: Date;
  maxDate?: Date;
  disabled?: (date: Date) => boolean;
}

export function SingleCalendar({
  onApply,
  onCancel,
  initialRange,
  minDate,
  maxDate,
  disabled,
}: SingleCalendarProps) {
  const [selectedRange, setSelectedRange] = React.useState<DateRange>(
    initialRange || { from: undefined, to: undefined }
  );

  const handleRangeChange = useCallback((range: DateRange) => {
    setSelectedRange(range);
  }, []);

  return (
    <Calendar
      numberOfMonths={1}
      // One click selects the day. Without this the grid ran its two-click
      // range logic and left the end-of-range box empty after a single pick.
      mode="single"
      onApply={onApply}
      onCancel={onCancel}
      initialRange={initialRange}
      selectedRange={selectedRange}
      onRangeChange={handleRangeChange}
      minDate={minDate}
      maxDate={maxDate}
      disabled={disabled}
    />
  );
}
