"use client"

import { useQuery } from "@tanstack/react-query"
import { networkService } from "@/services/network.service"

export const NETWORKS_QUERY_KEY = ["networks"] as const
export const MANUFACTURER_PROFILES_QUERY_KEY = ["networks", "profiles"] as const

/**
 * Sensor manufacturers with their device counts (`GET /networks/`). Counts cover every mirrored
 * device, not only the active group's, so they describe the fleet rather than the current list.
 */
export function useNetworks(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: [...NETWORKS_QUERY_KEY, { includeCounts: true }],
    queryFn: () => networkService.getNetworks({ includeCounts: true }),
    enabled: options.enabled ?? true,
    staleTime: 5 * 60 * 1000,
  })
}

/** Manufacturer diagnostic profiles and their readiness (`GET /networks/profiles`). */
export function useManufacturerProfiles(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: [...MANUFACTURER_PROFILES_QUERY_KEY],
    queryFn: () => networkService.getManufacturerProfiles(),
    enabled: options.enabled ?? true,
    staleTime: 5 * 60 * 1000,
  })
}
