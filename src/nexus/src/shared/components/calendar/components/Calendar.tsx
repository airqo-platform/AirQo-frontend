'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { AqChevronLeft } from '@airqo/icons-react';
import { AqChevronRight } from '@airqo/icons-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { DateRange } from '../types';
import { YearSelector } from './YearSelector';
import { CalendarFooter } from './CalendarFooter';

/** Weeks start on Monday, so the grid leads with the row containing the 1st. */
const WEEK_STARTS_ON = 1 as const;

interface CoreCalendarProps {
  numberOfMonths?: number;
  /**
   * How many days one click selects. `'range'` (the default) needs a start and
   * an end click. `'single'` completes on the first click.
   *
   * This must be threaded all the way down: the grid used to always run its
   * two-click range logic, so a single-date picker asked the user for a second
   * click it had no use for, and left the end-of-range box empty.
   */
  mode?: 'single' | 'range';
  onApply?: (value: DateRange) => void;
  onCancel?: () => void;
  initialRange?: DateRange;
  selectedRange?: DateRange; // For controlled mode
  /** Observe selection changes; pair with `selectedRange` for controlled use. */
  onRangeChange?: (range: DateRange) => void;
  /** Earliest selectable day (inclusive). Omit for no lower bound. */
  minDate?: Date;
  /** Latest selectable day (inclusive). Omit for no upper bound. */
  maxDate?: Date;
  /** Extra per-day predicate, applied on top of `minDate`/`maxDate`. */
  disabled?: (date: Date) => boolean;
  children?: React.ReactNode; // For presets sidebar
}

