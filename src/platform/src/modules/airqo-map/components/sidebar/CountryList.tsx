'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';

interface Country {
  code: string;
  name: string;
  flag: string;
}

interface CountryListProps {
  countries?: Country[];
  selectedCountry?: string;
  onCountrySelect?: (countryCode: string) => void;
  className?: string;
}

const defaultCountries: Country[] = [
  { code: 'all', name: 'All', flag: '🌍' },
  { code: 'ug', name: 'Uganda', flag: '🇺🇬' },
  { code: 'ke', name: 'Kenya', flag: '🇰🇪' },
  { code: 'ng', name: 'Nigeria', flag: '🇳🇬' },
];

export const CountryList: React.FC<CountryListProps> = ({
  countries = defaultCountries,
  selectedCountry = 'all',
  onCountrySelect,
  className,
}) => {
  return (
    <div className={cn('pt-3 pb-1 pl-4 border-b border-primary/10', className)}>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3">
        {countries.map(country => (
          <button
            key={country.code}
            onClick={() => onCountrySelect?.(country.code)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0',
              selectedCountry === country.code
                ? 'bg-primary text-primary-foreground ring-2 ring-primary/20 shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            <span className="text-base">{country.flag}</span>
            <span>{country.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
