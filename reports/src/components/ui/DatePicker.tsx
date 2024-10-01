'use client';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';
import { DateRange, SelectRangeEventHandler } from 'react-day-picker';

import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export function DatePickerWithRange({
  className,
  value,
  onChange,
}: React.HTMLAttributes<HTMLDivElement> & {
  value?: DateRange;
  onChange?: (value: DateRange) => void;
}) {
  const today = new Date();

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !value && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, 'LLL dd, y')} - {format(value.to, 'LLL dd, y')}
                </>
              ) : (
                format(value.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-white dark:bg-gray-800 dark:text-gray-400"
          align="start"
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange as SelectRangeEventHandler}
            numberOfMonths={2}
            modifiers={{
              disabled: { after: today },
            }}
            classNames={{
              day_selected: 'text-white hover:bg-blue-400 hover:text-white',
              day_range_middle:
                'bg-blue-200 dark:bg-gray-700 rounded-none text-gray-400 hover:bg-blue-300',
              day_range_end:
                'bg-blue-600 rounded-l-none text-white hover:bg-blue-800 hover:text-white',
              day_range_start:
                'bg-blue-600 rounded-r-none text-white hover:bg-blue-800 hover:text-white',
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
