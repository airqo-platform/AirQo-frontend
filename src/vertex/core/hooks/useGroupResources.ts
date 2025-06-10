import { useQuery } from "@tanstack/react-query"
import { sites } from "@/core/apis/sites"
import { devices } from "@/core/apis/devices"
import { groupsApi } from "@/core/apis/organizations"
import type { GroupResponse } from "@/app/types/groups"
import { useAppSelector } from "../redux/hooks";

export const useGroupResources = (groupId: string) => {
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);

  const { data: groupData, isLoading: isLoadingGroup } = useQuery({
    queryKey: ["groupDetails", groupId],
    queryFn: async () => {
      const response = (await groupsApi.getGroupDetailsApi(groupId)) as GroupResponse
      return response
    },
    enabled: !!groupId,
  })

  const groupTitle = groupData?.group?.grp_title || ""
  const networkId = activeNetwork?.net_name || ""

  const { data: sitesData, isLoading: isLoadingSites, refetch: refetchSites } = useQuery({
    queryKey: ["sites-summary", networkId, groupTitle],
    queryFn: async () => {
      try {

        const response = await sites.getSitesSummary(networkId, groupTitle)

        return {
          hasSites: Array.isArray(response.sites) && response.sites.length > 0,
          sites: response.sites || [],
        }
      } catch {
        return { hasSites: false, sites: [] }
      }
    },
    enabled: !!groupTitle,
  })

  const { data: devicesData, isLoading: isLoadingDevices, refetch: refetchDevices } = useQuery({
    queryKey: ["devices-summary", networkId, groupTitle],
    queryFn: async () => {
      try {

        const response = await devices.getDevicesSummaryApi(networkId, groupTitle)

        return {
          hasDevices: Array.isArray(response.devices) && response.devices.length > 0,
          devices: response.devices || [],
        }
      } catch {
        return { hasDevices: false, devices: [] }
      }
    },
    enabled: !!groupTitle,
  })

  const isLoading = isLoadingGroup || isLoadingSites || isLoadingDevices

  const refetch = () => {
    refetchSites()
    refetchDevices()
  }

  return {
    isLoading,
    hasSites: sitesData?.hasSites || false,
    hasDevices: devicesData?.hasDevices || false,
    hasMembers: (groupData?.group?.numberOfGroupUsers || 0) > 0,

    sites: sitesData?.sites || [],
    devices: devicesData?.devices || [],
    group: groupData?.group,

    refetch,

    setupComplete:
      !isLoading &&
      (sitesData?.hasSites || false) &&
      (devicesData?.hasDevices || false) &&
      (groupData?.group?.numberOfGroupUsers || 0) > 0,
  }
}

