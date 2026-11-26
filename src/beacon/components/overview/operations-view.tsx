"use client"

import { format, parseISO } from "date-fns"
import { AqCheckCircle } from "@airqo/icons-react"
import {
  HEALTH_LABELS,
  healthFor,
  type DailyOnline,
  type DayOverDay,
  type DeviceStatusKey,
  type OverviewView,
  type PeriodSummary,
  type RankedFleet,
  type StatusCounts,
} from "@/lib/network-overview"
import type { NetworkStatusAlert } from "@/services/network-status.service"
import { HealthBadge, OnlineTrendChart, OverviewCard, StatusTiles } from "./overview-parts"

interface ChangeItem {
  key: string
  title: string
  detail: string
  action?: { label: string; onClick: () => void }
}

const signed = (value: number, digits = 0) => `${value > 0 ? "+" : value < 0 ? "−" : "±"}${Math.abs(value).toFixed(digits)}`

export function OperationsView({
  counts,
  dayOverDay,
  fleets,
  recentIncidents,
  days,
  period,
  warningAt,
  onOpenStatus,
  onOpenView,
}: {
  counts: StatusCounts
  dayOverDay: DayOverDay | null
  /** Manufacturers ranked worst first; empty when the page is already filtered to one fleet. */
  fleets: RankedFleet[]
  recentIncidents: NetworkStatusAlert[]
  days: DailyOnline[]
  period: PeriodSummary
  warningAt: number
  onOpenStatus: (status: DeviceStatusKey) => void
  onOpenView: (view: OverviewView) => void
}) {
  const changes: ChangeItem[] = []
  if (dayOverDay) {
    const { previous, latest, notTransmittingChange, onlineChange } = dayOverDay
    if (notTransmittingChange !== 0) {
      changes.push({
        key: "not-transmitting",
        title: `${signed(notTransmittingChange)} Not Transmitting since yesterday`,
        detail: `${previous.not_transmitting_devices_count.toLocaleString()} at ${format(parseISO(previous.checked_at), "HH:mm")} yesterday, ${latest.not_transmitting_devices_count.toLocaleString()} now`,
        action: notTransmittingChange > 0 ? { label: "See which", onClick: () => onOpenStatus("not_transmitting") } : undefined,
      })
    }
    if (Math.abs(onlineChange) >= 0.5) {
      changes.push({
        key: "online-rate",
        title: `Online rate ${onlineChange > 0 ? "up" : "down"} ${Math.abs(onlineChange).toFixed(1)} points`,
        detail: `${(100 - previous.not_transmitting_percentage).toFixed(1)}% yesterday, ${(100 - latest.not_transmitting_percentage).toFixed(1)}% now`,
      })
    }
  }
  for (const fleet of fleets.filter((f) => f.health !== "OK").slice(0, 3)) {
    changes.push({
      key: `fleet-${fleet.id}`,
      title: `${fleet.name} at ${fleet.averageOnline.toFixed(1)}% online`,
      detail: `${HEALTH_LABELS[fleet.health]} on average over the period · ${fleet.devices.toLocaleString()} devices`,
      action: { label: "Compare fleets", onClick: () => onOpenView("hardware") },
    })
  }

  return (
    <div className="space-y-6">
      <StatusTiles counts={counts} onOpen={onOpenStatus} />

      <div className="grid gap-6 lg:grid-cols-5">
        <OverviewCard
          title="Needs attention"
          description={dayOverDay ? "Compared with the same time yesterday" : "No check from 24 hours ago to compare with"}
          className="lg:col-span-3"
        >
          {changes.length > 0 ? (
            <ul className="divide-y divide-border border-t border-border">
              {changes.map((item) => (
                <li key={item.key} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  {item.action && (
                    <button
                      type="button"
                      onClick={item.action.onClick}
                      className="shrink-0 rounded text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {item.action.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <AqCheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
              Nothing has changed enough to flag.
            </p>
          )}
        </OverviewCard>

        <OverviewCard title="Recent incidents" description="Checks over the warning line, last 48 hours" className="lg:col-span-2">
          {recentIncidents.length > 0 ? (
            <ul className="max-h-80 divide-y divide-border overflow-y-auto border-t border-border">
              {recentIncidents.slice(0, 8).map((check) => {
                const online = check.total_deployed_devices - check.not_transmitting_devices_count
                return (
                  <li key={check._id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{format(parseISO(check.checked_at), "d MMM, HH:mm")}</p>
                      <p className="text-xs text-muted-foreground">
                        {check.not_transmitting_percentage.toFixed(1)}% offline · {online.toLocaleString()} of{" "}
                        {check.total_deployed_devices.toLocaleString()} online
                      </p>
                    </div>
                    <HealthBadge health={check.status ?? healthFor(check.not_transmitting_percentage, warningAt)} />
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <AqCheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
              No checks over the warning line in the last 48 hours.
            </p>
          )}
        </OverviewCard>
      </div>

      <OverviewCard
        title="Online rate by day"
        description={
          period.averageOnline === null
            ? undefined
            : `Average ${period.averageOnline.toFixed(1)}% over ${period.days} days. The daily average reached the warning line on ${period.daysInWarning} of them.`
        }
      >
        <OnlineTrendChart days={days} warningAt={warningAt} />
      </OverviewCard>
    </div>
  )
}
