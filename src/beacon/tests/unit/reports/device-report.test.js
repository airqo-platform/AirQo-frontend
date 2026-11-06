import test from "node:test"
import assert from "node:assert/strict"
import "../test-env.mjs"

import {
  SNAPSHOT_NOTE,
  buildDeviceReport,
  getUptimeBand,
  reportTextToString,
  toUptimePercent,
} from "@/lib/reports/device-report"
import { REPORT_MAP_HEIGHT, REPORT_MAP_WIDTH, fitMapFrame, getMapNote } from "@/lib/reports/report-images"
import {
  buildCalendarCharts,
  buildDailyUptimeChart,
  buildDeviceHeatmap,
  buildSensorHealthChart,
  buildStatusGauge,
  niceMax,
} from "@/lib/reports/report-charts"
import { buildDeviceReportPdf } from "@/lib/reports/device-report-pdf"

const FROM = new Date(2026, 9, 26, 0, 0, 0, 0) // Mon Oct 26
const TO = new Date(2026, 10, 8, 23, 59, 59, 999) // Sun Nov 8, 14 days
const GENERATED = new Date(2026, 10, 9, 9, 0, 0, 0)

/** Hourly readings on the given days, hours 0..hoursPerDay-1. */
const readings = (dayOffsets, hoursPerDay, sensors = [10, 12]) =>
  dayOffsets.flatMap((offset) =>
    Array.from({ length: hoursPerDay }, (_, hour) => ({
      datetime: new Date(2026, 9, 26 + offset, hour, 30).toISOString(),
      record_count: 2,
      s1_pm2_5: sensors[0] + hour,
      s2_pm2_5: sensors[1] + hour,
    }))
  )

const ALL_DAYS = Array.from({ length: 14 }, (_, day) => day)

const buildReport = (devices, overrides = {}) =>
  buildDeviceReport({
    entities: [{ name: "kampala", devices }],
    itemLabel: "Cluster",
    itemNames: ["kampala"],
    organisation: "green_city",
    from: FROM,
    to: TO,
    generatedAt: GENERATED,
    ...overrides,
  })

const text = (paragraphs) => paragraphs.map(reportTextToString).join(" ")

test("uptime bands use Beacon's thresholds, and zero means nothing was received", () => {
  assert.equal(getUptimeBand(75), "good")
  assert.equal(getUptimeBand(74.9), "moderate")
  assert.equal(getUptimeBand(50), "moderate")
  assert.equal(getUptimeBand(49.9), "critical")
  assert.equal(getUptimeBand(0), "no-data")
  assert.equal(getUptimeBand(null), "no-data")
})

test("the snapshot names one cluster, counts several and never repeats Devices", () => {
  const device = { _id: "d1", name: "aq_1", data: readings(ALL_DAYS, 24) }

  assert.deepEqual(buildReport([device]).snapshot[1], { label: "Cluster", value: "kampala" })
  assert.deepEqual(buildReport([device], { itemNames: ["kampala", "mbale"] }).snapshot[1], {
    label: "Clusters",
    value: "2",
  })

  const labels = buildReport([device], { itemLabel: "Device", itemNames: ["aq_1"] }).snapshot.map((row) => row.label)
  assert.deepEqual(labels, ["Organisation", "Devices", "Devices on the map", "Period"])
})

test("a heatmap pulls the map back to show each device's reach, and says when it's too small to see", () => {
  const kampala = { latitude: 0.32, longitude: 32.58 }
  const lagos = { latitude: 6.52, longitude: 3.38 }
  const frame = (points, reachKm) => fitMapFrame(points, REPORT_MAP_WIDTH, REPORT_MAP_HEIGHT, undefined, reachKm)

  assert.equal(frame([kampala], 0).zoom, 15)
  assert.equal(frame([kampala], 5).zoom, 12)
  // Far apart, the reach is smaller than the usual margin, so the view doesn't change
  assert.equal(frame([kampala, lagos], 5).zoom, frame([kampala, lagos], 0).zoom)

  assert.equal(getMapNote([kampala], false), SNAPSHOT_NOTE)
  assert.match(getMapNote([kampala], true), /up to 5 km from a device/)
  assert.match(getMapNote([kampala, lagos], true), /too far apart/)
})

