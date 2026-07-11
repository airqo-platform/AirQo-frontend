'use client';

import React, { useCallback } from 'react';
import { Calendar } from './Calendar';
import { DateRange } from '../types';

// Preset configurations
const getPresets = () => {
  const today = new Date();
  return [
    { label: 'Today', from: today, to: today },
    {
      label: 'Yesterday',
      from: new Date(today.getTime() - 24 * 60 * 60 * 1000),
      to: new Date(today.getTime() - 24 * 60 * 60 * 1000),
    },
    {
      label: 'Last 7 days',
      from: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
      to: today,
    },
    {
      label: 'Last 30 days',
      from: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000),
      to: today,
    },
    {
      label: 'Last 90 days',
      from: new Date(today.getTime() - 89 * 24 * 60 * 60 * 1000),
      to: today,
    },
    {
      label: 'This month',
      from: new Date(today.getFullYear(), today.getMonth(), 1),
      to: new Date(today.getFullYear(), today.getMonth() + 1, 0),
    },
    {
      label: 'This year',
      from: new Date(today.getFullYear(), 0, 1),
      to: new Date(today.getFullYear(), 11, 31),
    },
    {
      label: 'Last year',
      from: new Date(today.getFullYear() - 1, 0, 1),
      to: new Date(today.getFullYear() - 1, 11, 31),
    },
  ];
};

interface RangeCalendarProps {
  showPresets?: boolean;
  onApply?: (value: DateRange) => void;
  onCancel?: () => void;
  initialRange?: DateRange;
  onPresetSelect?: (value: DateRange) => void;
}

export function RangeCalendar({
  showPresets = true,
  onApply,
  onCancel,
  initialRange,
}: RangeCalendarProps) {
  // Responsive: show 1 month on mobile, 2 months on desktop
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const numberOfMonths = isMobile ? 1 : 2;

  const [selectedRange, setSelectedRange] = React.useState<DateRange>(
    initialRange || { from: undefined, to: undefined }
  );

  const handlePresetSelect = useCallback(
    (preset: { from: Date; to: Date }) => {
      const presetRange = { from: preset.from, to: preset.to };
      setSelectedRange(presetRange);
      onApply?.(presetRange);
    },
    [onApply]
  );

  const handleRangeChange = useCallback((range: DateRange) => {
    setSelectedRange(range);
  }, []);

  const presets = getPresets();

  const presetSidebar = showPresets ? (
    <div
      className={`border-r border-border bg-muted/30 py-3 px-2 ${numberOfMonths === 1 ? 'w-32' : 'w-40'}`}
    >
      {presets.map((preset, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => handlePresetSelect(preset)}
          className={`w-full justify-start px-2 mb-0.5 font-normal hover:bg-accent text-xs text-left bg-transparent border-none cursor-pointer ${numberOfMonths === 2 ? 'h-9 px-3' : 'h-8'}`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <Calendar
      numberOfMonths={numberOfMonths}
      onApply={onApply}
      onCancel={onCancel}
      initialRange={initialRange}
      selectedRange={selectedRange}
      onRangeChange={handleRangeChange}
    >
      {presetSidebar}
    </Calendar>
  );
}
