import test from "node:test"
import assert from "node:assert/strict"
import "../test-env.mjs"

import {
  checkTypeCounts,
  filterDevices,
  groupFleetIssues,
  issueAgeBuckets,
  shiftDiagnosisDate,
  sortDevices,
  subsystemLabel,
  subsystemNoun,
  summariseDevices,
} from "@/lib/fleet-health"

let seq = 0
const issue = (overrides) => ({
  issue_code: `CODE_${++seq}`,
  check_type: "DATA_GAPS",
  component_name: "communication",
  title: "Data gaps",
  subsystem: "connectivity",
  severity: "LOW",
  description: null,
  is_new: false,
  streak_days: 2,
  streak_start_date: "2026-10-28",
  device_id: "d1",
  device_name: "airqo_d1",
  diagnosis_date: "2026-10-29",
  ...overrides,
})

const ISSUES = [
  issue({ device_id: "d1", device_name: "airqo_d1", subsystem: "battery", component_name: "device_battery", check_type: "LOW_CHARGE_OUTAGE", title: "Outages after low battery voltage", severity: "CRITICAL", streak_days: 4 }),
  issue({ device_id: "d1", device_name: "airqo_d1", subsystem: "battery", component_name: "device_battery", check_type: "METRIC_RATE_EXCEEDED", title: "Battery discharging fast", severity: "HIGH", is_new: true, streak_days: 1 }),
  issue({ device_id: "d2", device_name: "airqo_d2", subsystem: "battery", component_name: "device_battery", check_type: "LOW_CHARGE_OUTAGE", title: "Outages after low battery voltage", severity: "HIGH", streak_days: 3 }),
  issue({ device_id: "d3", device_name: "airqo_d3", subsystem: "sensor", check_type: "METRIC_STUCK", title: "Sensor 1 PM2.5 stuck", severity: "HIGH" }),
  issue({ device_id: "d3", device_name: "airqo_d3", subsystem: "sensor", check_type: "METRIC_STUCK", title: "Sensor 1 PM10 stuck", severity: "HIGH" }),
  issue({ device_id: "d4", device_name: "airqo_d4", subsystem: "sensor", check_type: "SENSOR_DISAGREEMENT", title: "Sensors disagree", severity: "MEDIUM", is_new: true, streak_days: 1 }),
  issue({ device_id: "d1", device_name: "airqo_d1" }),
  issue({ device_id: "d5", device_name: "airqo_d5", severity: "MEDIUM", streak_days: 8 }),
  issue({ device_id: "d6", device_name: "airqo_d6", severity: "CRITICAL", check_type: "METRIC_MISSING", title: "No timestamp readings" }),
]

test("subsystemLabel names known subsystems and tidies the rest", () => {
  assert.equal(subsystemLabel("battery"), "Battery")
  assert.equal(subsystemLabel("Sensor"), "Sensors")
  assert.equal(subsystemLabel("gps_module"), "Gps module")
  assert.equal(subsystemLabel(""), "Other")
  assert.equal(subsystemLabel(null), "Other")
})

test("subsystemNoun reads as the word before 'issues'", () => {
  assert.equal(subsystemNoun("sensor"), "sensor")
  assert.equal(subsystemNoun("GPS_Module"), "gps module")
  assert.equal(subsystemNoun(""), "other")
})

test("groupFleetIssues counts issues, devices, new devices and types per subsystem", () => {
  const groups = groupFleetIssues(ISSUES)
  const battery = groups.find((g) => g.subsystem === "battery")

  assert.equal(battery.issueCount, 3)
  assert.equal(battery.deviceCount, 2)
  assert.equal(battery.newDeviceCount, 1)
  assert.deepEqual(battery.severityCounts, { CRITICAL: 1, HIGH: 2, MEDIUM: 0, LOW: 0 })
  assert.deepEqual(battery.types, [
    { title: "Outages after low battery voltage", deviceCount: 2, newDeviceCount: 0 },
    { title: "Battery discharging fast", deviceCount: 1, newDeviceCount: 1 },
  ])
})

test("groupFleetIssues puts the groups with most critical and high issues first", () => {
  // battery: 1 critical + 2 high = 3; sensor: 2 high = 2; connectivity: 1 critical = 1
  assert.deepEqual(groupFleetIssues(ISSUES).map((g) => g.subsystem), ["battery", "sensor", "connectivity"])
})

