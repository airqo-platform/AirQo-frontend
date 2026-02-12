'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/shared/components/ui/button';
import { DatePicker } from '@/shared/components/calendar';
import type { DateRange } from '@/shared/components/calendar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { HiChevronDown, HiCheck } from 'react-icons/hi';
import { AqDownload01 } from '@airqo/icons-react';
import { Tooltip } from 'flowbite-react';

import { cn } from '@/shared/lib/utils';
import type {
  FrequencyType,
  PollutantType,
  ChartType,
} from '@/shared/components/charts/types';
import {
  FREQUENCY_LABELS,
  POLLUTANT_LABELS,
  CHART_TYPE_LABELS,
} from '@/shared/components/charts/constants';

const CHART_TYPE_OPTIONS = Object.entries(CHART_TYPE_LABELS)
  .filter(([key]) => key === 'line' || key === 'bar')
  .map(([value, label]) => ({
    label,
    value: value as ChartType,
  }));

// Frequency options - exclude 'raw' as requested
const FREQUENCY_OPTIONS = Object.entries(FREQUENCY_LABELS)
  .filter(([key]) => key !== 'raw')
  .map(([value, label]) => ({
    label,
    value: value as FrequencyType,
  }));

// Pollutant options
const POLLUTANT_OPTIONS = Object.entries(POLLUTANT_LABELS).map(
  ([value, label]) => ({
    label,
    value: value.toUpperCase(),
  })
);

// Data type options for download
const DATA_TYPE_OPTIONS = [
  { label: 'Calibrated Data', value: 'calibrated' as const },
  { label: 'Raw Data', value: 'raw' as const },
];

interface InsightsFiltersProps {
  frequency: FrequencyType;
  setFrequency: (frequency: FrequencyType) => void;
  pollutant: PollutantType;
  setPollutant: (pollutant: PollutantType) => void;
  chartType: ChartType;
  setChartType: (chartType: ChartType) => void;
  dateRange: { from: Date; to: Date } | undefined;
  setDateRange: (dateRange: { from: Date; to: Date } | undefined) => void;
  dataType: 'calibrated' | 'raw';
  setDataType: (dataType: 'calibrated' | 'raw') => void;
  onDownload: (dataType?: 'calibrated' | 'raw') => void;
  isDownloading?: boolean;
}

