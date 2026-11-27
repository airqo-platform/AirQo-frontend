"use client"

import { cn } from "@/lib/utils"
import type { NetworkHealth, RankedFleet } from "@/lib/network-overview"
import type { HourlyTrend } from "@/services/network-status.service"
import { HealthBadge, HourlyChart, OverviewCard } from "./overview-parts"

export type FleetKind = "network" | "cohort"

const BAR: Record<NetworkHealth, string> = {
  OK: "bg-green-500",
  WARNING: "bg-orange-500",
  CRITICAL: "bg-red-500",
}

export function HardwareView({
  kind,
  onKindChange,
  fleets,
  trends,
  warningAt,
  onFocus,
}: {
  kind: FleetKind
  onKindChange: (kind: FleetKind) => void
  fleets: RankedFleet[]
  trends: HourlyTrend[]
  warningAt: number
  onFocus: (kind: FleetKind, id: string) => void
}) {
  const noun = kind === "network" ? "Manufacturer" : "Cohort"
  return (
    <div className="space-y-6">
      <OverviewCard
        title="Fleet comparison"
        description="Average online rate over the period, worst first"
        action={
          <div role="group" aria-label="Compare by" className="flex gap-1 rounded-md bg-muted p-1">
            {(["network", "cohort"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={kind === option}
                onClick={() => onKindChange(option)}
                className={cn(
                  "h-8 rounded px-3 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  kind === option ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option === "network" ? "Manufacturers" : "Cohorts"}
              </button>
            ))}
          </div>
        }
      >
        {fleets.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No {noun.toLowerCase()} figures for this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th scope="col" className="pb-2 pr-3 font-semibold">{noun}</th>
                  <th scope="col" className="px-3 pb-2 text-right font-semibold">Devices</th>
                  <th scope="col" className="w-[34%] px-3 pb-2 font-semibold">Online rate</th>
                  <th scope="col" className="px-3 pb-2 font-semibold">Daily range</th>
                  <th scope="col" className="px-3 pb-2 font-semibold">Status</th>
                  <th scope="col" className="pb-2 pl-3">
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {fleets.map((fleet) => (
                  <tr key={fleet.id} className="border-t border-border">
                    <td className="py-3 pr-3 font-semibold text-foreground">{fleet.name}</td>
                    <td className="px-3 py-3 text-right text-foreground">{fleet.devices.toLocaleString()}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div aria-hidden="true" className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className={cn("h-full", BAR[fleet.health])} style={{ width: `${Math.max(0, fleet.averageOnline)}%` }} />
                        </div>
                        <span className="w-14 text-right font-semibold text-foreground">{fleet.averageOnline.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                      {fleet.lowestOnline.toFixed(0)}–{fleet.highestOnline.toFixed(0)}%
                    </td>
                    <td className="px-3 py-3">
                      <HealthBadge health={fleet.health} />
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <button
                        type="button"
                        onClick={() => onFocus(kind, fleet.id)}
                        className="rounded text-sm font-medium text-primary hover:underline whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Filter to this {noun.toLowerCase()}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </OverviewCard>

      <OverviewCard
        title="Online rate by hour of day"
        description="Average over the period for the current filter, by the hour (UTC) of each check. Filter to one manufacturer to see whether it drives a dip."
      >
        <HourlyChart trends={trends} warningAt={warningAt} />
      </OverviewCard>
    </div>
  )
}
