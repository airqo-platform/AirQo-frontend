'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AqWifiOff, AqSignal02, AqXClose } from '@airqo/icons-react';

const DEBOUNCE_DELAY = 300;
const AUTO_HIDE_DELAY = 5000;
const API_DEGRADED_EVENT = 'vertex-network-degraded';
const API_RECOVERED_EVENT = 'vertex-network-recovered';

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

interface NetworkStatus {
  isOnline: boolean;
}

interface ApiHealthStatus {
  hasConnectivityIssue: boolean;
}

function useNetworkStatus(): NetworkStatus {
  const initialOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const [isOnline, setIsOnline] = useState<boolean>(initialOnline);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
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
  const [showBackOnline, setShowBackOnline] = useState(false);
  const { isOnline } = useNetworkStatus();
  const { hasConnectivityIssue } = useApiHealthStatus();

  const hasIssue = !isOnline || hasConnectivityIssue;
  const shouldShow = useDebounce(hasIssue && !dismissed, DEBOUNCE_DELAY);

  const config = useMemo(() => {
    if (!isOnline) {
      return {
        message: 'You are offline. Check your internet connection.',
        bgClass: 'bg-red-600',
        Icon: AqWifiOff,
      };
    }
    if (hasConnectivityIssue) {
      return {
        message: 'Connection is unstable. Some data may be temporarily unavailable.',
        bgClass: 'bg-amber-600',
        Icon: AqSignal02,
      };
    }
    return null;
  }, [isOnline, hasConnectivityIssue]);

  const prevOnlineRef = useRef<boolean>(isOnline);
  useEffect(() => {
    if (prevOnlineRef.current === false && isOnline === true) {
      setShowBackOnline(true);
      setDismissed(false);
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline]);

  useEffect(() => {
    if (!hasIssue) setDismissed(false);
  }, [hasIssue]);

  useEffect(() => {
    if (!autoHide || !showBackOnline) return;
    const t = setTimeout(() => setShowBackOnline(false), autoHideDelay);
    return () => clearTimeout(t);
  }, [autoHide, showBackOnline, autoHideDelay]);

  const handleDismiss = useCallback(() => setDismissed(true), []);

  if (!isMounted) return null;

  if (showBackOnline && isOnline && !hasConnectivityIssue) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`fixed left-1/2 transform -translate-x-1/2 z-[2000] ${
          position === 'top' ? 'top-4' : 'bottom-6'
        } max-w-md mx-4 min-w-[320px] bg-green-600 text-white rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 ease-out ${className}`}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <AqSignal02 className="w-5 h-5" aria-hidden="true" />
          <p className="text-sm font-medium leading-tight">
            You&apos;re back online. Connection restored.
          </p>
        </div>
      </div>
    );
  }

  if (!shouldShow || !config) return null;

  const positionClasses = position === 'top' ? 'top-4' : 'bottom-6';

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`
        fixed left-1/2 transform -translate-x-1/2 z-[2000]
        ${positionClasses}
        max-w-md mx-4 min-w-[320px]
        ${config.bgClass} text-white
        rounded-lg shadow-lg backdrop-blur-sm
        transition-all duration-300 ease-out
        opacity-100 translate-y-0 scale-100
        ${className}
      `}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <config.Icon className="w-5 h-5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-tight">{config.message}</p>
          {showDetailedInfo && (
            <div className="mt-1 text-xs text-white/80">
              Network: {isOnline ? 'Online' : 'Offline'}
            </div>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-white/80 hover:text-white focus:text-white focus:outline-none transition-colors duration-200"
          aria-label="Dismiss network status notification"
        >
          <AqXClose className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
