import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { groupsApi, groupMembers } from "../apis/organizations"
import type { Group } from "@/app/types/groups"
import { setError, setGroups } from "../redux/slices/groupsSlice"
import { setTeamMember } from "../redux/slices/teamSlice"
import { setGroup } from "../redux/slices/groupDetailsSlice"
import { useDispatch } from "react-redux"

interface ErrorResponse {
  message: string
}

interface TeamMembersResponse {
  group_members: Array<{
    id: string
  }>
}

export const useGroups = () => {
  const dispatch = useDispatch()

  const { data, isLoading, error } = useQuery({
    queryKey: ["groups"],
    queryFn: () => groupsApi.getGroupsApi(),
    onSuccess: (data: any) => {
      dispatch(setGroups(data.groups))
    },
    onError: (error: Error) => {
      dispatch(setError(error.message))
    },
  })

  return {
    groups: data?.groups ?? [],
    isLoading,
    error,
  }
}

export const useGroupsDetails = (groupId: string) => {
  const dispatch = useDispatch()

  const { data, isLoading, error } = useQuery({
    queryKey: ["groupDetails", groupId],
    queryFn: () => groupsApi.getGroupDetailsApi(groupId),
    onSuccess: (data: any) => {
      dispatch(setGroup(data.group))
    },
    onError: (error: Error) => {
      dispatch(setError(error.message))
    },
  })

  return {
    group: data?.group ?? [],
    isLoading,
    error,
  }
}

export const useUpdateGroupDetails = () => {
  const queryClient = useQueryClient()
  const dispatch = useDispatch()

  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: Partial<Group> }) =>
      groupsApi.updateGroupDetailsApi(groupId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["groupDetails", variables.groupId])
      dispatch(setGroup(data.group))
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      dispatch(setError(error.response?.data?.message || "Failed to update group details"))
    },
  })
}

export const useCreateGroup = () => {
  const queryClient = useQueryClient()
  const dispatch = useDispatch()

  return useMutation({
    mutationFn: (newGroup: Group) => groupsApi.createGroupApi(newGroup),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      dispatch(setGroups((prevGroups) => [...prevGroups, data.group]))
      return data.group // Ensure we're returning the created group
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      dispatch(setError(error.response?.data?.message || "Failed to create group"))
      throw error // Re-throw the error so it can be caught in the component
    },
  })
}

export const useAssignDevicesToGroup = () => {
  const queryClient = useQueryClient()
  const dispatch = useDispatch()

  return useMutation({
    mutationFn: ({ deviceIds, groups }: { deviceIds: string[]; groups: string[] }) =>
      groupsApi.assignDevicesToGroupApi(deviceIds, groups),
    onSuccess: () => {
      queryClient.invalidateQueries(["groups"])
      queryClient.invalidateQueries(["devices"])
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      dispatch(setError(error.response?.data?.message || "Failed to assign devices to group"))
    },
  })
}

export const useAssignSitesToGroup = () => {
  const queryClient = useQueryClient()
  const dispatch = useDispatch()

  return useMutation({
    mutationFn: ({ siteIds, groups }: { siteIds: string[]; groups: string[] }) =>
      groupsApi.assignSitesToGroupApi(siteIds, groups),
    onSuccess: () => {
      queryClient.invalidateQueries(["groups"])
      queryClient.invalidateQueries(["sites"])
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      dispatch(setError(error.response?.data?.message || "Failed to assign sites to group"))
    },
  })
}

export const useTeamMembers = (groupId: string) => {
  const dispatch = useDispatch()

  const { data, isLoading, error } = useQuery<TeamMembersResponse, AxiosError<ErrorResponse>>({
    queryKey: ["team", groupId],
    queryFn: () => groupMembers.getGroupMembersApi(groupId),
    onSuccess: (data: TeamMembersResponse) => {
      dispatch(setTeamMember(data))
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      dispatch(setError(error.message))
    },
  })

  return {
    team: data?.group_members || [],
    isLoading,
    error,
  }
}

export const useInviteUserToGroup = (groupId: string) => {
  const queryClient = useQueryClient()
  const dispatch = useDispatch()

  return useMutation({
    mutationFn: async (userEmail: string) => {
      const response = await groupMembers.getGroupMembersApi(groupId)
      const existingMembers = response.group_members || []
      const isExistingMember = existingMembers.some((member: any) => member.email === userEmail)

      if (isExistingMember) {
        throw new Error("User is already a member of this group")
      }

      return groupMembers.inviteUserToGroupTeam(groupId, userEmail)
    },
    onSuccess: (data, userEmail) => {
      queryClient.invalidateQueries(["team", groupId])
    },
    onError: (error: Error) => {
      dispatch(setError(error.message || "Failed to invite user to group"))
    },
  })
}

export const useAcceptGroupInvite = () => {
  const queryClient = useQueryClient()
  const dispatch = useDispatch()

  return useMutation({
    mutationFn: ({ groupId, userEmail }: { groupId: string; userEmail: string }) =>
      groupMembers.acceptGroupTeamInvite(groupId, userEmail),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["team", variables.groupId])
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      dispatch(setError(error.response?.data?.message || "Failed to accept group invitation"))
    },
  })
}

export const useUpdateGroupMember = () => {
  const queryClient = useQueryClient()
  const dispatch = useDispatch()

  return useMutation({
    mutationFn: ({ groupId, userEmail, role }: { groupId: string; userEmail: string; role: string }) =>
      groupMembers.updateGroupTeam(groupId, userEmail, role),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["team", variables.groupId])
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      dispatch(setError(error.response?.data?.message || "Failed to update group member"))
    },
  })
}

export const useActivateGroup = () => {
  const queryClient = useQueryClient()
  const dispatch = useDispatch()

  return useMutation({
    mutationFn: ({ groupId, status }: { groupId: string; status: 'ACTIVE' | 'INACTIVE' }) =>
      groupsApi.updateGroupDetailsApi(groupId, { grp_status: status }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["groups"])
      queryClient.invalidateQueries(["groupDetails", variables.groupId])
      dispatch(setGroup(data.group))
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      dispatch(setError(error.response?.data?.message || "Failed to update group status"))
    },
  })
}

