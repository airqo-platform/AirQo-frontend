'use client';

import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { Input } from '@/shared/components/ui/input';
import { TimePicker } from './TimePicker';
import { DateTimeInputProps } from '../types';

export function DateTimeInput({
  date,
  time = '00:00',
  onDateChange,
  onTimeChange,
  label,
  disabled = false,
  className,
}: DateTimeInputProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      const newDate = new Date(value);
      if (!isNaN(newDate.getTime())) {
        onDateChange?.(newDate);
      }
    } else {
      onDateChange?.(undefined);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-xs font-medium text-muted-foreground block">
          {label}
        </label>
      )}
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="date"
          value={date ? format(date, 'yyyy-MM-dd') : ''}
          onChange={handleDateChange}
          disabled={disabled}
          className="flex-1 h-8 text-sm"
          placeholder="Select date"
        />
        <div className="flex-1">
          <TimePicker
            value={time}
            onChange={onTimeChange}
            disabled={disabled}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
