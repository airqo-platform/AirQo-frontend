"use client"

import { useEffect, useState } from "react"
import { AqLineChartUp01, AqMarkerPin01, AqScales01, AqSignal01 } from "@airqo/icons-react"
import { SummaryCard, type CardVariant } from "@/components/dashboard/summary-card"
import { airQloudService, type SitesPerformanceSummary } from "@/services/airqloud.service"
import { getPerformanceWindow } from "@/app/dashboard/analytics/airqlouds-table"
import { useGroup } from "@/lib/group-context"
import { formatCompactNumber } from "@/lib/utils"

// Same thresholds as the table's mini graphs
const uptimeVariant = (v: number): CardVariant => (v >= 75 ? "emerald" : v >= 50 ? "amber" : "rose")
const errorMarginVariant = (v: number): CardVariant => (v <= 3 ? "emerald" : v <= 5 ? "amber" : "rose")
const correlationVariant = (v: number): CardVariant => (v >= 0.9 ? "emerald" : v >= 0.75 ? "amber" : "rose")

const countLabel = (count: number) => `${count} device${count === 1 ? "" : "s"}`

/** Uptime, error margin and correlation of all the devices at the organisation's sites. */
export function SitesSummaryCards({ performanceDays }: Readonly<{ performanceDays: number }>) {
  const { activeGroup, loading: groupLoading } = useGroup()
  const [summary, setSummary] = useState<SitesPerformanceSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (groupLoading || !activeGroup) return
    let cancelled = false
    const { startDate, endDate } = getPerformanceWindow(performanceDays)

    setIsLoading(true)
    setHasError(false)
    airQloudService
      .getSitesPerformanceSummary({
        group: activeGroup,
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
      })
      .then((data) => {
        if (!cancelled) setSummary(data)
      })
      .catch(() => {
        if (cancelled) return
        setSummary(null)
        setHasError(true)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [activeGroup, groupLoading, performanceDays])

  const unavailable = hasError ? "—" : "N/A"
  const uptime = summary?.uptime ?? null
  const errorMargin = summary?.error_margin ?? null
  const correlation = summary?.correlation ?? null

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Sites"
          value={summary?.total_sites ?? unavailable}
          icon={AqMarkerPin01}
          iconVariant="primary"
          secondaryLabel="Devices at these sites"
          secondaryValue={summary?.total_devices ?? unavailable}
          isLoading={isLoading}
        />
        <SummaryCard
          title="Uptime"
          value={uptime === null ? unavailable : `${uptime.toFixed(1)}%`}
          icon={AqSignal01}
          iconVariant={uptime === null ? "slate" : uptimeVariant(uptime)}
          secondaryLabel="Average across"
          secondaryValue={summary ? countLabel(summary.total_devices) : unavailable}
          progressPercentage={uptime ?? 0}
          isLoading={isLoading}
        />
        <SummaryCard
          title="Error Margin"
          value={errorMargin === null ? unavailable : `±${formatCompactNumber(errorMargin, 1)} µg/m³`}
          icon={AqScales01}
          iconVariant={errorMargin === null ? "slate" : errorMarginVariant(errorMargin)}
          secondaryLabel="PM2.5 sensor 1 vs 2, across"
          secondaryValue={summary ? countLabel(summary.error_margin_devices) : unavailable}
          isLoading={isLoading}
        />
        <SummaryCard
          title="Correlation"
          value={correlation === null ? unavailable : correlation.toFixed(2)}
          icon={AqLineChartUp01}
          iconVariant={correlation === null ? "slate" : correlationVariant(correlation)}
          secondaryLabel="PM2.5 sensor 1 vs 2, across"
          secondaryValue={summary ? countLabel(summary.correlation_devices) : unavailable}
          progressPercentage={Math.max(0, correlation ?? 0) * 100}
          isLoading={isLoading}
        />
      </div>
      {hasError && (
        <p className="text-sm text-destructive">Couldn&apos;t load the site summary. Try refreshing the page.</p>
      )}
    </div>
  )
}
