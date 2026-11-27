import test from "node:test"
import assert from "node:assert/strict"
import "../test-env.mjs"
import {
  compareWithYesterday,
  countByArea,
  dailyOnline,
  devicesToCsv,
  healthFor,
  hourlyOnline,
  isOverviewView,
  lastSeenOf,
  locationOf,
  mergeUptime,
  onlinePercent,
  rankFleets,
  recentIncidents,
  reportSummary,
  silentFor,
  sortByLongestSilent,
  summarisePeriod,
} from "@/lib/network-overview"

const check = (checkedAt, notTransmitting, total = 100) => ({
  _id: checkedAt,
  checked_at: checkedAt,
  total_deployed_devices: total,
  operational_count: total - notTransmitting,
  transmitting_count: 0,
  data_available_count: 0,
  not_transmitting_devices_count: notTransmitting,
  not_transmitting_percentage: (notTransmitting / total) * 100,
  status: "OK",
})

test("health follows the platform's lines: warning from 35% offline, critical from 50%", () => {
  assert.equal(healthFor(34.9), "OK")
  assert.equal(healthFor(35), "WARNING")
  assert.equal(healthFor(49.9), "WARNING")
  assert.equal(healthFor(50), "CRITICAL")
  assert.equal(healthFor(25, 20), "WARNING", "a check's own threshold_value wins")
})

test("the online rate counts every device except Not Transmitting", () => {
  assert.equal(onlinePercent({ total: 200, operational: 150, transmitting: 10, data_available: 10, not_transmitting: 30 }), 85)
  assert.equal(onlinePercent({ total: 0, operational: 0, transmitting: 0, data_available: 0, not_transmitting: 0 }), 0)
})

test("yesterday's check is the one closest to 24 hours before the newest", () => {
  const checks = [
    check("2026-11-26T10:00:00Z", 131),
    check("2026-11-25T09:00:00Z", 120),
    check("2026-11-25T10:00:00Z", 113),
    check("2026-11-25T14:00:00Z", 140),
  ]
  const result = compareWithYesterday(checks)
  assert.equal(result.previous.checked_at, "2026-11-25T10:00:00Z")
  assert.equal(result.notTransmittingChange, 18)
  assert.ok(Math.abs(result.onlineChange - -18) < 1e-9)
})

test("no comparison when nothing was checked near the same time yesterday", () => {
  assert.equal(compareWithYesterday([check("2026-11-26T10:00:00Z", 10), check("2026-11-26T06:00:00Z", 12)]), null)
  assert.equal(compareWithYesterday([check("2026-11-26T10:00:00Z", 10)]), null)
})

const uptime = [
  { _id: "2026-11-02", avgOfflinePercentage: 40, maxOfflinePercentage: 55, minOfflinePercentage: 30 },
  { _id: "2026-11-01", avgOfflinePercentage: 20, maxOfflinePercentage: 30, minOfflinePercentage: 10 },
  { _id: "2026-11-03", avgOfflinePercentage: 30, maxOfflinePercentage: 36, minOfflinePercentage: 25 },
]

test("days come out oldest first, as online rates", () => {
  assert.deepEqual(
    dailyOnline(uptime).map((d) => [d.date, d.averageOnline, d.lowestOnline]),
    [
      ["2026-11-01", 80, 70],
      ["2026-11-02", 60, 45],
      ["2026-11-03", 70, 64],
    ],
  )
})

test("the period counts warning days by daily average and critical days by their worst check", () => {
  const period = summarisePeriod(uptime)
  assert.equal(period.days, 3)
  assert.equal(period.averageOnline, 70)
  assert.equal(period.daysInWarning, 1)
  assert.deepEqual(period.criticalDays, ["2026-11-02"])
  assert.deepEqual(period.worstDay, { date: "2026-11-02", lowestOnline: 45 })
  assert.equal(summarisePeriod([]).averageOnline, null)
})

test("fleets are ranked worst first with their health", () => {
  const fleets = rankFleets(
    [
      { _id: "a", avg_total_monitors: 10.4, avg_not_transmitting_percentage: 10, max_not_transmitting_percentage: 20, min_not_transmitting_percentage: 5 },
      { _id: "b", avg_total_monitors: 5, avg_not_transmitting_percentage: 42, max_not_transmitting_percentage: 60, min_not_transmitting_percentage: 30 },
    ],
    (item) => item._id.toUpperCase(),
  )
  assert.deepEqual(
    fleets.map((f) => [f.name, f.devices, f.averageOnline, f.health]),
    [
      ["B", 5, 58, "WARNING"],
      ["A", 10, 90, "OK"],
    ],
  )
})

test("the report summary states the period, warning days, critical days and the fleet spread", () => {
  const period = summarisePeriod(uptime)
  const fleets = rankFleets(
    [
      { _id: "airqo", avg_total_monitors: 10, avg_not_transmitting_percentage: 21.3, max_not_transmitting_percentage: 30, min_not_transmitting_percentage: 14 },
      { _id: "metone", avg_total_monitors: 2, avg_not_transmitting_percentage: 1, max_not_transmitting_percentage: 8, min_not_transmitting_percentage: 0 },
    ],
    (item) => (item._id === "airqo" ? "AirQo" : "Met One"),
  )
  const text = reportSummary({ scopeName: "the network", period, firstDay: "2026-11-01", lastDay: "2026-11-03", deployed: 612, fleets })
  assert.match(text, /^Between 1 November and 3 November, an average of 70\.0% of the 612 deployed devices in the network were online\./)
  assert.match(text, /warning line on 1 of 3 days/)
  assert.match(text, /one day, 2 November, had a check at the critical line/)
  assert.match(text, /Met One had the highest average online rate \(99\.0%\) and AirQo the lowest \(78\.7%\)/)
  assert.match(
    reportSummary({ scopeName: "Clarity", period: summarisePeriod([]), firstDay: null, lastDay: null, deployed: null, fleets: [] }),
    /No status checks were recorded for Clarity/,
  )
})

