'use client';

import { useState, useEffect } from 'react';
import { deviceService } from '../../../shared/services/deviceService';
import type { CountriesResponse, CountryData } from '../../../shared/types/api';

export interface UseCountriesResult {
  countries: CountryData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching countries list
 * @param cohort_id - Optional comma-separated cohort IDs for filtering
 */
export function useCountries(cohort_id?: string): UseCountriesResult {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCountries = async () => {
    // If cohort_id is null, wait for it to be determined
    if (cohort_id === null) {
      return;
    }

    // If cohort_id is empty string, no cohorts exist, so no countries
    if (cohort_id === '') {
      setCountries([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response: CountriesResponse =
        await deviceService.getCountriesAuthenticated(cohort_id);
      setCountries(response.countries);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch countries'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cohort_id]);

  return {
    countries,
    isLoading,
    error,
    refetch: fetchCountries,
  };
}
