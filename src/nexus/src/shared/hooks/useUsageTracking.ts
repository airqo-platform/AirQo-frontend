'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { resolveSessionAccessToken } from '@/shared/services/sessionAuthToken';
import { buildBackendApiUrl } from '@/shared/lib/oauth-session';
import {
  buildRouteTemplate,
  clampDuration,
  consumeSessionStartFlag,
  getOrCreateUsageSessionId,
  runUsageFlush,
  sanitizeUsageEvent,
  USAGE_EVENT_MAX_PATH_LENGTH,
  USAGE_MAX_BATCH_SIZE,
  USAGE_SESSION_ID_KEY,
} from '@/modules/usage/utils/usageTracking';
import type {
  UsageBeaconEvent,
  UsageRawBeaconEvent,
} from '@/shared/types/usage';

const FLUSH_INTERVAL_MS = 30_000;

interface SegmentState {
  path: string;
  enteredAt: number;
}

/**
 * Page-event beacon hook for Nexus usage stats. Mounts once (via the
 * AnalyticsBridge in `posthog-provider`) and is a no-op on the server and for
 * unauthenticated sessions.
 *
 * Records one `page_view` event per page-visit segment:
 * - on route change: the PREVIOUS page, with seconds spent on it;
 * - on tab hide / pagehide: the CURRENT page, with seconds spent so far.
 *
 * Events are queued, batched (max 50 per POST) and flushed on route change, tab
 * hide, every 30 s, and on unmount. Flush is fire-and-forget: no retries, no
 * logging, and the queue is dropped (not retried) when no token resolves.
 */
export const useUsageTracking = (): void => {
  const { status } = useSession();
  const pathname = usePathname();
  const params = useParams();

  const queueRef = useRef<UsageBeaconEvent[]>([]);
  const segmentRef = useRef<SegmentState | null>(null);
  const sessionStartPendingRef = useRef<boolean>(false);
  const sessionIdRef = useRef<string>('');
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isAuthenticated = status === 'authenticated';

  const routePath = useMemo(() => {
    let templatedPath =
      pathname !== null && pathname !== undefined
        ? buildRouteTemplate(
            pathname,
            (params ?? {}) as Record<string, string | string[]>
          )
        : null;

    // Fallback: when route templating returns null (overlong or otherwise
    // unusable path), use the raw pathname truncated to the protocol limit.
    if (
      !templatedPath &&
      typeof pathname === 'string' &&
      pathname.startsWith('/')
    ) {
      templatedPath = pathname.slice(0, USAGE_EVENT_MAX_PATH_LENGTH);
    }

    return templatedPath;
  }, [pathname, params]);

  // Lazily resolve + cache the per-browser-session id (and consume the
  // once-per-session start flag) the first time we actually record something.
  const ensureSessionState = useCallback(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = getOrCreateUsageSessionId();
    }
    if (!sessionStartPendingRef.current) {
      sessionStartPendingRef.current = consumeSessionStartFlag();
    }
  }, []);

  // Swap the queued events out for a fresh array and POST them. Fire-and-forget:
  // never awaited by the UI, errors are swallowed inside runUsageFlush.
  const flushQueue = useCallback(() => {
    if (queueRef.current.length === 0) {
      return;
    }

    const events = queueRef.current;
    queueRef.current = [];

    void runUsageFlush(events, sessionIdRef.current, {
      resolveToken: resolveSessionAccessToken,
      fetchImpl: (input, init) => fetch(input, init),
      buildUrl: buildBackendApiUrl,
    });
  }, []);

  // Push a single event onto the queue, attaching the session-start marker on
  // the very first event of the session. Flushes when the batch cap is hit.
  const enqueueEvent = useCallback(
    (raw: UsageRawBeaconEvent) => {
      const event = sanitizeUsageEvent(raw);
      if (!event) {
        return;
      }

      ensureSessionState();

      if (sessionStartPendingRef.current) {
        event.session_start = true;
        sessionStartPendingRef.current = false;
      }

      queueRef.current.push(event);

      if (queueRef.current.length >= USAGE_MAX_BATCH_SIZE) {
        flushQueue();
      }
    },
    [ensureSessionState, flushQueue]
  );

  // Track the current page segment. On a pathname change we emit the PREVIOUS
  // segment with the time spent, then start a new segment for the new page.
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const now = Date.now();

    const previous = segmentRef.current;
    if (previous) {
      const secondsSpent = clampDuration((now - previous.enteredAt) / 1000);
      enqueueEvent({ path: previous.path, duration_sec: secondsSpent });
    }

    if (routePath) {
      segmentRef.current = { path: routePath, enteredAt: now };
    } else {
      segmentRef.current = null;
    }

    // Flush on route change after pushing the previous segment.
    flushQueue();
  }, [routePath, isAuthenticated, enqueueEvent, flushQueue]);

  // Never let events queued under one auth session be sent with a later
  // session's token. This also prevents a logout/login cycle from retaining
  // the previous page segment in memory.
  useEffect(() => {
    if (isAuthenticated) {
      return;
    }

    queueRef.current = [];
    segmentRef.current = null;
    sessionStartPendingRef.current = false;
    sessionIdRef.current = '';
  }, [isAuthenticated]);

  // Emit the current segment on tab hide / page unload. Both `visibilitychange`
  // (→hidden) and `pagehide` can fire on a single close, so guard against a
  // double emit within one hide cycle.
  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined') {
      return;
    }

    let hideEmitted = false;

    const emitCurrentSegment = () => {
      if (hideEmitted) {
        return;
      }
      hideEmitted = true;

      const current = segmentRef.current;
      if (!current) {
        return;
      }

      const secondsSpent = clampDuration(
        (Date.now() - current.enteredAt) / 1000
      );
      enqueueEvent({ path: current.path, duration_sec: secondsSpent });
      flushQueue();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        emitCurrentSegment();
      } else {
        // Tab returned: reset the segment start time so hidden time is not
        // counted as page dwell. The previous segment was already emitted on
        // hide, so this is a fresh dwell window on the same page.
        hideEmitted = false;
        if (segmentRef.current) {
          segmentRef.current.enteredAt = Date.now();
        }
      }
    };

    const handlePageHide = () => {
      emitCurrentSegment();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [isAuthenticated, enqueueEvent, flushQueue]);

  // Periodic flush every 30 s.
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    flushTimerRef.current = setInterval(() => {
      flushQueue();
    }, FLUSH_INTERVAL_MS);

    return () => {
      if (flushTimerRef.current !== null) {
        clearInterval(flushTimerRef.current);
        flushTimerRef.current = null;
      }
    };
  }, [isAuthenticated, flushQueue]);

  // Final flush on unmount.
  useEffect(() => {
    return () => {
      flushQueue();
    };
  }, [flushQueue]);
};

export { USAGE_SESSION_ID_KEY };
