import test from "node:test"
import assert from "node:assert/strict"
import "../test-env.mjs"

import { summarizeDailyPerformance } from "@/lib/performance-summary"
import { airQloudService } from "@/services/airqloud.service"

const DAILY = [
  { date: "2026-10-01", uptime: 50, error_margin: 2, correlation: 0.9 },
  { date: "2026-10-02", uptime: 25, error_margin: null, correlation: null },
  { date: "2026-10-03", uptime: 0, error_margin: 4, correlation: null },
]

test("a row's uptime averages every day, including days with no readings", () => {
  assert.equal(summarizeDailyPerformance(DAILY, 3, 0.9).averageUptime, 25)
})

test("error margin and correlation come from the API, with history only for days that have a value", () => {
  const summary = summarizeDailyPerformance(DAILY, 3, 0.9)
  assert.equal(summary.averageErrorMargin, 3)
  assert.equal(summary.averageCorrelation, 0.9)
  assert.deepEqual(summary.uptimeHistory.map((day) => day.timestamp), ["2026-10-01", "2026-10-02", "2026-10-03"])
  assert.deepEqual(summary.errorMarginHistory, [
    { value: 2, timestamp: "2026-10-01" },
    { value: 4, timestamp: "2026-10-03" },
  ])
  assert.deepEqual(summary.correlationHistory, [{ value: 0.9, timestamp: "2026-10-01" }])
})

test("a row without days has no uptime", () => {
  assert.equal(summarizeDailyPerformance([], null, null).averageUptime, null)
})

const stubFetch = (t, body) => {
  const urls = []
  t.mock.method(airQloudService, "getAuthHeaders", () => ({}))
  t.mock.method(globalThis, "fetch", async (url) => {
    urls.push(String(url))
    return { ok: true, status: 200, json: async () => body }
  })
  return urls
}

test("lists ask for the summary, including when both options are false", async (t) => {
  const urls = stubFetch(t, { cohorts: [], grids: [], sites: [] })
  const params = { includePerformance: true, includeSeries: false, includeDevices: false }

  await airQloudService.getAirQlouds(params)
  await airQloudService.getGrids(params)
  await airQloudService.getSites(params)

  assert.equal(urls.length, 3)
  for (const url of urls) {
    const query = new URL(url, "http://localhost").searchParams
    assert.equal(query.get("includeSeries"), "false")
    assert.equal(query.get("includeDevices"), "false")
  }
})

test("a grid without its sites keeps its device count, country and summary", async (t) => {
  stubFetch(t, {
    grids: [
      {
        grid_id: "grid_a",
        name: "a_grid",
        country: "Uganda",
        number_of_devices: 12,
        sites: [],
        daily: DAILY,
        error_margin: 3,
        correlation: 0.9,
        offline_devices: 2,
      },
    ],
  })

  const { airqlouds } = await airQloudService.getGrids({ includeSeries: false, includeDevices: false })

  assert.equal(airqlouds[0].numberOfDevices, 12)
  assert.equal(airqlouds[0].country, "Uganda")
  assert.deepEqual(airqlouds[0].daily, DAILY)
  assert.equal(airqlouds[0].error_margin, 3)
  assert.equal(airqlouds[0].correlation, 0.9)
  assert.equal(airqlouds[0].offline_devices, 2)
})
