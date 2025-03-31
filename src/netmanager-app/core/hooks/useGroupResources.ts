import { useQuery } from "@tanstack/react-query"
import { sites } from "@/core/apis/sites"
import { devices } from "@/core/apis/devices"
import { groupsApi } from "@/core/apis/organizations"
import type { GroupResponse } from "@/app/types/groups"
import { useAppSelector } from "../redux/hooks";

/**
 * Hook to determine if a group has sites, devices, and members assigned
 * Uses the specific API endpoints for getting sites and devices by group name
 */
export const useGroupResources = (groupId: string) => {
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);
  // First, get the group details to get the group title
  const { data: groupData, isLoading: isLoadingGroup } = useQuery({
    queryKey: ["groupDetails", groupId],
    queryFn: async () => {
      const response = (await groupsApi.getGroupDetailsApi(groupId)) as GroupResponse
      return response
    },
    enabled: !!groupId,
  })

  // Get the group title from the group data
  const groupTitle = groupData?.group?.grp_title || ""
  const networkId = activeNetwork?.net_name || ""

  // Query to get sites for this specific group using the getSitesSummary API
  const { data: sitesData, isLoading: isLoadingSites } = useQuery({
    queryKey: ["sites-summary", networkId, groupTitle],
    queryFn: async () => {
      try {
        // Use the specific API to get sites for this group
        const response = await sites.getSitesSummary(networkId, groupTitle)

        return {
          hasSites: Array.isArray(response.sites) && response.sites.length > 0,
          sites: response.sites || [],
        }
      } catch (error) {
        console.error(`Failed to fetch sites for group ${groupTitle}:`, error)
        return { hasSites: false, sites: [] }
      }
    },
    enabled: !!groupTitle, // Only run this query if we have the group title
  })

  // Query to get devices for this specific group using the getDevicesSummaryApi
  const { data: devicesData, isLoading: isLoadingDevices } = useQuery({
    queryKey: ["devices-summary", networkId, groupTitle],
    queryFn: async () => {
      try {
        // Use the specific API to get devices for this group
        const response = await devices.getDevicesSummaryApi(networkId, groupTitle)

        return {
          hasDevices: Array.isArray(response.devices) && response.devices.length > 0,
          devices: response.devices || [],
        }
      } catch (error) {
        console.error(`Failed to fetch devices for group ${groupTitle}:`, error)
        return { hasDevices: false, devices: [] }
      }
    },
    enabled: !!groupTitle, // Only run this query if we have the group title
  })

  const isLoading = isLoadingGroup || isLoadingSites || isLoadingDevices

  return {
    isLoading,
    // Boolean flags indicating if resources are assigned to this group
    hasSites: sitesData?.hasSites || false,
    hasDevices: devicesData?.hasDevices || false,
    hasMembers: (groupData?.group?.numberOfGroupUsers || 0) > 0,

    // Raw data in case it's needed
    sites: sitesData?.sites || [],
    devices: devicesData?.devices || [],
    group: groupData?.group,

    // Overall setup status
    setupComplete:
      !isLoading &&
      (sitesData?.hasSites || false) &&
      (devicesData?.hasDevices || false) &&
      (groupData?.group?.numberOfGroupUsers || 0) > 0,
  }
}

