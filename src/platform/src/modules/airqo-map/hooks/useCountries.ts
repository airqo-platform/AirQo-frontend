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
 */
export function useCountries(): UseCountriesResult {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCountries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: CountriesResponse =
        await deviceService.getCountriesAuthenticated();
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
  }, []);

  return {
    countries,
    isLoading,
    error,
    refetch: fetchCountries,
  };
}
