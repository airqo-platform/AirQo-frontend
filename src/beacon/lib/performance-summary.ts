import type { PerformanceDay } from "@/services/airqloud.service"

type DailyMetric = "uptime" | "error_margin" | "correlation"

const historyOf = (daily: PerformanceDay[], metric: DailyMetric) =>
  daily.flatMap((day) => {
    const value = day[metric]
    return value === null || value === undefined ? [] : [{ value, timestamp: day.date }]
  })

/**
 * A table row's figures from the per-day summary lists return with `includeSeries=false`.
 * Error margin and correlation only have history for the days that produced a value.
 */
export function summarizeDailyPerformance(
  daily: PerformanceDay[],
  errorMargin: number | null,
  correlation: number | null,
) {
  const uptimeHistory = historyOf(daily, "uptime")

  return {
    averageUptime:
      uptimeHistory.length === 0
        ? null
        : uptimeHistory.reduce((total, day) => total + day.value, 0) / uptimeHistory.length,
    averageErrorMargin: errorMargin,
    averageCorrelation: correlation,
    uptimeHistory,
    errorMarginHistory: historyOf(daily, "error_margin"),
    correlationHistory: historyOf(daily, "correlation"),
  }
}
