'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AqLoading01, AqWifiOff, AqSignal02, AqXClose } from '@airqo/icons-react';
import { useConnectionRecovery, type ConnectionPhase } from '@/core/hooks/useConnectionRecovery';

const DEBOUNCE_DELAY = 300;
const AUTO_HIDE_DELAY = 5000;
const API_DEGRADED_EVENT = 'vertex-network-degraded';
const API_RECOVERED_EVENT = 'vertex-network-recovered';

const PROGRESS_BANNERS: Partial<
  Record<ConnectionPhase, { message: string; bgClass: string; busy: boolean }>
> = {
  reconnecting: { message: 'Reconnecting…', bgClass: 'bg-blue-600', busy: true },
  refreshing: { message: 'Refreshing data…', bgClass: 'bg-blue-600', busy: true },
  restored: {
    message: "You're back online. Connection restored.",
    bgClass: 'bg-green-600',
    busy: false,
  },
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

interface ApiHealthStatus {
  hasConnectivityIssue: boolean;
}

function useApiHealthStatus(): ApiHealthStatus {
  const [hasConnectivityIssue, setHasConnectivityIssue] = useState(false);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleNetworkDegraded = () => {
      setHasConnectivityIssue(true);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(() => setHasConnectivityIssue(false), 12000);
    };

    const handleNetworkRecovered = () => {
      setHasConnectivityIssue(false);
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
        clearTimerRef.current = null;
      }
    };

    window.addEventListener(API_DEGRADED_EVENT, handleNetworkDegraded as EventListener);
    window.addEventListener(API_RECOVERED_EVENT, handleNetworkRecovered as EventListener);

    return () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      window.removeEventListener(API_DEGRADED_EVENT, handleNetworkDegraded as EventListener);
      window.removeEventListener(API_RECOVERED_EVENT, handleNetworkRecovered as EventListener);
    };
  }, []);

  return { hasConnectivityIssue };
}

interface NetworkStatusBannerProps {
  position?: 'top' | 'bottom';
  className?: string;
  showDetailedInfo?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export default function NetworkStatusBanner({
  position = 'top',
  className = '',
  showDetailedInfo = false,
  autoHide = true,
  autoHideDelay = AUTO_HIDE_DELAY,
}: NetworkStatusBannerProps) {
  const isMounted = useMounted();
  const [dismissed, setDismissed] = useState(false);
  const { phase, retry, clearRestored } = useConnectionRecovery();
  const { hasConnectivityIssue } = useApiHealthStatus();

  const isOffline = phase === 'offline';
  const isUnstable =
    phase === 'unreachable' ||
    phase === 'unstable' ||
    (hasConnectivityIssue && (phase === 'idle' || phase === 'restored'));
  const hasIssue = isOffline || isUnstable;
  const shouldShow = useDebounce(hasIssue && !dismissed, DEBOUNCE_DELAY);

  const config = useMemo(() => {
    if (isOffline) {
      return {
        message: 'You are offline. Check your internet connection.',
        bgClass: 'bg-red-600',
        Icon: AqWifiOff,
      };
    }
    if (isUnstable) {
      return {
        message: 'Connection is unstable. Some data may be temporarily unavailable.',
        bgClass: 'bg-amber-600',
        Icon: AqSignal02,
      };
    }
    return null;
  }, [isOffline, isUnstable]);

  useEffect(() => {
    setDismissed(false);
  }, [phase]);

  useEffect(() => {
    if (!hasIssue) setDismissed(false);
  }, [hasIssue]);

  useEffect(() => {
    if (!autoHide || phase !== 'restored') return;
    const t = setTimeout(clearRestored, autoHideDelay);
    return () => clearTimeout(t);
  }, [autoHide, phase, autoHideDelay, clearRestored]);

  const handleDismiss = useCallback(() => setDismissed(true), []);

  if (!isMounted) return null;

  const progress = isUnstable ? undefined : PROGRESS_BANNERS[phase];
  const toastClasses = `fixed left-1/2 transform -translate-x-1/2 z-[2000] ${
    position === 'top' ? 'top-4' : 'bottom-6'
  } max-w-md mx-4 min-w-[320px] text-white rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 ease-out ${className}`;

  // Both live regions stay mounted so screen readers announce each change to their content.
  return (
    <>
      <div role="status" aria-live="polite" aria-atomic="true">
        {progress && (
          <div className={`${toastClasses} ${progress.bgClass}`}>
            <div className="flex items-center gap-3 px-4 py-3">
              {progress.busy ? (
                <AqLoading01 className="w-5 h-5 motion-safe:animate-spin" aria-hidden="true" />
              ) : (
                <AqSignal02 className="w-5 h-5" aria-hidden="true" />
              )}
              <p className="text-sm font-medium leading-tight">{progress.message}</p>
            </div>
          </div>
        )}
      </div>

      <div role="alert" aria-live="assertive" aria-atomic="true">
        {shouldShow && config && (
          <div className={`${toastClasses} ${config.bgClass}`}>
            <div className="flex items-center gap-3 px-4 py-3">
              <config.Icon className="w-5 h-5" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">{config.message}</p>
                {showDetailedInfo && (
                  <div className="mt-1 text-xs text-white/80">
                    Network: {isOffline ? 'Offline' : 'Online'}
                  </div>
                )}
              </div>
              {isUnstable && (
                <button
                  type="button"
                  onClick={retry}
                  className="flex-shrink-0 rounded-md bg-white px-3 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-amber-600 transition-colors duration-200"
                >
                  Retry
                </button>
              )}
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-white/80 hover:text-white focus:text-white focus:outline-none transition-colors duration-200"
                aria-label="Dismiss network status notification"
              >
                <AqXClose className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
