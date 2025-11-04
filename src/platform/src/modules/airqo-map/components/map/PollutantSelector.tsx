'use client';

import React from 'react';
import {
  POLLUTANT_LABELS,
  type PollutantType,
} from '@/shared/utils/airQuality';
import Select from '@/shared/components/ui/select';

interface PollutantSelectorProps {
  selectedPollutant: PollutantType;
  onPollutantChange: (pollutant: PollutantType) => void;
  className?: string;
}

export const PollutantSelector: React.FC<PollutantSelectorProps> = ({
  selectedPollutant,
  onPollutantChange,
  className,
}) => {
  const handleChange = (event: { target: { value: unknown } }) => {
    const value = event.target.value;
    // Runtime validation to ensure type safety
    if (value === 'pm2_5' || value === 'pm10') {
      onPollutantChange(value);
    } else {
      console.warn('Invalid pollutant type received:', value);
    }
  };

  return (
    <div className={className}>
      <Select
        value={selectedPollutant}
        onChange={handleChange}
        className="w-24 h-8 text-sm shadow"
      >
        {Object.entries(POLLUTANT_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
    </div>
  );
};
