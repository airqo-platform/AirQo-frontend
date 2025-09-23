'use client';

import { useState, useEffect, useCallback } from 'react';
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

function getBannerConfig({ isOnline, isSlow, isVerySlow }) {
  if (!isOnline) {
    return {
      message: 'You are offline. Check your internet connection.',
      bgClass: 'bg-red-600',
      Icon: AqWifiOff,
      severity: 'critical',
    };
  }
  // Very slow has precedence
  if (isVerySlow) {
    return {
      message: 'Very slow connection detected. Experience may be degraded.',
      bgClass: 'bg-amber-700',
      Icon: AqSignal02,
      severity: 'warning',
    };
  }

  if (isSlow) {
    return {
      message: 'Slow connection detected. Some features may be limited.',
      bgClass: 'bg-amber-600',
      Icon: AqSignal02,
      severity: 'warning',
    };
  }
  return null;
}

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
  const { isOnline, isSlow, isVerySlow, effectiveType, downlink, rtt } =
    useNetworkStatus();

  const hasIssue = !isOnline || isVerySlow || isSlow;
  const shouldShow = useDebounce(hasIssue && !dismissed, DEBOUNCE_DELAY);
  const config = getBannerConfig({ isOnline, isSlow });

  // Reset dismissal when fully OK again
  useEffect(() => {
    if (isOnline && !isSlow) setDismissed(false);
  }, [isOnline, isSlow]);

  // Auto-hide slow-warning (not offline)
  useEffect(() => {
    if (!autoHide || !config || config.severity === 'critical' || !shouldShow)
      return;
    const t = setTimeout(() => setDismissed(true), autoHideDelay);
    return () => clearTimeout(t);
  }, [config, shouldShow, autoHide, autoHideDelay]);

  const handleDismiss = useCallback(() => setDismissed(true), []);

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
