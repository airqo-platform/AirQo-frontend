import test from "node:test"
import assert from "node:assert/strict"

// Browser globals for the connection monitor, which wraps window.fetch; next-auth calls the global fetch
let answer = "network-error"
const signedIn = { user: { name: "Field Engineer", email: "field@example.com" }, accessToken: "token", expires: "2099-01-01T00:00:00.000Z" }
const serverFetch = async (url) => {
  if (String(url).startsWith("/api/ping")) return new Response(null, { status: 204 })
  if (answer === "network-error") throw new TypeError("Failed to fetch")
  if (answer === "bad-gateway") return new Response("<html>502</html>", { status: 502 })
  if (answer === "signed-out") return Response.json({})
  return Response.json(signedIn)
}
const win = new EventTarget()
win.location = { href: "http://localhost:3000/dashboard", origin: "http://localhost:3000" }
win.fetch = serverFetch
win.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} }
globalThis.window = win
globalThis.localStorage = win.localStorage
globalThis.document = Object.assign(new EventTarget(), { visibilityState: "visible" })
// next-auth logs client errors with sendBeacon when the browser has it (all current browsers do)
// Node 21+ has a read-only global navigator, so the fixture is defined rather than assigned
Object.defineProperty(globalThis, "navigator", {
  value: { onLine: true, userAgent: "node", sendBeacon: () => true },
  configurable: true,
  writable: true,
})

const { forgetSession, isSessionRead, keepSession, withSessionFallback } = await import("@/lib/session-fallback")
const { startNetworkMonitor } = await import("@/lib/network-status")
startNetworkMonitor()
globalThis.fetch = window.fetch
const { getSession } = await import("next-auth/react")

const failed = () => Promise.reject(new TypeError("Failed to fetch"))

test("recognises next-auth's session check and nothing else", () => {
  assert.equal(isSessionRead("/api/auth/session"), true)
  assert.equal(isSessionRead("http://localhost:3000/api/auth/session?x=1"), true)
  assert.equal(isSessionRead(new Request("http://localhost:3000/api/auth/session")), true)
  assert.equal(isSessionRead("/api/auth/session", { method: "POST" }), false, "update() POSTs; a failed update keeps its own session")
  assert.equal(isSessionRead("/api/auth/csrf"), false)
  assert.equal(isSessionRead("/api/devices"), false)
})

test("answers a failed session check with the kept session", async () => {
  keepSession(signedIn)
  const response = await withSessionFallback(failed())
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), signedIn)
})

test("answers a server error with the kept session", async () => {
  keepSession(signedIn)
  const response = await withSessionFallback(Promise.resolve(new Response("down", { status: 503 })))
  assert.deepEqual(await response.json(), signedIn)
})

test("passes real answers through unchanged", async () => {
  keepSession(signedIn)
  const signedOut = Response.json({})
  assert.equal(await withSessionFallback(Promise.resolve(signedOut)), signedOut)
  const unauthorised = new Response("{}", { status: 401 })
  assert.equal(await withSessionFallback(Promise.resolve(unauthorised)), unauthorised)
})

test("lets the failure through when there is no session to keep", async () => {
  forgetSession()
  await assert.rejects(withSessionFallback(failed()), TypeError)
  keepSession(null)
  await assert.rejects(withSessionFallback(failed()), TypeError)
})

test("does not keep a session past its expiry", async () => {
  keepSession({ ...signedIn, expires: "2026-11-26T09:00:00.000Z" })
  await assert.rejects(withSessionFallback(failed(), () => Date.parse("2026-11-26T09:00:01.000Z")), TypeError)
})

test("does not answer a cancelled request", async () => {
  keepSession(signedIn)
  const aborted = Promise.reject(Object.assign(new Error("aborted"), { name: "AbortError" }))
  await assert.rejects(withSessionFallback(aborted), { name: "AbortError" })
})

test("next-auth keeps the session when its check can't reach the server", async () => {
  keepSession(signedIn)
  answer = "network-error"
  assert.deepEqual(await getSession(), signedIn)
  answer = "bad-gateway"
  assert.deepEqual(await getSession(), signedIn)
})

test("next-auth still signs out when the server says so", async () => {
  keepSession(signedIn)
  answer = "signed-out"
  assert.equal(await getSession(), null)
})

test("next-auth signs out on a failed check when no session was ever kept", async () => {
  forgetSession()
  answer = "network-error"
  assert.equal(await getSession(), null)
})
