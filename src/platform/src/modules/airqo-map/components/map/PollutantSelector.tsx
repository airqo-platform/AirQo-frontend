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
    const pollutant = event.target.value as PollutantType;
    onPollutantChange(pollutant);
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
