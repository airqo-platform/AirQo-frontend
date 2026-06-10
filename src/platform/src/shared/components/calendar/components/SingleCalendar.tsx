'use client';

import React, { useCallback } from 'react';
import { Calendar } from './Calendar';
import { DateRange } from '../types';

interface SingleCalendarProps {
  onApply?: (value: DateRange) => void;
  onCancel?: () => void;
  initialRange?: DateRange;
}

export function SingleCalendar({
  onApply,
  onCancel,
  initialRange,
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
      onApply={onApply}
      onCancel={onCancel}
      initialRange={initialRange}
      selectedRange={selectedRange}
      onRangeChange={handleRangeChange}
    />
  );
}
