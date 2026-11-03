"use client"

import { useQuery } from "@tanstack/react-query"
import { diagnosticsService } from "@/services/diagnosticsService"

export const DEVICE_DAY_QUERY_PREFIX = ["diagnostics", "device-day"] as const

export const deviceDayQueryKey = (deviceId: string, date: string | null) =>
  [...DEVICE_DAY_QUERY_PREFIX, { deviceId, date }] as const

/**
 * One device's full diagnosis for one day; the page and the day dialog share it. A daily run can
 * replace a day, so the panel invalidates this device's days whenever it reloads its summaries.
 */
export function useDeviceDayDiagnosis(deviceId: string, date: string | null) {
  return useQuery({
    queryKey: deviceDayQueryKey(deviceId, date),
    queryFn: () => diagnosticsService.getDeviceDailyDiagnostic(deviceId, date as string),
    enabled: Boolean(deviceId && date),
  })
}
