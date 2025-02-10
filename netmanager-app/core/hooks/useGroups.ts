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
  export const useGridDetails = (groupId: string) => {
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
  
  // Hook to update grid details
  export const useUpdateGridDetails = (gridId: string) => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
      mutationFn: async () => await grids.updateGridDetailsApi(gridId),
      onSuccess: () => {
        // Invalidate and refetch the grid details
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
  
  // Hook to create a new grid
  export const useCreateGrid = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
      mutationFn: async (newGrid: CreateGrid) =>
        await grids.createGridApi(newGrid),
      onSuccess: () => {
        // Invalidate and refetch the grid summary after creating a new grid
        queryClient.invalidateQueries({ queryKey: ["gridSummary"] });
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
  