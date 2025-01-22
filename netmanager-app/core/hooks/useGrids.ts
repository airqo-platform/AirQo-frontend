import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { grids } from "../apis/grids";
import { CreateGrid, Grid } from "@/app/types/grids";

interface ErrorResponse {
  message: string;
}

// Response type for the grid summary
interface GridSummaryResponse {
  success: boolean;
  message: string;
  grids: Grid[];
}

// Hook to get the grid summary
export const useGridSummary = (networkId: string) => {
  return useQuery<GridSummaryResponse, AxiosError<ErrorResponse>>(
    ["gridSummary", networkId],
    () => grids.getGridsSummary(networkId),
    {
      staleTime: 5 * 60 * 1000, // Cache results for 5 minutes
    }
  );
};

// Hook to get grid details by gridId
export const useGridDetails = (gridId: string) => {
  return useQuery<Grid, AxiosError<ErrorResponse>>(
    ["gridDetails", gridId],
    () => grids.getGridDetails(gridId),
    {
      staleTime: 5 * 60 * 1000, // Cache results for 5 minutes
    }
  );
};

// Hook to update grid details
export const useUpdateGridDetails = (gridId: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => await grids.updateGridDetails(gridId),
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
    mutationFn: async (newGrid: CreateGrid) => await grids.createGrid(newGrid),
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
