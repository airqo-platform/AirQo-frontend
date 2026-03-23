'use client';

import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { photonService, PhotonSearchResult } from '../services/photonService';

export type { PhotonSearchResult } from '../services/photonService';

export const usePhotonSearch = (query: string, enabled = true) => {
  const debouncedQuery = useDebounce(query, 300);

  const normalizedQuery = debouncedQuery.trim();
  const shouldFetch = enabled && normalizedQuery.length > 0;

  const {
    data: results = [],
    isLoading,
    error,
    refetch: refetchQuery,
  } = useQuery<PhotonSearchResult[], Error>({
    queryKey: ['map', 'photon-search', normalizedQuery],
    queryFn: () => photonService.search(normalizedQuery, 10),
    enabled: shouldFetch,
    networkMode: 'online',
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60 * 12,
  });

  const refetch = useCallback(async () => {
    if (!shouldFetch) return;
    await refetchQuery();
  }, [refetchQuery, shouldFetch]);

  return {
    results: shouldFetch ? results : [],
    isLoading: shouldFetch ? isLoading : false,
    error: shouldFetch ? (error?.message ?? null) : null,
    refetch,
  };
};
