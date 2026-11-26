// The connection monitor keeps module-level state, so these tests run in order as one story:
// each starts from the state the previous one left.
import test, { mock } from "node:test"
import assert from "node:assert/strict"

let serverAnswers = true
let pings = 0

const win = new EventTarget()
win.location = { href: "http://localhost:3000/", origin: "http://localhost:3000" }
win.fetch = async (url) => {
  if (String(url).startsWith("/api/ping")) pings += 1
  if (!serverAnswers) throw new TypeError("Failed to fetch")
  return new Response(null, { status: 204 })
}
globalThis.window = win
globalThis.document = Object.assign(new EventTarget(), { visibilityState: "visible" })
globalThis.navigator = { onLine: false, userAgent: "node" }

mock.timers.enable({ apis: ["setTimeout", "Date"], now: Date.UTC(2026, 10, 26, 9) })

const { checkConnectionNow, getConnectionState, isLikelyOffline, subscribe } = await import("@/lib/network-status")

/** Lets pending promise callbacks run (the ping is async). */
const settle = async () => {
  for (let i = 0; i < 5; i += 1) await new Promise((resolve) => setImmediate(resolve))
}

/** Moves the clock on, past the ping cache, and runs any timers that are due. */
const advance = async (ms) => {
  mock.timers.tick(ms)
  await settle()
}

/** Moves the clock on in small steps until the monitor reaches `state`, as its backoff timers fire. */
const waitFor = async (state, limitMs = 10_000) => {
  for (let elapsed = 0; elapsed < limitMs && getConnectionState() !== state; elapsed += 250) {
    await advance(250)
  }
  return getConnectionState()
}

const unsubscribe = subscribe(() => {})

test.after(() => {
  unsubscribe()
  mock.timers.reset()
})

test("stays online when the browser says offline at start but the server answers", async () => {
  await settle()
  assert.ok(pings >= 1, "the server should be pinged to check the browser's flag")
  assert.equal(getConnectionState(), "online")
  assert.equal(isLikelyOffline(), false)
})

test("ignores an offline event while the server still answers", async () => {
  await advance(3000)
  window.dispatchEvent(new Event("offline"))
  await settle()
  assert.equal(getConnectionState(), "online")
})

test("goes offline when the browser says offline and the server can't be reached", async () => {
  serverAnswers = false
  await advance(3000)
  window.dispatchEvent(new Event("offline"))
  await settle()
  assert.equal(getConnectionState(), "offline")
  assert.equal(isLikelyOffline(), true)
})

test("recovers without an online event when the browser's flag stays on offline", async () => {
  serverAnswers = true
  assert.equal(await waitFor("restored"), "restored")
  // The restored message shows for three seconds
  await advance(3000)
  assert.equal(getConnectionState(), "online")
})

test("ignores an online event when it never went offline", async () => {
  navigator.onLine = true
  window.dispatchEvent(new Event("online"))
  await settle()
  assert.equal(getConnectionState(), "online")
})

test("reconnects through the server check after a real outage", async () => {
  serverAnswers = false
  navigator.onLine = false
  await advance(3000)
  window.dispatchEvent(new Event("offline"))
  await settle()
  assert.equal(getConnectionState(), "offline")

  // Network back, server not yet
  navigator.onLine = true
  window.dispatchEvent(new Event("online"))
  await settle()
  assert.equal(getConnectionState(), "reconnecting")

  serverAnswers = true
  assert.equal(await waitFor("restored"), "restored")
})

test("Retry checks the server straight away instead of waiting for the next timed check", async () => {
  await advance(3000) // the restored message clears
  serverAnswers = false
  navigator.onLine = false
  window.dispatchEvent(new Event("offline"))
  await settle()
  assert.equal(getConnectionState(), "offline")

  serverAnswers = true
  await checkConnectionNow()
  assert.equal(getConnectionState(), "restored")
})
