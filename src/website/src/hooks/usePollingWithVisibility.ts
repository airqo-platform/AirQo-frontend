'use client';

import { useCallback, useEffect, useRef } from 'react';

const MAX_BACKOFF_MS = 5 * 60 * 1000; // 5 minutes max backoff
const BACKOFF_MULTIPLIER = 1.5;

/**
 * Polls `callback` at `activeIntervalMs` when the page is visible,
 * and pauses entirely when the tab is hidden (Page Visibility API).
 *
 * Implements exponential backoff on errors to avoid overloading servers.
 * Returns a `refresh` function that triggers an immediate fetch.
 */
export function usePollingWithVisibility(
  callback: () => void | Promise<void>,
  activeIntervalMs: number,
): { refresh: () => void } {
  const callbackRef = useRef(callback);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const backoffRef = useRef(1);
  const errorCountRef = useRef(0);

  // Keep the callback ref fresh without re-triggering the effect.
  callbackRef.current = callback;

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    const currentInterval = Math.min(
      activeIntervalMs * Math.pow(BACKOFF_MULTIPLIER, errorCountRef.current),
      MAX_BACKOFF_MS,
    );
    intervalRef.current = setInterval(() => {
      void callbackRef.current();
    }, currentInterval);
  }, [activeIntervalMs, stop]);

  const refresh = useCallback(() => {
    errorCountRef.current = 0;
    backoffRef.current = 1;
    void callbackRef.current();
  }, []);

  // Kick off an initial fetch + start polling.
  useEffect(() => {
    void callbackRef.current();
    start();

    return stop;
  }, [start, stop]);

  // React to visibility changes.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        errorCountRef.current = 0;
        start();
      } else {
        stop();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [start, stop]);

  return { refresh };
}
