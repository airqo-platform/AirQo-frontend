import test from "node:test"
import assert from "node:assert/strict"
import "../test-env.mjs"

import {
  GOOGLE_MAPS_PHONE_MAX_WAYPOINTS,
  buildGoogleMapsDirectionsLinks,
  calculateNearestNeighborRoute,
  cheapestInsertionKm,
  haversineDistance,
  isPhoneBrowser,
  optimizeRoundTrip,
} from "@/utils/routing-utils"
import { getAttentionReasons, hasMapCoordinates, suggestRouteAdditions } from "@/lib/maintenance-map"

const HOME = { latitude: 0.332078, longitude: 32.570473 }
const km = (a, b) => haversineDistance(a.latitude, a.longitude, b.latitude, b.longitude)
const tourKm = (start, stops) => {
  const tour = [start, ...stops, start]
  return tour.slice(1).reduce((sum, p, i) => sum + km(tour[i], p), 0)
}

// Deterministic points around Kampala
const randomPoints = (count, seed = 7) => {
  let s = seed
  const next = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648)
  return Array.from({ length: count }, (_, i) => ({
    id: `p${i}`,
    latitude: 0.2 + next() * 0.3,
    longitude: 32.4 + next() * 0.3,
  }))
}

test("optimizeRoundTrip visits every stop once and is never longer than nearest-neighbour", () => {
  const points = randomPoints(60)
  const trip = optimizeRoundTrip(HOME, points)

  assert.equal(trip.order.length, points.length)
  assert.deepEqual(new Set(trip.order.map((p) => p.id)), new Set(points.map((p) => p.id)))
  assert.equal(trip.legs.length, points.length + 1)
  assert.ok(Math.abs(trip.distanceKm - tourKm(HOME, trip.order)) < 1e-9)
  assert.ok(trip.distanceKm <= tourKm(HOME, calculateNearestNeighborRoute(HOME, points)) + 1e-9)
})

test("optimizeRoundTrip leaves no stretch whose reversal would shorten the trip", () => {
  const trip = optimizeRoundTrip(HOME, randomPoints(40, 11))
  const tour = [HOME, ...trip.order, HOME]
  for (let i = 1; i < tour.length - 2; i++) {
    for (let k = i + 1; k < tour.length - 1; k++) {
      const delta = km(tour[i - 1], tour[k]) + km(tour[i], tour[k + 1]) - km(tour[i - 1], tour[i]) - km(tour[k], tour[k + 1])
      assert.ok(delta >= -1e-6, `reversing ${i}..${k} would save ${-delta} km`)
    }
  }
})

test("optimizeRoundTrip handles no stops and one stop", () => {
  assert.deepEqual(optimizeRoundTrip(HOME, []), { order: [], distanceKm: 0, legs: [] })
  const stop = { id: "a", latitude: 0.34, longitude: 32.58 }
  const trip = optimizeRoundTrip(HOME, [stop])
  assert.deepEqual(trip.order, [stop])
  assert.ok(Math.abs(trip.distanceKm - 2 * km(HOME, stop)) < 1e-9)
})

test("cheapestInsertionKm is the extra distance of the best leg to slot a stop into", () => {
  const stop = { latitude: 0.432078, longitude: 32.570473 }
  // On the way there costs nothing extra
  assert.ok(cheapestInsertionKm(HOME, [stop], { latitude: 0.382078, longitude: 32.570473 }) < 1e-6)
  const aside = { latitude: 0.382078, longitude: 32.590473 }
  const expected = km(HOME, aside) + km(aside, stop) - km(HOME, stop)
  assert.ok(Math.abs(cheapestInsertionKm(HOME, [stop], aside) - expected) < 1e-9)
})

const NOW = Date.parse("2026-10-29T12:00:00Z")
const item = (id, lat, lng, extra = {}) => ({
  device_id: id,
  device_name: id,
  latitude: lat,
  longitude: lng,
  last_active: "2026-10-29T10:00:00Z",
  uptime: 95,
  data_completeness: 95,
  error_margin: 3,
  cohorts: [],
  ...extra,
})

test("getAttentionReasons flags offline, critical uptime and critical error margin", () => {
  assert.deepEqual(getAttentionReasons(item("a", 0, 0, { uptime: 0, last_active: "2026-10-23T09:00:00Z" }), NOW), {
    severity: 3,
    reasons: ["Offline · last data 6 days ago"],
  })
  assert.deepEqual(getAttentionReasons(item("b", 0, 0, { uptime: 0, last_active: null }), NOW).reasons, ["Offline · no data"])
  assert.deepEqual(getAttentionReasons(item("c", 0, 0, { uptime: 32 }), NOW), { severity: 2, reasons: ["Uptime 32%"] })
  assert.deepEqual(getAttentionReasons(item("d", 0, 0, { error_margin: 25 }), NOW), { severity: 2, reasons: ["Error ±25.0"] })
  assert.deepEqual(getAttentionReasons(item("e", 0, 0), NOW), { severity: 0, reasons: [] })
  // A site whose devices have no paired readings has no error margin to flag
  const site = { site_id: "s", error_margin_devices: 0 }
  assert.equal(getAttentionReasons(item("f", 0, 0, { error_margin: 0, site }), NOW).severity, 0)
})

