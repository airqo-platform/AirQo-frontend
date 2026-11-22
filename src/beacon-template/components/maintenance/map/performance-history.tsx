"use client"

import React, { useEffect, useState } from "react"
import { Activity } from "lucide-react"
import { getDevicePerformanceData } from "@/services/device-api.service"
import { useGroup } from "@/lib/group-context"
import { formatCompactNumber } from "@/lib/utils"

interface DailyPoint {
  value: number
  timestamp: string
}

interface DailyHistory {
  uptime: DailyPoint[]
  error: DailyPoint[]
  correlation: DailyPoint[]
}

export interface MiniHistory extends DailyHistory {
  loaded: boolean
  loading: boolean
  failed?: boolean
}

const HISTORY_DAYS = 14
const DAY_MS = 86400000

/**
 * The window the history covers: the last 14 UTC days, today included, as the date keys the
 * readings are bucketed under, and the start of the first day to request readings from.
 */
function historyWindow(now: Date): { start: Date; days: string[] } {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const first = today - (HISTORY_DAYS - 1) * DAY_MS
  const days = Array.from({ length: HISTORY_DAYS }, (_, i) => new Date(first + i * DAY_MS).toISOString().slice(0, 10))
  return { start: new Date(first), days }
}

/**
 * A PM2.5 reading, or null outside the 0–1000 µg/m³ the data pipeline accepts: one corrupt value
 * such as -1.3e24 would swamp a day's error margin and correlation.
 */
const toPm25 = (v: any): number | null => {
  if (v == null) return null
  const n = typeof v === "number" ? v : Number(v)
  return Number.isFinite(n) && n >= 0 && n <= 1000 ? n : null
}

const pearson = (xs: number[], ys: number[]): number | null => {
  const n = xs.length
  if (n < 2) return null
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n
  let num = 0,
    dx = 0,
    dy = 0
  for (let i = 0; i < n; i++) {
    const ex = xs[i] - mx
    const ey = ys[i] - my
    num += ex * ey
    dx += ex * ex
    dy += ey * ey
  }
  const den = Math.sqrt(dx * dy)
  return den === 0 ? null : num / den
}

/** One device's daily uptime, mean |sensor 1 − sensor 2| and sensor correlation. */
function computeMiniHistory(rawPoints: any[]): DailyHistory {
  const buckets: Record<string, { hours: Set<number>; errs: number[]; s1: number[]; s2: number[] }> = {}
  for (const p of rawPoints) {
    if (!p?.datetime) continue
    const dt = new Date(p.datetime)
    if (isNaN(dt.getTime())) continue
    const dayKey = dt.toISOString().slice(0, 10)
    if (!buckets[dayKey]) buckets[dayKey] = { hours: new Set(), errs: [], s1: [], s2: [] }
    buckets[dayKey].hours.add(dt.getUTCHours())
    const s1 = toPm25(p.s1_pm2_5 ?? p["pm2.5 sensor1"])
    const s2 = toPm25(p.s2_pm2_5 ?? p["pm2.5 sensor2"])
    if (s1 != null && s2 != null) {
      buckets[dayKey].errs.push(Math.abs(s1 - s2))
      buckets[dayKey].s1.push(s1)
      buckets[dayKey].s2.push(s2)
    }
  }
  const days = Object.keys(buckets).sort()
  const uptime: DailyPoint[] = []
  const error: DailyPoint[] = []
  const correlation: DailyPoint[] = []
  for (const d of days) {
    const b = buckets[d]
    const ts = `${d}T00:00:00.000Z`
    uptime.push({ timestamp: ts, value: (b.hours.size / 24) * 100 })
    if (b.errs.length > 0) error.push({ timestamp: ts, value: b.errs.reduce((a, c) => a + c, 0) / b.errs.length })
    const r = pearson(b.s1, b.s2)
    if (r != null) correlation.push({ timestamp: ts, value: r })
  }
  return { uptime, error, correlation }
}

/**
 * Several devices' histories as one, as the Sites table summarises a site, over the window's
 * `days`: each day's uptime averages every device, a device without data that day counting as
 * 0%, so a day none of them reported is 0% rather than missing; error margin and correlation
 * average the devices that have a value that day. One device's history is its own.
 */
function combineHistories(histories: DailyHistory[], deviceCount: number, dayKeys: string[]): DailyHistory {
  const byDay = (points: DailyPoint[]) => new Map(points.map((p) => [p.timestamp, p.value]))
  const uptimes = histories.map((h) => byDay(h.uptime))
  const errors = histories.map((h) => byDay(h.error))
  const correlations = histories.map((h) => byDay(h.correlation))
  const days = dayKeys.map((d) => `${d}T00:00:00.000Z`)

  const meanOfPresent = (maps: Map<string, number>[]) =>
    days.flatMap((ts) => {
      const values = maps.map((m) => m.get(ts)).filter((v): v is number => v !== undefined)
      return values.length > 0 ? [{ timestamp: ts, value: values.reduce((a, b) => a + b, 0) / values.length }] : []
    })

  return {
    uptime: days.map((ts) => ({
      timestamp: ts,
      value: uptimes.reduce((sum, m) => sum + (m.get(ts) ?? 0), 0) / Math.max(1, deviceCount),
    })),
    error: meanOfPresent(errors),
    correlation: meanOfPresent(correlations),
  }
}

