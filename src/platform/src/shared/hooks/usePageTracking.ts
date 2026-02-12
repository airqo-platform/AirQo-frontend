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
  const sessionMetrics = useRef<SessionMetrics>({
    pagesViewed: 0,
    actionsPerformed: 0,
    sessionDuration: 0,
    errorsEncountered: 0,
  });

  // Track page view and dwell time
  useEffect(() => {
    if (!pathname) return;

    // Reset page start time
    pageStartTime.current = Date.now();
    sessionMetrics.current.pagesViewed += 1;

    // Track page dwell time on unmount
    return () => {
      const dwellTime = (Date.now() - pageStartTime.current) / 1000;
      trackPageDwell(posthog, pathname, dwellTime);
    };
  }, [pathname, posthog]);

  // Track session quality on unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionMetrics.current.sessionDuration =
        Date.now() - pageStartTime.current;
      trackSessionQuality(posthog, sessionMetrics.current);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
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
