/**
 * Helpers for one device's diagnosis history: the day columns of the health grid, per-day issue
 * presence, how long the likely cause has held, and the hour-by-hour shape of a single day.
 * Diagnosis days are UTC calendar days written `YYYY-MM-DD`.
 */
import type {
  DeviceDailyDiagnosticSummary,
  DiagnosisResult,
  IssueSeverity,
  OutageWindow,
} from "@/types/diagnostics"

/** Every day from `start` to `end`, both included. */
export function dayRange(start: string, end: string): string[] {
  const days: string[] = []
  const [y, m, d] = start.split("-").map(Number)
  for (let i = 0; i < 400; i++) {
    const day = new Date(Date.UTC(y, m - 1, d + i)).toISOString().slice(0, 10)
    if (day > end) break
    days.push(day)
  }
  return days
}

/** "device_battery" → "Device battery". */
export function humanizeComponent(name: string): string {
  const words = name.replace(/[_-]+/g, " ").trim()
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : name
}

/** "pm2_5_sensor1" → "PM2.5 sensor 1", "battery_voltage" → "Battery voltage". */
export function humanizeMetric(metric: string): string {
  const words = metric
    .replace(/pm2_5/gi, "PM2.5")
    .replace(/pm10/gi, "PM10")
    .replace(/_?sensor_?(\d+)/gi, " sensor $1")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/**
 * A cause as people say it: "device_battery (battery) fault" → "Battery fault". Titles in any
 * other shape are kept as they are.
 */
export function causeTitle(diagnosis: Pick<DiagnosisResult, "title">): string {
  const match = /^\S+ \(([^)]+)\) (.+)$/.exec(diagnosis.title.trim())
  if (!match) return diagnosis.title
  const [, type, what] = match
  return `${type.charAt(0).toUpperCase()}${type.slice(1)} ${what}`
}

/**
 * A recommended action with component ids named by their type: "Inspect device_battery (battery):
 * …" → "Inspect the battery: …".
 */
export function humanizeAction(action: string): string {
  return action.replace(/\b[\w.]+ \(([\w ]+)\)/g, "the $1")
}

export type ScoreBand = "good" | "fair" | "poor" | "bad"

export const scoreBand = (score: number): ScoreBand =>
  score >= 85 ? "good" : score >= 70 ? "fair" : score >= 50 ? "poor" : "bad"

export interface ComponentRow {
  key: string
  label: string
  /** Component names in this row; more than one only for the merged "always 100" row. */
  components: string[]
  scores: Record<string, number>
  latest: number | null
}

/**
 * One grid row per scored component, weakest on the latest day first. Components that scored
 * 100 on every diagnosed day share a single row, since they have nothing to show apart.
 */
export function componentRows(daily: DeviceDailyDiagnosticSummary[]): ComponentRow[] {
  const latestDay = [...daily].sort((a, b) => b.diagnosis_date.localeCompare(a.diagnosis_date))[0]
  const names = new Set<string>()
  for (const day of daily) Object.keys(day.subsystem_scores || {}).forEach((name) => names.add(name))

  const rows: ComponentRow[] = []
  const perfect: string[] = []
  for (const name of names) {
    const scores: Record<string, number> = {}
    for (const day of daily) {
      const score = day.subsystem_scores?.[name]
      if (typeof score === "number") scores[day.diagnosis_date] = score
    }
    if (Object.values(scores).every((score) => score >= 100)) {
      perfect.push(name)
      continue
    }
    rows.push({
      key: name,
      label: humanizeComponent(name),
      components: [name],
      scores,
      latest: latestDay?.subsystem_scores?.[name] ?? null,
    })
  }
  rows.sort((a, b) => (a.latest ?? 101) - (b.latest ?? 101) || a.label.localeCompare(b.label))

  if (perfect.length > 0) {
    perfect.sort()
    const scores: Record<string, number> = {}
    for (const day of daily) if (perfect.some((name) => name in (day.subsystem_scores || {}))) scores[day.diagnosis_date] = 100
    rows.push({
      key: "__perfect__",
      label: perfect.length === 1 ? humanizeComponent(perfect[0]) : `${perfect.length} components at 100`,
      components: perfect,
      scores,
      latest: 100,
    })
  }
  return rows
}

