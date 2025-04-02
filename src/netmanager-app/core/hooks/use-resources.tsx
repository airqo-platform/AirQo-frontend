"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { sites } from "@/core/apis/sites"
import { devices } from "@/core/apis/devices"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { setDevices } from "../redux/slices/devicesSlice"
import { setSites } from "../redux/slices/sitesSlice"
import type { RootState } from "../redux/store"
import { useGroupsDetails } from "./useGroups"

/**
 * Comprehensive hook for efficient resource management
 * Handles both organization list resources and individual group resources
 * Note: In this system, "organization" and "group" refer to the same entity
 */
export function useResources() {
  const queryClient = useQueryClient()
  const appDispatch = useAppDispatch()

  // Get data from Redux store
  const groups = useAppSelector((state: RootState) => state.groups.groups)
  const reduxSites = useAppSelector((state: RootState) => state.sites.sites)
  const reduxDevices = useAppSelector((state: RootState) => state.devices.devices)

  // Prefetch resources for frequently accessed groups
  useEffect(() => {
    // Only prefetch for a small number of groups to avoid overwhelming the API
    const groupsToPrefetch = groups.slice(0, 3) // Prefetch for the first 3 groups

    groupsToPrefetch.forEach((group) => {
      const groupName = group.grp_title || ""

      // Prefetch sites and devices data
      queryClient.prefetchQuery({
        queryKey: ["sites", "", groupName],
        queryFn: () => sites.getSitesSummary("", groupName),
        staleTime: 5 * 60 * 1000, // 5 minutes
      })

      queryClient.prefetchQuery({
        queryKey: ["devices", "", groupName],
        queryFn: () => devices.getDevicesSummaryApi("", groupName),
        staleTime: 5 * 60 * 1000, // 5 minutes
      })
    })
  }, [groups, queryClient])

  // Function to get resource status for all organizations/groups
  const useOrganizationResources = () => {
    const [resourceMap, setResourceMap] = useState(new Map<string, { hasSites: boolean; hasDevices: boolean }>())
    const query = useQuery({
      queryKey: ["organization-resources", groups.map((g) => g._id).join(",")],
      queryFn: async () => {
        // Initialize the resource map
        const newResourceMap = new Map<string, { hasSites: boolean; hasDevices: boolean }>()

        // Initialize map for all groups/organizations
        groups.forEach((group) => {
          newResourceMap.set(group._id, { hasSites: false, hasDevices: false })
        })

        if (groups.length === 0) {
          return newResourceMap
        }

        try {
          // Create a map of group names to group IDs for faster lookup
          const groupNameToIdMap = new Map<string, string>()
          const groupsToFetch = new Set<string>() // Track which groups need fetching

          groups.forEach((group) => {
            if (group.grp_title) {
              const groupName = group.grp_title.toLowerCase()
              groupNameToIdMap.set(groupName, group._id)
              groupsToFetch.add(group._id) // Initially assume all groups need fetching
            }
          })

          // First check if we can determine resource status from Redux store
          if (reduxSites.length > 0 || reduxDevices.length > 0) {
            // Process sites from Redux
            reduxSites.forEach((site) => {
              const siteGroups = site.groups || []
              siteGroups.forEach((groupName) => {
                const groupId = groupNameToIdMap.get(groupName.toLowerCase())
                if (groupId) {
                  const resourceStatus = newResourceMap.get(groupId)
                  if (resourceStatus) {
                    // Only mark as having sites if the site is actually assigned to this group
                    // and not just associated with it
                    if (site.organizationId === groupId || site.assignedToGroup === true) {
                      resourceStatus.hasSites = true
                    }
                  }
                }
              })
            })

            // Process devices from Redux
            reduxDevices.forEach((device) => {
              const deviceGroups = device.groups || []
              deviceGroups.forEach((groupName) => {
                const groupId = groupNameToIdMap.get(groupName.toLowerCase())
                if (groupId) {
                  const resourceStatus = newResourceMap.get(groupId)
                  if (resourceStatus) {
                    // Only mark as having devices if the device is actually assigned to this group
                    // and not just associated with it
                    if (device.organizationId === groupId || device.assignedToGroup === true) {
                      resourceStatus.hasDevices = true
                    }
                  }
                }
              })
            })

            // Remove groups that have complete information from our fetch list
            newResourceMap.forEach((status, groupId) => {
              if (status.hasSites && status.hasDevices) {
                groupsToFetch.delete(groupId)
              }
            })
          }

          // If we still have groups that need fetching
          if (groupsToFetch.size > 0) {
            // Convert the Set back to an array of group objects
            const remainingGroups = groups.filter((group) => groupsToFetch.has(group._id))

            // Process in batches to avoid overwhelming the API
            const BATCH_SIZE = 5 // Adjust based on your API's capacity
            const batches = []

            for (let i = 0; i < remainingGroups.length; i += BATCH_SIZE) {
              const batchGroups = remainingGroups.slice(i, i + BATCH_SIZE)

              // Create a batch of promises for this set of groups
              const batchPromises = batchGroups.map(async (group) => {
                const groupId = group._id
                const groupName = group.grp_title || ""

                // Fetch sites and devices in parallel for this group
                const [sitesResponse, devicesResponse] = await Promise.all([
                  sites.getSitesSummary("", groupName),
                  devices.getDevicesSummaryApi("", groupName),
                ])

                // Store the results in the React Query cache for future use
                queryClient.setQueryData(["sites", "", groupName], sitesResponse)
                queryClient.setQueryData(["devices", "", groupName], devicesResponse)

                // Update Redux store with new data
                if (sitesResponse.sites?.length > 0) {
                  appDispatch(setSites([...reduxSites, ...sitesResponse.sites]))
                }

                if (devicesResponse.devices?.length > 0) {
                  appDispatch(setDevices([...reduxDevices, ...devicesResponse.devices]))
                }

                return {
                  groupId,
                  hasSites: (sitesResponse.sites?.length || 0) > 0,
                  hasDevices: (devicesResponse.devices?.length || 0) > 0,
                }
              })

              batches.push(Promise.all(batchPromises))
            }

            // Wait for all batches to complete
            const results = await Promise.all(batches)

            // Flatten the results and update the resource map
            results.flat().forEach((result) => {
              const resourceStatus = newResourceMap.get(result.groupId)
              if (resourceStatus) {
                resourceStatus.hasSites = result.hasSites
                resourceStatus.hasDevices = result.hasDevices
              }
            })
          }

          return newResourceMap
        } catch (error) {
          console.error("Failed to fetch resources:", error)
          return newResourceMap
        }
      },
      enabled: groups.length > 0,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    })

    useEffect(() => {
      if (query.data) {
        setResourceMap(query.data)
      }
    }, [query.data])

    return {
      ...query,
      data: resourceMap,
    }
  }

  // Function to get resources for a specific group/organization
  const useGroupResources = (groupId: string) => {
    // Get the group details using the existing hook
    const { group, isLoading: isLoadingGroup, error: groupError } = useGroupsDetails(groupId)

    // Get the group name from the group data
    const groupName = group?.grp_title || ""

    // First, try to filter data from Redux store
    const filteredSites = reduxSites.filter((site) =>
      site.groups?.some((g) => g.toLowerCase() === groupName.toLowerCase()),
    )

    const filteredDevices = reduxDevices.filter((device) =>
      device.groups?.some((g) => g.toLowerCase() === groupName.toLowerCase()),
    )

    // Check if we need to fetch data from the API
    const needsFetching = !groupName || (filteredSites.length === 0 && filteredDevices.length === 0)

    const { data: resourcesData, isLoading: isLoadingResources } = useQuery({
      queryKey: ["group-resources", groupId],
      queryFn: async () => {
        // Fetch sites and devices in parallel
        const [sitesResponse, devicesResponse] = await Promise.all([
          sites.getSitesSummary("", groupName),
          devices.getDevicesSummaryApi("", groupName),
        ])

        // Update Redux store with the new data
        if (sitesResponse.sites?.length > 0) {
          // Merge with existing sites to avoid duplicates
          const newSites = sitesResponse.sites.filter(
            (newSite) => !reduxSites.some((existingSite) => existingSite._id === newSite._id),
          )

          if (newSites.length > 0) {
            appDispatch(setSites([...reduxSites, ...newSites]))
          }
        }

        if (devicesResponse.devices?.length > 0) {
          // Merge with existing devices to avoid duplicates
          const newDevices = devicesResponse.devices.filter(
            (newDevice) => !reduxDevices.some((existingDevice) => existingDevice._id === newDevice._id),
          )

          if (newDevices.length > 0) {
            appDispatch(setDevices([...reduxDevices, ...newDevices]))
          }
        }

        return {
          sites: sitesResponse.sites || [],
          devices: devicesResponse.devices || [],
        }
      },
      enabled: !!groupId && !!groupName && needsFetching,
      staleTime: 5 * 60 * 1000,
    })

    // Determine the final data to return
    const finalSites = (resourcesData?.sites?.length || 0) > 0 ? resourcesData?.sites : filteredSites

    const finalDevices = (resourcesData?.devices?.length || 0) > 0 ? resourcesData?.devices : filteredDevices

    const isLoading = isLoadingGroup || (needsFetching && isLoadingResources)

    return {
      isLoading,
      error: groupError,
      hasSites: finalSites.length > 0,
      hasDevices: finalDevices.length > 0,
      hasMembers: (group?.numberOfGroupUsers || 0) > 0,
      sites: finalSites,
      devices: finalDevices,
      setupComplete:
        !isLoading && finalSites.length > 0 && finalDevices.length > 0 && (group?.numberOfGroupUsers || 0) > 0,
    }
  }

  return {
    useOrganizationResources,
    useGroupResources,
    prefetchResources: () => null, // Already handled in the useEffect
  }
}

// Export convenience hooks for easier usage
export function useOrganizationResources() {
  const { useOrganizationResources } = useResources()
  return useOrganizationResources()
}

export function useGroupResources(groupId: string) {
  const { useGroupResources } = useResources()
  return useGroupResources(groupId)
}

export function usePrefetchResources() {
  // This hook doesn't need to return anything, the prefetching is handled in useResources
  useResources()
  return null
}

