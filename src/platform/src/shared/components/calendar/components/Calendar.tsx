'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { AqChevronLeft } from '@airqo/icons-react';
import { AqChevronRight } from '@airqo/icons-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { DateRange } from '../types';
import { YearSelector } from './YearSelector';
import { CalendarFooter } from './CalendarFooter';

// Optimized date utilities
const dateUtils = {
  addMonths: (date: Date, months: number) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  },

  startOfMonth: (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1),
  endOfMonth: (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0),

  startOfWeek: (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return d;
  },

  eachDayOfInterval: (start: Date, end: Date) => {
    const days: Date[] = [];
    const current = new Date(start);
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  },

  isSameDay: (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear(),

  isSameMonth: (d1: Date, d2: Date) =>
    d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear(),

  isWithinRange: (date: Date, from: Date, to: Date) =>
    date >= from && date <= to,

  addDays: (date: Date, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  },

  formatDate: (
    date: Date,
    format: 'full' | 'month-year' | 'short-month' | 'day'
  ) => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const fullMonths = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    switch (format) {
      case 'full':
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
      case 'month-year':
        return `${fullMonths[date.getMonth()]} ${date.getFullYear()}`;
      case 'short-month':
        return months[date.getMonth()];
      case 'day':
        return date.getDate().toString();
    }
  },
};

interface CoreCalendarProps {
  numberOfMonths?: number;
  onApply?: (value: DateRange) => void;
  onCancel?: () => void;
  initialRange?: DateRange;
  selectedRange?: DateRange; // For controlled mode
  onRangeChange?: (range: DateRange) => void; // For controlled mode
  children?: React.ReactNode; // For presets sidebar
}

export function Calendar({
  numberOfMonths = 2,
  onApply,
  onCancel,
  initialRange,
  selectedRange: controlledRange,
  onRangeChange,
  children,
}: CoreCalendarProps) {
  const [displayMonth, setDisplayMonth] = useState(
    initialRange?.from ? dateUtils.startOfMonth(initialRange.from) : new Date()
  );
  const [internalRange, setInternalRange] = useState<DateRange>(
    initialRange || { from: undefined, to: undefined }
  );
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Use controlled range if provided, otherwise use internal state
  const selectedRange =
    controlledRange !== undefined ? controlledRange : internalRange;

  // Generate calendar days for display
  const calendarMonths = useMemo(() => {
    return Array.from({ length: numberOfMonths }, (_, i) => {
      const month = dateUtils.addMonths(displayMonth, i);
      const start = dateUtils.startOfWeek(dateUtils.startOfMonth(month));
      const end = new Date(dateUtils.endOfMonth(month));
      end.setDate(end.getDate() + (6 - end.getDay()));

      return {
        month,
        days: dateUtils.eachDayOfInterval(start, end),
      };
    });
  }, [displayMonth, numberOfMonths]);

  const handleDateSelect = useCallback(
    (date: Date) => {
      const newRange = (() => {
        // Always allow range selection for API consistency
        if (!selectedRange.from || selectedRange.to)
          return { from: date, to: undefined };
        return date < selectedRange.from
          ? { from: date, to: selectedRange.from }
          : { from: selectedRange.from, to: date };
      })();

      if (controlledRange !== undefined && onRangeChange) {
        onRangeChange(newRange);
      } else {
        setInternalRange(newRange);
      }
    },
    [selectedRange, controlledRange, onRangeChange]
  );

  const handleYearChange = useCallback((year: number) => {
    setDisplayMonth(prev => new Date(year, prev.getMonth(), 1));
  }, []);

  const getDayClassName = useCallback(
    (day: Date, isCurrentMonth: boolean) => {
      if (!isCurrentMonth)
        return 'text-muted-foreground/40 cursor-default hover:bg-transparent';

      const isToday = dateUtils.isSameDay(day, new Date());
      const isStart =
        selectedRange.from && dateUtils.isSameDay(day, selectedRange.from);
      const isEnd =
        selectedRange.to && dateUtils.isSameDay(day, selectedRange.to);
      const isSelected = isStart || isEnd;
      const isInRange =
        selectedRange.from &&
        selectedRange.to &&
        dateUtils.isWithinRange(day, selectedRange.from, selectedRange.to) &&
        !isSelected;
      const isHovered =
        hoveredDate &&
        selectedRange.from &&
        !selectedRange.to &&
        dateUtils.isWithinRange(
          day,
          selectedRange.from < hoveredDate ? selectedRange.from : hoveredDate,
          selectedRange.from > hoveredDate ? selectedRange.from : hoveredDate
        );

      const classes = [
        // Use relative positioning to allow layering; selected days receive higher z-index
        'h-9 w-9 text-sm flex items-center justify-center relative transition-all',
      ];

      // Rounded corners
      if (isStart) classes.push('rounded-l-md');
      if (isEnd) classes.push('rounded-r-md');
      if (!isInRange && !isStart && !isEnd) classes.push('rounded-md');

      // Visual styles and layering: ensure selected date appears on top
      if (isToday && !isSelected)
        classes.push('font-semibold ring-1 ring-primary z-20');

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
      className={`shadow-lg border-border ${numberOfMonths === 1 ? 'w-auto' : 'max-w-2xl'}`}
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
                          setDisplayMonth(dateUtils.addMonths(displayMonth, -1))
                        }
                        className="h-8 w-8 p-0 hover:bg-accent"
                        Icon={AqChevronLeft}
                      />
                    )}
                    {monthIndex !== 0 && <div className="w-8" />}

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {dateUtils.formatDate(month, 'short-month')}
                      </span>
                      {monthIndex === 0 && (
                        <YearSelector
                          currentYear={currentYear}
                          onYearChange={handleYearChange}
                        />
                      )}
                      {monthIndex !== 0 && (
                        <span className="text-sm font-semibold">
                          {month.getFullYear()}
                        </span>
                      )}
                    </div>

                    {monthIndex === numberOfMonths - 1 && (
                      <Button
                        variant="outlined"
                        size="sm"
                        onClick={() =>
                          setDisplayMonth(dateUtils.addMonths(displayMonth, 1))
                        }
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
                    {days.map((day, i) => {
                      const isCurrentMonth = dateUtils.isSameMonth(day, month);
                      return (
                        <button
                          key={i}
                          onClick={() =>
                            isCurrentMonth && handleDateSelect(day)
                          }
                          onMouseEnter={() =>
                            isCurrentMonth && setHoveredDate(day)
                          }
                          onMouseLeave={() => setHoveredDate(null)}
                          disabled={!isCurrentMonth}
                          className={getDayClassName(day, isCurrentMonth)}
                        >
                          {dateUtils.formatDate(day, 'day')}
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
          selectedRange={selectedRange}
          onCancel={() => {
            // First call the custom onCancel if provided (for dialog close)
            onCancel?.();
            // Then clear the range
            const emptyRange = { from: undefined, to: undefined };
            if (controlledRange !== undefined && onRangeChange) {
              onRangeChange(emptyRange);
            } else {
              setInternalRange(emptyRange);
            }
          }}
          onApply={() => onApply?.(selectedRange)}
        />
      </CardContent>
    </Card>
  );
}
