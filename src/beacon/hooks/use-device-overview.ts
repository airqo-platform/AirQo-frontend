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
  const total = meta?.totalDevices ?? meta?.total ?? pagination.total
  if (total === 0) return NO_DEVICES

  const deployed = meta?.deployedDevices
  const online = meta?.onlineDevices
  const offline = meta?.offlineDevices
  // Zeroes would read as a fleet with nothing deployed or online, so this counts as a failed load
  if (deployed === undefined || online === undefined || offline === undefined) {
    throw new Error("The device list came back without its counts")
  }
  return { total, tracked: meta?.devicesInAtLeastOneCohort ?? 0, deployed, online, offline }
}

/** The organisations someone's own devices can come from: everything but the AirQo (personal) context. */
const personalGroupIds = (groups: UserGroup[]): string[] =>
  groups.filter((group) => group.grp_title?.toLowerCase() !== "airqo").map((group) => group._id)

async function fetchPersonalCounts(userId: string, groupIds: string[]): Promise<DeviceCounts> {
  const cohortIds = await getPersonalUserCohorts(userId)
  const { devices } = await getMyDevicesForUI({ userId, groupIds, cohortIds })
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
  const groupIds = personalGroupIds(availableGroups)

  return useQuery({
    queryKey: ["device-overview", showOrgDevices ? "org" : "my", activeGroup, userId, showOrgDevices ? null : groupIds],
    enabled: !groupLoading && (showOrgDevices || Boolean(userId)),
    queryFn: async () => {
      if (!showOrgDevices) return fetchPersonalCounts(userId as string, groupIds)
      return activeGroup ? fetchOrganisationCounts(activeGroup) : NO_DEVICES
    },
  })
}
