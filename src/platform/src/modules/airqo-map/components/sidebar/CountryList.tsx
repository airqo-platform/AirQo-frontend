'use client';

import * as React from 'react';
import Image from 'next/image';
import { AqChevronUp, AqChevronDown } from '@airqo/icons-react';
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
  cohort_id?: string;
  isOrganizationFlow?: boolean;
}

const CountryListSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div
    className={cn(
      'pt-3 pb-1 px-4 border-b border-gray-100 dark:border-gray-700',
      className
    )}
  >
    <div className="flex gap-2 pb-3">
      {Array.from({ length: 1 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse flex-shrink-0"
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
  cohort_id,
  isOrganizationFlow = false,
}) => {
  const {
    countries: countriesData,
    isLoading,
    error,
  } = useCountries(cohort_id);

  // Collapsed by default on mobile
  const [isCollapsed, setIsCollapsed] = React.useState(true);

  const hasAutoSelectedRef = React.useRef(false);
  const hasHandledErrorRef = React.useRef(false);

  const countries: Country[] = React.useMemo(() => {
    return normalizeCountries(countriesData || []);
  }, [countriesData]);

  React.useEffect(() => {
    if (
      isOrganizationFlow &&
      !isLoading &&
      !error &&
      countries.length > 1 &&
      !selectedCountry &&
      !hasAutoSelectedRef.current
    ) {
      const firstCountry = countries[1];
      if (firstCountry && onCountrySelect) {
        hasAutoSelectedRef.current = true;
        onCountrySelect(firstCountry.code);
      }
    }
  }, [
    isOrganizationFlow,
    countries,
    isLoading,
    error,
    selectedCountry,
    onCountrySelect,
  ]);

  React.useEffect(() => {
    if (
      isOrganizationFlow &&
      error &&
      onCountrySelect &&
      !hasHandledErrorRef.current
    ) {
      hasHandledErrorRef.current = true;
      onCountrySelect('');
    }
  }, [isOrganizationFlow, error, onCountrySelect]);

  React.useEffect(() => {
    hasAutoSelectedRef.current = false;
    hasHandledErrorRef.current = false;
  }, [cohort_id]);

  // Derive the selected country object for the collapsed summary
  const selectedCountryObj = React.useMemo(
    () => countries.find(c => c.code === selectedCountry),
    [countries, selectedCountry]
  );

  if (isLoading) {
    return <CountryListSkeleton className={className} />;
  }

  if (error) {
    return (
      <div
        className={cn(
          'pt-3 pb-1 px-4 border-b border-gray-100 dark:border-gray-700',
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
      className={cn('border-b border-gray-100 dark:border-gray-700', className)}
    >
      {/* ── Mobile toggle header (hidden on sm+) ───────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 sm:hidden">
        {/* Always show selected country in header */}
        <div className="flex items-center gap-2 text-sm">
          {selectedCountryObj ? (
            <>
              {selectedCountryObj.code === 'all' ? (
                <span className="text-base">{selectedCountryObj.flag}</span>
              ) : (
                <Image
                  src={selectedCountryObj.flag}
                  alt={`${selectedCountryObj.name} flag`}
                  width={16}
                  height={12}
                  className="rounded-sm flex-shrink-0"
                />
              )}
              <span className="font-medium text-foreground">
                {capitalizeWords(selectedCountryObj.name.replace(/_/g, ' '))}
              </span>
            </>
          ) : (
            <span className="font-medium text-foreground">Countries</span>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(prev => !prev)}
          aria-label={
            isCollapsed ? 'Expand country list' : 'Collapse country list'
          }
          aria-expanded={!isCollapsed}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors',
            'bg-gray-100 dark:bg-gray-700 text-muted-foreground',
            'hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95'
          )}
        >
          {isCollapsed ? (
            <>
              <span>Show</span>
              <AqChevronDown className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>Hide</span>
              <AqChevronUp className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* ── Country grid ────────────────────────────────────────────────── */}
      {/*
        On mobile:  hidden when isCollapsed, visible when not.
        On sm+:     always visible (override via sm:block / sm:flex).
      */}
      <div
        className={cn(
          'px-4 pb-3',
          // Mobile visibility controlled by state; desktop always shown
          isCollapsed ? 'hidden sm:block' : 'block',
          // Add top padding only when toggle header is not rendered (sm+)
          'sm:pt-3'
        )}
      >
        <div className="flex flex-wrap gap-2">
          {countries.map(country => (
            <button
              key={country.code}
              onClick={() => onCountrySelect?.(country.code)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200',
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
                  className="rounded-sm flex-shrink-0"
                />
              )}
              <span className="hidden sm:inline">
                {capitalizeWords(country.name.replace(/_/g, ' '))}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
