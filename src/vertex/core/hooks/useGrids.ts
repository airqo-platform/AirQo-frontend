import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { grids } from "../apis/grids";
import { CreateGrid, Grid } from "@/app/types/grids";
import {  setError, setGrids } from "../redux/slices/gridsSlice";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../redux/hooks";
import React from "react";

interface ErrorResponse {
  message: string;
}

// Hook to get the grid summary
export const useGrids = () => {
  const dispatch = useDispatch();
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);

  const { data, isLoading, error } = useQuery({
    queryKey: ["grids"],
    queryFn: () => grids.getGridsApi(activeNetwork?.net_name || ""),
    enabled: !!activeNetwork?.net_name,
  });

  React.useEffect(() => {
    if (data?.grids) {
      dispatch(setGrids(data.grids));
    }
    if (error) {
      dispatch(setError(error.message));
    }
  }, [data, error, dispatch]);

  return {
    grids: data?.grids ?? [],
    isLoading,
    error,
  };
};

// Hook to get grid details by gridId
export const useGridDetails = (gridId: string) => {
  const dispatch = useDispatch();
  const { data, isLoading, error } = useQuery<Grid, AxiosError<ErrorResponse>>({
    queryKey: ["gridDetails", gridId],
    queryFn: () => grids.getGridDetailsApi(gridId),
    enabled: !!gridId,
  });

  React.useEffect(() => {
    if (error) {
      dispatch(setError(error.message));
    }
  }, [error, dispatch]);

  return {
    gridDetails: data ?? ({} as Grid),
    isLoading,
    error,
  };
};

// Hook to update grid details
export const useUpdateGridDetails = (gridId: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (updatedFields: { name?: string; visibility?: boolean }) =>
      grids.updateGridDetailsApi(gridId, updatedFields),
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
    updateGridDetails: mutation.mutateAsync,
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
      queryClient.invalidateQueries({ queryKey: ["grids"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error("Failed to create grid:", error.response?.data?.message);
    },
  });

  return {
    createGrid: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};