export function Calendar({
  numberOfMonths = 2,
  mode = 'range',
  onApply,
  onCancel,
  initialRange,
  selectedRange: controlledRange,
  onRangeChange,
  minDate,
  maxDate,
  disabled,
  children,
}: CoreCalendarProps) {
  const [displayMonth, setDisplayMonth] = useState(
    initialRange?.from ? startOfMonth(initialRange.from) : new Date()
  );
  const [internalRange, setInternalRange] = useState<DateRange>(
    initialRange || { from: undefined, to: undefined }
  );
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Bounds are compared as local calendar days: every cell in the grid is a
  // local midnight already, so comparing instants would make an upper bound
  // of "today at 00:00" reject today itself.
  const minDayMs = minDate ? startOfDay(minDate).getTime() : null;
  const maxDayMs = maxDate ? startOfDay(maxDate).getTime() : null;
  const isDayDisabled = useCallback(
    (day: Date) => {
      const time = startOfDay(day).getTime();
      if (minDayMs !== null && time < minDayMs) return true;
      if (maxDayMs !== null && time > maxDayMs) return true;
      return disabled ? Boolean(disabled(day)) : false;
    },
    [minDayMs, maxDayMs, disabled]
  );
  // Month arrows stop at the edges of the selectable window so a bounded
  // calendar can never page into a month where nothing is selectable.
  const isMonthReachable = useCallback(
    (offset: number) => {
      const first = startOfMonth(addMonths(displayMonth, offset));
      const last = endOfMonth(addMonths(displayMonth, offset));
      if (minDayMs !== null && startOfDay(last).getTime() < minDayMs)
        return false;
      if (maxDayMs !== null && startOfDay(first).getTime() > maxDayMs)
        return false;
      return true;
    },
    [displayMonth, minDayMs, maxDayMs]
  );

  // Use controlled range if provided, otherwise use internal state
  const selectedRange =
    controlledRange !== undefined ? controlledRange : internalRange;

  // Generate calendar days for display
  const calendarMonths = useMemo(
    () =>
      Array.from({ length: numberOfMonths }, (_, i) => {
        const month = addMonths(displayMonth, i);
        // Pad to whole Monday-start weeks on both sides so every month renders
        // a stable 6-row grid instead of reflowing between 4, 5 and 6 rows.
        const gridStart = startOfWeek(startOfMonth(month), {
          weekStartsOn: WEEK_STARTS_ON,
        });
        const lastDay = endOfMonth(month);
        const gridEnd = addDays(lastDay, (7 - lastDay.getDay()) % 7);

        return {
          month,
          days: eachDayOfInterval({ start: gridStart, end: gridEnd }),
        };
      }),
    [displayMonth, numberOfMonths]
  );

  const handleDateSelect = useCallback(
    (date: Date) => {
      const newRange = (() => {
        // A single-date picker completes on the first click. Returning
        // `{ from, to: undefined }` here (the old unconditional behaviour) left
        // the end-of-range box empty and made the user click a second day they
        // had no reason to pick before Apply would even mean something.
        if (mode === 'single') return { from: date, to: date };
        // Always allow range selection for API consistency
        if (!selectedRange.from || selectedRange.to)
          return { from: date, to: undefined };
        return date < selectedRange.from
          ? { from: date, to: selectedRange.from }
          : { from: selectedRange.from, to: date };
      })();

      if (controlledRange === undefined) {
        setInternalRange(newRange);
      }
      onRangeChange?.(newRange);
    },
    [mode, selectedRange, controlledRange, onRangeChange]
  );

  const handleYearChange = useCallback((year: number) => {
    setDisplayMonth(prev => new Date(year, prev.getMonth(), 1));
  }, []);

  const getDayClassName = useCallback(
    (day: Date, isCurrentMonth: boolean, isDisabled: boolean) => {
      if (!isCurrentMonth)
        return 'text-muted-foreground/40 cursor-default hover:bg-transparent';
      if (isDisabled)
        return 'text-muted-foreground/40 cursor-not-allowed hover:bg-transparent';

      const isToday = isSameDay(day, new Date());
      const isStart = selectedRange.from && isSameDay(day, selectedRange.from);
      const isEnd = selectedRange.to && isSameDay(day, selectedRange.to);
      const isSelected = isStart || isEnd;
      const isInRange =
        selectedRange.from &&
        selectedRange.to &&
        isWithinInterval(day, {
          start: selectedRange.from,
          end: selectedRange.to,
        }) &&
        !isSelected;
      const isHovered =
        hoveredDate &&
        selectedRange.from &&
        !selectedRange.to &&
        isWithinInterval(day, {
          start:
            selectedRange.from < hoveredDate ? selectedRange.from : hoveredDate,
          end:
            selectedRange.from > hoveredDate ? selectedRange.from : hoveredDate,
        });

      const classes = [
        // Use relative positioning to allow layering; selected days receive higher z-index
        'h-9 w-9 text-sm flex items-center justify-center relative transition-all',
      ];

      // Rounded corners
      if (isStart) classes.push('rounded-l-md');
      if (isEnd) classes.push('rounded-r-md');
      if (!isInRange && !isStart && !isEnd) classes.push('rounded-md');

      // Visual styles and layering: ensure selected date appears on top
      if (isToday && !isSelected) classes.push('ring-1 ring-primary z-20');

      // Selected date: highest z-index so it renders above range/hover highlights
      if (isSelected)
        classes.push(
          'bg-primary text-primary-foreground hover:bg-primary font-medium shadow-sm z-20'
        );

      // Range / hover highlights should be underneath selected date
      if ((isInRange || isHovered) && !isSelected)
        classes.push('bg-accent z-10');

      // Default text / hover styles for non-selected cells
      if (!isSelected)
        classes.push(
          'text-foreground hover:bg-accent hover:ring-1 hover:ring-muted'
        );

      return classes.join(' ');
    },
    [selectedRange, hoveredDate]
  );

  const currentYear = displayMonth.getFullYear();

  return (
    <Card
      className={`shadow-lg border border-border ${numberOfMonths === 1 ? 'w-auto' : 'max-w-2xl'}`}
    >
      <CardContent className="p-0">
        <div className="flex">
          {children}

          <div className="flex-1 p-4">
            <div className={`flex ${numberOfMonths === 1 ? '' : 'gap-12'}`}>
              {calendarMonths.map(({ month, days }, monthIndex) => (
                <div
                  key={monthIndex}
                  className={numberOfMonths === 1 ? '' : 'flex-1'}
                >
                  <div className="flex items-center justify-between mb-4">
                    {monthIndex === 0 && (
                      <Button
                        variant="outlined"
                        size="sm"
                        onClick={() =>
                          setDisplayMonth(addMonths(displayMonth, -1))
                        }
                        disabled={!isMonthReachable(-1)}
                        aria-label="Previous month"
                        className="h-8 w-8 p-0 hover:bg-accent"
                        Icon={AqChevronLeft}
                      />
                    )}
                    {monthIndex !== 0 && <div className="w-8" />}

                    <div className="flex items-center gap-2">
                      <span className="text-sm">{format(month, 'MMM')}</span>
                      {monthIndex === 0 && (
                        <YearSelector
                          currentYear={currentYear}
                          onYearChange={handleYearChange}
                        />
                      )}
                      {monthIndex !== 0 && (
                        <span className="text-sm">{month.getFullYear()}</span>
                      )}
                    </div>

                    {monthIndex === numberOfMonths - 1 && (
                      <Button
                        variant="outlined"
                        size="sm"
                        onClick={() =>
                          setDisplayMonth(addMonths(displayMonth, 1))
                        }
                        disabled={!isMonthReachable(1)}
                        aria-label="Next month"
                        className="h-8 w-8 p-0 hover:bg-accent"
                        Icon={AqChevronRight}
                      />
                    )}
                    {monthIndex !== numberOfMonths - 1 && (
                      <div className="w-8" />
                    )}
                  </div>

                  <div className="grid grid-cols-7 mb-1">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                      day => (
                        <div
                          key={day}
                          className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
                        >
                          {day}
                        </div>
                      )
                    )}
                  </div>

                  <div className="grid grid-cols-7 gap-0">
                    {/* Whole Monday-start weeks, so a month renders 4, 5 or 6
                        rows depending on the month. Keyed by the day itself
                        rather than the index: the list changes length between
                        months, and an index key would let React reuse the wrong
                        cell. */}
                    {days.map(day => {
                      const isCurrentMonth = isSameMonth(day, month);
                      const isDisabled = isDayDisabled(day);
                      const isSelectable = isCurrentMonth && !isDisabled;
                      return (
                        <button
                          key={day.getTime()}
                          type="button"
                          onClick={() => isSelectable && handleDateSelect(day)}
                          onMouseEnter={() =>
                            isSelectable && setHoveredDate(day)
                          }
                          onMouseLeave={() => setHoveredDate(null)}
                          disabled={!isSelectable}
                          aria-disabled={!isSelectable}
                          className={getDayClassName(
                            day,
                            isCurrentMonth,
                            isDisabled
                          )}
                        >
                          {format(day, 'd')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <CalendarFooter
          numberOfMonths={numberOfMonths}
          mode={mode}
          selectedRange={selectedRange}
          onCancel={() => {
            // First call the custom onCancel if provided (for dialog close)
            onCancel?.();
            // Then clear the range
            const emptyRange = { from: undefined, to: undefined };
            if (controlledRange === undefined) {
              setInternalRange(emptyRange);
            }
            onRangeChange?.(emptyRange);
          }}
          onApply={() => onApply?.(selectedRange)}
        />
      </CardContent>
    </Card>
  );
}