export const InsightsFilters: React.FC<InsightsFiltersProps> = ({
  frequency,
  setFrequency,
  pollutant,
  setPollutant,
  chartType,
  setChartType,
  dateRange,
  setDateRange,
  dataType,
  setDataType,
  onDownload,
  isDownloading = false,
}) => {
  // Dropdown states
  const [frequencyOpen, setFrequencyOpen] = useState(false);
  const [pollutantOpen, setPollutantOpen] = useState(false);
  const [chartTypeOpen, setChartTypeOpen] = useState(false);
  const [dataTypeOpen, setDataTypeOpen] = useState(false);

  // Handle date range change
  const handleDateRangeChange = useCallback(
    (
      value:
        | string
        | Date
        | DateRange
        | { from: string; to: string }
        | undefined
    ) => {
      let fromDate: Date | null = null;
      let toDate: Date | null = null;

      if (!value) {
        setDateRange(undefined);
        return;
      }

      // Handle different input types
      if (typeof value === 'string') {
        // Single date string
        fromDate = new Date(value);
        toDate = new Date(value);
      } else if (value instanceof Date) {
        // Single Date object
        fromDate = value;
        toDate = value;
      } else if ('from' in value && 'to' in value) {
        // DateRange or object with from/to
        const from =
          typeof value.from === 'string' ? new Date(value.from) : value.from;
        const to = typeof value.to === 'string' ? new Date(value.to) : value.to;
        if (from && to) {
          fromDate = from;
          toDate = to;
        }
      }

      if (fromDate && toDate) {
        setDateRange({ from: fromDate, to: toDate });
      }
    },
    [setDateRange]
  );

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      {/* Left group - filters */}
      <div className="flex flex-row flex-wrap items-stretch gap-2">
        {/* Frequency Filter */}
        <div className="relative">
          <DropdownMenu open={frequencyOpen} onOpenChange={setFrequencyOpen}>
            <DropdownMenuTrigger asChild>
              <button className="w-full sm:w-auto justify-start flex gap-2 items-center rounded-md border border-gray-300 text-left font-normal text-sm px-3 py-2 bg-white dark:bg-[#1d1f20] dark:border-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                <span>
                  {FREQUENCY_OPTIONS.find(option => option.value === frequency)
                    ?.label || 'Select Frequency'}
                </span>
                <HiChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    frequencyOpen && 'rotate-180'
                  )}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[140px] z-[10010]">
              {FREQUENCY_OPTIONS.map(option => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setFrequency(option.value as FrequencyType)}
                  className={cn(
                    'cursor-pointer flex items-center justify-between',
                    frequency === option.value &&
                      'bg-accent text-accent-foreground'
                  )}
                >
                  {option.label}
                  {frequency === option.value && (
                    <HiCheck className="h-4 w-4" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Date Range Filter */}
        <div className="w-full sm:w-auto">
          <DatePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            placeholder="Select date range"
            className="w-full sm:w-auto bg-white dark:bg-[#1d1f20] dark:border-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            contentClassName="z-[10010]"
          />
        </div>

        {/* Pollutant Filter */}
        <div className="relative">
          <DropdownMenu open={pollutantOpen} onOpenChange={setPollutantOpen}>
            <DropdownMenuTrigger asChild>
              <button className="w-full sm:w-auto justify-start flex gap-2 items-center rounded-md border border-gray-300 text-left font-normal text-sm px-3 py-2 bg-white dark:bg-[#1d1f20] dark:border-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                <span>
                  {POLLUTANT_OPTIONS.find(
                    option => option.value.toLowerCase() === pollutant
                  )?.label || 'Select Pollutant'}
                </span>
                <HiChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    pollutantOpen && 'rotate-180'
                  )}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[140px] z-[10010]">
              {POLLUTANT_OPTIONS.map(option => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() =>
                    setPollutant(option.value.toLowerCase() as PollutantType)
                  }
                  className={cn(
                    'cursor-pointer flex items-center justify-between',
                    pollutant === option.value.toLowerCase() &&
                      'bg-accent text-accent-foreground'
                  )}
                >
                  {option.label}
                  {pollutant === option.value.toLowerCase() && (
                    <HiCheck className="h-4 w-4" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Chart Type Filter */}
        <div className="relative">
          <DropdownMenu open={chartTypeOpen} onOpenChange={setChartTypeOpen}>
            <DropdownMenuTrigger asChild>
              <button className="w-full sm:w-auto justify-start flex gap-2 items-center rounded-md border border-gray-300 text-left font-normal text-sm px-3 py-2 bg-white dark:bg-[#1d1f20] dark:border-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                <span>
                  {CHART_TYPE_OPTIONS.find(option => option.value === chartType)
                    ?.label || 'Select Chart Type'}
                </span>
                <HiChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    chartTypeOpen && 'rotate-180'
                  )}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[140px] z-[10010]">
              {CHART_TYPE_OPTIONS.map(option => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setChartType(option.value)}
                  className={cn(
                    'cursor-pointer flex items-center justify-between',
                    chartType === option.value &&
                      'bg-accent text-accent-foreground'
                  )}
                >
                  {option.label}
                  {chartType === option.value && (
                    <HiCheck className="h-4 w-4" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Right side - Download dropdown */}
      <div>
        <div className="relative">
          <Tooltip content="Download openly available air quality data for your own use">
            <DropdownMenu open={dataTypeOpen} onOpenChange={setDataTypeOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="filled"
                  size="sm"
                  Icon={AqDownload01}
                  className="px-4 py-2"
                  showTextOnMobile
                  loading={isDownloading}
                >
                  {isDownloading ? 'Downloading...' : 'Download Data'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px] z-[10010]">
                {DATA_TYPE_OPTIONS.map(option => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => {
                      setDataType(option.value);
                      onDownload(option.value);
                    }}
                    className="cursor-pointer flex items-center justify-between"
                    disabled={isDownloading}
                  >
                    <span className="flex items-center gap-2">
                      {option.label}
                    </span>
                    {dataType === option.value && (
                      <HiCheck className="h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default InsightsFilters;
