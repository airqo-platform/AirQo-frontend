/**
 * Hands an analysis from the Clustered Analysis page to its results page.
 *
 * The response stays in memory for the client-side navigation that follows, and sessionStorage
 * gets a copy so a reload of the results page still has it. sessionStorage is limited to about
 * 5 MB per site, which a few large clusters over a long period exceed, so that copy is best
 * effort: when it does not fit, a reload asks for the analysis to be run again.
 */

export type AnalysisHandoffType = "airqlouds" | "devices"

export interface AnalysisHandoff {
  type: AnalysisHandoffType
  dateRange: { from: string; to: string }
  /** The performance response as the service returned it: cohorts or devices, by `type`. */
  data: unknown
}

const STORAGE_KEYS = {
  data: "analysisData",
  dateRange: "analysisDateRange",
  type: "analysisType",
} as const

let latest: AnalysisHandoff | null = null

export function handOffAnalysis(handoff: AnalysisHandoff): void {
  latest = handoff

  try {
    sessionStorage.setItem(STORAGE_KEYS.dateRange, JSON.stringify(handoff.dateRange))
    sessionStorage.setItem(STORAGE_KEYS.type, handoff.type)
    sessionStorage.setItem(STORAGE_KEYS.data, JSON.stringify(handoff.data))
  } catch {
    // Over quota. Drop any earlier analysis so a reload never shows it under this one's dates.
    try {
      sessionStorage.removeItem(STORAGE_KEYS.data)
    } catch {
      // Storage unavailable altogether; the in-memory copy still serves the navigation.
    }
  }
}

/** The latest analysis: the one just run, else the one sessionStorage kept across a reload. */
export function readAnalysisHandoff(): AnalysisHandoff | null {
  if (latest) return latest

  const storedData = sessionStorage.getItem(STORAGE_KEYS.data)
  const storedDateRange = sessionStorage.getItem(STORAGE_KEYS.dateRange)
  if (!storedData || !storedDateRange) return null

  return {
    type: sessionStorage.getItem(STORAGE_KEYS.type) === "devices" ? "devices" : "airqlouds",
    dateRange: JSON.parse(storedDateRange),
    data: JSON.parse(storedData),
  }
}
