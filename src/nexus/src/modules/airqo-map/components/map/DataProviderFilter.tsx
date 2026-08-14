'use client';

import React from 'react';
import Select from '@/shared/components/ui/select';
import {
  DATA_PROVIDER_ALL,
  getDataProviderDisplayLabel,
} from '../../utils/dataProviders';

interface DataProviderFilterProps {
  /** Canonical provider keys present in the loaded readings (e.g. AIRQO) */
  providers: string[];
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
  className?: string;
}

export const DataProviderFilter: React.FC<DataProviderFilterProps> = ({
  providers,
  selectedProvider,
  onProviderChange,
  className,
}) => {
  const handleChange = (event: { target: { value: unknown } }) => {
    const value = event.target.value;
    if (typeof value === 'string') {
      onProviderChange(value);
    }
  };

  return (
    <div className={className}>
      <Select
        value={selectedProvider}
        onChange={handleChange}
        className="w-36 h-8 text-sm shadow"
        aria-label="Filter by data provider"
      >
        <option value={DATA_PROVIDER_ALL}>All Providers</option>
        {providers.map(provider => (
          <option key={provider} value={provider}>
            {getDataProviderDisplayLabel(provider)}
          </option>
        ))}
      </Select>
    </div>
  );
};
