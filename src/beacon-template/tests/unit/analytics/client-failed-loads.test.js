// After PostHog fails to load three times analytics turns off for the page, but signing out must
// still remove its stored identity. Own file, so the failures start from a fresh module.
import test from "node:test"
import assert from "node:assert/strict"
import "../test-env.mjs"
import posthog from "posthog-js"

process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test"
Object.assign(window.location, { pathname: "/dashboard/home", search: "", hash: "", hostname: "beacon.example.org" })
window.requestIdleCallback = (callback) => setTimeout(callback, 0)
const cookies = []
globalThis.document = {
  set cookie(value) {
    cookies.push(value)
  },
}

const { isAnalyticsEnabled, resetAnalytics, trackEvent } = await import("@/lib/analytics")

async function waitFor(check, timeoutMs = 2000) {
  const started = Date.now()
  while (!check()) {
    if (Date.now() - started > timeoutMs) throw new Error("Timed out waiting for the analytics client")
    await new Promise((resolve) => setTimeout(resolve, 5))
  }
}

test("signing out after PostHog gave up loading still removes its stored identity", async () => {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    posthog.failNextInit()
    trackEvent(`attempt_${attempt}`)
    await waitFor(() => posthog.initCalls === attempt)
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
  assert.equal(isAnalyticsEnabled(), false)

  window.localStorage.setItem("ph_phc_test_posthog", '{"distinct_id":"user-1"}')
  resetAnalytics()
  assert.equal(window.localStorage.getItem("ph_phc_test_posthog"), null)
  assert.ok(cookies.includes("ph_phc_test_posthog=; Max-Age=0; path=/; domain=.example.org"))
})
