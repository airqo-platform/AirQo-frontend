import { useQuery } from "@tanstack/react-query"
import type { Group } from "@/app/types/groups"
import { sites } from "@/core/apis/sites"
import { devices } from "@/core/apis/devices"

/**
 * Custom hook to efficiently fetch and manage organization resource status
 * This hook provides a map of organization IDs to their resource status (hasSites, hasDevices)
 */
export function useOrganizationResources(groups: Group[]) {
  // Create a query to fetch resource status for all organizations at once
  return useQuery({
    queryKey: ["organization-resources", groups.map((g) => g._id).join(",")],
    queryFn: async () => {
      // Initialize the resource map
      const resourceMap = new Map<string, { hasSites: boolean; hasDevices: boolean }>()

      // Initialize map for all groups
      groups.forEach((group) => {
        resourceMap.set(group._id, { hasSites: false, hasDevices: false })
      })

      // Batch fetch sites and devices in parallel
      const [sitesResponses, devicesResponses] = await Promise.all([
        // Fetch sites for all groups in parallel
        Promise.all(
          groups.map(async (group) => {
            try {
              const response = await sites.getSitesSummary("", group.grp_title || "")
              return {
                groupId: group._id,
                groupTitle: group.grp_title,
                sites: response.sites || [],
              }
            } catch (error) {
              console.error(`Failed to fetch sites for group ${group.grp_title}:`, error)
              return { groupId: group._id, groupTitle: group.grp_title, sites: [] }
            }
          }),
        ),
        // Fetch devices for all groups in parallel
        Promise.all(
          groups.map(async (group) => {
            try {
              const response = await devices.getDevicesSummaryApi("", group.grp_title || "")
              return {
                groupId: group._id,
                groupTitle: group.grp_title,
                devices: response.devices || [],
              }
            } catch (error) {
              console.error(`Failed to fetch devices for group ${group.grp_title}:`, error)
              return { groupId: group._id, groupTitle: group.grp_title, devices: [] }
            }
          }),
        ),
      ])

      // Process sites data
      sitesResponses.forEach((response) => {
        if (response.sites.length > 0) {
          const resourceStatus = resourceMap.get(response.groupId)
          if (resourceStatus) {
            resourceStatus.hasSites = true
          }
        }
      })

      // Process devices data
      devicesResponses.forEach((response) => {
        if (response.devices.length > 0) {
          const resourceStatus = resourceMap.get(response.groupId)
          if (resourceStatus) {
            resourceStatus.hasDevices = true
          }
        }
      })

      return resourceMap
    },
    enabled: groups.length > 0,
    staleTime: 5 * 60 * 1000,
  })
}