const now = new Date("2026-11-26T10:00:00Z")
const devices = [
  { _id: "1", name: "aq_1", network: "airqo", lastActive: "2026-11-25T18:00:00Z", site: [{ name: "Nakawa", district: "Kampala", country: "Uganda" }] },
  { _id: "2", name: "aq_2", network: "airqo", lastActive: "2026-11-03T06:00:00Z", lastRawData: "2026-11-02T06:00:00Z", site: { name: "Kibera", country: "Kenya" } },
  { _id: "3", name: "aq_3", network: "clarity", lastActive: null, site: [] },
]

test("the latest of the feed and raw timestamps counts as last seen", () => {
  assert.equal(lastSeenOf(devices[1]), "2026-11-03T06:00:00Z")
  assert.equal(lastSeenOf(devices[2]), null)
})

test("never-seen devices come first, then the longest silent", () => {
  assert.deepEqual(sortByLongestSilent(devices).map((d) => d._id), ["3", "2", "1"])
})

test("silence reads in minutes, hours, then days", () => {
  assert.equal(silentFor("2026-11-26T09:20:00Z", now), "40 minutes")
  assert.equal(silentFor("2026-11-25T18:00:00Z", now), "16 hours")
  assert.equal(silentFor("2026-11-03T06:00:00Z", now), "23 days")
  assert.equal(silentFor(null, now), null)
})

test("sites read as a name and an area, whether the platform sends an array or an object", () => {
  assert.equal(locationOf(devices[0]), "Nakawa, Kampala")
  assert.equal(locationOf(devices[1]), "Kibera, Kenya")
  assert.equal(locationOf(devices[2]), "")
})

test("areas are counted by district, then country, and folded past the top few", () => {
  assert.deepEqual(countByArea(devices), [
    { area: "Kampala", count: 1 },
    { area: "Kenya", count: 1 },
    { area: "No site", count: 1 },
  ])
  const many = Array.from({ length: 8 }, (_, i) => ({ _id: String(i), name: `d${i}`, site: { district: `D${i}` } }))
  const folded = countByArea(many, 3)
  assert.equal(folded.length, 3)
  assert.deepEqual(folded[2], { area: "Other areas", count: 6 })
})

test("the CSV quotes cells that need it and says Never for unseen devices", () => {
  const csv = devicesToCsv(
    [{ _id: "x", name: "aq_x", long_name: 'Gate "A", north', network: "airqo", lastActive: null, site: null }],
    () => "AirQo",
    now,
  )
  const [header, row] = csv.split("\n")
  assert.equal(header, "Device,Site,Area,Country,Manufacturer,Last data (UTC),Silent for")
  assert.equal(row, '"Gate ""A"", north",,,,AirQo,,Never')
})

test("only the four role views are accepted", () => {
  assert.equal(isOverviewView("field"), true)
  assert.equal(isOverviewView("admin"), false)
  assert.equal(isOverviewView(null), false)
})

const day = (date, avg, max = avg) => ({
  _id: date,
  avgOfflinePercentage: avg,
  maxOfflinePercentage: max,
  minOfflinePercentage: avg,
  totalChecks: 4,
  alertsTriggered: 0,
})

test("a day without a recorded average is left out, not shown as 100% online", () => {
  assert.deepEqual(
    dailyOnline([day("2026-11-24", null, null), day("2026-11-25", 20, 30)]).map((d) => [d.date, d.averageOnline, d.lowestOnline]),
    [["2026-11-25", 80, 70]]
  )
  assert.equal(summarisePeriod([day("2026-11-24", null, null)]).averageOnline, null)
})

test("summary days keep their figures and gaps take the figure from that day's checks", () => {
  const summary = [day("2026-11-23", 10), day("2026-11-24", null, null), day("2026-11-25", null, null)]
  const fromChecks = [day("2026-11-23", 99), day("2026-11-24", 40)]
  assert.deepEqual(
    mergeUptime(summary, fromChecks).map((d) => [d._id, d.avgOfflinePercentage]),
    [["2026-11-23", 10], ["2026-11-24", 40]]
  )
})

test("recent incidents keep the last 48 hours over the warning line, newest first", () => {
  const now = new Date("2026-11-26T12:00:00Z")
  const at = (iso, exceeded) => ({ ...check(iso, 40), threshold_exceeded: exceeded })
  const checks = [
    at("2026-11-19T12:00:00Z", true), // a week old
    at("2026-11-25T08:00:00Z", true),
    at("2026-11-26T10:00:00Z", true),
    at("2026-11-26T11:00:00Z", false), // under the line
    at("2026-11-24T13:00:00Z", true),
  ]
  assert.deepEqual(
    recentIncidents(checks, { now }).map((c) => c.checked_at),
    ["2026-11-26T10:00:00Z", "2026-11-25T08:00:00Z", "2026-11-24T13:00:00Z"]
  )
  assert.equal(recentIncidents(checks, { now, limit: 1 }).length, 1)
})

test("the hourly online rate counts each slot by its number of checks", () => {
  const slot = (hour, offline, count) => ({ _id: { hour, dayOfWeek: 1 }, avg_not_transmitting_percentage: offline, count })
  const hours = hourlyOnline([slot(9, 0, 4), slot(9, 100, 1), slot(10, null, 3), slot(11, 50, 0), slot(8, 20, 2)])
  assert.deepEqual(
    hours.map((h) => [h.hour, h.online, h.checks]),
    [[8, 80, 2], [9, 80, 5]]
  )
})
