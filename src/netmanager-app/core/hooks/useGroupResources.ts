import { useQuery } from "@tanstack/react-query"
import { sites } from "../apis/sites"
import { devices } from "../apis/devices"
import { groupsApi } from "@/core/apis/organizations"

// Update the useGroupSites hook to check for group name matches
export const useGroupSites = (groupId: string) => {
  return useQuery({
    queryKey: ["group-sites", groupId],
    queryFn: async () => {
      try {
        // Get the group details to get the group name
        const groupDetails = await groupsApi.getGroupDetailsApi(groupId)
        const groupName = groupDetails?.group?.grp_title

        // First attempt: Try to use the direct API endpoint with group name
        const response = await sites.getSitesByGroupApi(groupName || groupId)

        // If we got sites directly from the API, return them
        if (response.sites && response.sites.length > 0) {
          return {
            sites: response.sites,
            hasSites: response.sites.length > 0,
          }
        }

        // If the direct API returned no sites, fall back to the client-side filtering approach
        const allSitesResponse = await sites.getAllSitesApi()

        // Filter sites that have the groupId or groupName in their groups array
        const groupSites = allSitesResponse.sites.filter((site) => {
          // Check if the site has the group in its groups array (by ID or name)
          const siteHasGroup =
            site.groups &&
            (site.groups.includes(groupId) ||
              site.groups.includes(groupName) ||
              site.groups.some((group) => group === groupId || group === groupName))

          // Also check if any of the site's devices belong to the group (by ID or name)
          const siteDevicesHaveGroup =
            site.devices &&
            site.devices.some(
              (device) =>
                device.groups?.includes(groupId) ||
                device.groups?.includes(groupName) ||
                device.group === groupId ||
                device.group === groupName,
            )

          return siteHasGroup || siteDevicesHaveGroup
        })

        return {
          sites: groupSites,
          hasSites: groupSites.length > 0,
        }
      } catch (error) {
        // If the direct API endpoint failed, fall back to the client-side filtering approach
        try {
          // Get the group details to get the group name
          const groupDetails = await groupsApi.getGroupDetailsApi(groupId)
          const groupName = groupDetails?.group?.grp_title

          const allSitesResponse = await sites.getSitesSummary()

          // Filter sites that have the groupId or groupName in their groups array
          const groupSites = allSitesResponse.sites.filter((site) => {
            // Check if the site has the group in its groups array (by ID or name)
            const siteHasGroup =
              site.groups &&
              (site.groups.includes(groupId) ||
                site.groups.includes(groupName) ||
                site.groups.some((group) => group === groupId || group === groupName))

            // Also check if any of the site's devices belong to the group (by ID or name)
            const siteDevicesHaveGroup =
              site.devices &&
              site.devices.some(
                (device) =>
                  device.groups?.includes(groupId) ||
                  device.groups?.includes(groupName) ||
                  device.group === groupId ||
                  device.group === groupName,
              )

            return siteHasGroup || siteDevicesHaveGroup
          })

          return {
            sites: groupSites,
            hasSites: groupSites.length > 0,
          }
        } catch (innerError) {
          console.error("Failed to fetch sites:", innerError)
          return {
            sites: [],
            hasSites: false,
          }
        }
      }
    },
    // Only run this query if we have a groupId
    enabled: !!groupId,
  })
}

// Update the useGroupDevices hook to check for group name matches
export const useGroupDevices = (groupId: string) => {
  return useQuery({
    queryKey: ["group-devices", groupId],
    queryFn: async () => {
      try {
        // Get the group details to get the group name
        const groupDetails = await groupsApi.getGroupDetailsApi(groupId)
        const groupName = groupDetails?.group?.grp_title

        // First attempt: Try to use the direct API endpoint with group name
        const response = await devices.getDevicesByGroupApi(groupName || groupId)

        // If we got devices directly from the API, return them
        if (response.devices && response.devices.length > 0) {
          return {
            devices: response.devices,
            hasDevices: response.devices.length > 0,
          }
        }

        // If the direct API returned no devices, fall back to the client-side filtering approach
        const allDevicesResponse = await devices.getAllDevicesApi()

        // Filter devices that have the groupId or groupName in their groups array
        const groupDevices = allDevicesResponse.devices.filter((device) => {
          // Check if the device has the group in its groups array (by ID or name)
          const deviceHasGroup =
            device.groups &&
            (device.groups.includes(groupId) ||
              device.groups.includes(groupName) ||
              device.groups.some((group) => group === groupId || group === groupName))

          // Also check if the device's site belongs to the group (by ID or name)
          const deviceSiteHasGroup =
            device.site &&
            device.site.groups &&
            (device.site.groups.includes(groupId) ||
              device.site.groups.includes(groupName) ||
              device.site.groups.some((group) => group === groupId || group === groupName))

          return deviceHasGroup || deviceSiteHasGroup
        })

        return {
          devices: groupDevices,
          hasDevices: groupDevices.length > 0,
        }
      } catch (error) {
        // If the direct API endpoint failed, fall back to the client-side filtering approach
        try {
          // Get the group details to get the group name
          const groupDetails = await groupsApi.getGroupDetailsApi(groupId)
          const groupName = groupDetails?.group?.grp_title

          const allDevicesResponse = await device.getAllDevicesApi()

          // Filter devices that have the groupId or groupName in their groups array
          const groupDevices = allDevicesResponse.devices.filter((device) => {
            // Check if the device has the group in its groups array (by ID or name)
            const deviceHasGroup =
              device.groups &&
              (device.groups.includes(groupId) ||
                device.groups.includes(groupName) ||
                device.groups.some((group) => group === groupId || group === groupName))

            // Also check if the device's site belongs to the group (by ID or name)
            const deviceSiteHasGroup =
              device.site &&
              device.site.groups &&
              (device.site.groups.includes(groupId) ||
                device.site.groups.includes(groupName) ||
                device.site.groups.some((group) => group === groupId || group === groupName))

            return deviceHasGroup || deviceSiteHasGroup
          })

          return {
            devices: groupDevices,
            hasDevices: groupDevices.length > 0,
          }
        } catch (innerError) {
          console.error("Failed to fetch devices:", innerError)
          return {
            devices: [],
            hasDevices: false,
          }
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

