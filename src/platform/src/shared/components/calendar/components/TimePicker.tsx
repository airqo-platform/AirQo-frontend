'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { HiChevronUp, HiChevronDown } from 'react-icons/hi2';
import { TimePickerProps } from '../types';
import { DateUtils } from '../utils/date-utils';

export function TimePicker({
  value = '12:00',
  onChange,
  className,
  disabled = false,
  format24h = true,
}: TimePickerProps) {
  const { hours, minutes } = DateUtils.parseTimeString(value);

  const updateTime = (newHours: number, newMinutes: number) => {
    const timeString = DateUtils.createTimeString(newHours, newMinutes);
    onChange?.(timeString);
  };

  const incrementHours = () => {
    const maxHours = format24h ? 23 : 12;
    const newHours = hours >= maxHours ? 0 : hours + 1;
    updateTime(newHours, minutes);
  };

  const decrementHours = () => {
    const maxHours = format24h ? 23 : 12;
    const newHours = hours <= 0 ? maxHours : hours - 1;
    updateTime(newHours, minutes);
  };

  const incrementMinutes = () => {
    const newMinutes = minutes >= 59 ? 0 : minutes + 1;
    updateTime(hours, newMinutes);
  };

  const decrementMinutes = () => {
    const newMinutes = minutes <= 0 ? 59 : minutes - 1;
    updateTime(hours, newMinutes);
  };

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {/* Hours */}
      <div className="flex flex-col items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={incrementHours}
          disabled={disabled}
          className="h-5 w-5 p-0 text-xs"
        >
          <HiChevronUp className="h-3 w-3" />
        </Button>
        <Input
          type="number"
          value={hours.toString().padStart(2, '0')}
          onChange={e => {
            const newHours = parseInt(e.target.value) || 0;
            const maxHours = format24h ? 23 : 12;
            if (newHours >= 0 && newHours <= maxHours) {
              updateTime(newHours, minutes);
            }
          }}
          disabled={disabled}
          className="h-6 w-10 text-center text-xs p-1"
          min="0"
          max={format24h ? '23' : '12'}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={decrementHours}
          disabled={disabled}
          className="h-5 w-5 p-0 text-xs"
        >
          <HiChevronDown className="h-3 w-3" />
        </Button>
      </div>

      <div className="text-xs font-medium">:</div>

      {/* Minutes */}
      <div className="flex flex-col items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={incrementMinutes}
          disabled={disabled}
          className="h-5 w-5 p-0 text-xs"
        >
          <HiChevronUp className="h-3 w-3" />
        </Button>
        <Input
          type="number"
          value={minutes.toString().padStart(2, '0')}
          onChange={e => {
            const newMinutes = parseInt(e.target.value) || 0;
            if (newMinutes >= 0 && newMinutes <= 59) {
              updateTime(hours, newMinutes);
            }
          }}
          disabled={disabled}
          className="h-6 w-10 text-center text-xs p-1"
          min="0"
          max="59"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={decrementMinutes}
          disabled={disabled}
          className="h-5 w-5 p-0 text-xs"
        >
          <HiChevronDown className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