test("readings settle which scale a small uptime value is on", () => {
  // The service turns the API's 48.96 into 0.4896
  assert.equal(toUptimePercent(0.5, 50), 50)
  assert.equal(toUptimePercent(48.96, 48), 48.96)
  // ...but a value already under 1 stays as it is, so 0.5 can really mean half a percent
  assert.equal(toUptimePercent(0.5, 0.6), 0.5)
  assert.equal(toUptimePercent(null, 12), 12)
  assert.equal(toUptimePercent(undefined, null), null)
  assert.equal(toUptimePercent(150, null), 100)
})

test("a device is summarised from its readings, within the period only", () => {
  const report = buildReport([
    {
      _id: "d1",
      long_name: "aq_1",
      uptime: 0.5,
      latitude: 0.3,
      longitude: 32.5,
      data: [
        ...readings(ALL_DAYS, 12),
        { datetime: new Date(2026, 8, 1, 1).toISOString(), record_count: 5, s1_pm2_5: 500, s2_pm2_5: 1 },
      ],
    },
  ])
  const [device] = report.devices
  assert.equal(device.name, "aq_1")
  assert.equal(device.uptime, 50)
  assert.equal(device.band, "moderate")
  assert.equal(device.errorMargin, 2)
  assert.equal(device.records, 14 * 12 * 2)
  assert.ok(Math.abs(device.correlation - 1) < 1e-9)
  assert.equal(report.days.length, 14)
  assert.equal(report.days[0].uptime, 50)
  assert.equal(report.summary.mappedCount, 1)
})

test("devices with no data count against the average but aren't called critical", () => {
  const report = buildReport([
    { _id: "d1", name: "good", uptime: 1, data: readings(ALL_DAYS, 24) },
    { _id: "d2", name: "silent", uptime: 0, data: [] },
  ])
  assert.equal(report.summary.averageUptime, 50)
  assert.equal(report.summary.reportingCount, 1)
  assert.equal(report.bandCounts["no-data"], 1)
  assert.equal(report.devices[0].name, "silent")
  assert.match(text(report.narrative.findings), /1 device sent no data in this period: silent/)
  assert.match(text(report.narrative.recommendations), /Check power and connectivity/)
})

test("the same device in two clusters is counted once, under both names", () => {
  const device = { _id: "d1", name: "aq_1", uptime: 1, data: readings([0], 2) }
  const report = buildReport([], {
    entities: [
      { name: "a", devices: [device] },
      { name: "b", devices: [device] },
    ],
    itemNames: ["a", "b"],
  })
  assert.equal(report.devices.length, 1)
  assert.deepEqual(report.devices[0].groups, ["a", "b"])
  assert.equal(report.showGroups, true)
})

test("the uptime change compares the last 7 full days with the 7 before", () => {
  const report = buildReport([
    {
      _id: "d1",
      name: "aq_1",
      uptime: 0.75,
      data: [...readings(ALL_DAYS.slice(0, 7), 12), ...readings(ALL_DAYS.slice(7), 24)],
    },
  ])
  assert.equal(report.summary.uptimeChange, 50)
  assert.equal(report.summary.changeLabel, "the last 7 days and the 7 days before")
  assert.match(text(report.narrative.findings), /rose by 50\.0 percentage points/)
})

test("a flat week reads as unchanged, never as a 0.00% increase", () => {
  const report = buildReport([{ _id: "d1", name: "aq_1", uptime: 1, data: readings(ALL_DAYS, 24) }])
  assert.equal(report.summary.uptimeChange, 0)
  const findings = text(report.narrative.findings)
  assert.match(findings, /broadly unchanged/)
  assert.doesNotMatch(findings, /increase/)
})

test("today only counts the hours so far", () => {
  const generatedAt = new Date(2026, 10, 8, 9, 30)
  const report = buildReport([{ _id: "d1", name: "aq_1", data: readings([13], 10) }], { generatedAt })
  const today = report.days[report.days.length - 1]
  assert.equal(today.expectedHours, 10)
  assert.equal(today.uptime, 100)
  assert.equal(report.hasPartialDay, true)
})

