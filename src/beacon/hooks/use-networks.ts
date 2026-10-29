"use client"

import { useQuery } from "@tanstack/react-query"
import { networkService } from "@/services/network.service"
import type { NetworkListParams } from "@/types/network.types"

export const NETWORKS_QUERY_KEY = ["networks"] as const
export const MANUFACTURER_PROFILES_QUERY_KEY = ["networks", "profiles"] as const

/**
 * Cache key for one networks listing. The group is part of it so an organisation's scoped list
 * is never served from the fleet-wide cache (or another organisation's).
 */
export const networksQueryKey = (params: NetworkListParams = {}) =>
  [
    ...NETWORKS_QUERY_KEY,
    {
      includeCounts: params.includeCounts !== false,
      group: params.group?.trim() || null,
      onlyWithDevices: Boolean(params.onlyWithDevices),
    },
  ] as const

/**
 * Sensor manufacturers with their device counts (`GET /networks/`). Pass the active
 * organisation's `group` (the value the device list sends) for counts limited to its devices;
 * without it the counts cover the whole fleet.
 */
export function useNetworks(options: NetworkListParams & { enabled?: boolean } = {}) {
  const { enabled, ...params } = options
  return useQuery({
    queryKey: networksQueryKey(params),
    queryFn: () => networkService.getNetworks(params),
    enabled: enabled ?? true,
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
