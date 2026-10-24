"use client"

import { useEffect, useState } from "react"
import { deviceApiService } from "@/services/device-api.service"
import { useGroup } from "@/lib/group-context"
import { resolveDeviceDataSource } from "@/lib/manufacturers"
import type { DeviceDiagnostics } from "@/types/diagnostics"
import type { DeviceDataSource } from "@/types/network.types"

export interface SyncedDeviceRecord {
  id: string
  name: string | null
  /** Sensor manufacturer / network (airqo, airgradient, ...) */
  network: string | null
  /** Picks the device's profile; a device without one counts as lowcost */
  category: string
  /** Where beacon reads the device from; `none` means no readings are stored */
  dataSource: DeviceDataSource
  /**
   * Source key the local raw readings are stored under: the ThingSpeak channel for AirQo devices,
   * the device id for other manufacturers read through their API. Null when there is no data path.
   */
  channelId: string | number | null
  /** Latest raw reading, keyed field1..field20 */
  latest: { timestamp: string | null; values: Record<string, unknown> } | null
  /** Latest stored daily diagnosis from the last 7 days; only requested with `includeDiagnostics` */
  diagnostics: DeviceDiagnostics | null
}

const sourceKey = (raw: any, dataSource: DeviceDataSource, id: string): string | number | null => {
  if (raw.last_reading?.channel_id != null) return raw.last_reading.channel_id
  if (dataSource === "thingspeak") return raw.device_number ?? raw.beacon_data?.device_number ?? null
  if (dataSource === "external_api") return id ?? null
  return null
}

const toRecord = (raw: any): SyncedDeviceRecord => {
  const id = raw._id ?? raw.device_id
  const dataSource = resolveDeviceDataSource(raw)
  return {
    id,
    name: raw.name ?? raw.device_name ?? null,
    network: raw.network ?? raw.beacon_data?.network_id ?? null,
    category: raw.category || "lowcost",
    dataSource,
    channelId: sourceKey(raw, dataSource, id),
    latest: raw.last_reading ? { timestamp: raw.last_reading.timestamp ?? null, values: raw.last_reading.values || {} } : null,
    diagnostics: raw.diagnostics ?? null,
  }
}

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
