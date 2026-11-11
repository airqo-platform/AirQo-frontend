// The PostHog client half of lib/analytics.ts, with a key set and posthog-js replaced by the
// recorder in tests/unit/stubs/posthog-js.mjs. Node runs each test file in its own process, so
// setting the key here doesn't affect the other analytics tests.
import test from "node:test"
import assert from "node:assert/strict"
import "../test-env.mjs"
import posthog from "posthog-js"

process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test"
Object.assign(window.location, { pathname: "/dashboard/home", search: "", hash: "" })
// Load PostHog straight away instead of after the one-second fallback delay
window.requestIdleCallback = (callback) => setTimeout(callback, 0)

const { identifyUser, isAnalyticsEnabled, trackEvent } = await import("@/lib/analytics")

/** Waits for the queued load (a timer, then the dynamic import) to have run. */
async function waitFor(check, timeoutMs = 2000) {
  const started = Date.now()
  while (!check()) {
    if (Date.now() - started > timeoutMs) throw new Error("Timed out waiting for the analytics client")
    await new Promise((resolve) => setTimeout(resolve, 5))
  }
}

test("a full queue and a failed load still identify the user once PostHog loads", async () => {
  assert.equal(isAnalyticsEnabled(), true)
  posthog.failNextInit()

  // More events than the queue keeps, then the sign-in
  for (let index = 0; index < 120; index += 1) trackEvent(`event_${index}`)
  identifyUser({ id: "user-1", role: "admin" })

  // The first load fails: nothing is sent, and nothing waiting is thrown away
  await waitFor(() => posthog.initCalls === 1)
  await new Promise((resolve) => setTimeout(resolve, 10))
  assert.equal(posthog.captured.length, 0)
  assert.equal(posthog.identified.length, 0)

  // The next call retries the load; the queue is still full, so this event itself isn't kept
  trackEvent("after_failure")
  await waitFor(() => posthog.captured.length > 0)

  assert.equal(posthog.initCalls, 2)
  assert.equal(posthog.captured.length, 100)
  assert.equal(posthog.captured[0].event, "event_0")
  assert.equal(posthog.captured[0].properties.route, "/dashboard/home")
  assert.deepEqual(posthog.identified, [{ id: "user-1", properties: { beacon_role: "admin" } }])
})
