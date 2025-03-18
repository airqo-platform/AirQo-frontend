import { useQuery } from "@tanstack/react-query"
import type { Group } from "@/app/types/groups"
import { sites } from "@/core/apis/sites"
import { devices } from "@/core/apis/devices"

/**
 * Optimized custom hook to efficiently fetch and manage organization resource status
 * This hook pre-fetches all data first, then processes it to determine resource status
 */
export function useOrganizationResources(groups: Group[]) {
  return useQuery({
    queryKey: ["organization-resources", groups.map((g) => g._id).join(",")],
    queryFn: async () => {
      // Initialize the resource map
      const resourceMap = new Map<string, { hasSites: boolean; hasDevices: boolean; hasMembers: boolean }>()

      // Initialize map for all groups/organizations
      groups.forEach((group) => {
        resourceMap.set(group._id, {
          hasSites: false,
          hasDevices: false,
          hasMembers: group.numberOfGroupUsers > 0,
        })
      })

      try {
        // Fetch all data in a single batch
        const [allSites, allDevices] = await Promise.all([
          // Get all sites data in one call
          sites.getAllSites(),
          // Get all devices data in one call
          devices.getAllDevices(),
        ])

        // Create lookup maps for faster processing
        const sitesByOrg = new Map()
        const devicesByOrg = new Map()

        // Process sites data
        allSites.forEach((site) => {
          const orgId = site.organizationId
          if (!sitesByOrg.has(orgId)) {
            sitesByOrg.set(orgId, [])
          }
          sitesByOrg.get(orgId).push(site)
        })

        // Process devices data
        allDevices.forEach((device) => {
          const orgId = device.organizationId
          if (!devicesByOrg.has(orgId)) {
            devicesByOrg.set(orgId, [])
          }
          devicesByOrg.get(orgId).push(device)
        })

        // Update the resource map
        groups.forEach((group) => {
          const orgId = group._id
          const hasSites = sitesByOrg.has(orgId) && sitesByOrg.get(orgId).length > 0
          const hasDevices = devicesByOrg.has(orgId) && devicesByOrg.get(orgId).length > 0

          resourceMap.set(orgId, {
            hasSites,
            hasDevices,
            hasMembers: group.numberOfGroupUsers > 0,
          })
        })

        return resourceMap
      } catch (error) {
        console.error("Failed to fetch resources:", error)

        // If the batch approach fails, fall back to a simpler implementation
        // that still reduces API calls compared to the original

        try {
          // Get all sites with their organization mapping
          const allSitesData = await sites.getAllSitesSummary()

          // Get all devices with their organization mapping
          const allDevicesData = await devices.getAllDevicesSummary()

          // Process the data to update the resource map
          groups.forEach((group) => {
            const groupId = group._id
            const groupName = group.grp_title || ""

            // Check if this group has any sites
            const hasSites = allSitesData.some(
              (site) =>
                site.organizationId === groupId || site.organizationName?.toLowerCase() === groupName.toLowerCase(),
            )

            // Check if this group has any devices
            const hasDevices = allDevicesData.some(
              (device) =>
                device.organizationId === groupId || device.organizationName?.toLowerCase() === groupName.toLowerCase(),
            )

            // Update the resource map
            resourceMap.set(groupId, {
              hasSites,
              hasDevices,
              hasMembers: group.numberOfGroupUsers > 0,
            })
          })
        } catch (secondError) {
          console.error("Secondary approach failed:", secondError)
          // If both approaches fail, we'll return the default map with all values as false
        }

        return resourceMap
      }
    },
    enabled: groups.length > 0,
    staleTime: 5 * 60 * 1000,
  })
}

