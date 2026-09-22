import type {
  UsageBeaconEvent,
  UsageBeaconPayload,
  UsageRawBeaconEvent,
} from '@/shared/types/usage';

export const USAGE_SESSION_ID_KEY = 'airqo:usage:session_id';
export const USAGE_SESSION_STARTED_KEY = 'airqo:usage:session_started';
export const USAGE_EVENT_MAX_PATH_LENGTH = 300;
export const USAGE_EVENT_TYPE_PAGE_VIEW = 'page_view';
export const USAGE_MAX_BATCH_SIZE = 50;
export const USAGE_MAX_DURATION_SEC = 14400; // 4 hours — clamps absurd dwell times

/**
 * Templates a pathname by replacing each Next.js dynamic-segment VALUE with its
 * placeholder key. Next.js `useParams()` returns the raw (decoded) segment, but
 * the rendered pathname may hold either the raw or URL-encoded form — both are
 * replaced so the template is stable regardless of encoding.
 *
 * @returns the templated path, or null when the result is unusable (does not
 *   start with `/` or exceeds the max path length).
 */
export const buildRouteTemplate = (
  pathname: string,
  params: Record<string, string | string[]>
): string | null => {
  if (typeof pathname !== 'string') {
    return null;
  }

  // Replace complete pathname segments only. Replacing arbitrary substrings
  // can corrupt static segments (for example `/api` when a param is `api`).
  const result = pathname
    .split('/')
    .map(segment => {
      let decodedSegment = segment;
      try {
        decodedSegment = decodeURIComponent(segment);
      } catch {
        // Keep the original segment when the pathname contains malformed
        // percent-encoding; it will still pass through unchanged.
      }

      const match = Object.entries(params).find(([, value]) => {
        if (typeof value === 'string') {
          return (
            value !== '' &&
            (segment === value ||
              segment === encodeURIComponent(value) ||
              decodedSegment === value)
          );
        }

        return value.some(
          item =>
            item !== '' &&
            (segment === item ||
              segment === encodeURIComponent(item) ||
              decodedSegment === item)
        );
      });

      return match ? `[${match[0]}]` : segment;
    })
    .join('/');

  if (!result.startsWith('/') || result.length > USAGE_EVENT_MAX_PATH_LENGTH) {
    return null;
  }

  return result;
};

/**
 * Clamps a dwell duration to an integer number of seconds within
 * [0, USAGE_MAX_DURATION_SEC].
 */
export const clampDuration = (seconds: number): number => {
  if (!Number.isFinite(seconds)) {
    return 0;
  }
  const rounded = Math.round(seconds);
  if (rounded < 0) {
    return 0;
  }
  if (rounded > USAGE_MAX_DURATION_SEC) {
    return USAGE_MAX_DURATION_SEC;
  }
  return rounded;
};

/**
 * Sanitises a raw beacon event into a wire-safe `UsageBeaconEvent`.
 * Returns null when the event is invalid (caller must drop it), enforcing the
 * backend's all-or-nothing batch contract client-side.
 *
 * Rules:
 * - `path` must be a string starting with `/` and be <= 300 chars.
 * - `duration_sec` is clamped to an integer in [0, 14400].
 * - `type` is fixed to `page_view`.
 */
export const sanitizeUsageEvent = (
  event: UsageRawBeaconEvent
): UsageBeaconEvent | null => {
  if (!event || typeof event.path !== 'string') {
    return null;
  }

  const { path } = event;
  if (!path.startsWith('/') || path.length > USAGE_EVENT_MAX_PATH_LENGTH) {
    return null;
  }

  const sanitized: UsageBeaconEvent = {
    type: USAGE_EVENT_TYPE_PAGE_VIEW,
    path,
  };

  if (typeof event.duration_sec === 'number') {
    sanitized.duration_sec = clampDuration(event.duration_sec);
  }

  if (event.session_start === true) {
    sanitized.session_start = true;
  }

  return sanitized;
};

/**
 * Splits a list of events into batches of at most `max` items. The backend
 * rejects batches over 50, so callers chunk before sending.
 */
