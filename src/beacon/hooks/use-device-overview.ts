"use client"

import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useNavigationAccess } from "@/hooks/use-navigation-access"
import { countDevices, type DeviceCounts } from "@/lib/device-status"
import { useGroup, type UserGroup } from "@/lib/group-context"
import {
  getDevicesForUIPaginated,
  getMyDevicesForUI,
  getPersonalUserCohorts,
} from "@/services/device-api.service"

const NO_DEVICES: DeviceCounts = { total: 0, tracked: 0, deployed: 0, online: 0, offline: 0 }

/** The list endpoint reports the whole organisation's counts alongside each page, so one row is enough. */
async function fetchOrganisationCounts(group: string): Promise<DeviceCounts> {
  const { meta, pagination } = await getDevicesForUIPaginated({ skip: 0, limit: 1, group })
  return {
    total: meta?.totalDevices ?? meta?.total ?? pagination.total,
    tracked: meta?.devicesInAtLeastOneCohort ?? 0,
    deployed: meta?.deployedDevices ?? 0,
    online: meta?.onlineDevices ?? 0,
    offline: meta?.offlineDevices ?? 0,
  }
}

async function fetchPersonalCounts(userId: string, groups: UserGroup[]): Promise<DeviceCounts> {
  const cohortIds = await getPersonalUserCohorts(userId)
  const { devices } = await getMyDevicesForUI({
    userId,
    groupIds: groups.filter((group) => group.grp_title?.toLowerCase() !== "airqo").map((group) => group._id),
    cohortIds,
  })
  return countDevices(devices)
}

/**
 * Device counts for what the person is looking at: the organisation's fleet, or their own devices
 * when the AirQo (personal) context doesn't give them the fleet. Home uses this to choose between
 * the setup steps and the returning layout.
 */
export function useDeviceOverview() {
  const { data: session } = useSession()
  const { activeGroup, availableGroups, loading: groupLoading } = useGroup()
  const { showOrgDevices } = useNavigationAccess()
  const userId = session?.user?._id

  return useQuery({
    queryKey: ["device-overview", showOrgDevices ? "org" : "my", activeGroup, userId],
    enabled: !groupLoading && (showOrgDevices || Boolean(userId)),
    queryFn: async () => {
      if (!showOrgDevices) return fetchPersonalCounts(userId as string, availableGroups)
      return activeGroup ? fetchOrganisationCounts(activeGroup) : NO_DEVICES
    },
  })
}
