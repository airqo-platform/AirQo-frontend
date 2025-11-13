'use client';

import { useState, useEffect, useCallback } from 'react';
import { photonService, PhotonSearchResult } from '../services/photonService';

export type { PhotonSearchResult } from '../services/photonService';

export const usePhotonSearch = (query: string, enabled = true) => {
  const [results, setResults] = useState<PhotonSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim() || !enabled) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const searchResults = await photonService.search(searchQuery, 10);
        setResults(searchResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [enabled]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      search(query);
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [query, search]);

  return { results, isLoading, error, refetch: () => search(query) };
};
