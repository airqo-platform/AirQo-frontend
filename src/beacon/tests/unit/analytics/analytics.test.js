import test from "node:test"
import assert from "node:assert/strict"
import { readdirSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import "../test-env.mjs"

import {
  ROUTE_TEMPLATES,
  beforeSend,
  getPageContext,
  getRouteTemplate,
  isAnalyticsEnabled,
  sanitizeProperties,
  stripUrlDetails,
  trackEvent,
  trackPageview,
  withAppProperties,
} from "@/lib/analytics"

const APP_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../app")

/** Every page route under app/, as a Next.js path such as /dashboard/devices/[id]. */
function listPageRoutes(dir = APP_DIR, segments = []) {
  const routes = []
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) {
      if (entry === "api") continue
      // Route groups such as (auth) don't appear in the URL
      const segment = /^\(.*\)$/.test(entry) ? [] : [entry]
      routes.push(...listPageRoutes(full, [...segments, ...segment]))
    } else if (/^page\.(tsx|ts|jsx|js)$/.test(entry)) {
      routes.push(`/${segments.join("/")}`)
    }
  }
  return routes
}

test("every page in app/ has a route template, so new pages are reported under their own name", () => {
  const missing = listPageRoutes().filter((route) => !ROUTE_TEMPLATES.includes(route))
  assert.deepEqual(missing, [], `add these to ROUTE_TEMPLATES in lib/analytics.ts: ${missing.join(", ")}`)
})

test("concrete paths are reported as their route template", () => {
  assert.equal(getRouteTemplate("/dashboard/devices/aq_g5_87"), "/dashboard/devices/[id]")
  assert.equal(getRouteTemplate("/dashboard/devices/aq_g5_87/diagnostics"), "/dashboard/devices/[id]/diagnostics")
  assert.equal(getRouteTemplate("/dashboard/sites/64f0c2a1e4b0a1b2c3d4e5f6"), "/dashboard/sites/[id]")
  assert.equal(getRouteTemplate("/dashboard/category/lowcost"), "/dashboard/category/[categoryId]")
  assert.equal(getRouteTemplate("/dashboard/home"), "/dashboard/home")
  assert.equal(getRouteTemplate("/dashboard"), "/dashboard")
  assert.equal(getRouteTemplate("/"), "/")
})

test("a static page wins over a dynamic one at the same depth", () => {
  assert.equal(getRouteTemplate("/dashboard/devices/my-devices"), "/dashboard/devices/my-devices")
  assert.equal(getRouteTemplate("/dashboard/analytics/analysis"), "/dashboard/analytics/analysis")
})

test("query strings, hashes and trailing slashes don't change the route", () => {
  assert.equal(getRouteTemplate("/dashboard/devices/aq_1?tab=config#top"), "/dashboard/devices/[id]")
  assert.equal(getRouteTemplate("/dashboard/reports/"), "/dashboard/reports")
})

test("unknown paths are reported as unmatched rather than as the raw path", () => {
  assert.equal(getRouteTemplate("/dashboard/not-a-page/123/456"), "unmatched")
  assert.equal(getRouteTemplate(null), "unmatched")
})

test("page context names the page the way the app does", () => {
  assert.deepEqual(getPageContext("/dashboard/devices/aq_g5_87"), {
    route: "/dashboard/devices/[id]",
    page_title: "Device Details",
  })
})

test("properties that could identify a person or carry typed text are dropped", () => {
  const clean = sanitizeProperties({
    email: "someone@example.com",
    userEmail: "someone@example.com",
    userName: "someone",
    firstName: "Some",
    phone_number: "0700000000",
    accessToken: "JWT abc",
    message: "free text",
    description: "free text",
    search_query: "kampala",
    name: "Device 1",
    format: "pdf",
    device_count: 12,
    has_query: true,
    query_length: 7,
    tab: "config",
  })
  assert.deepEqual(clean, { format: "pdf", device_count: 12, has_query: true, query_length: 7, tab: "config" })
})

test("values are cut down to plain, bounded data", () => {
  const clean = sanitizeProperties({
    long: "x".repeat(500),
    list: Array.from({ length: 80 }, (_, index) => index),
    nested: { status: "offline", userEmail: "someone@example.com" },
    skipped: undefined,
    callback: () => {},
    notANumber: Number.NaN,
  })
  assert.equal(clean.long.length, 200)
  assert.equal(clean.list.length, 50)
  assert.deepEqual(clean.nested, { status: "offline" })
  assert.equal("skipped" in clean, false)
  assert.equal("callback" in clean, false)
  assert.equal(clean.notANumber, null)
})

test("URLs lose their query string and hash before they are sent", () => {
  assert.equal(
    stripUrlDetails("https://beacon.airqo.net/dashboard/home?group=airqo#token=abc&provider=google"),
    "https://beacon.airqo.net/dashboard/home"
  )
  assert.equal(stripUrlDetails("/login?callbackUrl=%2Fdashboard"), "/login")

  const event = beforeSend({
    uuid: "1",
    event: "$pageview",
    properties: {
      $current_url: "https://beacon.airqo.net/login#token=secret",
      $referrer: "https://vertex.airqo.net/devices/overview?search=kampala",
      $pathname: "/login",
    },
    $set_once: { $initial_current_url: "https://beacon.airqo.net/?token=secret" },
  })
  assert.equal(event.properties.$current_url, "https://beacon.airqo.net/login")
  assert.equal(event.properties.$referrer, "https://vertex.airqo.net/devices/overview")
  assert.equal(event.properties.$pathname, "/login")
  assert.equal(event.$set_once.$initial_current_url, "https://beacon.airqo.net/")
  assert.equal(beforeSend(null), null)
})

test("every event says which app and environment it came from, without overriding its own values", () => {
  const event = withAppProperties({ uuid: "1", event: "$pageleave", properties: { environment: "custom", route: "/dashboard" } })
  assert.equal(event.properties.app_name, "beacon")
  assert.equal(event.properties.environment, "custom")
  assert.equal(event.properties.route, "/dashboard")
  assert.equal(withAppProperties({ uuid: "2", event: "$identify", properties: {} }).properties.environment, "development")
  assert.equal(withAppProperties(null), null)
})

test("without NEXT_PUBLIC_POSTHOG_KEY nothing is loaded or sent", () => {
  assert.equal(isAnalyticsEnabled(), false)
  assert.doesNotThrow(() => trackEvent("report_exported", { format: "pdf" }))
  assert.doesNotThrow(() => trackPageview("/dashboard/home"))
})

test("a sign-in records its method once, and a failed one leaves nothing behind", async () => {
  const { clearLoginStarted, consumeLoginMethod, consumeLoginStartedAt, markLoginStarted } = await import(
    "@/lib/feedback-preferences"
  )

  markLoginStarted("google")
  assert.equal(consumeLoginMethod(), "google")
  assert.equal(consumeLoginMethod(), null)
  assert.ok(consumeLoginStartedAt() > 0)

  markLoginStarted("password")
  clearLoginStarted()
  assert.equal(consumeLoginStartedAt(), null)
  assert.equal(consumeLoginMethod(), null)
})
