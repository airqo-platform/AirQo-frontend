import type { Revalidator, RevalidatorOptions } from 'swr';

/**
 * Shared bounded retry policy for idempotent reads (AGENTS.md retry policy):
 *
 * - Never retry: aborts/cancellations, `ERR_NETWORK`, and 5xx server errors.
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
 * SWR-compatible retry adapter. Retries ONLY 429 (rate-limit) for idempotent
 * GETs, at most 1 retry / 2 attempts. Honours `Retry-After` when present
 * (capped), falls back to 1 s. Never retries abort/ERR_NETWORK/5xx/401/403
 * or any other status.
 *
 * Wire into SWR config via spread: `{ ...swrRetryPolicy, errorRetryCount: 1 }`.
 */
export const swrRetryPolicy = {
  shouldRetryOnError: (error: Error): boolean => {
    // Only retry on 429 — idempotent GETs.  Abort / ERR_NETWORK / 5xx /
    // 401 / 403 / 404 / everything else: fail immediately.
    if (isRetryForbiddenError(error)) return false;
    return getErrorStatus(error) === 429;
  },
  onErrorRetry: (
    error: Error,
    _key: string,
    _config: unknown,
    revalidate: Revalidator,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Required by SWR's onErrorRetry signature; not used.
    _revalidateOpts: Required<RevalidatorOptions>
  ): void => {
    // Defense in depth: only 429 should reach here when shouldRetryOnError
    // gates correctly, but guard explicitly so a misconfiguration never
    // causes a retry storm.
    if (getErrorStatus(error) !== 429) return;
    if (isRetryForbiddenError(error)) return;

    const retryAfterMs = (() => {
      const seconds = getRetryAfterSeconds(error);
      if (seconds !== null) {
        return Math.min(seconds * 1000, RATE_LIMIT_RETRY_MAX_MS);
      }
      // Exponential fallback: 1 s for the single allowed retry.
      return 1000;
    })();

    setTimeout(() => revalidate({ retryCount: 1 }), retryAfterMs);
  },
} as const;

const isRetryForbiddenError = (error: unknown): boolean => {
  if (isAbortError(error)) return true;
  if ((error as { code?: string } | null)?.code === 'ERR_NETWORK') return true;
  const status = getErrorStatus(error);
  return status !== null && status >= 500 && status < 600;
};
