import { useQuery } from "@tanstack/react-query"
import { sites } from "@/core/apis/sites"
import { devices } from "@/core/apis/devices"
import { groupsApi } from "@/core/apis/organizations"
import type { GroupResponse } from "@/app/types/groups"

/**
 * Combined hook to get all resources for an organization/group
 * This optimized version leverages cached data when possible
 */
export const useGroupResources = (groupId: string) => {
  // Query to get all resources data (this could be pre-fetched by useOrganizationResources)
  const { data: allResourcesData, isLoading: isLoadingAllResources } = useQuery({
    queryKey: ["all-resources"],
    queryFn: async () => {
      const [allSites, allDevices] = await Promise.all([sites.getSitesSummary(), devices.getAllDevices()])

      return { allSites, allDevices }
    },
    // This could be disabled if we know the data is already loaded by useOrganizationResources
    staleTime: 5 * 60 * 1000,
  })

  // Get the group details
  const { data: groupData, isLoading: isLoadingGroup } = useQuery({
    queryKey: ["groupDetails", groupId],
    queryFn: async () => {
      const response = (await groupsApi.getGroupDetailsApi(groupId)) as GroupResponse
      return response
    },
    enabled: !!groupId,
  })

  // Filter the pre-fetched data for this specific group
  const filteredData = useQuery({
    queryKey: ["filtered-resources", groupId],
    queryFn: () => {
      if (!allResourcesData) return { sites: [], devices: [] }

      const { allSites, allDevices } = allResourcesData

      // Filter sites for this group
      const sites = allSites.filter((site) => site.organizationId === groupId)

      // Filter devices for this group
      const devices = allDevices.filter((device) => device.organizationId === groupId)

      return { sites, devices }
    },
    enabled: !!allResourcesData && !!groupId,
    // This is a derived query from existing data, so it's very fast
    staleTime: 5 * 60 * 1000,
  })

  const isLoading = isLoadingAllResources || isLoadingGroup || filteredData.isLoading

  return {
    isLoading,
    hasSites: (filteredData.data?.sites?.length || 0) > 0,
    hasDevices: (filteredData.data?.devices?.length || 0) > 0,
    hasMembers: (groupData?.group?.numberOfGroupUsers || 0) > 0,
    sites: filteredData.data?.sites || [],
    devices: filteredData.data?.devices || [],
    setupComplete:
      !isLoading &&
      (filteredData.data?.sites?.length || 0) > 0 &&
      (filteredData.data?.devices?.length || 0) > 0 &&
      (groupData?.group?.numberOfGroupUsers || 0) > 0,
  }
}

