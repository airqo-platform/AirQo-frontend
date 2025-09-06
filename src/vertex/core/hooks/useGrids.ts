import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { grids } from "../apis/grids";
import { CreateGrid, Grid } from "@/app/types/grids";
import { setError, setGrids } from "../redux/slices/gridsSlice";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../redux/hooks";
import React from "react";
import ReusableToast from "@/components/shared/toast/ReusableToast";

interface ErrorResponse {
  message: string;
  errors?: {
    message: string;
  };
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
  const { data, isLoading, error } = useQuery<{ message: string, grids: Grid[] }, AxiosError<ErrorResponse>>({
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
    gridDetails: data?.grids[0],
    isLoading,
    error,
  };
};

// Hook to update grid details
export const useUpdateGridDetails = (gridId: string) => {
  const queryClient = useQueryClient();
  const {
    mutateAsync: updateGridDetails,
    isPending: isLoading,
    error,
  } = useMutation<Grid, AxiosError<ErrorResponse>, { name?: string; visibility?: boolean }>({
    mutationFn: (updatedFields: { name?: string; visibility?: boolean }) =>
      grids.updateGridDetailsApi(gridId, updatedFields),
    onSuccess: () => {
      ReusableToast({
        message: "Grid details updated successfully",
        type: "SUCCESS",
      });
      queryClient.invalidateQueries({ queryKey: ["gridDetails", gridId] });
      queryClient.invalidateQueries({ queryKey: ["grids"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      ReusableToast({
        message: `Failed to update grid: ${error.response?.data?.message || error.message}`,
        type: "ERROR",
      });
    },
  });

  return {
    updateGridDetails,
    isLoading,
    error,
  };
};

// Hook to create a new grid
export const useCreateGrid = () => {
  const queryClient = useQueryClient();
  const { mutate: createGrid, isPending: isLoading, error } = useMutation<Grid, AxiosError<ErrorResponse>, CreateGrid>({
    mutationFn: async (newGrid: CreateGrid) =>
      await grids.createGridApi(newGrid),
    onSuccess: (data) => {
      ReusableToast({
        message: `Grid '${data.name}' created successfully`,
        type: "SUCCESS",
      });
      queryClient.invalidateQueries({ queryKey: ["grids"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      ReusableToast({
        message: `Failed to create grid: ${error.response?.data?.errors?.message || error.response?.data?.message || error.message}`,
        type: "ERROR",
      });
    },
  });

  return {
    createGrid,
    isLoading,
    error,
  };
};
