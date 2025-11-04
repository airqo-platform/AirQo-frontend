'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn, capitalizeWords } from '@/shared/lib/utils';
import { useCountries } from '../../hooks';
import {
  normalizeCountries,
  type Country,
} from '../../utils/dataNormalization';

interface CountryListProps {
  selectedCountry?: string;
  onCountrySelect?: (countryCode: string) => void;
  className?: string;
}

const CountryListSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div
    className={cn(
      'pt-3 pb-1 pl-4 border-b border-gray-100 dark:border-gray-700',
      className
    )}
  >
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse"
        >
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
          <div className="w-16 h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

export const CountryList: React.FC<CountryListProps> = ({
  selectedCountry = 'uganda',
  onCountrySelect,
  className,
}) => {
  const { countries: countriesData, isLoading, error } = useCountries();

  // Transform CountryData to Country format using utility function
  const countries: Country[] = React.useMemo(() => {
    return normalizeCountries(countriesData || []);
  }, [countriesData]);

  if (isLoading) {
    return <CountryListSkeleton className={className} />;
  }

  if (error) {
    return (
      <div
        className={cn(
          'pt-3 pb-1 pl-4 border-b border-gray-100 dark:border-gray-700',
          className
        )}
      >
        <div className="text-sm text-red-500 dark:text-red-400">
          Failed to load countries
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'pt-3 pb-1 pl-4 border-b border-gray-100 dark:border-gray-700',
        className
      )}
    >
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3">
        {countries.map(country => (
          <button
            key={country.code}
            onClick={() => onCountrySelect?.(country.code)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0',
              selectedCountry === country.code
                ? 'bg-primary text-primary-foreground ring-2 ring-primary/20 shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-muted-foreground hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            {country.code === 'all' ? (
              <span className="text-base">{country.flag}</span>
            ) : (
              <Image
                src={country.flag}
                alt={`${country.name} flag`}
                width={16}
                height={12}
                className="rounded-sm"
              />
            )}
            <span>{capitalizeWords(country.name.replace(/_/g, ' '))}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
