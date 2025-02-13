import {
    useMutation,
    useQuery,
    useQueryClient,
    UseQueryOptions,
  } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { groups, groupMembers } from "../apis/organizations";
import { Group } from "@/app/types/groups";
import { GroupsState, setError, setGroups } from "../redux/slices/groupsSlice";
import {  setTeamMember } from "../redux/slices/teamSlice";
import { GroupsDetailState, setGroup } from "../redux/slices/groupDetailsSlice";
import { useDispatch } from "react-redux";
  
interface ErrorResponse {
    message: string;
}

export const useGroups = () => {
    const dispatch = useDispatch();

    const { data, isLoading, error } = useQuery<
        GroupsState,
        AxiosError<ErrorResponse>
    >({
        queryKey: ["groups"],
        queryFn: () => groups.getGroupsApi(),
        onSuccess: (data: GroupsState) => {
            dispatch(setGroups(data.groups));
        },
        onError: (error: AxiosError<ErrorResponse>) => {
            dispatch(setError(error.message));
        },
    } as UseQueryOptions<GroupsState, AxiosError<ErrorResponse>>)

    return {
      groups: data?.groups ?? [],
      isLoading,
      error,
    };
};

  export const useGroupsDetails = (groupId: string) => {
    const dispatch = useDispatch();

    const { data, isLoading, error } = useQuery<
      GroupsDetailState,
        AxiosError<ErrorResponse>
    >({
        queryKey: ["groups"],
        queryFn: () => groups.getGroupDetailsApi(groupId),
        onSuccess: (data: GroupsDetailState) => {
            dispatch(setGroup(data.group));
        },
        onError: (error: AxiosError<ErrorResponse>) => {
            dispatch(setError(error.message));
        },
    } as UseQueryOptions<GroupsDetailState, AxiosError<ErrorResponse>>)

    return {
      group: data?.group ?? [],
      isLoading,
      error,
    };
};

export const useUpdateGroupDetails = (gridId: string) => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async (updatedGroup: Partial<Group>) =>
            await groups.updateGroupApi(gridId, updatedGroup),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["groupDetails", gridId] });
        },
        onError: (error: AxiosError<ErrorResponse>) => {
            console.error(
                "Failed to update group details:",
                error.response?.data?.message
            );
        },
    });

    return {
        updateGroupDetails: mutation.mutate,
        isLoading: mutation.isPending,
        error: mutation.error,
    };
};

export const useCreateGroup = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async (newGroup: Group) =>
            await groups.createGroupApi(newGroup),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["groups"] });
        },
        onError: (error: AxiosError<ErrorResponse>) => {
            console.error("Failed to create group:", error.response?.data?.message);
        },
    });

    return {
        createGroup: mutation.mutate,
        isLoading: mutation.isPending,
        error: mutation.error,
    };
};

interface TeamMembersResponse {
  group_members: Array<{
    id: string;

  }>;
}

export const useTeamMembers = (groupId: string) => {
  const dispatch = useDispatch();

  const { data, isLoading, error } = useQuery<TeamMembersResponse, AxiosError<ErrorResponse>>({
      queryKey: ["team", groupId],
      queryFn: () => groupMembers.getGroupMembersApi(groupId),
      onSuccess: (data: TeamMembersResponse) => {
          dispatch(setTeamMember(data));
      },
      onError: (error: AxiosError<ErrorResponse>) => {
          dispatch(setError(error.message));
      },
  });

  return {
    team: data?.group_members || [],
    isLoading,
    error,
  };
};