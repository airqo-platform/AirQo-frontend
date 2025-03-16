import { useQuery } from "@tanstack/react-query"
import { sites } from "../apis/sites"
import { devices } from "../apis/devices"
import { groupsApi } from "@/core/apis/organizations"

/**
 * Custom hook to fetch sites assigned to a specific group
 * This hook tries two approaches:
 * 1. First, it attempts to use the direct API endpoint for getting sites by group
 * 2. If that fails or returns no results, it falls back to fetching all sites and filtering client-side
 */
export const useGroupSites = (groupId: string) => {
  return useQuery({
    queryKey: ["group-sites", groupId],
    queryFn: async () => {
      try {
        // First attempt: Try to use the direct API endpoint
        const response = await sites.getSitesByGroupApi(groupId)

        // If we got sites directly from the API, return them
        if (response.sites && response.sites.length > 0) {
          return {
            sites: response.sites,
            hasSites: response.sites.length > 0,
          }
        }

        // If the direct API returned no sites, fall back to the client-side filtering approach
        const allSitesResponse = await sites.getAllSitesApi()

        // Filter sites that have the groupId in their groups array
        // Check both the ID and the title (some systems might use the title as the identifier)
        const groupSites = allSitesResponse.sites.filter(
          (site) => site.groups && (site.groups.includes(groupId) || site.groups.some((group) => group === groupId)),
        )

        return {
          sites: groupSites,
          hasSites: groupSites.length > 0,
        }
      } catch (error) {
        // If the direct API endpoint failed, fall back to the client-side filtering approach
        const allSitesResponse = await sites.getAllSitesApi()

        // Filter sites that have the groupId in their groups array
        const groupSites = allSitesResponse.sites.filter(
          (site) => site.groups && (site.groups.includes(groupId) || site.groups.some((group) => group === groupId)),
        )

        return {
          sites: groupSites,
          hasSites: groupSites.length > 0,
        }
      }
    },
    // Only run this query if we have a groupId
    enabled: !!groupId,
  })
}

/**
 * Custom hook to fetch devices assigned to a specific group
 * Similar to sites, we try the direct API first, then fall back to client-side filtering
 */
export const useGroupDevices = (groupId: string) => {
  return useQuery({
    queryKey: ["group-devices", groupId],
    queryFn: async () => {
      try {
        // First attempt: Try to use the direct API endpoint
        const response = await devices.getDevicesByGroupApi(groupId)

        // If we got devices directly from the API, return them
        if (response.devices && response.devices.length > 0) {
          return {
            devices: response.devices,
            hasDevices: response.devices.length > 0,
          }
        }

        // If the direct API returned no devices, fall back to the client-side filtering approach
        const allDevicesResponse = await devices.getAlldevices()

        // Filter devices that have the groupId in their groups array
        const groupDevices = allDevicesResponse.devices.filter(
          (device) =>
            device.groups && (device.groups.includes(groupId) || device.groups.some((group) => group === groupId)),
        )

        return {
          devices: groupDevices,
          hasDevices: groupDevices.length > 0,
        }
      } catch (error) {
        // If the direct API endpoint failed, fall back to the client-side filtering approach
        const allDevicesResponse = await devices.getAlldevices()

        // Filter devices that have the groupId in their groups array
        const groupDevices = allDevicesResponse.devices.filter(
          (device) =>
            device.groups && (device.groups.includes(groupId) || device.groups.some((group) => group === groupId)),
        )

        return {
          devices: groupDevices,
          hasDevices: groupDevices.length > 0,
        }
      }
    },
    // Only run this query if we have a groupId
    enabled: !!groupId,
  })
}

/**
 * Combined hook to get all resources for a group
 * This provides a single place to check if a group has sites, devices, and members
 */
export const useGroupResources = (groupId: string) => {
  const { data: sitesData, isLoading: isLoadingSites } = useGroupSites(groupId)
  const { data: devicesData, isLoading: isLoadingDevices } = useGroupDevices(groupId)

  // We can also get the group details to check for members
  const { data: groupData, isLoading: isLoadingGroup } = useQuery({
    queryKey: ["groupDetails", groupId],
    queryFn: () => groupsApi.getGroupDetailsApi(groupId),
    enabled: !!groupId,
  })

  const isLoading = isLoadingSites || isLoadingDevices || isLoadingGroup

  return {
    isLoading,
    hasSites: sitesData?.hasSites || false,
    hasDevices: devicesData?.hasDevices || false,
    hasMembers: groupData?.group?.numberOfGroupUsers > 0 || false,
    sites: sitesData?.sites || [],
    devices: devicesData?.devices || [],
    setupComplete:
      !isLoading &&
      (sitesData?.hasSites || false) &&
      (devicesData?.hasDevices || false) &&
      (groupData?.group?.numberOfGroupUsers > 0 || false),
  }
}

