/*
 * Copied from beacon/lib/retry.ts (isConnectivityError only), so route-error can
 * tell a dropped connection from a real crash. Nexus's ErrorBoundary has the same
 * abort/cancel check inline; Vertex has none.
 *
 * The connection monitor that drives the offline banner (Beacon lib/network-status.ts,
 * Nexus lib/backendStatus.ts, Vertex's events in network-status-banner) stays in
 * each app: it pings each app's own server.
 */

/** True when a request failed with no response at all (network down), not a cancelled one. */
export function isConnectivityError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const e = error as any

  if (e.name === 'AbortError' || e.name === 'CanceledError' || e.code === 'ERR_CANCELED') return false

  // axios: no response at all
  if (e.isAxiosError) return !e.response

  // fetch rejects with a TypeError when the network fails
  if (e instanceof TypeError) return true

  return false
}

/** `navigator.onLine` is only a hint, but `false` is reliable. */
export function isBrowserOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}
