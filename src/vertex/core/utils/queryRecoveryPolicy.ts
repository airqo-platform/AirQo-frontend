import type { AxiosError } from "axios";
import type { Query, QueryClient } from "@tanstack/react-query";

/**
 * What Vertex queries do when the connection drops and comes back.
 *
 * - A request that got no answer is retried for about 20 seconds. A timeout and other failures keep
 *   the shorter budget: a timeout means the server is slow, and each retry waits out the timeout again.
 * - If the browser goes offline during those retries, they pause and carry on after the reconnect.
 * - After a reconnect, mounted queries that are stale or failed for a network or server reason run
 *   again, once. A 4xx would fail the same way, so it is left alone.
 */

const PING_URL = "/api/ping";
const PING_TIMEOUT_MS = 5000;

const NON_RETRYABLE_STATUSES = new Set([401, 403, 404, 422]);
const TIMEOUT_ERROR_CODES = new Set(["ECONNABORTED", "ETIMEDOUT"]);
const NETWORK_ERROR_CODES = new Set(["ERR_NETWORK", "ECONNABORTED", "ETIMEDOUT"]);

const MAX_RETRIES = 2;
const MAX_NETWORK_RETRIES = 3;
const NETWORK_RETRY_BASE_MS = 3000;
const NETWORK_RETRY_MAX_MS = 12000;

/** A tab hidden for at least this long re-runs failed queries when it becomes visible. */
export const HIDDEN_RECOVERY_THRESHOLD_MS = 60_000;

export const getErrorStatusCode = (error: unknown): number | null => {
  const axiosLike = error as AxiosError | undefined;
  if (typeof axiosLike?.response?.status === "number") {
    return axiosLike.response.status;
  }

  const generic = error as { status?: number } | undefined;
  if (typeof generic?.status === "number") {
    return generic.status;
  }

  return null;
};

const getErrorCode = (error: unknown): string | null => {
  const axiosLike = error as AxiosError | undefined;
  return typeof axiosLike?.code === "string" ? axiosLike.code : null;
};

/**
 * True when a request got no answer at all. The axios interceptors rewrite these failures to
 * `response.status === 0`, so checking for a missing response would never match.
 */
export const isNetworkLevelError = (error: unknown): boolean => {
  const code = getErrorCode(error);
  if (code === "ERR_CANCELED") return false;
  return getErrorStatusCode(error) === 0 || (code !== null && NETWORK_ERROR_CODES.has(code));
};

/** True when the request was dropped on the way, not when the server was too slow to answer. */
const isConnectionDrop = (error: unknown): boolean =>
  isNetworkLevelError(error) && !TIMEOUT_ERROR_CODES.has(getErrorCode(error) ?? "");

/** True when a failed request could succeed once the connection is back. */
export const isRecoverableFailure = (error: unknown): boolean => {
  const status = getErrorStatusCode(error);
  return status === null || status === 0 || status >= 500;
};

/**
 * There is deliberately no `navigator.onLine` check here. A retry that finds the browser offline
 * pauses and resumes on reconnect, so an interrupted request doesn't end in an error.
 */
export const shouldRetryQuery = (failureCount: number, error: unknown): boolean => {
  const status = getErrorStatusCode(error);
  if (status !== null && (status >= 500 || NON_RETRYABLE_STATUSES.has(status))) {
    return false;
  }

  if (getErrorCode(error) === "ERR_CANCELED") {
    return false;
  }

  return failureCount < (isConnectionDrop(error) ? MAX_NETWORK_RETRIES : MAX_RETRIES);
};

/** Half the delay is fixed and half random, so tabs that failed together don't retry together. */
export const backoffWithJitter = (attempt: number, baseMs: number, maxMs: number): number => {
  const ceiling = Math.min(maxMs, baseMs * 2 ** attempt);
  return Math.round(ceiling / 2 + Math.random() * (ceiling / 2));
};

export const getQueryRetryDelay = (attempt: number, error: unknown): number =>
  isConnectionDrop(error)
    ? backoffWithJitter(attempt, NETWORK_RETRY_BASE_MS, NETWORK_RETRY_MAX_MS)
    : Math.min(1000 * 2 ** attempt, 10000);

export const shouldRefetchOnReconnect = (query: Query): boolean =>
  query.state.status !== "error" || isRecoverableFailure(query.state.error);

const isRecoverablyFailed = (query: Query): boolean =>
  query.state.status === "error" && isRecoverableFailure(query.state.error);

/**
 * Re-runs failed, mounted queries. This also reaches a failed query whose old data is still fresh,
 * which `refetchOnReconnect` skips. A query already fetching is left to finish.
 */
export const refetchFailedQueries = (client: QueryClient): Promise<void> =>
  client.refetchQueries(
    { type: "active", predicate: isRecoverablyFailed },
    { cancelRefetch: false }
  );

export const countFailedQueries = (client: QueryClient): number =>
  client.getQueryCache().findAll({ type: "active", predicate: isRecoverablyFailed }).length;

/** `navigator.onLine` only says a network interface is up, so confirm the app can really be reached. */
export const checkApiReachable = async (): Promise<boolean> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

  try {
    const response = await fetch(PING_URL, {
      method: "HEAD",
      cache: "no-store",
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
};
