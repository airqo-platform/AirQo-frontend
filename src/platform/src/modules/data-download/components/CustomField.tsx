'use client';

import React from 'react';
import { HiChevronDown, HiCheck } from 'react-icons/hi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { DatePicker } from '@/shared/components/calendar';
import { DateRange } from '@/shared/components/calendar/types';
import { cn } from '@/shared/lib/utils';

interface CustomFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  Icon?: React.ComponentType<{ className?: string }>;
  placeholder?: string;
  className?: string;
  showLabel?: boolean;
  disabled?: boolean;
  mode?: 'dropdown' | 'calendar';
  selectedRange?: DateRange;
  onRangeSelect?: (range: DateRange) => void;
  required?: boolean;
}

export const CustomField: React.FC<CustomFieldProps> = ({
  label,
  value,
  onChange,
  options,
  Icon,
  placeholder = 'Select…',
  className,
  showLabel = true,
  disabled = false,
  mode = 'dropdown',
  selectedRange,
  onRangeSelect,
  required = false,
}) => {
  const selected = options.find(o => o.value === value);

  const formatDateRange = (range?: DateRange) => {
    if (!range || !range.from) return placeholder;
    const from = range.from.toLocaleDateString();
    const to = range.to ? range.to.toLocaleDateString() : '';
    return to ? `${from} - ${to}` : from;
  };

  const displayValue =
    mode === 'calendar'
      ? formatDateRange(selectedRange)
      : (selected?.label ?? placeholder);

  const handleSelect = (newValue: string) => {
    // Only call onChange if the value actually changed
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  const handleRangeSelect = (range: DateRange) => {
    onRangeSelect?.(range);
  };

  if (mode === 'calendar') {
    return (
      <div className={cn('flex flex-col space-y-2', className)}>
        {showLabel && label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-600 ml-1">*</span>}
          </label>
        )}
        <DatePicker
          mode="range"
          useDialog={true}
          value={selectedRange}
          onChange={value => {
            if (
              value &&
              typeof value === 'object' &&
              'from' in value &&
              'to' in value
            ) {
              // Handle backend-datetime format: { from: string, to: string }
              if (
                typeof value.from === 'string' &&
                typeof value.to === 'string'
              ) {
                handleRangeSelect({
                  from: new Date(value.from),
                  to: new Date(value.to),
                });
              } else {
                // Handle regular DateRange
                handleRangeSelect(value as DateRange);
              }
            }
          }}
          placeholder={placeholder}
          returnFormat="backend-datetime"
          className="bg-white dark:bg-[#1d1f20] dark:border-gray-700 shadow-sm w-full"
        />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col space-y-2', className)}>
      {showLabel && label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'w-full dark:bg-[#1d1f20] justify-start flex gap-2 items-center rounded-md border border-gray-300 dark:border-gray-700 text-left font-normal text-sm px-3 py-2 bg-white',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            <span
              className={cn(
                'flex-1 truncate',
                !selected && 'text-gray-500 dark:text-gray-400'
              )}
            >
              {displayValue}
            </span>
            <HiChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={4}
          className={cn(
            'p-1',
            mode === 'dropdown' && 'max-h-[300px] overflow-y-auto'
          )}
          matchTriggerWidth={true}
        >
          {options.map(opt => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={cn(
                'cursor-pointer flex items-center justify-between gap-2',
                value === opt.value && 'bg-accent text-accent-foreground'
              )}
            >
              <span className="flex-1 truncate">{opt.label}</span>
              {value === opt.value && (
                <HiCheck className="h-4 w-4 shrink-0 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
