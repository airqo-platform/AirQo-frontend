'use client';

import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
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
export function useCountries(cohort_id?: string | null): UseCountriesResult {
  const normalizedCohortId =
    cohort_id === null ? 'disabled' : (cohort_id ?? 'all');
  const enabled = cohort_id !== null;

  const {
    data: countries = [],
    isLoading,
    error,
    refetch: refetchQuery,
  } = useQuery<CountryData[], Error>({
    queryKey: ['map', 'countries', normalizedCohortId],
    queryFn: async () => {
      const response: CountriesResponse =
        await deviceService.getCountriesAuthenticated(cohort_id || undefined);
      return response.countries;
    },
    enabled,
    networkMode: 'online',
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60 * 12,
  });

  const refetch = useCallback(async () => {
    await refetchQuery();
  }, [refetchQuery]);

  const noopRefetch = useCallback(async () => undefined, []);

  if (!enabled) {
    return {
      countries: [],
      isLoading: false,
      error: null,
      refetch: noopRefetch,
    };
  }

  return {
    countries,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
