/**
 * Shared bounded retry policy for idempotent reads (AGENTS.md retry policy):
 *
 * - Never retry: aborts/cancellations, `ERR_NETWORK`, and 5xx server errors.
 * - Bounded retry: idempotent reads that get a 429 (rate limit) retry once
 *   with exponential backoff — never more than 2 attempts total.
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
  retryDelay: (attempt: number): number =>
    Math.min(1000 * 2 ** attempt, 4000),
} as const;

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

const getErrorStatus = (error: unknown): number | null => {
  const candidate = error as {
    response?: { status?: unknown };
    status?: unknown;
  } | null;
  const status = candidate?.response?.status ?? candidate?.status;
  return typeof status === 'number' ? status : null;
};

const isRetryForbiddenError = (error: unknown): boolean => {
  if (isAbortError(error)) return true;
  if ((error as { code?: string } | null)?.code === 'ERR_NETWORK') return true;
  const status = getErrorStatus(error);
  return status !== null && status >= 500 && status < 600;
};
