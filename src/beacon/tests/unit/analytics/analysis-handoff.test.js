import test from "node:test"
import assert from "node:assert/strict"
import "../test-env.mjs"

import { clearAnalysisHandoff, handOffAnalysis, readAnalysisHandoff } from "@/lib/analysis-handoff"
import authService from "@/services/api-service"

// The auth cleanup also expires cookies
if (globalThis.document === undefined) globalThis.document = { cookie: "" }

const sample = (name, type = "airqlouds") => ({
  type,
  dateRange: { from: "2026-11-10T21:00:00.000Z", to: "2026-11-24T20:59:59.999Z" },
  data: [{ id: "c1", name, devices: [] }],
})

test.beforeEach(() => {
  clearAnalysisHandoff()
})

test("hands the analysis to the results page and keeps a sessionStorage copy for reloads", () => {
  const analysis = sample("riverside")
  handOffAnalysis(analysis)

  assert.equal(readAnalysisHandoff(), analysis)
  assert.equal(sessionStorage.getItem("analysisType"), "airqlouds")
  assert.deepEqual(JSON.parse(sessionStorage.getItem("analysisDateRange")), analysis.dateRange)
  assert.deepEqual(JSON.parse(sessionStorage.getItem("analysisData")), analysis.data)
})

test("reads the sessionStorage copy when nothing is in memory, as after a reload", () => {
  const analysis = sample("lakeshore", "devices")
  sessionStorage.setItem("analysisType", "devices")
  sessionStorage.setItem("analysisDateRange", JSON.stringify(analysis.dateRange))
  sessionStorage.setItem("analysisData", JSON.stringify(analysis.data))

  assert.deepEqual(readAnalysisHandoff(), analysis)
})

test("still serves the analysis from memory when sessionStorage is over quota", () => {
  sessionStorage.setItem("analysisData", JSON.stringify([{ id: "old", name: "older analysis" }]))
  const analysis = sample("hillcrest")
  const setItem = sessionStorage.setItem
  sessionStorage.setItem = (key, value) => {
    if (key === "analysisData") {
      throw new DOMException("Setting the value of 'analysisData' exceeded the quota.", "QuotaExceededError")
    }
    setItem.call(sessionStorage, key, value)
  }
  try {
    handOffAnalysis(analysis)
  } finally {
    sessionStorage.setItem = setItem
  }

  assert.equal(readAnalysisHandoff(), analysis)
  // A reload must not fall back to the older analysis under this one's dates
  assert.equal(sessionStorage.getItem("analysisData"), null)
  assert.equal(sessionStorage.getItem("analysisType"), "airqlouds")
})

test("clearing forgets the analysis in memory and in sessionStorage", () => {
  handOffAnalysis(sample("riverside"))
  clearAnalysisHandoff()

  assert.equal(readAnalysisHandoff(), null)
  assert.equal(sessionStorage.getItem("analysisData"), null)
  assert.equal(sessionStorage.getItem("analysisDateRange"), null)
  assert.equal(sessionStorage.getItem("analysisType"), null)
})

test("the auth cleanup forgets it too, so the next sign-in on this tab cannot open it", () => {
  handOffAnalysis(sample("riverside"))
  authService.clearAllAuthData()

  assert.equal(readAnalysisHandoff(), null)
  assert.equal(sessionStorage.getItem("analysisData"), null)
})
