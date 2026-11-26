"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { AqDownload01, AqMarkerPin01 } from "@airqo/icons-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/navigation"
import { trackEvent } from "@/lib/analytics"
import {
  countByArea,
  devicesToCsv,
  getStatusCategory,
  lastSeenOf,
  locationOf,
  silentFor,
  sortByLongestSilent,
  type DeviceStatusKey,
  type StatusCounts,
  type StatusDevice,
} from "@/lib/network-overview"
import { networkStatusService } from "@/services/network-status.service"
import { OverviewCard, STATUS_SWATCH } from "./overview-parts"

const FIELD_STATUSES: DeviceStatusKey[] = ["not_transmitting", "data_available", "transmitting"]
const PAGE_SIZE = 25

export function FieldView({
  counts,
  status,
  onStatusChange,
  filter,
  scopeName,
  networkName,
}: {
  counts: StatusCounts
  status: DeviceStatusKey
  onStatusChange: (status: DeviceStatusKey) => void
  filter?: { network?: string; cohort_id?: string }
  scopeName: string
  networkName: (network: string) => string
}) {
  const [devices, setDevices] = useState<StatusDevice[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const network = filter?.network
  const cohortId = filter?.cohort_id

  useEffect(() => {
    let current = true
    setLoading(true)
    setError(null)
    setVisible(PAGE_SIZE)
    networkStatusService
      .getDevicesByStatus(status, { network, cohort_id: cohortId })
      .then((response) => {
        if (!current) return
        const list = Array.isArray(response?.devices) ? response.devices : []
        setDevices(sortByLongestSilent(list))
        setTotal(typeof response?.meta?.total === "number" ? response.meta.total : list.length)
      })
      .catch((err: unknown) => {
        if (!current) return
        console.error(err)
        setDevices([])
        setTotal(null)
        setError("The device list didn't load. Try Refresh, or open Devices instead.")
      })
      .finally(() => {
        if (current) setLoading(false)
      })
    return () => {
      current = false
    }
  }, [status, network, cohortId])

  const areas = useMemo(() => countByArea(devices), [devices])
  const largestArea = areas[0]?.count ?? 0
  const category = getStatusCategory(status)
  const now = new Date()

  const exportCsv = () => {
    const csv = devicesToCsv(devices, networkName, now)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `beacon-${status.replace(/_/g, "-")}-${format(now, "yyyy-MM-dd")}.csv`
    link.click()
    URL.revokeObjectURL(url)
    trackEvent("overview_devices_exported", { status, count: devices.length })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-4 items-start">
      <OverviewCard
        id="overview-devices"
        title="Devices to visit"
        description={`${category.label}: ${category.description.toLowerCase()}. Longest silent first.`}
        className="lg:col-span-3"
        action={
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={loading || devices.length === 0}>
            <AqDownload01 className="h-4 w-4" aria-hidden="true" />
            Export CSV
          </Button>
        }
      >
        <div role="group" aria-label="Status" className="flex flex-wrap gap-2">
          {FIELD_STATUSES.map((key) => {
            const selected = key === status
            return (
              <button
                key={key}
                type="button"
                aria-pressed={selected}
                onClick={() => onStatusChange(key)}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  selected ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-foreground hover:bg-muted",
                )}
              >
                <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", STATUS_SWATCH[key])} />
                {getStatusCategory(key).label} · {counts[key].toLocaleString()}
              </button>
            )
          })}
        </div>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </p>
        ) : loading ? (
          <div className="space-y-2" aria-busy="true" aria-label="Loading devices">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : devices.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No {category.label} devices in {scopeName} right now.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th scope="col" className="pb-2 pr-3 font-semibold">Device</th>
                    <th scope="col" className="px-3 pb-2 font-semibold">Site</th>
                    <th scope="col" className="px-3 pb-2 font-semibold">Manufacturer</th>
                    <th scope="col" className="px-3 pb-2 font-semibold">Last data</th>
                    <th scope="col" className="pb-2 pl-3 text-right font-semibold whitespace-nowrap">Silent for</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.slice(0, visible).map((device) => {
                    const seen = lastSeenOf(device)
                    const silent = silentFor(seen, now)
                    const longSilent = seen ? now.getTime() - Date.parse(seen) >= 7 * 24 * 60 * 60 * 1000 : true
                    return (
                      <tr key={device._id} className="border-t border-border">
                        <td className="py-3 pr-3">
                          <Link
                            href={`${ROUTES.DEVICES}/${encodeURIComponent(device._id)}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {device.long_name || device.name}
                          </Link>
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">{locationOf(device) || "No site"}</td>
                        <td className="px-3 py-3 text-muted-foreground">{device.network ? networkName(device.network) : "—"}</td>
                        <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                          {seen ? format(new Date(seen), "d MMM, HH:mm") : "Never"}
                        </td>
                        <td
                          className={cn(
                            "py-3 pl-3 text-right font-semibold whitespace-nowrap",
                            longSilent ? "text-red-700 dark:text-red-400" : "text-foreground",
                          )}
                        >
                          {silent ?? "Never seen"}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
              <span>
                Showing {Math.min(visible, devices.length).toLocaleString()} of {(total ?? devices.length).toLocaleString()}
              </span>
              {visible < devices.length && (
                <Button variant="outline" size="sm" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                  Show {Math.min(PAGE_SIZE, devices.length - visible)} more
                </Button>
              )}
            </div>
          </>
        )}
      </OverviewCard>

      <OverviewCard title="Where they are" description={`${category.label}, by district`}>
        {loading ? (
          <div className="space-y-3" aria-hidden="true">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-8 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : areas.length === 0 ? (
          <p className="text-sm text-muted-foreground">No devices to place.</p>
        ) : (
          <ul className="space-y-3">
            {areas.map((area) => (
              <li key={area.area} className="space-y-1">
                <div className="flex justify-between gap-2 text-sm">
                  <span className="truncate text-foreground">{area.area}</span>
                  <span className="font-semibold text-foreground">{area.count.toLocaleString()}</span>
                </div>
                <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full", STATUS_SWATCH[status])}
                    style={{ width: `${largestArea ? (area.count / largestArea) * 100 : 0}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
        <Button asChild className="h-auto min-h-10 w-full whitespace-normal py-2 text-center">
          <Link href={ROUTES.MAINTENANCE}>
            <AqMarkerPin01 className="h-4 w-4 shrink-0" aria-hidden="true" />
            Maintenance map
          </Link>
        </Button>
      </OverviewCard>
    </div>
  )
}