test("suggestRouteAdditions offers close items needing a visit, most serious first", () => {
  const route = [item("stop", 0.34, 32.58)]
  const candidates = [
    route[0],
    item("near-critical", 0.341, 32.581, { uptime: 30 }),
    item("near-offline", 0.342, 32.582, { uptime: 0, last_active: null }),
    item("near-fine", 0.3405, 32.5805),
    item("far-offline", 1.5, 33.5, { uptime: 0, last_active: null }),
  ]

  const suggestions = suggestRouteAdditions(HOME, route, candidates, { now: NOW })
  assert.deepEqual(suggestions.map((s) => s.item.device_id), ["near-offline", "near-critical"])
  assert.deepEqual(suggestions.map((s) => s.nearStopName), ["stop", "stop"])
  assert.ok(suggestions.every((s) => s.detourKm <= 5))
  assert.deepEqual(suggestRouteAdditions(HOME, route, candidates, { now: NOW, limit: 1 }).map((s) => s.item.device_id), [
    "near-offline",
  ])
  assert.deepEqual(suggestRouteAdditions(HOME, [], candidates, { now: NOW }), [])
})

test("a site without coordinates has no place on the map, rather than one at (0, 0)", () => {
  assert.equal(hasMapCoordinates({ latitude: 0.34, longitude: 32.58 }), true)
  assert.equal(hasMapCoordinates({ latitude: 0, longitude: 0 }), true)
  assert.equal(hasMapCoordinates({ latitude: null, longitude: null }), false)
  assert.equal(hasMapCoordinates({ latitude: 0.34, longitude: null }), false)
  assert.equal(hasMapCoordinates({ latitude: "abc", longitude: 32.58 }), false)

  const route = [item("stop", 0.34, 32.58)]
  const unlocated = item("unlocated", null, null, { uptime: 0, last_active: null })
  assert.deepEqual(suggestRouteAdditions(HOME, route, [unlocated], { now: NOW }), [])
})

test("buildGoogleMapsDirectionsLinks keeps each link within Google Maps' nine waypoints", () => {
  const params = (url) => new URL(url).searchParams
  const points = Array.from({ length: 13 }, (_, i) => ({ latitude: 0.3 + i / 100, longitude: 32.5 }))

  const links = buildGoogleMapsDirectionsLinks(points)
  assert.deepEqual(links.map(({ from, to }) => [from, to]), [[1, 11], [11, 13]])
  const first = params(links[0].url)
  assert.ok(links[0].url.startsWith("https://www.google.com/maps/dir/?"))
  assert.equal(first.get("api"), "1")
  assert.equal(first.get("travelmode"), "driving")
  assert.equal(first.get("origin"), "0.300000,32.500000")
  assert.equal(first.get("waypoints").split("|").length, 9)
  // Each link starts where the previous one ended
  assert.equal(params(links[1].url).get("origin"), first.get("destination"))
  assert.equal(params(links[1].url).get("waypoints").split("|").length, 1)
  assert.ok(links.every((link) => link.url.length < 2048))

  // A phone's web browser takes three waypoints a link
  const phoneLinks = buildGoogleMapsDirectionsLinks(points, GOOGLE_MAPS_PHONE_MAX_WAYPOINTS)
  assert.deepEqual(phoneLinks.map(({ from, to }) => [from, to]), [[1, 5], [5, 9], [9, 13]])
  assert.ok(phoneLinks.every((link) => params(link.url).get("waypoints").split("|").length <= 3))

  assert.equal(buildGoogleMapsDirectionsLinks(points.slice(0, 2)).length, 1)
  assert.equal(params(buildGoogleMapsDirectionsLinks(points.slice(0, 2))[0].url).get("waypoints"), null)
  assert.deepEqual(buildGoogleMapsDirectionsLinks(points.slice(0, 1)), [])
})

test("isPhoneBrowser tells phone and tablet browsers from desktop ones", () => {
  assert.equal(isPhoneBrowser("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148"), true)
  assert.equal(isPhoneBrowser("Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36"), true)
  assert.equal(isPhoneBrowser("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130.0 Safari/537.36"), false)
  assert.equal(isPhoneBrowser("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36"), false)
  assert.equal(isPhoneBrowser(""), false)
  // An iPad user agent that only the iPad token matches: no Mobile, Android, iPhone or iPod
  assert.equal(isPhoneBrowser("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/604.1"), true)
})

test("isPhoneBrowser tells an iPad asking for desktop sites from a Mac by its touch points", () => {
  const desktopSafari = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
  assert.equal(isPhoneBrowser(desktopSafari, 5), true)
  assert.equal(isPhoneBrowser(desktopSafari, 0), false)
  assert.equal(isPhoneBrowser("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36", 10), false)
})
