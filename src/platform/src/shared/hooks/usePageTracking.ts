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
      // Calculate full session duration in seconds
      sessionMetrics.current.sessionDuration = Math.floor(
        (Date.now() - sessionStartTime.current) / 1000
      );

      // Use sendBeacon transport for reliable transmission
      trackSessionQuality(posthog, sessionMetrics.current);
    };

    // Use pagehide for better reliability than beforeunload
    window.addEventListener('pagehide', handlePageHide);

    // Fallback to visibilitychange for browsers without pagehide
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handlePageHide();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
