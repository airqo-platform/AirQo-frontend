'use client';

import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import Checkbox from '@/shared/components/ui/checkbox';
import { DateRange } from '../types';

// Optimized date utilities (extracted for reuse)
const dateUtils = {
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

    switch (format) {
      case 'full':
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
      default:
        return date.toDateString();
    }
  },
};

interface CalendarFooterProps {
  numberOfMonths: number;
  selectedRange: DateRange;
  onCancel: () => void;
  onApply: () => void;
}

export function CalendarFooter({
  numberOfMonths,
  selectedRange,
  onCancel,
  onApply,
}: CalendarFooterProps) {
  const [startTime, setStartTime] = useState('12:00');
  const [endTime, setEndTime] = useState('11:59');
  const [includeTime, setIncludeTime] = useState(false);

  return (
    <div className="border-t border-border bg-muted/20 p-3">
      {/* Use grid for layout: when numberOfMonths === 1 stack rows, otherwise two columns */}
      <div
        className={`grid gap-2 items-end ${
          numberOfMonths === 1 ? 'grid-cols-1' : 'grid-cols-[1fr_auto]'
        }`}
      >
        <div className="flex flex-col gap-1">
          <div className="grid grid-flow-col auto-cols-max gap-2">
            <Input
              type="text"
              placeholder="Start date"
              value={
                selectedRange.from
                  ? dateUtils.formatDate(selectedRange.from, 'full')
                  : ''
              }
              style={{
                width: 118,
              }}
              readOnly
              className="h-9 flex-shrink-0 text-sm"
              containerClassName="mb-0"
            />
            <Input
              type="text"
              placeholder="End date"
              value={
                selectedRange.to
                  ? dateUtils.formatDate(selectedRange.to, 'full')
                  : ''
              }
              style={{
                width: 118,
              }}
              readOnly
              className="h-9 flex-shrink-0 text-sm"
              containerClassName="mb-0"
            />
          </div>

          {includeTime && (
            <div className="grid grid-flow-col auto-cols-max gap-2">
              <Input
                type="time"
                value={startTime}
                style={{
                  width: 118,
                }}
                onChange={e => setStartTime(e.target.value)}
                className="h-9 flex-shrink-0 text-sm"
                containerClassName="mb-0"
              />
              <Input
                type="time"
                value={endTime}
                style={{
                  width: 118,
                }}
                onChange={e => setEndTime(e.target.value)}
                className="h-9 flex-shrink-0 text-sm"
                containerClassName="mb-0"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              id="include-time-checkbox"
              checked={includeTime}
              onCheckedChange={setIncludeTime}
            />
            <label
              htmlFor="include-time-checkbox"
              className="text-sm text-muted-foreground"
            >
              Include Time
            </label>
          </div>
        </div>

        <div
          className={`flex gap-2 ${numberOfMonths === 1 ? 'justify-end' : ''}`}
        >
          <Button
            variant="outlined"
            size="md"
            onClick={onCancel}
            className="h-9"
          >
            Cancel
          </Button>
          <Button size="md" onClick={onApply} className="h-9">
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
