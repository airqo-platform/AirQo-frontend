import useSWR from 'swr';
import { useCallback } from 'react';
import { getPlatformOverview } from '../services/platformOverviewService';
import { STABLE_SWR_OPTIONS, useAbortableFetcher } from './useAbortableSWR';
import { isAbortError } from '../lib/retryPolicy';
import type { PlatformOverviewSnapshot } from '../services/platformOverviewService';

/** Read-only Platform Overview snapshot — admin-only, keyed by route. */
export const usePlatformOverview = () => {
  const key = ['system/platform-overview'] as const;
  const { fetcher } = useAbortableFetcher(
    useCallback((signal: AbortSignal) => getPlatformOverview(signal), [])
  );

  const result = useSWR<PlatformOverviewSnapshot>(key, fetcher, {
    ...STABLE_SWR_OPTIONS,
    keepPreviousData: true,
  });

  return {
    ...result,
    error: isAbortError(result.error) ? null : result.error,
  };
};
