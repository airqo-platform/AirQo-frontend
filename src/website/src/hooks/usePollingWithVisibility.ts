'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Polls `callback` at `activeIntervalMs` when the page is visible,
 * and pauses entirely when the tab is hidden (Page Visibility API).
 *
 * Returns a `refresh` function that triggers an immediate fetch.
 */
export function usePollingWithVisibility(
  callback: () => void | Promise<void>,
  activeIntervalMs: number,
): { refresh: () => void } {
  const callbackRef = useRef(callback);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    intervalRef.current = setInterval(() => {
      void callbackRef.current();
    }, activeIntervalMs);
  }, [activeIntervalMs, stop]);

  const refresh = useCallback(() => {
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