test("groupFleetIssues breaks urgency ties on critical issues, then devices", () => {
  const groups = groupFleetIssues([
    issue({ device_id: "a", subsystem: "x", severity: "HIGH" }),
    issue({ device_id: "b", subsystem: "y", severity: "CRITICAL" }),
    issue({ device_id: "c", subsystem: "z", severity: "HIGH" }),
    issue({ device_id: "d", subsystem: "z", severity: "LOW" }),
  ])
  assert.deepEqual(groups.map((g) => g.subsystem), ["y", "z", "x"])
})

test("devices with a known health score are visited first, lowest score first", () => {
  const worst = [
    { device_id: "d2", overall_health_score: 22.4, top_cause_code: "COMPONENT_FAULT:device_battery" },
    { device_id: "d1", overall_health_score: 31.5, top_cause_code: "COMPONENT_FAULT:communication" },
  ]
  const groups = groupFleetIssues(ISSUES, worst)
  const battery = groups.find((g) => g.subsystem === "battery")
  assert.deepEqual(battery.devices.map((d) => d.deviceId), ["d2", "d1"])
})

test("a lowest-scoring device's likely cause counts for the group holding that component", () => {
  const worst = [
    { device_id: "d2", overall_health_score: 22.4, top_cause_code: "COMPONENT_FAULT:device_battery" },
    // d1 has battery issues too, but its likely cause is its communication data gaps
    { device_id: "d1", overall_health_score: 31.5, top_cause_code: "COMPONENT_FAULT:communication" },
    { device_id: "d3", overall_health_score: 40, top_cause_code: null },
  ]
  const count = (subsystem) => groupFleetIssues(ISSUES, worst).find((g) => g.subsystem === subsystem).likelyCauseDeviceCount
  assert.equal(count("battery"), 1)
  assert.equal(count("connectivity"), 1)
  assert.equal(count("sensor"), 0)
})

test("summariseDevices orders each device's issues by severity and finds its longest streak", () => {
  const [d1] = summariseDevices(ISSUES.filter((i) => i.device_id === "d1"))
  assert.equal(d1.worstSeverity, "CRITICAL")
  assert.deepEqual(d1.issues.map((i) => i.severity), ["CRITICAL", "HIGH", "LOW"])
  assert.equal(d1.hasNewIssue, true)
  assert.equal(d1.longestStreakDays, 4)
  assert.equal(d1.healthScore, null)
})

test("sortDevices supports every order", () => {
  const devices = summariseDevices(ISSUES)
  assert.equal(sortDevices(devices, "severity")[0].deviceId, "d1") // critical with 3 issues beats d6's single critical
  assert.equal(sortDevices(devices, "streak")[0].deviceId, "d5")
  assert.equal(sortDevices(devices, "issues")[0].deviceId, "d1")
})

test("filterDevices needs one issue matching all issue filters, and matches text across fields", () => {
  const devices = summariseDevices(ISSUES)
  const ids = (list) => list.map((d) => d.deviceId).sort()

  assert.deepEqual(ids(filterDevices(devices, { checkType: "LOW_CHARGE_OUTAGE" })), ["d1", "d2"])
  assert.deepEqual(ids(filterDevices(devices, { newOnly: true })), ["d1", "d4"])
  // d1's new issue is HIGH, not CRITICAL: no single issue matches both
  assert.deepEqual(ids(filterDevices(devices, { newOnly: true, severity: "CRITICAL" })), [])
  assert.deepEqual(ids(filterDevices(devices, { query: "PM10" })), ["d3"])
  assert.deepEqual(ids(filterDevices(devices, { query: "AIRQO_D5" })), ["d5"])
  assert.equal(filterDevices(devices, {}).length, devices.length)
})

test("checkTypeCounts counts each device once per check", () => {
  const devices = summariseDevices(ISSUES.filter((i) => i.subsystem === "sensor"))
  assert.deepEqual(checkTypeCounts(devices), [
    { checkType: "METRIC_STUCK", deviceCount: 1 },
    { checkType: "SENSOR_DISAGREEMENT", deviceCount: 1 },
  ])
})

test("issueAgeBuckets sorts issues by how many days in a row they were found", () => {
  assert.deepEqual(
    issueAgeBuckets(ISSUES).map((b) => b.count),
    [2, 5, 1, 1]
  )
  // A new issue counts as new whatever its streak says
  assert.equal(issueAgeBuckets([{ is_new: true, streak_days: 5 }])[0].count, 1)
})

test("shiftDiagnosisDate moves across month and year ends in UTC", () => {
  assert.equal(shiftDiagnosisDate("2026-10-29", -1), "2026-10-28")
  assert.equal(shiftDiagnosisDate("2026-11-01", -1), "2026-10-31")
  assert.equal(shiftDiagnosisDate("2026-12-31", 1), "2027-01-01")
})
