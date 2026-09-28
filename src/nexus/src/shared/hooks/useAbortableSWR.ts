import { useCallback, useRef } from 'react';
import { swrRetryPolicy } from '../lib/retryPolicy';

export const STABLE_SWR_OPTIONS = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  ...swrRetryPolicy,
  errorRetryCount: 1,
  // The auth tree mounts more than once per page load; a remount must reuse
  // the cached response instead of re-firing the request. Freshness is
  // handled by key changes (group switch), explicit mutations and the
  // group-switch invalidation.
  revalidateIfStale: false,
  dedupingInterval: 5000,
} as const;

/** A fetcher that receives its own AbortSignal from the abortable wrapper. */
export type AbortableFetcher<T> = (signal: AbortSignal) => Promise<T>;

export const useAbortableFetcher = <T>(fetcher: AbortableFetcher<T>) => {
  const abortRef = useRef<AbortController | null>(null);

  // NOTE: no abort on unmount. SWR deduplicates subscribers on the same key
  // and shares one in-flight request between them — a StrictMode remount
  // subscribes to the SAME in-flight request, and aborting it on unmount
  // leaves the remount with a "canceled" error that nothing re-triggers
  // (shouldRetryOnError only retries 429). The request is still aborted when
  // a NEW fetch supersedes it (revalidation / key change), and the AbortSignal
  // keeps working for per-request cancellation.

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const wrappedFetcher = useCallback(async () => {
    // Abort the previous in-flight request when a new fetch supersedes it.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      return await fetcher(controller.signal);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }, [fetcher]);

  return { fetcher: wrappedFetcher, cancel };
};
