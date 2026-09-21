/**
 * Client-side connectivity monitor.
 *
 * `navigator.onLine` only says a network interface is up, so it is used as a
 * hint: going offline is trusted immediately, but "back online" is only
 * declared once a cheap request to our own server (/api/ping) succeeds.
 *
 * States:
 *  - online:       normal operation
 *  - offline:      the browser reports no network
 *  - reconnecting: the browser reports a network, but the server can't be reached yet
 *  - restored:     reachability confirmed after an outage; data is being refreshed
 *                  (lasts a few seconds, then back to "online")
 *
 * When a connection is restored, listeners registered with
 * `onConnectionRestored` run so data that failed during the outage can reload.
 */
import { backoffDelay, isConnectivityError } from "@/lib/retry"

export type ConnectionState = "online" | "offline" | "reconnecting" | "restored"

export interface ConnectionRestoredEvent {
  /** A read request failed during the outage, so the page on screen may be showing an error. */
  lostRequests: boolean
}

const PING_URL = "/api/ping"
const PING_TIMEOUT_MS = 5000
const PING_CACHE_MS = 2000
const RESTORED_DISPLAY_MS = 3000

let state: ConnectionState = "online"
let started = false
let lostRequests = false
let pollAttempt = 0
let pollTimer: ReturnType<typeof setTimeout> | undefined
let restoredTimer: ReturnType<typeof setTimeout> | undefined
let nativeFetch: typeof fetch | undefined
let pingInFlight: Promise<boolean> | undefined
let lastPing: { at: number; ok: boolean } | undefined

const stateListeners = new Set<() => void>()
const restoredListeners = new Set<(event: ConnectionRestoredEvent) => void>()

const isBrowser = () => typeof window !== "undefined"

function setState(next: ConnectionState) {
  if (next === state) return
  state = next
  stateListeners.forEach((listener) => listener())
}

// ─── Store API (for useSyncExternalStore) ─────────────────────────────

export function subscribe(listener: () => void): () => void {
  startNetworkMonitor()
  stateListeners.add(listener)
  return () => {
    stateListeners.delete(listener)
  }
}

export function getConnectionState(): ConnectionState {
  return state
}

export function getServerConnectionState(): ConnectionState {
  return "online"
}

/** True while we know (or strongly suspect) the user has no connection. */
export function isLikelyOffline(): boolean {
  if (isBrowser() && navigator.onLine === false) return true
  return state === "offline" || state === "reconnecting"
}

export function onConnectionRestored(listener: (event: ConnectionRestoredEvent) => void): () => void {
  restoredListeners.add(listener)
  return () => {
    restoredListeners.delete(listener)
  }
}

// ─── Reachability ─────────────────────────────────────────────────────

/**
 * Resolves true when our server answers at all (any status). Concurrent
 * callers share one request, and a recent result is reused.
 */
export function checkReachability(): Promise<boolean> {
  if (!isBrowser()) return Promise.resolve(true)
  if (navigator.onLine === false) return Promise.resolve(false)
  if (lastPing && Date.now() - lastPing.at < PING_CACHE_MS) return Promise.resolve(lastPing.ok)
  if (pingInFlight) return pingInFlight

  const doFetch = nativeFetch ?? window.fetch.bind(window)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS)

  pingInFlight = doFetch(`${PING_URL}?t=${Date.now()}`, {
    method: "HEAD",
    cache: "no-store",
    signal: controller.signal,
  })
    .then(() => true)
    .catch(() => false)
    .then((ok) => {
      clearTimeout(timeout)
      lastPing = { at: Date.now(), ok }
      pingInFlight = undefined
      return ok
    })

  return pingInFlight
}

// ─── Transitions ──────────────────────────────────────────────────────

function clearPoll() {
  if (pollTimer) clearTimeout(pollTimer)
  pollTimer = undefined
}

function goOffline() {
  clearPoll()
  if (restoredTimer) clearTimeout(restoredTimer)
  setState("offline")
}

function startReconnecting() {
  clearPoll()
  if (restoredTimer) clearTimeout(restoredTimer)
  pollAttempt = 0
  setState("reconnecting")
  void poll()
}

async function poll() {
  clearPoll()
  if (state !== "reconnecting") return

  const ok = await checkReachability()
  if (state !== "reconnecting") return

  if (ok) {
    restore()
    return
  }
  pollTimer = setTimeout(() => void poll(), backoffDelay(pollAttempt++, 1000, 30_000))
}

function restore() {
  clearPoll()
  const event: ConnectionRestoredEvent = { lostRequests }
  lostRequests = false
  setState("restored")

  restoredListeners.forEach((listener) => {
    try {
      listener(event)
    } catch (error) {
      console.error("Connection restored listener failed:", error)
    }
  })

  restoredTimer = setTimeout(() => {
    if (state === "restored") setState("online")
  }, RESTORED_DISPLAY_MS)
}

/**
 * Records a failed request. Only failures with no response count, and only
 * reads (GET/HEAD) mark the page as needing a reload, so a failed save never
 * causes a form to be reset.
 *
 * If the browser still claims to be online, the server is pinged: an
 * unreachable server means we're effectively offline; a reachable one means
 * the failure was server-side and is left to the caller.
 */
export function reportRequestFailure(error: unknown, method = "GET") {
  if (!isBrowser() || !isConnectivityError(error)) return

  const isRead = ["GET", "HEAD"].includes(method.toUpperCase())

  if (state === "offline" || state === "reconnecting") {
    if (isRead) lostRequests = true
    return
  }

  void checkReachability().then((ok) => {
    if (ok || state === "offline" || state === "reconnecting") return
    if (isRead) lostRequests = true
    if (navigator.onLine === false) goOffline()
    else startReconnecting()
  })
}

// ─── Wiring ───────────────────────────────────────────────────────────

function requestMethod(input: RequestInfo | URL, init?: RequestInit): string {
  if (init?.method) return init.method
  if (typeof Request !== "undefined" && input instanceof Request) return input.method
  return "GET"
}

/**
 * Most Beacon pages call `fetch` directly, so failures are observed with a
 * thin pass-through wrapper. The caller gets the original promise unchanged.
 */
function observeFetch() {
  // Already wrapped (e.g. this module was re-evaluated by hot reload): reuse the original
  const existing = (window.fetch as any).__beaconNativeFetch as typeof fetch | undefined
  if (existing) {
    nativeFetch = existing
    return
  }

  const original = window.fetch.bind(window)
  nativeFetch = original

  const observed: typeof fetch = (input, init) => {
    const promise = original(input, init)
    promise.catch((error) => reportRequestFailure(error, requestMethod(input, init)))
    return promise
  }
  ;(observed as any).__beaconNativeFetch = original
  window.fetch = observed
}

function handleOnline() {
  startReconnecting()
}

function handleVisibility() {
  if (document.visibilityState !== "visible") return

  // Timers are throttled in background tabs and the "online" event can be
  // missed across sleep/wake, so re-check as soon as the tab is visible again.
  if (navigator.onLine === false) {
    goOffline()
  } else if (state === "offline") {
    startReconnecting()
  } else if (state === "reconnecting") {
    pollAttempt = 0
    void poll()
  }
}

/** Idempotent. Called automatically by the first subscriber. */
export function startNetworkMonitor() {
  if (started || !isBrowser()) return
  started = true

  observeFetch()
  window.addEventListener("offline", goOffline)
  window.addEventListener("online", handleOnline)
  document.addEventListener("visibilitychange", handleVisibility)

  if (navigator.onLine === false) goOffline()
}
