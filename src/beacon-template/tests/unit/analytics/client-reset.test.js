// Signing out before PostHog has loaded on the page: its stored identity is removed directly, so
// the next page can't restore the previous user's id. Own file, so PostHog hasn't loaded yet.
import test from "node:test"
import assert from "node:assert/strict"
import "../test-env.mjs"

process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test"
Object.assign(window.location, { pathname: "/dashboard/home", search: "", hash: "", hostname: "beacon.example.org" })
const cookies = []
globalThis.document = {
  set cookie(value) {
    cookies.push(value)
  },
}
window.localStorage.setItem("ph_phc_test_posthog", '{"distinct_id":"user-1"}')

const { resetAnalytics } = await import("@/lib/analytics")

test("signing out before PostHog loads removes its stored identity", () => {
  resetAnalytics()
  assert.equal(window.localStorage.getItem("ph_phc_test_posthog"), null)
  assert.ok(cookies.includes("ph_phc_test_posthog=; Max-Age=0; path=/; domain=.example.org"))
  assert.ok(cookies.includes("ph_phc_test_posthog=; Max-Age=0; path=/"))
})
