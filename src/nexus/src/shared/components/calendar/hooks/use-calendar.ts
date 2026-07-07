'use client';

import { useState, useCallback, useMemo } from 'react';
import { addMonths, subMonths } from 'date-fns';
import { DateRange } from '../types';
import { DateUtils } from '../utils/date-utils';

export interface UseCalendarOptions {
  mode?: 'single' | 'range';
  selected?: Date | DateRange;
  onSelect?: (date: Date | DateRange | undefined) => void;
  disabled?: (date: Date) => boolean;
  minDate?: Date;
  maxDate?: Date;
  defaultMonth?: Date;
  numberOfMonths?: number;
}

export function useCalendar(options: UseCalendarOptions = {}) {
  const {
    mode = 'single',
    selected,
    onSelect,
    disabled,
    minDate,
    maxDate,
    defaultMonth = new Date(),
    numberOfMonths = 1,
  } = options;

  const [displayMonth, setDisplayMonth] = useState(defaultMonth);
  const [hoveredDate, setHoveredDate] = useState<Date | undefined>();

  const months = useMemo(() => {
    const months: Date[] = [];
    for (let i = 0; i < numberOfMonths; i++) {
      months.push(addMonths(displayMonth, i));
    }
    return months;
  }, [displayMonth, numberOfMonths]);

  const calendarDays = useMemo(() => {
    return months.map(month => DateUtils.getCalendarDays(month));
  }, [months]);

  const goToNextMonth = useCallback(() => {
    setDisplayMonth(prev => addMonths(prev, 1));
  }, []);

  const goToPrevMonth = useCallback(() => {
    setDisplayMonth(prev => subMonths(prev, 1));
  }, []);

  const goToMonth = useCallback((month: Date) => {
    setDisplayMonth(month);
  }, []);

  const selectDate = useCallback(
    (date: Date) => {
      if (DateUtils.isDateDisabled(date, disabled, minDate, maxDate)) {
        return;
      }

      if (mode === 'single') {
        onSelect?.(date);
      } else if (mode === 'range') {
        const currentRange = selected as DateRange | undefined;

        if (!currentRange?.from) {
          // Start new range
          onSelect?.({ from: date, to: undefined });
        } else if (currentRange.from && !currentRange.to) {
          // Complete range
          if (date < currentRange.from) {
            onSelect?.({ from: date, to: currentRange.from });
          } else {
            onSelect?.({ from: currentRange.from, to: date });
          }
        } else {
          // Start new range
          onSelect?.({ from: date, to: undefined });
        }
      }
    },
    [mode, selected, onSelect, disabled, minDate, maxDate]
  );

  const isDateSelected = useCallback(
    (date: Date) => {
      return DateUtils.isDateSelected(date, selected);
    },
    [selected]
  );

  const isDateDisabled = useCallback(
    (date: Date) => {
      return DateUtils.isDateDisabled(date, disabled, minDate, maxDate);
    },
    [disabled, minDate, maxDate]
  );

  const isDateHovered = useCallback(
    (date: Date) => {
      if (!hoveredDate || mode !== 'range') return false;

      const range = selected as DateRange | undefined;
      if (!range?.from || range.to) return false;

      const start = range.from < hoveredDate ? range.from : hoveredDate;
      const end = range.from > hoveredDate ? range.from : hoveredDate;

      return DateUtils.isDateInRange(date, { from: start, to: end });
    },
    [hoveredDate, mode, selected]
  );

  return {
    displayMonth,
    months,
    calendarDays,
    goToNextMonth,
    goToPrevMonth,
    goToMonth,
    selectDate,
    isDateSelected,
    isDateDisabled,
    isDateHovered,
    hoveredDate,
    setHoveredDate,
  };
}
