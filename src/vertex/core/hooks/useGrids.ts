import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { GetGridsSummaryParams, grids } from "../apis/grids";
import { CreateGrid, Grid, GridsSummaryResponse } from "@/app/types/grids";
import { setError, setGrids } from "../redux/slices/gridsSlice";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../redux/hooks";
import React from "react";
import ReusableToast from "@/components/shared/toast/ReusableToast";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

interface ErrorResponse {
  message: string;
  errors?:
    | { [key: string]: { msg: string } }
    | { message: string };
}

export interface GridListingOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

// Hook to get the grid summary
export const useGrids = (options: GridListingOptions = {}) => {
  const dispatch = useDispatch();
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);

  const { page = 1, limit = 100, search, sortBy, order } = options;
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const skip = (safePage - 1) * safeLimit;

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["grids", activeNetwork?.net_name, { page, limit, search, sortBy, order }] as const,
    queryFn: () => {
      const params: GetGridsSummaryParams = {
        network: activeNetwork?.net_name || "",
        limit: safeLimit,
        skip,
        ...(search && { search }),
        ...(sortBy && { sortBy }),
        ...(order && { order }),
      };
      return grids.getGridsApi(params);
    },
    enabled: !!activeNetwork?.net_name,
    staleTime: 300_000,
    refetchOnWindowFocus: false,
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
    meta: data?.meta,
    isLoading,
    isFetching,
    error,
  };
};

// Hook to get grid details by gridId
export const useGridDetails = (gridId: string) => {
  const dispatch = useDispatch();
  const { data, isLoading, error } = useQuery<GridsSummaryResponse, AxiosError<ErrorResponse>>({
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
  } = useMutation<Grid, AxiosError<ErrorResponse>, { name?: string; visibility?: boolean; admin_level?: string }>({
    mutationFn: (updatedFields: { name?: string; visibility?: boolean; admin_level?: string }) =>
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
        message: `Failed to update grid: ${getApiErrorMessage(error)}`,
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
        message: `Failed to create grid: ${getApiErrorMessage(error)}`,
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
