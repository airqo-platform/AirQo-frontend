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
import { TeamState, setTeamMember } from "../redux/slices/teamSlice";
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
    const mutation = useMutation({
      mutationFn: async () => await groups.getGroupDetailsApi(groupId),
      onSuccess: () => {
        console.log("Grid details fetched successfully");
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        console.error(
          "Failed to fetch grid details:",
          error.response?.data?.message
        );
      },
    });

    return {
        getGroupDetails: mutation.mutate || [],
        isLoading: mutation.isPending,
        error: mutation.error as Error | null,
    };
};

export const useUpdateGroupDetails = (gridId: string) => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async () => await groups.getGroupDetailsApi(gridId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["groupDetails", gridId] });
        },
        onError: (error: AxiosError<ErrorResponse>) => {
        console.error(
            "Failed to update grid details:",
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
        console.error("Failed to create grid:", error.response?.data?.message);
      },
    });
  
    return {
      createGrid: mutation.mutate,
      isLoading: mutation.isPending,
      error: mutation.error,
    };
  };


export const useTeamMembers = (groupId: string) => {
  const dispatch = useDispatch();

  const { data, isLoading, error } = useQuery<
      GroupsState,
      AxiosError<ErrorResponse>
  >({
      queryKey: ["team", groupId],
      queryFn: () => groupMembers.getGroupMembersApi(groupId),
      onSuccess: (data: TeamState) => {
          dispatch(setTeamMember(data.team));
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