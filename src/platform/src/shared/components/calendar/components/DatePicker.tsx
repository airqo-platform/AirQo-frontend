'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { HiCalendar, HiChevronDown } from 'react-icons/hi2';
import { useMediaQuery } from 'react-responsive';
import { cn } from '@/shared/lib/utils';
import { Card } from '@/shared/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { SingleCalendar } from './SingleCalendar';
import { RangeCalendar } from './RangeCalendar';
import { DatePickerProps, DateRange } from '../types';
import { DateUtils } from '../utils/date-utils';

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  mode: propMode,
  className,
  align = 'start',
  maxWidth,
  showPresets = true,
  useDialog = false,
  contentClassName,
  returnFormat = 'date',
}: DatePickerProps & { showPresets?: boolean }) {
  const [open, setOpen] = useState(false);

  // Use responsive hook for automatic mobile detection
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Auto-detect mode based on screen size if not explicitly set
  const mode = propMode || (isMobile ? 'single' : 'range');

  // Set default value to last 7 days if no value provided
  const defaultValue =
    mode === 'range' && !value ? DateUtils.getDefaultPresets()[2].value : value;

  const [internalValue, setInternalValue] = useState<
    Date | DateRange | undefined
  >(defaultValue);

  // Update internal value when external value changes or set default
  React.useEffect(() => {
    if (value) {
      setInternalValue(value);
    } else if (!internalValue && mode === 'range') {
      // Set default to last 7 days
      const defaultRange = DateUtils.getDefaultPresets()[2]; // "Last 7 days"
      setInternalValue(defaultRange.value);
      onChange?.(defaultRange.value);
    }
  }, [value, mode, internalValue, onChange]);

  const getDisplayValue = () => {
    const displayValue = internalValue || value;

    if (!displayValue) {
      return placeholder;
    }

    // Handle single date mode where the value may be a Date or a DateRange
    if (mode === 'single') {
      if (displayValue instanceof Date) {
        return format(displayValue, 'MMM d, yyyy');
      }

      // Sometimes internal/value might be a DateRange (e.g., from calendar components)
      if (
        displayValue &&
        typeof displayValue === 'object' &&
        'from' in displayValue
      ) {
        const range = displayValue as DateRange;
        if (range.from) return format(range.from, 'MMM d, yyyy');
      }
    }

    if (
      mode === 'range' &&
      typeof displayValue === 'object' &&
      'from' in displayValue
    ) {
      const range = displayValue as DateRange;
      if (!range.from) return placeholder;

      if (!range.to) {
        return format(range.from, 'MMM d');
      }

      const fromStr = format(range.from, 'MMM d');
      const toStr = format(range.to, 'MMM d, yyyy');

      return `${fromStr} - ${toStr}`;
    }

    return placeholder;
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleApply = (selected: DateRange) => {
    if (mode === 'single') {
      const date = selected.from;
      setInternalValue(date);

      // Handle different return formats
      if (returnFormat === 'backend-datetime' && date) {
        onChange?.(DateUtils.toBackendDateTime(date, false));
      } else {
        onChange?.(date);
      }
    } else {
      setInternalValue(selected);

      // Handle different return formats for range
      if (returnFormat === 'backend-datetime') {
        try {
          const { startDateTime, endDateTime } =
            DateUtils.formatRangeForBackend(selected);
          onChange?.({ from: startDateTime, to: endDateTime });
        } catch (error) {
          console.error('Error formatting date range for backend:', error);
          onChange?.(selected);
        }
      } else {
        onChange?.(selected);
      }
    }
    setOpen(false);
  };

  const calendarContent = (
    <>
      {mode === 'single' ? (
        <SingleCalendar
          onApply={handleApply}
          onCancel={handleCancel}
          // Ensure the calendar always receives a DateRange when in single mode.
          // internalValue can be a Date (selected single date) or a DateRange (from calendar).
          initialRange={
            internalValue instanceof Date
              ? { from: internalValue, to: internalValue }
              : (internalValue as DateRange | undefined)
          }
        />
      ) : (
        <RangeCalendar
          showPresets={showPresets && !isMobile}
          onApply={handleApply}
          onCancel={handleCancel}
          initialRange={internalValue as DateRange | undefined}
        />
      )}
    </>
  );

  // Simple dialog component for date picker
  const DatePickerDialog = () => {
    const dialogRef = useRef<HTMLDivElement>(null);

    // Handle escape key with useCallback
    const handleEscape = useCallback((e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }, []);

    useEffect(() => {
      if (open) {
        // Focus management
        dialogRef.current?.focus();
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        // Add escape key listener
        document.addEventListener('keydown', handleEscape);
      } else {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      }

      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, handleEscape]);

    if (!open) return null;

    return createPortal(
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 dark:bg-black/80"
          onClick={() => setOpen(false)}
        />

        {/* Dialog */}
        <Card
          ref={dialogRef}
          className="relative w-auto border-none max-w-none overflow-hidden"
          tabIndex={-1}
        >
          <div className="p-0">{calendarContent}</div>
        </Card>
      </div>,
      document.body
    );
  };

  if (useDialog) {
    return (
      <>
        <button
          className={cn(
            'w-auto justify-start flex gap-2 items-center rounded-md border border-input text-left font-normal text-sm px-3 py-2',
            !value && !internalValue && 'text-muted-foreground',
            className
          )}
          style={{ maxWidth: maxWidth || '300px' }}
          onClick={() => setOpen(true)}
        >
          <HiCalendar className="h-4 w-4" />
          <span className="truncate">{getDisplayValue()}</span>
          <HiChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        </button>

        <DatePickerDialog />
      </>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'w-auto justify-start flex gap-2 items-center rounded-md border border-input text-left font-normal text-sm px-3 py-2',
            !value && !internalValue && 'text-muted-foreground',
            className
          )}
        >
          <HiCalendar className="h-4 w-4" />
          <span className="truncate">{getDisplayValue()}</span>
          <HiChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={cn(
          'w-auto p-0 rounded-md border-none',
          mode === 'range' && !isMobile && 'w-fit',
          contentClassName
        )}
        align={align}
      >
        {calendarContent}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
