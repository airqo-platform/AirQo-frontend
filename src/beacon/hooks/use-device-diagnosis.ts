"use client"

import { useQuery } from "@tanstack/react-query"
import { diagnosticsService } from "@/services/diagnosticsService"

export const deviceDayQueryKey = (deviceId: string, date: string | null) =>
  ["diagnostics", "device-day", { deviceId, date }] as const

/** One device's full diagnosis for one day; the page and the day dialog share it. */
export function useDeviceDayDiagnosis(deviceId: string, date: string | null) {
  return useQuery({
    queryKey: deviceDayQueryKey(deviceId, date),
    queryFn: () => diagnosticsService.getDeviceDailyDiagnostic(deviceId, date as string),
    enabled: Boolean(deviceId && date),
    staleTime: 5 * 60 * 1000,
  })
}
