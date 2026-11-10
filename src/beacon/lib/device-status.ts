import type { UIDevice } from "@/types/api.types"

/** The counts behind the summary cards on Home and the device lists. */
export interface DeviceCounts {
  total: number
  tracked: number
  deployed: number
  online: number
  offline: number
}

export const percentageOf = (value: number, total: number): number =>
  total > 0 ? Math.round((value / total) * 100) : 0

export const getDeviceLastSeenTimestamp = (device: UIDevice) =>
  device.reading_timestamp || device.last_updated || null

/** Online means seen since the start of the previous day. */
export const isDeviceOnline = (device: UIDevice, now: Date = new Date()): boolean => {
  const lastSeenTimestamp = getDeviceLastSeenTimestamp(device)
  if (!lastSeenTimestamp) return false

  const updatedDate = new Date(lastSeenTimestamp)
  if (Number.isNaN(updatedDate.getTime())) return false

  const cutoffDate = new Date(now)
  cutoffDate.setDate(cutoffDate.getDate() - 1)
  cutoffDate.setHours(0, 0, 0, 0)

  return updatedDate >= cutoffDate
}

/** Personal devices have no server-side summary, so they are counted from the list itself. */
export const countDevices = (devices: UIDevice[], now: Date = new Date()): DeviceCounts => {
  const online = devices.filter((device) => isDeviceOnline(device, now)).length
  return {
    total: devices.length,
    tracked: devices.length,
    deployed: devices.filter((device) => device.status === "deployed").length,
    online,
    offline: devices.length - online,
  }
}
