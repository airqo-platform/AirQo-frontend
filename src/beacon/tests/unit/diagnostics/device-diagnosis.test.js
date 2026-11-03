import test from "node:test"
import assert from "node:assert/strict"
import "../test-env.mjs"

import {
  causeTitle,
  componentRows,
  dayFraction,
  dayRange,
  daySegments,
  diagnosedDaysInWindow,
  humanizeAction,
  humanizeComponent,
  humanizeMetric,
  issuePresence,
  latestCausePattern,
  scoreBand,
  utcClock,
} from "@/lib/device-diagnosis"

const day = (date, overrides = {}) => ({
  id: date,
  device_id: "d1",
  diagnosis_date: date,
  record_count: 100,
  hours_with_data: 20,
  overall_health_score: 80,
  lifecycle_state: "DEGRADING",
  subsystem_scores: { communication: 60, device_battery: 40, pm_sensor1: 100, pm_sensor2: 100 },
  issue_count: 0,
  issues: [],
  top_cause_code: null,
  ...overrides,
})

const issue = (issue_code, severity) => ({ issue_code, severity, title: issue_code, check_type: "X", subsystem: "s", is_new: false, streak_days: 1, streak_start_date: "2026-10-01" })

test("dayRange includes both ends and crosses months", () => {
  assert.deepEqual(dayRange("2026-10-30", "2026-11-02"), ["2026-10-30", "2026-10-31", "2026-11-01", "2026-11-02"])
  assert.deepEqual(dayRange("2026-11-02", "2026-11-01"), [])
})

test("humanizeComponent and causeTitle read like speech", () => {
  assert.equal(humanizeComponent("device_battery"), "Device battery")
  assert.equal(causeTitle({ title: "device_battery (battery) fault" }), "Battery fault")
  assert.equal(causeTitle({ title: "Solar panel shaded" }), "Solar panel shaded")
})

test("humanizeMetric spells out PM sizes and sensor numbers", () => {
  assert.equal(humanizeMetric("pm2_5_sensor1"), "PM2.5 sensor 1")
  assert.equal(humanizeMetric("pm10_sensor2"), "PM10 sensor 2")
  assert.equal(humanizeMetric("battery_voltage"), "Battery voltage")
})

test("humanizeAction names components by their type", () => {
  assert.equal(
    humanizeAction("Inspect device_battery (battery): Battery Voltage low. Check it first — it likely explains the issues on communication."),
    "Inspect the battery: Battery Voltage low. Check it first — it likely explains the issues on communication."
  )
  assert.equal(humanizeAction("Clean the inlet."), "Clean the inlet.")
})

test("scoreBand splits at 85, 70 and 50", () => {
  assert.deepEqual([100, 85, 84.9, 70, 69.9, 50, 49.9].map(scoreBand), ["good", "good", "fair", "fair", "poor", "poor", "bad"])
})

test("componentRows puts the weakest component first and merges those always at 100", () => {
  const rows = componentRows([
    day("2026-10-28", { subsystem_scores: { communication: 30, device_battery: 18, pm_sensor1: 100, pm_sensor2: 100 } }),
    day("2026-10-29", { subsystem_scores: { communication: 44.5, device_battery: 36.1, pm_sensor1: 100, pm_sensor2: 100 } }),
  ])
  assert.deepEqual(rows.map((r) => r.label), ["Device battery", "Communication", "2 components at 100"])
  assert.equal(rows[0].latest, 36.1)
  assert.deepEqual(rows[0].scores, { "2026-10-28": 18, "2026-10-29": 36.1 })
  assert.deepEqual(rows[2].components, ["pm_sensor1", "pm_sensor2"])
})

test("componentRows keeps a component that dipped below 100 once in its own row", () => {
  const rows = componentRows([
    day("2026-10-28", { subsystem_scores: { a: 100, b: 100 } }),
    day("2026-10-29", { subsystem_scores: { a: 99, b: 100 } }),
  ])
  assert.deepEqual(rows.map((r) => r.label), ["A", "B"])
})

