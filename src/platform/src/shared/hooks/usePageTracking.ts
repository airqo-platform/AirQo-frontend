/**
 * usePageTracking Hook
 *
 * Tracks page views, dwell time, and session quality metrics for analytics
 */

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';
import {
  trackPageDwell,
  trackSessionQuality,
} from '../utils/enhancedAnalytics';

interface SessionMetrics {
  pagesViewed: number;
  actionsPerformed: number;
  sessionDuration: number;
  errorsEncountered: number;
}

export const usePageTracking = () => {
  const pathname = usePathname();
  const posthog = usePostHog();
  const pageStartTime = useRef<number>(Date.now());
  const sessionStartTime = useRef<number>(Date.now()); // Track full session, not just current page
  const sessionQualitySent = useRef<boolean>(false); // Prevent duplicate session quality events
  const sessionMetrics = useRef<SessionMetrics>({
    pagesViewed: 0,
    actionsPerformed: 0,
    sessionDuration: 0,
    errorsEncountered: 0,
  });

  // Track page view and dwell time
  useEffect(() => {
    if (!pathname) return;

    // Reset page start time for dwell tracking
    pageStartTime.current = Date.now();
    sessionMetrics.current.pagesViewed += 1;

    // Track page dwell time on unmount
    return () => {
      const dwellTime = (Date.now() - pageStartTime.current) / 1000;
      trackPageDwell(posthog, pathname, dwellTime);
    };
  }, [pathname, posthog]);

  // Track session quality on unmount using pagehide for reliability
  useEffect(() => {
    const handlePageHide = () => {
      // Prevent duplicate session quality events
      if (sessionQualitySent.current) return;
      sessionQualitySent.current = true;

      // Calculate full session duration in seconds
      sessionMetrics.current.sessionDuration = Math.floor(
        (Date.now() - sessionStartTime.current) / 1000
      );

      // Use sendBeacon transport for reliable transmission during page unload
      trackSessionQuality(posthog, sessionMetrics.current, {
        transport: 'sendBeacon',
      });
    };

    // Check if pagehide is supported
    const supportsPageHide = 'onpagehide' in window;

    // Use pagehide for better reliability than beforeunload
    window.addEventListener('pagehide', handlePageHide);

    // Fallback to visibilitychange only for browsers without pagehide
    let visibilityChangeHandler: (() => void) | null = null;
    if (!supportsPageHide) {
      visibilityChangeHandler = () => {
        if (document.visibilityState === 'hidden') {
          handlePageHide();
        }
      };
      document.addEventListener('visibilitychange', visibilityChangeHandler);
    }

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      if (visibilityChangeHandler) {
        document.removeEventListener(
          'visibilitychange',
          visibilityChangeHandler
        );
      }
    };
  }, [posthog]);

  // Increment action count
  const trackAction = useCallback(() => {
    sessionMetrics.current.actionsPerformed += 1;
  }, []);

  // Increment error count
  const trackError = useCallback(() => {
    sessionMetrics.current.errorsEncountered += 1;
  }, []);

  return {
    trackAction,
    trackError,
  };
};