/** For each issue code, the severity it was found with on each day it was found. */
export function issuePresence(daily: DeviceDailyDiagnosticSummary[]): Map<string, Map<string, IssueSeverity>> {
  const presence = new Map<string, Map<string, IssueSeverity>>()
  for (const day of daily) {
    for (const issue of day.issues || []) {
      const days = presence.get(issue.issue_code) ?? new Map<string, IssueSeverity>()
      days.set(day.diagnosis_date, issue.severity)
      presence.set(issue.issue_code, days)
    }
  }
  return presence
}

export interface CausePattern {
  causeCode: string
  /** Diagnosed days whose likely cause was this one. */
  days: number
  diagnosedDays: number
  firstDate: string
}

/** How often the latest day's likely cause was also the likely cause on the other diagnosed days. */
export function latestCausePattern(daily: DeviceDailyDiagnosticSummary[]): CausePattern | null {
  const sorted = [...daily].sort((a, b) => a.diagnosis_date.localeCompare(b.diagnosis_date))
  const causeCode = sorted[sorted.length - 1]?.top_cause_code
  if (!causeCode) return null
  const matching = sorted.filter((day) => day.top_cause_code === causeCode)
  return { causeCode, days: matching.length, diagnosedDays: sorted.length, firstDate: matching[0].diagnosis_date }
}

/** How many of `dates` fall in the `windowDays` days ending on `asOf`. */
export function diagnosedDaysInWindow(dates: string[], asOf: string, windowDays: number): number {
  const [y, m, d] = asOf.split("-").map(Number)
  const start = new Date(Date.UTC(y, m - 1, d - windowDays + 1)).toISOString().slice(0, 10)
  return dates.filter((date) => date >= start && date <= asOf).length
}

/** Where a timestamp falls in its UTC day, from 0 (00:00) to 1 (24:00). */
export function dayFraction(iso: string, day: string): number {
  const time = new Date(iso).getTime()
  const start = Date.parse(`${day}T00:00:00Z`)
  return Math.min(1, Math.max(0, (time - start) / 86_400_000))
}

/** "2026-10-29T01:22:22+00:00" → "01:22". */
export function utcClock(iso?: string | null): string {
  if (!iso) return "—"
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? "—" : date.toISOString().slice(11, 16)
}

export interface DaySegment {
  kind: "data" | "outage"
  start: number
  end: number
  outage?: OutageWindow
}

/**
 * The day split into stretches with data and outages, as fractions of the day. Data runs from the
 * first to the last reading, minus the outages; before the first and after the last reading is left
 * out (unknown), as is anything outside the day.
 */
export function daySegments(
  day: string,
  firstRecordAt: string | null | undefined,
  lastRecordAt: string | null | undefined,
  outages: OutageWindow[] = []
): DaySegment[] {
  if (!firstRecordAt || !lastRecordAt) return []
  const first = dayFraction(firstRecordAt, day)
  const last = dayFraction(lastRecordAt, day)
  const sorted = [...outages]
    .map((outage) => ({ outage, start: dayFraction(outage.start, day), end: dayFraction(outage.end, day) }))
    .filter((window) => window.end > window.start)
    .sort((a, b) => a.start - b.start)

  const segments: DaySegment[] = []
  let cursor = first
  for (const window of sorted) {
    if (window.start > cursor) segments.push({ kind: "data", start: cursor, end: Math.min(window.start, last) })
    segments.push({ kind: "outage", start: window.start, end: window.end, outage: window.outage })
    cursor = Math.max(cursor, window.end)
  }
  if (last > cursor) segments.push({ kind: "data", start: cursor, end: last })
  return segments.filter((segment) => segment.end > segment.start)
}
