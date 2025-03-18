import { useQuery } from "@tanstack/react-query"
import { sites } from "../apis/sites"
import { devices } from "../apis/devices"
import { groupsApi } from "../apis/organizations"
import type { DevicesSummaryResponse } from "@/app/types/devices"
import type { GroupResponse } from "@/app/types/groups"

/**
 * Custom hook to fetch sites assigned to a specific group
 * This hook checks if sites belong to a group by examining their groups array
 */
export const useGroupSites = (groupId: string) => {
  return useQuery({
    queryKey: ["group-sites", groupId],
    queryFn: async () => {
      try {
        // Get the group details to get the group name
        const groupDetails = (await groupsApi.getGroupDetailsApi(groupId)) as GroupResponse
        const groupName = groupDetails?.group?.grp_title

        // First attempt: Try to use the direct API endpoint with group name
        const response = await sites.getSitesSummary("", groupName || "")

        // If we got sites directly from the API, return them
        if (response.sites && response.sites.length > 0) {
          return {
            sites: response.sites,
            hasSites: response.sites.length > 0,
          }
        }

        // If the direct API returned no sites, we need to check if there are any sites
        // that reference this group by ID or name
        // This would require fetching all sites and filtering, which may not be feasible
        // depending on your data volume

        // For now, we'll return what we have
        return {
          sites: [],
          hasSites: false,
        }
      } catch (error) {
        console.error("Failed to fetch sites:", error)
        return {
          sites: [],
          hasSites: false,
        }
      }
    },
    // Only run this query if we have a groupId
    enabled: !!groupId,
  })
}

/**
 * Custom hook to fetch devices assigned to a specific group
 */
export const useGroupDevices = (groupId: string) => {
  return useQuery({
    queryKey: ["group-devices", groupId],
    queryFn: async () => {
      try {
        // Get the group details to get the group name
        const groupDetails = (await groupsApi.getGroupDetailsApi(groupId)) as GroupResponse
        const groupName = groupDetails?.group?.grp_title

        // First attempt: Try to use the direct API endpoint with group name
        const response = (await devices.getDevicesSummaryApi("", groupName || "")) as DevicesSummaryResponse

        // If we got devices directly from the API, return them
        if (response.devices && response.devices.length > 0) {
          return {
            devices: response.devices,
            hasDevices: response.devices.length > 0,
          }
        }

        // If the direct API returned no devices, we need to check if there are any devices
        // that reference this group by ID or name
        // This would require fetching all devices and filtering, which may not be feasible
        // depending on your data volume

        // For now, we'll return what we have
        return {
          devices: [],
          hasDevices: false,
        }
      } catch (error) {
        console.error("Failed to fetch devices:", error)
        return {
          devices: [],
          hasDevices: false,
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
    queryFn: async () => {
      const response = (await groupsApi.getGroupDetailsApi(groupId)) as GroupResponse
      return response
    },
    enabled: !!groupId,
  })

  const isLoading = isLoadingSites || isLoadingDevices || isLoadingGroup

  return {
    isLoading,
    hasSites: sitesData?.hasSites || false,
    hasDevices: devicesData?.hasDevices || false,
    hasMembers: (groupData?.group?.numberOfGroupUsers || 0) > 0,
    sites: sitesData?.sites || [],
    devices: devicesData?.devices || [],
    setupComplete:
      !isLoading &&
      (sitesData?.hasSites || false) &&
      (devicesData?.hasDevices || false) &&
      (groupData?.group?.numberOfGroupUsers || 0) > 0,
  }
}

