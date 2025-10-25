'use client';

import React from 'react';
import { HiFilter } from 'react-icons/hi';
import { ChartFilters, FrequencyType, PollutantType } from '../../types';
import { FREQUENCY_LABELS, POLLUTANT_LABELS } from '../../constants';
import { Input } from '@/shared/components/ui/input';
import Select from '@/shared/components/ui/select';
import { cn } from '@/shared/lib/utils';

interface ChartFiltersProps {
  filters: Partial<ChartFilters>;
  onFiltersChange: (filters: Partial<ChartFilters>) => void;
  className?: string;
}

export const ChartFiltersComponent: React.FC<ChartFiltersProps> = ({
  filters,
  onFiltersChange,
  className,
}) => {
  const handleFrequencyChange = (event: { target: { value: unknown } }) => {
    const frequency = event.target.value as FrequencyType;
    onFiltersChange({ ...filters, frequency });
  };

  const handlePollutantChange = (event: { target: { value: unknown } }) => {
    const pollutant = event.target.value as PollutantType;
    onFiltersChange({ ...filters, pollutant });
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({ ...filters, [field]: value });
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-end gap-4 p-4 bg-muted/30 rounded-lg',
        className
      )}
    >
      {/* Frequency Filter */}
      <div className="flex flex-col space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          Frequency
        </label>
        <Select
          value={filters.frequency || 'daily'}
          onChange={handleFrequencyChange}
          className="w-32"
        >
          {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      {/* Pollutant Filter */}
      <div className="flex flex-col space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          Pollutant
        </label>
        <Select
          value={filters.pollutant || 'pm2_5'}
          onChange={handlePollutantChange}
          className="w-32"
        >
          {Object.entries(POLLUTANT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      {/* Date Range */}
      <div className="flex items-end space-x-2">
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Start Date
          </label>
          <Input
            type="date"
            value={filters.startDate || ''}
            onChange={e => handleDateChange('startDate', e.target.value)}
            className="w-36 h-8 text-sm"
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            End Date
          </label>
          <Input
            type="date"
            value={filters.endDate || ''}
            onChange={e => handleDateChange('endDate', e.target.value)}
            className="w-36 h-8 text-sm"
          />
        </div>
      </div>

      {/* Sites Filter - Placeholder for future implementation */}
      {filters.sites && filters.sites.length > 0 && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <HiFilter className="h-4 w-4" />
          <span>{filters.sites.length} site(s) selected</span>
        </div>
      )}
    </div>
  );
};
