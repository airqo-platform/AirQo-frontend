import type { Revalidator, RevalidatorOptions } from 'swr';

/**
 * Shared bounded retry policy for idempotent reads (AGENTS.md retry policy):
 *
 * - Never retry: aborts/cancellations and 5xx server errors.
 * - Never retry: network-level failures (`ERR_NETWORK`, `ECONNABORTED`,
 *   `ETIMEDOUT`, `TimeoutError`) — those are retried only by `swrRetryPolicy`
 *   (the SWR-level adapter), per issue #4023.
 * - Bounded retry: idempotent reads that get a 429 (rate limit) retry once
 *   with backoff that honours the `Retry-After` header when present (capped),
 *   never more than 2 attempts total.
 * - Everything else fails immediately and the caller shows an error state.
 *
 * Shape matches React Query's `retry` / `retryDelay` options so it can be
 * spread directly into `useQuery`/`useQueries` configs.
 */
export const boundedRetryPolicy = {
  retry: (failureCount: number, error: unknown): boolean => {
    if (isRetryForbiddenError(error)) {
      return false;
    }
    return getErrorStatus(error) === 429 && failureCount < 1;
  },
  retryDelay: (attempt: number, error?: unknown): number => {
    const retryAfterSeconds = getRetryAfterSeconds(error);
    if (retryAfterSeconds !== null) {
      return Math.min(retryAfterSeconds * 1000, RATE_LIMIT_RETRY_MAX_MS);
    }
    return Math.min(1000 * 2 ** attempt, 4000);
  },
} as const;

const RATE_LIMIT_RETRY_MAX_MS = 15_000;

/**
 * Network-level retry tuning (issue #4023). Some services synthesize
 * HTTP 500 on network failures, so `code`/`name` classification must run
 * before `getErrorStatus` — see `isNetworkRetryableError`.
 */
const NETWORK_RETRY_MAX_ATTEMPTS = 2;
const NETWORK_RETRY_BASE_MS = 1_000;
const NETWORK_RETRY_MAX_MS = 4_000;
const NETWORK_RETRY_JITTER_MS = 250;

export const isAbortError = (error: unknown): boolean => {
  const candidate = error as {
    name?: string;
    code?: string;
    message?: string;
  } | null;
  if (!candidate) return false;
  return (
    candidate.name === 'AbortError' ||
    candidate.name === 'CanceledError' ||
    candidate.code === 'ERR_CANCELED' ||
    candidate.message === 'canceled'
  );
};

/**
 * Classifies transport-level failures (issue #4023) so they can be bounded-
 * retried after sleep/wake or reconnect. `code`/`name` are checked BEFORE
 * `getErrorStatus` because some services synthesize HTTP 500 on network
 * failures — a synthesized status must not mask the network-level cause.
 */
export const isNetworkRetryableError = (error: unknown): boolean => {
  const candidate = error as { name?: unknown; code?: unknown } | null;
  if (!candidate) return false;
  if (candidate.name === 'TimeoutError') return true;
  return (
    candidate.code === 'ERR_NETWORK' ||
    candidate.code === 'ECONNABORTED' ||
    candidate.code === 'ETIMEDOUT'
  );
};

export const getErrorStatus = (error: unknown): number | null => {
  const candidate = error as {
    response?: { status?: unknown };
    status?: unknown;
  } | null;
  const status = candidate?.response?.status ?? candidate?.status;
  return typeof status === 'number' ? status : null;
};

/**
 * Reads the `Retry-After` header (seconds) from a rate-limit response so the
 * client backs off for exactly as long as the server asked.
 */
export const getRetryAfterSeconds = (error: unknown): number | null => {
  const candidate = error as {
    response?: { headers?: Record<string, string | undefined> };
  } | null;
  const header =
    candidate?.response?.headers?.['retry-after'] ??
    candidate?.response?.headers?.['Retry-After'];
  if (!header) return null;

  // RFC 7231: Retry-After may be delay-seconds or an HTTP-date.
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds;
  }

  const date = new Date(header);
  if (!Number.isNaN(date.getTime())) {
    return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 1000));
  }

  return null;
};

/**
 * SWR-compatible retry adapter. Retries idempotent GETs on 429 (rate-limit)
 * and on network-level failures (issue #4023). 429: at most 1 retry / 2
 * attempts, honours `Retry-After` when present (capped), falls back to 1 s.
 * Network: exponential backoff with jitter, capped at 2 automatic retries
 * per key. Never retries aborts or 5xx. The retry count is preserved from
 * SWR's own tracking; `onErrorRetry` owns the cap — do NOT also set
 * `errorRetryCount` when spreading this policy.
 */
export const swrRetryPolicy = {
  shouldRetryOnError: (error: Error): boolean => {
    // Aborts/cancellations never retry — they are superseded fetches, not
    // failures to recover from.
    if (isAbortError(error)) return false;
    // Network-level failures retry so tabs recover after sleep/wake or
    // reconnect (issue #4023).
    if (isNetworkRetryableError(error)) return true;
    // Rate-limit: idempotent GETs only.
    return getErrorStatus(error) === 429;
  },
  onErrorRetry: (
    error: Error,
    _key: string,
    _config: unknown,
    revalidate: Revalidator,
    revalidateOpts: Required<RevalidatorOptions>
  ): void => {
    // Aborts never retry.
    if (isAbortError(error)) return;

    // 429 branch — defense in depth: only 429 should reach here when
    // shouldRetryOnError gates correctly, but guard explicitly so a
    // misconfiguration never causes a retry storm.
    if (getErrorStatus(error) === 429) {
      // Stop after one retry — don't loop on persistent 429s.
      if (revalidateOpts.retryCount > 1) return;

      const retryAfterMs = (() => {
        const seconds = getRetryAfterSeconds(error);
        if (seconds !== null) {
          return Math.min(seconds * 1000, RATE_LIMIT_RETRY_MAX_MS);
        }
        // Exponential fallback: 1 s for the single allowed retry.
        return 1000;
      })();

      setTimeout(() => revalidate(revalidateOpts), retryAfterMs);
      return;
    }

    // Network-level branch (issue #4023): bounded exponential backoff with
    // jitter so a tab recovers once connectivity returns, without a retry
    // storm when the network is genuinely down.
    if (isNetworkRetryableError(error)) {
      // At most 2 automatic retries per key.
      if (revalidateOpts.retryCount > NETWORK_RETRY_MAX_ATTEMPTS) return;

      const backoff = Math.min(
        NETWORK_RETRY_BASE_MS * 2 ** (revalidateOpts.retryCount - 1),
        NETWORK_RETRY_MAX_MS
      );
      const jitter = Math.floor(Math.random() * NETWORK_RETRY_JITTER_MS);
      setTimeout(() => revalidate(revalidateOpts), backoff + jitter);
    }
  },
} as const;

const isRetryForbiddenError = (error: unknown): boolean => {
  if (isAbortError(error)) return true;
  if ((error as { code?: string } | null)?.code === 'ERR_NETWORK') return true;
  const status = getErrorStatus(error);
  return status !== null && status >= 500 && status < 600;
};
