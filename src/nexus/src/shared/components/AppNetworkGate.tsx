'use client';

import React, {
  useEffect,
  useRef,
  useCallback,
  useSyncExternalStore,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useSWRConfig, type Cache } from 'swr';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import { Button } from '@/shared/components/ui';
import {
  subscribeBackendStatus,
  getBackendStatus,
  probeBackend,
} from '@/shared/lib/backendStatus';
import type { BackendStatusValue } from '@/shared/lib/backendStatus';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Delay before showing the outage overlay to avoid flash on transient errors. */
const OUTAGE_APPEAR_DELAY_MS = 1_000;

/** Auto-probe backoff schedule (capped at 60 s). */
const PROBE_BACKOFF_MS = [0, 5_000, 15_000, 30_000, 60_000];

/**
 * Hidden this long and a return to the foreground forces a recovery pass even
 * without an explicit offline/online event (sleep/wake can fire neither).
 */
const HIDDEN_RECOVERY_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

/** Minimum interval between non-forced visibility recovery attempts. */
const RECOVERY_MIN_INTERVAL_MS = 30_000;

// ---------------------------------------------------------------------------
// useSyncExternalStore helpers (framework-safe)
// ---------------------------------------------------------------------------

const subscribeBackend = (onStoreChange: () => void) =>
  subscribeBackendStatus(onStoreChange);

const getBackendSnapshot = () => getBackendStatus();

const getBackendServerSnapshot = () => ({
  status: 'unknown' as BackendStatusValue,
  reason: '',
});

// ---------------------------------------------------------------------------
// Stuck-SWR-entry scanner (module-level, framework-free)
// ---------------------------------------------------------------------------

/**
 * Detects a cache entry that is stuck in a failure or in-flight state — the
 * signature of the issue #4023 bug where a tab sleeps through a failed fetch
 * and never re-fires. Skips SWR's internal infinite/subscription keys and
 * non-object values.
 */
