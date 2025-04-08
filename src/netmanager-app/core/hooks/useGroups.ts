import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { groupsApi, groupMembers } from "../apis/organizations";
import type { Group, GroupMember } from "@/app/types/groups";
import { setError, setGroups } from "../redux/slices/groupsSlice";
import { setTeamMember } from "../redux/slices/teamSlice";
import { setGroup } from "../redux/slices/groupDetailsSlice";
import { useDispatch } from "react-redux";
import React from "react";

interface ErrorResponse {
  message: string;
}

interface TeamMembersResponse {
  success: boolean;
  message: string;
  group_members: GroupMember[];
}

interface CreateOrgInput {
  grp_title: string;
  grp_country: string;
  grp_industry: string;
  grp_timezone: {
    value: string;
    label: string;
  };
  grp_description: string;
  grp_website: string;
  grp_profile_picture?: string | "";
};


export const useGroups = () => {
  const dispatch = useDispatch();

  const { data, isLoading, error } = useQuery({
    queryKey: ["groups"],
    queryFn: () => groupsApi.getGroupsApi(),
  });

  React.useEffect(() => {
    if (data?.groups) {
      dispatch(setGroups(data.groups));
    }
    if (error) {
      dispatch(setError(error.message));
    }
  }, [data, error, dispatch]);

  return {
    groups: data?.groups ?? [],
    isLoading,
    error,
  };
};

export const useGroupsDetails = (groupId: string) => {
  const dispatch = useDispatch();

  const { data, isLoading, error } = useQuery({
    queryKey: ["groupDetails", groupId],
    queryFn: () => groupsApi.getGroupDetailsApi(groupId),
  });

  React.useEffect(() => {
    if (data?.group) {
      dispatch(setGroup(data.group));
    }
    if (error) {
      dispatch(setError(error.message));
    }
  }, [data, error, dispatch]);

  return {
    group: data?.group ?? [],
    isLoading,
    error,
  };
};

export const useUpdateGroupDetails = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: ({
      groupId,
      data,
    }: {
      groupId: string;
      data: Partial<Group>;
    }) => groupsApi.updateGroupDetailsApi(groupId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["groupDetails", variables.groupId] });
      dispatch(setGroup(data.group));
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      dispatch(
        setError(
          error.response?.data?.message || "Failed to update group details"
        )
      );
    },
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient()
  const dispatch = useDispatch()

  return useMutation({
    mutationFn: (newGroup: CreateOrgInput) => groupsApi.createGroupApi(newGroup),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      dispatch(setGroups([...data.groups, data.group]))
      return data.group 
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      dispatch(setError(error.response?.data?.message || "Failed to create group"))
      throw error
    },
  })
}

export const useAssignDevicesToGroup = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: ({
      deviceIds,
      groups,
    }: {
      deviceIds: string[];
      groups: string[];
    }) => groupsApi.assignDevicesToGroupApi(deviceIds, groups),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      dispatch(
        setError(
          error.response?.data?.message || "Failed to assign devices to group"
        )
      );
    },
  });
};

export const useAssignSitesToGroup = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: ({
      siteIds,
      groups,
    }: {
      siteIds: string[];
      groups: string[];
    }) => groupsApi.assignSitesToGroupApi(siteIds, groups),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["sites"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      dispatch(
        setError(
          error.response?.data?.message || "Failed to assign sites to group"
        )
      );
    },
  });
};

export const useTeamMembers = (groupId: string) => {
  const dispatch = useDispatch();

  const { data, isLoading, error } = useQuery<
    TeamMembersResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey: ["team", groupId],
    queryFn: () => groupMembers.getGroupMembersApi(groupId),
  });

  React.useEffect(() => {
    if (data?.group_members) {
      dispatch(setTeamMember(data.group_members));
    }
    if (error) {
      dispatch(setError(error.message));
    }
  }, [data, error, dispatch]);

  return {
    team: data?.group_members || [],
    isLoading,
    error,
  };
};

export const useInviteUserToGroup = (groupId: string) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (userEmail: string) => {
      const response = await groupMembers.getGroupMembersApi(groupId);
      const existingMembers = response.group_members || [];
      const isExistingMember = existingMembers.some(
        (member: GroupMember) => member.email === userEmail
      );

      if (isExistingMember) {
        throw new Error("User is already a member of this group");
      }

      return groupMembers.inviteUserToGroupTeam(groupId, userEmail);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", groupId] });
    },
    onError: (error: Error) => {
      dispatch(setError(error.message || "Failed to invite user to group"));
    },
  });
};

export const useAcceptGroupInvite = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: ({
      groupId,
      userEmail,
    }: {
      groupId: string;
      userEmail: string;
    }) => groupMembers.acceptGroupTeamInvite(groupId, userEmail),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["team", variables.groupId] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      dispatch(
        setError(
          error.response?.data?.message || "Failed to accept group invitation"
        )
      );
    },
  });
};

export const useUpdateGroupMember = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: ({
      groupId,
      userEmail,
      role,
    }: {
      groupId: string;
      userEmail: string;
      role: string;
    }) => groupMembers.updateGroupTeam(groupId, userEmail, role),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["team", variables.groupId] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      dispatch(
        setError(
          error.response?.data?.message || "Failed to update group member"
        )
      );
    },
  });
};
