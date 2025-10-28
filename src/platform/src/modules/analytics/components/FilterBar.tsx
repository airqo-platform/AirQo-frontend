import React, { useState } from 'react';
import { HiChevronDown, HiCheck } from 'react-icons/hi';
import { AqStar02, AqSettings01 } from '@airqo/icons-react';

import { Button } from '@/shared/components/ui/button';
import { DatePicker } from '@/shared/components/calendar';
import type { DateRange } from '@/shared/components/calendar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { cn } from '@/shared/lib/utils';
import { useAnalytics } from '../hooks/useAnalytics';
import { useAnalyticsPreferences } from '../hooks';
import type { QuickAccessLocationsProps } from '../types';
import type {
  FrequencyType,
  PollutantType,
} from '@/shared/components/charts/types';
import {
  FREQUENCY_LABELS,
  POLLUTANT_LABELS,
} from '@/shared/components/charts/constants';
import DownloadDialog from './DownloadDialog';

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

type FilterBarProps = Pick<QuickAccessLocationsProps, 'onManageFavorites'> & {
  className?: string;
  showIcons?: boolean;
  onShowIconsChange?: (showIcons: boolean) => void;
};

export const FilterBar: React.FC<FilterBarProps> = ({
  onManageFavorites,
  className,
  showIcons = true,
  onShowIconsChange,
}) => {
  const { filters, setFrequency, setDateRange, setPollutant } = useAnalytics();
  const { selectedSiteIds } = useAnalyticsPreferences();

  const [frequencyOpen, setFrequencyOpen] = useState(false);
  const [pollutantOpen, setPollutantOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [selectedDataType, setSelectedDataType] = useState<
    'calibrated' | 'raw'
  >('calibrated');

  const handleDateRangeChange = (
    value: string | Date | DateRange | { from: string; to: string } | undefined
  ) => {
    if (!value) return;

    // With returnFormat="backend-datetime", the DatePicker returns { from: string, to: string }
    // where strings are already in the correct timezone-aware format
    if (typeof value === 'object' && 'from' in value && 'to' in value) {
      const { from, to } = value;
      if (typeof from === 'string' && typeof to === 'string') {
        setDateRange(from, to);
        return;
      }
    }

    // Fallback for other formats (shouldn't happen with backend-datetime format)
    console.warn('Unexpected date format received:', value);
  };

  const handleDownloadClick = () => {
    setDownloadDialogOpen(true);
  };

  return (
    <div
      className={cn(
        'flex flex-wrap justify-between items-center gap-3',
        className
      )}
    >
      {/* Left group - pill style selects */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <DropdownMenu open={frequencyOpen} onOpenChange={setFrequencyOpen}>
            <DropdownMenuTrigger asChild>
              <button className="w-auto dark:bg-[#1d1f20] justify-start flex gap-2 items-center rounded-md border border-gray-300 dark:border-gray-700 text-left font-normal text-sm px-3 py-2 bg-white">
                <span>
                  {FREQUENCY_OPTIONS.find(
                    option => option.value === filters.frequency
                  )?.label || 'Select Frequency'}
                </span>
                <HiChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    frequencyOpen && 'rotate-180'
                  )}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[140px]">
              {FREQUENCY_OPTIONS.map(option => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setFrequency(option.value as FrequencyType)}
                  className={cn(
                    'cursor-pointer flex items-center justify-between',
                    filters.frequency === option.value &&
                      'bg-accent text-accent-foreground'
                  )}
                >
                  <span>{option.label}</span>
                  {filters.frequency === option.value && (
                    <HiCheck className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <DatePicker
            mode="range"
            value={{
              from: new Date(filters.startDate),
              to: new Date(filters.endDate),
            }}
            onChange={handleDateRangeChange}
            placeholder="Select date range"
            className="bg-white dark:bg-[#1d1f20] dark:border-gray-700 shadow-sm w-auto"
            showPresets={true}
            returnFormat="backend-datetime"
          />
        </div>

        <div>
          <DropdownMenu open={pollutantOpen} onOpenChange={setPollutantOpen}>
            <DropdownMenuTrigger asChild>
              <button className="w-auto dark:bg-[#1d1f20] justify-start flex gap-2 items-center rounded-md border border-gray-300 dark:border-gray-700 text-left font-normal text-sm px-3 py-2 bg-white">
                <span>
                  {POLLUTANT_OPTIONS.find(
                    option => option.value === filters.pollutant.toUpperCase()
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
            <DropdownMenuContent align="start" className="w-[120px]">
              {POLLUTANT_OPTIONS.map(option => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() =>
                    setPollutant(option.value.toLowerCase() as PollutantType)
                  }
                  className={cn(
                    'cursor-pointer flex items-center justify-between',
                    filters.pollutant === option.value.toLowerCase() &&
                      'bg-accent text-accent-foreground'
                  )}
                >
                  <span>{option.label}</span>
                  {filters.pollutant === option.value.toLowerCase() && (
                    <HiCheck className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <DropdownMenu open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DropdownMenuTrigger asChild>
              <button className="w-auto dark:bg-[#1d1f20] justify-center flex items-center rounded-md border border-gray-300 dark:border-gray-700 text-left font-normal text-sm px-3 py-2 bg-white">
                <AqSettings01 className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[180px]">
              <DropdownMenuItem
                onClick={() => onShowIconsChange?.(!showIcons)}
                className="cursor-pointer flex items-center justify-between"
              >
                <span>Show Emojis</span>
                {showIcons && <HiCheck className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onManageFavorites}
          className="inline-flex dark:bg-[#1d1f20] items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700 rounded-md bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
        >
          <AqStar02 className="h-4 w-4" />
          <span className="hidden sm:inline">Manage Favorites</span>
          <span className="sm:hidden">Favorites</span>
        </button>

        <Button
          variant="filled"
          size="sm"
          className="px-4 py-2 shadow-sm"
          onClick={handleDownloadClick}
        >
          Download Data ({selectedSiteIds.length})
        </Button>
      </div>

      {/* Download Confirmation Dialog */}
      <DownloadDialog
        isOpen={downloadDialogOpen}
        onClose={() => setDownloadDialogOpen(false)}
        selectedDataType={selectedDataType}
        onDataTypeChange={setSelectedDataType}
      />
    </div>
  );
};

export default FilterBar;