const hasStuckSWREntry = (cache: Cache): boolean => {
  for (const key of Array.from(cache.keys())) {
    if (typeof key !== 'string') continue;
    if (/^\$(inf|sub)\$/.test(key)) continue;

    const value = cache.get(key);
    if (!value || typeof value !== 'object') continue;

    const state = value as {
      error?: unknown;
      data?: unknown;
      isLoading?: boolean;
      isValidating?: boolean;
    };
    if (state.error != null) return true;
    if (
      state.data === undefined &&
      (state.isLoading === true || state.isValidating === true)
    ) {
      return true;
    }
  }
  return false;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface AppNetworkGateProps {
  children: React.ReactNode;
}

const AppNetworkGate = ({ children }: AppNetworkGateProps) => {
  const { isOnline, isOffline } = useNetworkStatus();
  const backendSnapshot = useSyncExternalStore(
    subscribeBackend,
    getBackendSnapshot,
    getBackendServerSnapshot
  );
  const backendStatus = backendSnapshot.status;

  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate, cache } = useSWRConfig();
  const wasOfflineRef = useRef(false);
  const isRefreshingRef = useRef(false);
  const recoveryRunIdRef = useRef(0);
  const hiddenAtRef = useRef<number | null>(null);
  const lastRecoveryAttemptRef = useRef(0);
  const probeInFlightRef = useRef<Promise<boolean> | null>(null);

  const runProbe = useCallback(() => {
    if (probeInFlightRef.current) return probeInFlightRef.current;

    const promise = probeBackend().finally(() => {
      if (probeInFlightRef.current === promise) {
        probeInFlightRef.current = null;
      }
    });
    probeInFlightRef.current = promise;
    return promise;
  }, []);

  // --- Offline reconnect refresh --------------------------------------------
  //
  // Declared before the effects below reference it (the auto-probe loop and
  // the recovery backstop both call it), so it must sit above them in the
  // component body to avoid a temporal-dead-zone reference.

  const refreshCachedData = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;

    try {
      await queryClient.invalidateQueries();
      await queryClient.refetchQueries({ type: 'active' });
      // One-argument form: pure revalidate that leaves cached data untouched.
      // Passing an explicit `undefined` data argument (or options) switches
      // SWR into its set-data form, which overwrites every matched cache
      // entry with `data: undefined` and clears errors — a cache wipe that
      // flashes existing data to a skeleton (issue #4023).
      await mutate(() => true);
      router.refresh();
    } finally {
      isRefreshingRef.current = false;
    }
  }, [mutate, queryClient, router]);

  // --- Outage overlay visibility (delayed appearance) ----------------------

  const [showOverlay, setShowOverlay] = useState(false);
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Auto-probe loop (backoff, visibility-aware) -------------------------

  const probeIndexRef = useRef(0);
  const probeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isVisibleRef = useRef(
    typeof document !== 'undefined'
      ? document.visibilityState === 'visible'
      : true
  );

  const clearProbeTimer = useCallback(() => {
    if (probeTimerRef.current !== null) {
      clearTimeout(probeTimerRef.current);
      probeTimerRef.current = null;
    }
  }, []);

  const scheduleProbe = useCallback(
    (delayMs: number) => {
      clearProbeTimer();
      probeTimerRef.current = setTimeout(() => {
        probeTimerRef.current = null;
        if (!isVisibleRef.current) return; // paused while hidden
        void runProbe().then(ok => {
          if (ok) {
            probeIndexRef.current = 0; // reset backoff on success
          } else {
            if (getBackendStatus().status !== 'outage') return;
            probeIndexRef.current = Math.min(
              probeIndexRef.current + 1,
              PROBE_BACKOFF_MS.length - 1
            );
            scheduleProbe(PROBE_BACKOFF_MS[probeIndexRef.current]);
          }
        });
      }, delayMs);
    },
    [clearProbeTimer, runProbe]
  );

  // Start the bounded retry loop after the delayed overlay appears. The loop
  // is keyed only to backend status so dismissing the overlay does not stop
  // recovery.
  useEffect(() => {
    let cancelled = false;
    if (backendStatus !== 'outage') {
      setShowOverlay(false);
      clearProbeTimer();
      return undefined;
    }

    overlayTimerRef.current = setTimeout(() => {
      if (cancelled) return;

      setShowOverlay(true);
      probeIndexRef.current = 0;
      void runProbe().then(ok => {
        if (cancelled) return;
        if (ok) {
          probeIndexRef.current = 0;
          // The backend recovered but no browser `online` event fires, so
          // SWR error states would otherwise persist — refresh now.
          void refreshCachedData();
        } else if (getBackendStatus().status === 'outage') {
          probeIndexRef.current = 1;
          scheduleProbe(PROBE_BACKOFF_MS[probeIndexRef.current]);
        }
      });
    }, OUTAGE_APPEAR_DELAY_MS);

    return () => {
      cancelled = true;
      if (overlayTimerRef.current !== null) {
        clearTimeout(overlayTimerRef.current);
        overlayTimerRef.current = null;
      }
      clearProbeTimer();
    };
  }, [
    backendStatus,
    scheduleProbe,
    clearProbeTimer,
    runProbe,
    refreshCachedData,
  ]);

  // Pause probes when the tab is hidden; resume when visible.
  useEffect(() => {
    const onVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';

      if (
        isVisibleRef.current &&
        backendStatus === 'outage' &&
        probeTimerRef.current === null
      ) {
        // Resume with a short delay.
        scheduleProbe(1_000);
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [backendStatus, scheduleProbe]);

  // --- Probe-gated recovery (issue #4023) -----------------------------------
  //
  // `mutate(() => true)` only revalidates keys whose fetcher can actually
  // run; if the network is still down the revalidation fails again and the
  // error stays. This loop probes the backend first and only refreshes after
  // a successful probe, so we never flash a skeleton or spin on a dead
  // network. Single-flight via recoveryRunIdRef and cancellable on offline /
  // supersession.

  const runRecovery = useCallback(async () => {
    // Hidden tabs: timers are throttled and the visibility handler re-checks
    // state on return.
    if (
      typeof document !== 'undefined' &&
      document.visibilityState !== 'visible'
    ) {
      return;
    }
    const runId = ++recoveryRunIdRef.current;
    const isStale = () => recoveryRunIdRef.current !== runId;

    for (let attempt = 0; attempt < PROBE_BACKOFF_MS.length; attempt++) {
      if (isStale()) return;
      if (typeof navigator !== 'undefined' && !navigator.onLine) return;

      const delay = PROBE_BACKOFF_MS[attempt];
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        if (isStale()) return;
        if (typeof navigator !== 'undefined' && !navigator.onLine) return;
      }

      const ok = await runProbe();
      if (isStale()) return;
      if (ok) {
        await refreshCachedData();
        return;
      }
    }
  }, [refreshCachedData, runProbe]);

  // Invalidate any in-flight runRecovery loop so a late probe resolution
  // cannot revalidate/refresh after the gate is gone.
  useEffect(
    () => () => {
      recoveryRunIdRef.current += 1;
    },
    []
  );

  useEffect(() => {
    if (isOffline) {
      wasOfflineRef.current = true;
      return;
    }

    if (isOnline && wasOfflineRef.current) {
      // If the tab is hidden, leave wasOfflineRef set so the visibility
      // handler recovers on return — probing while hidden wastes battery and
      // the throttled timers make it unreliable.
      if (
        typeof document !== 'undefined' &&
        document.visibilityState !== 'visible'
      ) {
        return;
      }
      wasOfflineRef.current = false;
      void runRecovery();
    }
  }, [isOnline, isOffline, runRecovery]);

  // --- Visibility / lifecycle backstop (issue #4023) -----------------------
  //
  // Sleep/wake and Wi-Fi reconnect often fire neither `offline`/`online` nor
  // a focus event. This backstop recovers when the tab returns to the
  // foreground after being offline, after a long hide, after a bfcache
  // restore, or on the Page Lifecycle `resume` event — whichever comes first.

  useEffect(() => {
    const attemptRecovery = () => {
      const hiddenForMs = hiddenAtRef.current
        ? Date.now() - hiddenAtRef.current
        : 0;
      const isForced =
        wasOfflineRef.current ||
        hiddenForMs >= HIDDEN_RECOVERY_THRESHOLD_MS ||
        getBackendStatus().status === 'outage';

      if (isForced || hasStuckSWREntry(cache)) {
        // Non-forced paths (stuck SWR entry alone) are throttled to avoid
        // hammering probes on every visibility change.
        if (
          !isForced &&
          Date.now() - lastRecoveryAttemptRef.current < RECOVERY_MIN_INTERVAL_MS
        ) {
          hiddenAtRef.current = null;
          return;
        }
        lastRecoveryAttemptRef.current = Date.now();
        wasOfflineRef.current = false;
        void runRecovery();
      }
      hiddenAtRef.current = null;
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAtRef.current = Date.now();
        return;
      }
      attemptRecovery();
    };

    const onPageShow = (event: PageTransitionEvent) => {
      // bfcache restore — revalidate everything that is stuck.
      if (event.persisted) {
        void runRecovery();
      }
    };

    const onResume = () => {
      attemptRecovery();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pageshow', onPageShow);
    // `resume` is part of the Page Lifecycle API; cast because TS lib may not
    // know it yet.
    document.addEventListener('resume', onResume as EventListener);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('resume', onResume as EventListener);
    };
  }, [runRecovery, cache]);

  const handleRetry = useCallback(() => {
    // Dismiss the dialog immediately while the probe and bounded background
    // retry loop continue without blocking the page.
    setShowOverlay(false);
    // Probe first (navigator.onLine is only a hint), then revalidate once the
    // backend actually answers — mirroring the auto-probe loop's success path.
    void runProbe().then(ok => {
      if (ok) {
        void refreshCachedData();
      }
    });
  }, [refreshCachedData, runProbe]);

  const handleOfflineRetry = useCallback(() => {
    void runRecovery();
  }, [runRecovery]);

  // --- Suppress offline banner when outage is visible -----------------------

  const isOutageOverlayVisible = showOverlay && backendStatus === 'outage';

  return (
    <>
      {/* Offline status pill — small, floating, top-center. Deliberately does
          not mention caching; just state + a discreet retry. */}
      {isOffline && !isOutageOverlayVisible && (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[2000] flex justify-center pt-2">
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-auto flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100 px-3.5 py-1.5 text-xs font-medium text-amber-800 shadow-md backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
          >
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-amber-500 motion-safe:animate-pulse dark:bg-amber-400"
            />
            <span>You&apos;re offline</span>
            <button
              type="button"
              onClick={handleOfflineRetry}
              className="font-semibold text-amber-900 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-600 dark:text-amber-100"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Backend-outage full-screen overlay */}
      {isOutageOverlayVisible && (
        <div
          className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/40 transition-opacity duration-300 motion-reduce:transition-none"
          role="alert"
          aria-live="assertive"
        >
          <div className="mx-4 max-w-md rounded-lg bg-card p-8 text-center shadow-xl">
            <h2 className="text-lg font-semibold text-card-foreground">
              We&apos;re having trouble reaching our servers
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Data may be stale. We retry automatically.
            </p>
            <div className="mt-5 flex flex-col items-center gap-3">
              <Button size="md" variant="filled" onClick={handleRetry}>
                Retry now
              </Button>
            </div>
          </div>
        </div>
      )}

      {children}
    </>
  );
};

export default AppNetworkGate;
