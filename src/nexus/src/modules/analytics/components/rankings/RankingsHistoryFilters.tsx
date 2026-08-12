'use client';

import React, { useMemo } from 'react';
import SelectField from '@/shared/components/ui/select';
import { SegmentedTabs } from '@/shared/components/ui/segmented-tabs';
import type { RankingsLevel } from '@/shared/types/api';
import { InfoBanner } from '@/shared/components/ui/banner';

const MAX_SPAN_YEARS = 5;

const LEVEL_OPTIONS: { value: RankingsLevel; label: string }[] = [
  { value: 'country', label: 'Country' },
  { value: 'city', label: 'City' },
];

interface RankingsHistoryFiltersProps {
  level: RankingsLevel;
  startYear: number;
  endYear: number;
  onLevelChange: (level: RankingsLevel) => void;
  onStartYearChange: (year: number) => void;
  onEndYearChange: (year: number) => void;
  disabled?: boolean;
}

const buildYearOptions = (): number[] => {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let year = currentYear; year >= currentYear - 20; year--) {
    years.push(year);
  }
  return years;
};

/**
 * Controls for the historical comparison: level plus a year range.
 * The backend caps the span at 5 years, so the start-year list only offers
 * years that keep the range valid — the browser can't produce an invalid
 * request instead of being told off after the fact.
 */
export const RankingsHistoryFilters: React.FC<
  RankingsHistoryFiltersProps
> = ({
  level,
  startYear,
  endYear,
  onLevelChange,
  onStartYearChange,
  onEndYearChange,
  disabled = false,
}) => {
  const yearOptions = useMemo(buildYearOptions, []);

  const startYearOptions = useMemo(
    () => yearOptions.filter(year => year <= endYear),
    [yearOptions, endYear]
  );

  const endYearOptions = useMemo(
    () => yearOptions.filter(year => year >= startYear),
    [yearOptions, startYear]
  );

  const span = endYear - startYear + 1;
  const isAtMaxSpan = span >= MAX_SPAN_YEARS;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedTabs
          ariaLabel="Ranking level"
          options={LEVEL_OPTIONS.map(option => ({
            ...option,
            disabled,
          }))}
          value={level}
          onChange={onLevelChange}
        />

        <SelectField
          label="Start year"
          value={startYear}
          onChange={event =>
            onStartYearChange(Number(event.target.value) || startYear)
          }
          disabled={disabled}
          className="w-32"
          containerClassName="w-32"
        >
          {startYearOptions.map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="End year"
          value={endYear}
          onChange={event =>
            onEndYearChange(Number(event.target.value) || endYear)
          }
          disabled={disabled}
          className="w-32"
          containerClassName="w-32"
        >
          {endYearOptions.map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </SelectField>
      </div>

      {isAtMaxSpan && (
        <InfoBanner
          dense
          title={`Year ranges are capped at ${MAX_SPAN_YEARS} years. Select a smaller range for older data.`}
        />
      )}
    </div>
  );
};

export default RankingsHistoryFilters;
