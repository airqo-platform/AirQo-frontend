/**
 * Keeps the user signed in through a dropped connection.
 *
 * next-auth's client turns any failed `GET /api/auth/session` into "signed out": a network error
 * or a server error page becomes `null`. Beacon then redirects to /login and clears the API token,
 * and next-auth stops re-checking on tab focus once its session is `null`, so it never recovers.
 *
 * A request that got no answer, or a 5xx, says nothing about the session. The fetch observer in
 * `lib/network-status` passes session reads through `withSessionFallback`, which answers those
 * failures with the last session Beacon saw (until it expires). Only a real answer from the
 * server changes the session, so signing out and an expired cookie still work as before.
 */
import { isConnectivityError } from "@/lib/retry"

const SESSION_PATH = "/api/auth/session"

let kept: { body: string; expiresAt: number | null } | null = null

/** Called with every session next-auth reports; `null` forgets it. */
export function keepSession(session: unknown): void {
  if (!session || typeof session !== "object") {
    kept = null
    return
  }
  const expires = (session as { expires?: unknown }).expires
  const expiresAt = typeof expires === "string" ? Date.parse(expires) : NaN
  kept = { body: JSON.stringify(session), expiresAt: Number.isNaN(expiresAt) ? null : expiresAt }
}

export function forgetSession(): void {
  kept = null
}

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input
  if (input instanceof URL) return input.href
  return input.url
}

function requestMethod(input: RequestInfo | URL, init?: RequestInit): string {
  if (init?.method) return init.method.toUpperCase()
  if (typeof Request !== "undefined" && input instanceof Request) return input.method.toUpperCase()
  return "GET"
}

/** True for next-auth's session check (a GET; `update()` POSTs to the same path). */
export function isSessionRead(input: RequestInfo | URL, init?: RequestInit): boolean {
  if (requestMethod(input, init) !== "GET") return false
  try {
    const base = typeof window !== "undefined" && window.location?.origin ? window.location.origin : "http://localhost"
    return new URL(requestUrl(input), base).pathname.endsWith(SESSION_PATH)
  } catch {
    return false
  }
}

function keptResponse(now: number): Response | null {
  if (!kept) return null
  if (kept.expiresAt !== null && kept.expiresAt <= now) return null
  return new Response(kept.body, { status: 200, headers: { "Content-Type": "application/json" } })
}

/**
 * Wraps a session read. A network failure or a 5xx is answered with the kept session, when there
 * is one; every other outcome is passed on unchanged.
 */
export function withSessionFallback(request: Promise<Response>, now: () => number = Date.now): Promise<Response> {
  return request.then(
    (response) => (response.status >= 500 ? keptResponse(now()) ?? response : response),
    (error: unknown) => {
      const fallback = isConnectivityError(error) ? keptResponse(now()) : null
      if (fallback) return fallback
      throw error
    }
  )
}
