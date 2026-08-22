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
import { useSWRConfig } from 'swr';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import { WarningBanner, Button } from '@/shared/components/ui';
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
  const { mutate } = useSWRConfig();
  const wasOfflineRef = useRef(false);
  const isRefreshingRef = useRef(false);

  // --- Outage overlay visibility (delayed appearance) ----------------------

  const [showOverlay, setShowOverlay] = useState(false);
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (backendStatus === 'outage') {
      // Delay before showing the overlay — cancelled if status clears.
      overlayTimerRef.current = setTimeout(() => {
        setShowOverlay(true);
      }, OUTAGE_APPEAR_DELAY_MS);
    } else {
      // Status cleared — cancel pending timer and hide immediately.
      if (overlayTimerRef.current !== null) {
        clearTimeout(overlayTimerRef.current);
        overlayTimerRef.current = null;
      }
      setShowOverlay(false);
    }

    return () => {
      if (overlayTimerRef.current !== null) {
        clearTimeout(overlayTimerRef.current);
        overlayTimerRef.current = null;
      }
    };
  }, [backendStatus]);

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
        void probeBackend().then(ok => {
          if (ok) {
            probeIndexRef.current = 0; // reset backoff on success
          } else {
            probeIndexRef.current = Math.min(
              probeIndexRef.current + 1,
              PROBE_BACKOFF_MS.length - 1
            );
            scheduleProbe(PROBE_BACKOFF_MS[probeIndexRef.current]);
          }
        });
      }, delayMs);
    },
    [clearProbeTimer]
  );

  // Start / stop the auto-probe loop when outage becomes visible / clears.
  useEffect(() => {
    if (showOverlay && backendStatus === 'outage') {
      probeIndexRef.current = 0;
      // Immediate first probe, then backoff.
      void probeBackend().then(ok => {
        if (!ok && showOverlay && backendStatus === 'outage') {
          probeIndexRef.current = 1;
          scheduleProbe(PROBE_BACKOFF_MS[probeIndexRef.current]);
        }
      });
    }

    return () => {
      clearProbeTimer();
    };
  }, [showOverlay, backendStatus, scheduleProbe, clearProbeTimer]);

  // Pause probes when the tab is hidden; resume when visible.
  useEffect(() => {
    const onVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';

      if (
        isVisibleRef.current &&
        showOverlay &&
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
  }, [showOverlay, backendStatus, scheduleProbe]);

  // --- Offline reconnect refresh (unchanged) --------------------------------

  const refreshCachedData = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;

    try {
      await queryClient.invalidateQueries();
      await queryClient.refetchQueries({ type: 'active' });
      await mutate(() => true, undefined, {
        revalidate: true,
      });
      router.refresh();
    } finally {
      isRefreshingRef.current = false;
    }
  }, [mutate, queryClient, router]);

  useEffect(() => {
    if (isOffline) {
      wasOfflineRef.current = true;
      return;
    }

    if (isOnline && wasOfflineRef.current) {
      wasOfflineRef.current = false;
      void refreshCachedData();
    }
  }, [isOnline, isOffline, refreshCachedData]);

  const handleRetry = useCallback(() => {
    void probeBackend();
  }, []);

  const handleOfflineRetry = useCallback(() => {
    void refreshCachedData();
  }, [refreshCachedData]);

  // --- Suppress offline banner when outage is visible -----------------------

  const isOutageOverlayVisible = showOverlay && backendStatus === 'outage';

  return (
    <>
      {/* Offline banner — suppressed while outage overlay is showing */}
      {isOffline && !isOutageOverlayVisible && (
        <div className="sticky top-0 z-[2000] p-2 md:p-3">
          <WarningBanner
            title="You're offline"
            message="Showing cached data. Reconnect refreshes stale data automatically, and Retry forces a fresh sync."
            dense
            actions={
              <Button size="sm" variant="outlined" onClick={handleOfflineRetry}>
                Retry connection
              </Button>
            }
          />
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
              <p className="text-xs text-muted-foreground">
                Automatic retry in the background
              </p>
            </div>
          </div>
        </div>
      )}

      {children}
    </>
  );
};

export default AppNetworkGate;