/** The last 14 days of one device, or of a site's devices combined. */
export function usePerformanceHistory(deviceNames: string[]): MiniHistory {
  const { activeGroup, loading: groupLoading } = useGroup()
  const [history, setHistory] = useState<MiniHistory>({
    uptime: [],
    error: [],
    correlation: [],
    loaded: false,
    loading: true,
  })
  const namesKey = deviceNames.filter(Boolean).join(",")

  useEffect(() => {
    let cancelled = false
    const names = namesKey ? namesKey.split(",") : []

    const loadHistory = async () => {
      // Nothing to ask for, such as a site with no named devices
      if (names.length === 0) {
        setHistory({ uptime: [], error: [], correlation: [], loaded: true, loading: false })
        return
      }
      if (groupLoading || !activeGroup) return
      setHistory((prev) => ({ ...prev, loading: true }))

      try {
        const end = new Date()
        const { start, days } = historyWindow(end)
        const resp = await getDevicePerformanceData({
          start: start.toISOString(),
          end: end.toISOString(),
          deviceNames: names,
          group: activeGroup,
        })
        if (cancelled) return

        const arr: any[] = Array.isArray(resp) ? resp : []
        const perDevice = arr.map((dev) =>
          computeMiniHistory(
            Array.isArray(dev?.raw_data) && dev.raw_data.length > 0
              ? dev.raw_data
              : Array.isArray(dev?.data)
              ? dev.data
              : []
          )
        )
        setHistory({ ...combineHistories(perDevice, names.length, days), loaded: true, loading: false })
      } catch {
        if (!cancelled) {
          setHistory({ uptime: [], error: [], correlation: [], loaded: false, loading: false, failed: true })
        }
      }
    }

    loadHistory()
    return () => {
      cancelled = true
    }
  }, [namesKey, activeGroup, groupLoading])

  return history
}

const renderBars = (
  points: DailyPoint[],
  opts: {
    label: string
    avgFormat: (v: number) => string
    format: (v: number) => string
    barColor: (v: number) => string
    normalize: (v: number, all: number[]) => number
  }
) => {
  if (points.length === 0) {
    return <div className="text-[10px] text-gray-400">No {opts.label.toLowerCase()} data</div>
  }
  const values = points.slice(-HISTORY_DAYS)
  const avg = values.reduce((a, b) => a + b.value, 0) / values.length
  const all = values.map((v) => v.value)

  return (
    <div className="bg-gray-50 dark:bg-gray-800/60 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">{opts.label}</span>
        <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200">{opts.avgFormat(avg)} avg</span>
      </div>
      <div className="flex items-end gap-[3px] h-8 pt-1">
        {values.map((v, i) => {
          const ratio = Math.max(0.08, Math.min(1, opts.normalize(v.value, all)))
          const h = Math.max(4, Math.round(ratio * 26))
          const date = new Date(v.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          return (
            <div
              key={i}
              title={`${date}: ${opts.format(v.value)}`}
              style={{ height: `${h}px` }}
              className={`flex-1 rounded-t-xs transition-all hover:opacity-80 ${opts.barColor(v.value)}`}
            />
          )
        })}
      </div>
    </div>
  )
}

/** The 14-day uptime, sensor drift and correlation bars of a map item's details panel. */
export const PerformanceHistory: React.FC<{ history: MiniHistory; subject: string; note?: string }> = ({
  history,
  subject,
  note,
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
        <Activity className="w-3.5 h-3.5 text-blue-600" />
        {HISTORY_DAYS}-Day Performance History
      </span>
    </div>
    {note && <p className="text-[10px] text-gray-400">{note}</p>}

    {history.loading ? (
      <div className="space-y-2">
        <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      </div>
    ) : history.failed ? (
      <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs text-center">
        Unable to load historical trends for this {subject}.
      </div>
    ) : (
      <div className="space-y-2">
        {renderBars(history.uptime, {
          label: "Uptime History",
          avgFormat: (v) => `${v.toFixed(0)}%`,
          format: (v) => `${v.toFixed(1)}%`,
          barColor: (v) => (v >= 80 ? "bg-emerald-500" : v >= 50 ? "bg-amber-500" : "bg-red-500"),
          normalize: (v) => v / 100,
        })}
        {renderBars(history.error, {
          label: "Sensor Error Drift",
          avgFormat: (v) => `±${formatCompactNumber(v, 1)}`,
          format: (v) => `±${formatCompactNumber(v, 2)} µg/m³`,
          barColor: (v) => (v <= 5 ? "bg-emerald-500" : v <= 15 ? "bg-amber-500" : "bg-red-500"),
          normalize: (v, all) => v / Math.max(10, ...all),
        })}
        {renderBars(history.correlation, {
          label: "Dual Sensor Correlation (r)",
          avgFormat: (v) => v.toFixed(2),
          format: (v) => v.toFixed(3),
          barColor: (v) => (v >= 0.9 ? "bg-emerald-500" : v >= 0.75 ? "bg-amber-500" : "bg-red-500"),
          normalize: (v) => Math.max(0, v),
        })}
      </div>
    )}
  </div>
)