test("issuePresence maps each issue to the days and severities it was found with", () => {
  const presence = issuePresence([
    day("2026-10-28", { issues: [issue("LOW_CHARGE", "CRITICAL")] }),
    day("2026-10-29", { issues: [issue("LOW_CHARGE", "HIGH"), issue("GAPS", "LOW")] }),
  ])
  assert.deepEqual([...presence.get("LOW_CHARGE")], [["2026-10-28", "CRITICAL"], ["2026-10-29", "HIGH"]])
  assert.deepEqual([...presence.get("GAPS")], [["2026-10-29", "LOW"]])
})

test("latestCausePattern counts the diagnosed days that shared the latest likely cause", () => {
  const battery = "COMPONENT_FAULT:device_battery"
  const pattern = latestCausePattern([
    day("2026-10-29", { top_cause_code: battery }),
    day("2026-10-04"),
    day("2026-10-05", { top_cause_code: battery }),
    day("2026-10-06", { top_cause_code: "COMPONENT_FAULT:communication" }),
  ])
  assert.deepEqual(pattern, { causeCode: battery, days: 2, diagnosedDays: 4, firstDate: "2026-10-05" })
  assert.equal(latestCausePattern([day("2026-10-29")]), null)
})

test("diagnosedDaysInWindow counts days in the window ending on as-of", () => {
  const dates = ["2026-10-09", "2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29"]
  assert.equal(diagnosedDaysInWindow(dates, "2026-10-29", 7), 4)
  assert.equal(diagnosedDaysInWindow(dates, "2026-11-01", 3), 0)
})

test("dayFraction and utcClock read times in UTC", () => {
  assert.equal(dayFraction("2026-10-29T06:00:00Z", "2026-10-29"), 0.25)
  assert.equal(dayFraction("2026-10-28T23:00:00Z", "2026-10-29"), 0)
  assert.equal(utcClock("2026-10-29T01:22:22+00:00"), "01:22")
  assert.equal(utcClock(null), "—")
})

test("daySegments splits the day between data and outages from first to last reading", () => {
  const outages = [
    { start: "2026-10-29T22:00:00Z", end: "2026-10-29T23:00:00Z", hours: 1, after_low_charge: false },
    { start: "2026-10-29T03:00:00Z", end: "2026-10-29T06:00:00Z", hours: 3, after_low_charge: true },
  ]
  const segments = daySegments("2026-10-29", "2026-10-29T00:00:00Z", "2026-10-29T23:30:00Z", outages)
  assert.deepEqual(
    segments.map((s) => [s.kind, +(s.start * 24).toFixed(2), +(s.end * 24).toFixed(2)]),
    [["data", 0, 3], ["outage", 3, 6], ["data", 6, 22], ["outage", 22, 23], ["data", 23, 23.5]]
  )
  assert.equal(segments[1].outage.after_low_charge, true)
  assert.deepEqual(daySegments("2026-10-29", null, null, outages), [])
})

test("daySegments keeps outages inside the readings and stops them overlapping", () => {
  const outages = [
    { start: "2026-10-28T22:00:00Z", end: "2026-10-29T02:00:00Z", hours: 4, after_low_charge: true },
    { start: "2026-10-29T05:00:00Z", end: "2026-10-29T08:00:00Z", hours: 3, after_low_charge: true },
    { start: "2026-10-29T07:00:00Z", end: "2026-10-29T09:00:00Z", hours: 2, after_low_charge: false },
    { start: "2026-10-29T23:00:00Z", end: "2026-10-30T01:00:00Z", hours: 2, after_low_charge: false },
  ]
  const segments = daySegments("2026-10-29", "2026-10-29T01:00:00Z", "2026-10-29T23:30:00Z", outages)
  assert.deepEqual(
    segments.map((s) => [s.kind, +(s.start * 24).toFixed(2), +(s.end * 24).toFixed(2)]),
    [["outage", 1, 2], ["data", 2, 5], ["outage", 5, 8], ["outage", 8, 9], ["data", 9, 23], ["outage", 23, 23.5]]
  )
})

test("the merged always-100 row shows no latest score when one of its components was not scored that day", () => {
  const rows = componentRows([
    day("2026-10-28", { subsystem_scores: { a: 50, pm1: 100, pm2: 100 } }),
    day("2026-10-29", { subsystem_scores: { a: 60, pm1: 100 } }),
  ])
  const merged = rows.find((r) => r.key === "__perfect__")
  assert.equal(merged.latest, null)
})
