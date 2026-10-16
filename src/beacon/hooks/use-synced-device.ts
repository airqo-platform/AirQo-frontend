"use client"

import { useEffect, useState } from "react"
import { deviceApiService } from "@/services/device-api.service"
import { useGroup } from "@/lib/group-context"
import type { DeviceDiagnostics } from "@/types/diagnostics"

export interface SyncedDeviceRecord {
  id: string
  name: string | null
  /** Picks the device's profile; a device without one counts as lowcost */
  category: string
  /** ThingSpeak channel the raw readings are stored under */
  channelId: string | number | null
  /** Latest raw reading, keyed field1..field20 */
  latest: { timestamp: string | null; values: Record<string, unknown> } | null
  /** Latest stored daily diagnosis from the last 7 days; only requested with `includeDiagnostics` */
  diagnostics: DeviceDiagnostics | null
}

const toRecord = (raw: any): SyncedDeviceRecord => ({
  id: raw._id ?? raw.device_id,
  name: raw.name ?? raw.device_name ?? null,
  category: raw.category || "lowcost",
  channelId: raw.device_number ?? raw.last_reading?.channel_id ?? null,
  latest: raw.last_reading ? { timestamp: raw.last_reading.timestamp ?? null, values: raw.last_reading.values || {} } : null,
  diagnostics: raw.diagnostics ?? null,
})

/**
 * One device's record from beacon-api's local sync table (`/devices/synced`), scoped to the
 * active group. `device` is null while loading, or when the group has no such device.
 */
export function useSyncedDevice(deviceId: string | null | undefined, options: { includeDiagnostics?: boolean } = {}) {
  const { activeGroup } = useGroup()
  const includeDiagnostics = Boolean(options.includeDiagnostics)
  const [state, setState] = useState<{ device: SyncedDeviceRecord | null; loading: boolean }>({ device: null, loading: true })

  useEffect(() => {
    if (!activeGroup || !deviceId) return
    let cancelled = false
    setState({ device: null, loading: true })
    deviceApiService
      .getDevicesPaginated({ group: activeGroup, search: deviceId, limit: 5, includeDiagnostics: includeDiagnostics || undefined })
      .then((response) => {
        // Search also matches names and sites, so pick the exact device
        const match = (response.devices || []).find((d: any) => (d._id ?? d.device_id) === deviceId)
        if (!cancelled) setState({ device: match ? toRecord(match) : null, loading: false })
      })
      .catch(() => !cancelled && setState({ device: null, loading: false }))
    return () => {
      cancelled = true
    }
  }, [deviceId, activeGroup, includeDiagnostics])

  return state
}
