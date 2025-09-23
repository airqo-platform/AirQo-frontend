'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AqWifiOff, AqSignal02, AqXClose } from '@airqo/icons-react';

// =============================================================================
// CONSTANTS
// =============================================================================
const DEBOUNCE_DELAY = 300;
const AUTO_HIDE_DELAY = 5000;

// =============================================================================
// HOOKS
// =============================================================================

/** Simple debounce hook */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}

/** Get the (possibly vendor-prefixed) connection object */
function getConnection() {
  if (typeof navigator === 'undefined') return null;
  return (
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection ||
    null
  );
}

/**
 * Network status hook (client-only)
 * - Reports: isOnline, effectiveType, downlink, rtt, isSlow
 * - Real-time via 'online'/'offline' and 'connection.change' (if supported)
 */
function useNetworkStatus() {
  const initialOnline =
    typeof navigator !== 'undefined' ? navigator.onLine : true;

  const conn = getConnection();
  const initialEffectiveType = conn?.effectiveType || '4g';
  const initialDownlink =
    typeof conn?.downlink === 'number' ? conn.downlink : null;
  const initialRtt = typeof conn?.rtt === 'number' ? conn.rtt : null;

  const [isOnline, setIsOnline] = useState(initialOnline);
  const [effectiveType, setEffectiveType] = useState(initialEffectiveType);
  const [downlink, setDownlink] = useState(initialDownlink);
  const [rtt, setRtt] = useState(initialRtt);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection = getConnection();
    const handleConnectionChange = () => {
      const c = getConnection();
      if (!c) return;
      if (c.effectiveType) setEffectiveType(c.effectiveType);
      if (typeof c.downlink === 'number') setDownlink(c.downlink);
      if (typeof c.rtt === 'number') setRtt(c.rtt);
    };

    if (connection && typeof connection.addEventListener === 'function') {
      connection.addEventListener('change', handleConnectionChange);
    }

    // Sync once on mount in case values changed before listeners attached
    handleConnectionChange();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection && typeof connection.removeEventListener === 'function') {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  // Slow if browser reports a low effectiveType, or very low downlink / high RTT
  const isSlow =
    ['slow-2g', '2g', '3g'].includes((effectiveType || '').toLowerCase()) ||
    (typeof downlink === 'number' && downlink > 0 && downlink < 0.8) || // < ~0.8 Mbps
    (typeof rtt === 'number' && rtt > 500); // > 500ms round trip

  // Very slow tier (stricter thresholds)
  const isVerySlow =
    ['slow-2g', '2g'].includes((effectiveType || '').toLowerCase()) ||
    (typeof downlink === 'number' && downlink > 0 && downlink < 0.3) || // < ~0.3 Mbps
    (typeof rtt === 'number' && rtt > 1000); // > 1000ms RTT

  return { isOnline, isSlow, isVerySlow, effectiveType, downlink, rtt };
}

// =============================================================================
// BANNER CONFIG
// =============================================================================

// getBannerConfig intentionally removed — we only display offline/back-online
// banners. Slow/very-slow detection is retained in telemetry but not
// surfaced to the user as per product request.

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * NetworkStatusBanner
 * Props:
 *  - position: 'top' | 'bottom'
 *  - className: string
 *  - showDetailedInfo: boolean (shows effectiveType/downlink/rtt if available)
 *  - autoHide: boolean (auto-hide warnings; not applied to critical/offline)
 *  - autoHideDelay: number ms
 */
export default function NetworkStatusBanner({
  position = 'bottom',
  className = '',
  showDetailedInfo = false,
  autoHide = true,
  autoHideDelay = AUTO_HIDE_DELAY,
}) {
  const [dismissed, setDismissed] = useState(false);
  const [showBackOnline, setShowBackOnline] = useState(false);
  const { isOnline, effectiveType, downlink, rtt } = useNetworkStatus();

  // Only consider offline as an issue to inform the user; slow/very-slow
  // telemetry is kept but not surfaced in the UI per product request.
  const hasIssue = !isOnline;
  const shouldShow = useDebounce(hasIssue && !dismissed, DEBOUNCE_DELAY);

  const config = useMemo(() => {
    // Only return an offline banner config when offline
    if (!isOnline) {
      return {
        message: 'You are offline. Check your internet connection.',
        bgClass: 'bg-red-600',
        Icon: AqWifiOff,
        severity: 'critical',
      };
    }
    return null;
  }, [isOnline]);

  // Track previous online state to show a brief "back online" pulse when
  // the connection is restored. This is useful to notify users after
  // transient network interruptions.
  const prevOnlineRef = useRef(isOnline);
  useEffect(() => {
    if (prevOnlineRef.current === false && isOnline === true) {
      // We transitioned from offline -> online
      setShowBackOnline(true);
      // Clear any dismissal so future offline events can be shown
      setDismissed(false);
      const t = setTimeout(() => setShowBackOnline(false), 3000);
      // update prev then cleanup
      prevOnlineRef.current = isOnline;
      return () => clearTimeout(t);
    }
    prevOnlineRef.current = isOnline;
    return undefined;
  }, [isOnline]);

  // Reset dismissal when fully OK again (i.e., online)
  useEffect(() => {
    if (isOnline) setDismissed(false);
  }, [isOnline]);

  // Auto-hide is only relevant for the transient "back online" pulse here.
  useEffect(() => {
    if (!autoHide || !showBackOnline) return;
    const t = setTimeout(() => setShowBackOnline(false), autoHideDelay);
    return () => clearTimeout(t);
  }, [autoHide, showBackOnline, autoHideDelay]);

  const handleDismiss = useCallback(() => setDismissed(true), []);

  // Show the transient back-online pulse first if present
  if (showBackOnline) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`fixed left-1/2 transform -translate-x-1/2 z-[2000] top-4 max-w-md mx-4 min-w-[320px] bg-green-600 text-white rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 ease-out ${className}`}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-shrink-0">
            <AqSignal02 className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-tight">
              You&apos;re back online. Connection restored.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!shouldShow || !config) return null;

  const positionClasses = position === 'top' ? 'top-4' : 'bottom-6';
  const isWarning = config.severity === 'warning';

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
        <div className="flex-shrink-0">
          <config.Icon className="w-5 h-5" aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-tight">{config.message}</p>

          {showDetailedInfo && (
            <div className="mt-1 text-xs text-white/80">
              Network: {isOnline ? 'Online' : 'Offline'}
              {isOnline && effectiveType
                ? ` • ${effectiveType.toUpperCase()}`
                : ''}
              {typeof downlink === 'number'
                ? ` • ↓ ${downlink.toFixed(1)} Mbps`
                : ''}
              {typeof rtt === 'number' ? ` • RTT ${rtt} ms` : ''}
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

      {autoHide && isWarning && (
        <div className="h-1 bg-white/20 rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-white/40 w-full origin-left"
            style={{
              animation: `shrink-progress ${autoHideDelay}ms linear forwards`,
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes shrink-progress {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }
      `}</style>
    </div>
  );
}
