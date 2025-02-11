import {
    useMutation,
    useQuery,
    useQueryClient,
    UseQueryOptions,
  } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { groups } from "../apis/organizations";
import { Group } from "@/app/types/groups";
import { GroupsState, setError, setGroups } from "../redux/slices/groupsSlice";
import { useDispatch } from "react-redux";
  
  interface ErrorResponse {
    message: string;
  }
  
  // Hook to get the grid summary
  export const useGrids = () => {
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
    } as UseQueryOptions<GroupsState, AxiosError<ErrorResponse>>);
  
    return {
      grids: data?.groups ?? [],
      isLoading,
      error,
    };
  };
  
  // Hook to get grid details by gridId
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

  export const useUpdateGridDetails = (gridId: string) => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
      mutationFn: async () => await groups.getGroupDetailsApi(gridId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["gridDetails", gridId] });
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        console.error(
          "Failed to update grid details:",
          error.response?.data?.message
        );
      },
    });
  
    return {
      updateGridDetails: mutation.mutate,
      isLoading: mutation.isPending,
      error: mutation.error,
    };
};

  export const useCreateGrid = () => {
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
  