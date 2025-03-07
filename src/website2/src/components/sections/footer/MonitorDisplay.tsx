'use client';
import { useTranslations } from 'next-intl';
import type React from 'react';

import { useSelector } from '@/hooks';

const MonitorDisplay: React.FC = () => {
  const t = useTranslations('monitorDisplay');
  const countryData: any | null = useSelector(
    (state) => state.country.selectedCountry,
  );

  // Get the number of sites (default to 0 if not available)
  const numberOfSites: number = countryData?.numberOfSites || 0;

  // Convert the number to a string and pad with leading zeros up to 4 digits
  const formattedNumber: string[] = numberOfSites
    .toString()
    .padStart(4, '0')
    .split('');

  return (
    <div className="flex items-center space-x-2">
      <div className="flex space-x-1">
        {formattedNumber.map((digit, index) => (
          <span
            key={index}
            className="bg-blue-600 text-white px-2 py-1 rounded"
          >
            {digit}
          </span>
        ))}
      </div>
      <p className="text-gray-800">
        {t('monitorsIn', {
          country:
            countryData?.long_name.replace('_', ' ') || t('defaultCountry'),
        })}
      </p>
    </div>
  );
};

export default MonitorDisplay;
