/**
 * Shared helpers for deciding whether a failed request is worth retrying
 * and how long to wait before the next attempt.
 */

/** Pulls an HTTP status off the error shapes used in Beacon (axios, fetch wrappers, React Query). */
export function getErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined
  const e = error as any
  const status = e.response?.status ?? e.status ?? e.statusCode
  return typeof status === "number" ? status : undefined
}

/**
 * True when the request never got a response: the network is down, the
 * request timed out, or the server was unreachable. Cancelled and aborted
 * requests are not connectivity failures.
 */
export function isConnectivityError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false
  const e = error as any

  if (e.name === "AbortError" || e.name === "CanceledError" || e.code === "ERR_CANCELED") return false

  // axios: no response at all
  if (e.isAxiosError) return !e.response

  // fetch rejects with a TypeError when the network fails
  if (e instanceof TypeError) return true

  return false
}

const TRANSIENT_STATUSES = new Set([502, 503, 504])
const TRANSIENT_MESSAGE = /failed to fetch|network ?error|networkerror|load failed|timed? ?out|status:? 50[234]\b/i

/**
 * True for failures that may succeed on a retry: no response, a timeout, or a
 * 502/503/504. Never true for a 4xx, which will fail the same way again.
 */
export function isTransientError(error: unknown): boolean {
  const status = getErrorStatus(error)
  if (status !== undefined) return TRANSIENT_STATUSES.has(status)
  if (isConnectivityError(error)) return true

  // Many services rethrow as a plain Error, so the status only survives in the message
  const message = error instanceof Error ? error.message : ""
  return TRANSIENT_MESSAGE.test(message)
}

/**
 * Exponential backoff with jitter ("equal jitter"): half of the exponential
 * delay is fixed, the other half is random, so clients that failed together
 * don't retry together.
 *
 * @param attempt 0 for the first retry, 1 for the second, ...
 */
export function backoffDelay(attempt: number, baseMs = 1000, maxMs = 30_000): number {
  const exponential = Math.min(maxMs, baseMs * 2 ** attempt)
  const half = exponential / 2
  return Math.round(half + Math.random() * half)
}