export const buildEventBatches = (
  events: UsageBeaconEvent[],
  max: number = USAGE_MAX_BATCH_SIZE
): UsageBeaconEvent[][] => {
  if (!Array.isArray(events) || events.length === 0) {
    return [];
  }
  const size = Math.max(1, Math.floor(max));
  const batches: UsageBeaconEvent[][] = [];
  for (let index = 0; index < events.length; index += size) {
    batches.push(events.slice(index, index + size));
  }
  return batches;
};

/**
 * Returns a per-browser-session id, creating and persisting one on first use.
 * Reads from `sessionStorage` by default; accepts an injectable storage for
 * tests. Falls back to a random string when neither crypto.randomUUID nor
 * sessionStorage is available.
 */
export const getOrCreateUsageSessionId = (storage?: Storage): string => {
  const store =
    storage ??
    (typeof sessionStorage !== 'undefined' ? sessionStorage : undefined);

  if (store) {
    try {
      const existing = store.getItem(USAGE_SESSION_ID_KEY);
      if (existing) {
        return existing;
      }
    } catch {
      // Storage access can throw (private mode, quota) — fall through.
    }
  }

  const fresh = generateFallbackId();

  if (store) {
    try {
      store.setItem(USAGE_SESSION_ID_KEY, fresh);
    } catch {
      // Non-fatal: the id just won't persist across the session.
    }
  }

  return fresh;
};

/**
 * Consumes the once-per-browser-session `session_start` flag.
 * Returns true exactly ONCE per session (the first call that observes the flag
 * unset); every subsequent call returns false.
 */
export const consumeSessionStartFlag = (storage?: Storage): boolean => {
  const store =
    storage ??
    (typeof sessionStorage !== 'undefined' ? sessionStorage : undefined);

  if (!store) {
    return false;
  }

  try {
    if (store.getItem(USAGE_SESSION_STARTED_KEY) === '1') {
      return false;
    }
    store.setItem(USAGE_SESSION_STARTED_KEY, '1');
    return true;
  } catch {
    return false;
  }
};

const generateFallbackId = (): string => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  return `us-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

export interface RunUsageFlushDeps {
  resolveToken: () => Promise<{
    fetchSucceeded: boolean;
    token: string | null;
  }>;
  fetchImpl: typeof fetch;
  buildUrl: (path: string) => string;
}

/**
 * Pure flush routine: resolves an access token, then POSTs the given events
 * (chunked into backend-safe batches) to the beacon endpoint. Designed to be
 * dependency-injected so it is fully unit-testable.
 *
 * Behaviour contract (see AGENTS.md):
 * - If no token resolves, the events are dropped (returns { accepted: 0 })
 *   rather than growing memory or throwing.
 * - Every network error is swallowed; no retries; the token is never logged.
 * - `keepalive: true` is set so in-flight requests survive tab close.
 */
export const runUsageFlush = async (
  events: UsageBeaconEvent[],
  sessionId: string | undefined,
  deps: RunUsageFlushDeps
): Promise<{ accepted: number }> => {
  const { fetchImpl, resolveToken, buildUrl } = deps;

  let resolvedToken: {
    fetchSucceeded: boolean;
    token: string | null;
  };
  try {
    resolvedToken = await resolveToken();
  } catch {
    // Token refresh failures are expected during sign-out/expiry. Beacon
    // delivery is best-effort and must never create an unhandled rejection.
    return { accepted: 0 };
  }

  const { fetchSucceeded, token } = resolvedToken;
  if (!fetchSucceeded || !token) {
    return { accepted: 0 };
  }

  const batches = buildEventBatches(events, USAGE_MAX_BATCH_SIZE);
  let accepted = 0;

  await Promise.all(
    batches.map(async batch => {
      const payload: UsageBeaconPayload = {
        events: batch,
      };
      if (typeof sessionId === 'string' && sessionId) {
        payload.session_id = sessionId;
      }

      try {
        const response = await fetchImpl(buildUrl('/users/usage/events'), {
          method: 'POST',
          keepalive: true,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `JWT ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          accepted += batch.length;
        }
      } catch {
        // Swallow every error — never retry, never surface to the UI
        // (AGENTS.md: abort/network/5xx are never retried; beacon is fire-and-forget).
      }
    })
  );

  return { accepted };
};