test("an empty selection still produces a sensible report", () => {
  const report = buildReport([])
  assert.equal(report.summary.deviceCount, 0)
  assert.equal(report.summary.band, "no-data")
  assert.match(text(report.narrative.conclusion), /can't be assessed/)
  assert.ok(report.narrative.recommendations.length > 0)
  assert.equal(buildSensorHealthChart(report), null)
})

test("recommendations follow what the data shows", () => {
  const healthy = buildReport([{ _id: "d1", name: "aq_1", uptime: 1, data: readings(ALL_DAYS, 24) }])
  assert.match(text(healthy.narrative.recommendations), /No urgent action/)

  const noisy = buildReport([
    { _id: "d1", name: "aq_1", uptime: 1, data: readings(ALL_DAYS, 24, [10, 30]) },
  ])
  assert.match(text(noisy.narrative.recommendations), /Inspect or replace the PM sensors/)
})

test("titles, labels and filenames describe the selection", () => {
  const device = { _id: "d1", name: "aq_1", uptime: 1, data: readings([0], 1) }
  const one = buildReport([device])
  assert.equal(one.title, "Device health report for kampala: Oct 26, 2026 - Nov 8, 2026")
  assert.equal(one.filename, "device-health-report-kampala-2026-11-09.pdf")
  assert.equal(one.subtitle, "Green City · 1 device")

  const many = buildReport([device], { itemNames: ["a", "b", "c", "d"] })
  assert.match(many.title, /for 4 clusters:/)
  assert.equal(many.filename, "device-health-report-4-clusters-2026-11-09.pdf")

  assert.match(buildReport([device], { organisation: "airqo" }).subtitle, /^AirQo /)
})

test("charts stay inside their bounds", () => {
  const report = buildReport([
    { _id: "d1", name: "aq_1", uptime: 0.3, data: readings(ALL_DAYS, 7) },
    { _id: "d2", name: "aq_2", uptime: 1, data: readings(ALL_DAYS, 24, [10, 18]) },
  ])
  const charts = [
    buildStatusGauge(report),
    buildDailyUptimeChart(report),
    buildDeviceHeatmap(report),
    buildSensorHealthChart(report),
    ...buildCalendarCharts(report),
  ]
  for (const chart of charts) {
    for (const shape of chart.shapes) {
      if (shape.kind === "rect") {
        assert.ok(shape.x >= -0.01 && shape.x + shape.w <= chart.width + 0.01, JSON.stringify(shape))
        assert.ok(shape.y >= -0.01 && shape.y + shape.h <= chart.height + 0.01, JSON.stringify(shape))
      }
    }
  }
  assert.equal(niceMax(0), 1)
  assert.equal(niceMax(9.2), 10)
  assert.equal(niceMax(1200), 2000)
})

test("a period across two months draws both in one calendar row", () => {
  const report = buildReport([{ _id: "d1", name: "aq_1", data: readings(ALL_DAYS, 1) }])
  assert.equal(buildCalendarCharts(report).length, 1)
  const titles = buildCalendarCharts(report)[0].shapes.filter((shape) => shape.kind === "text" && shape.size === 11)
  assert.deepEqual(titles.map((shape) => shape.text), ["October 2026", "November 2026"])
})

test("the PDF holds real text and leaves out sections that were switched off", () => {
  const report = buildReport([
    { _id: "d1", name: "aq_1", uptime: 0.3, latitude: 0.3, longitude: 32.5, data: readings(ALL_DAYS, 7) },
    { _id: "d2", name: "aq_2", uptime: 1, data: readings(ALL_DAYS, 24, [10, 18]) },
  ])
  const all = { map: true, dailyUptime: true, patterns: true, dataReceived: true, sensorHealth: true }
  const pdf = buildDeviceReportPdf(report, all).output()
  assert.ok(pdf.startsWith("%PDF"))

  const pagesOf = (sections) => buildDeviceReportPdf(report, sections).getNumberOfPages()
  const none = { map: false, dailyUptime: false, patterns: false, dataReceived: false, sensorHealth: false }
  assert.ok(pagesOf(all) > pagesOf(none))
})
