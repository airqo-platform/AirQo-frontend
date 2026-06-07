import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { GetGridsSummaryParams, grids, AdminLevelResponse, AdminLevelsListResponse } from "../apis/grids";
import { CreateGrid, Grid, GridsSummaryResponse } from "@/app/types/grids";
import { setError, setGrids } from "../redux/slices/gridsSlice";
import { useDispatch } from "react-redux";
import React from "react";


import { adapter } from '../adapters';

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
  network?: string;
}

// Hook to get the grid summary
export const useGrids = (options: GridListingOptions = {}) => {
  const dispatch = useDispatch();

  const { page = 1, limit = 100, search, sortBy, order, network } = options;
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const skip = (safePage - 1) * safeLimit;

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["grids", network, { page, limit, search, sortBy, order }] as const,
    queryFn: () => {
      const params: GetGridsSummaryParams = {
        network: network || "",
        limit: safeLimit,
        skip,
        ...(search && { search }),
        ...(sortBy && { sortBy }),
        ...(order && { order }),
      };
      return adapter.getGridsApi(params);
    },
    enabled: true,
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
    queryFn: () => adapter.getGridDetailsApi(gridId),
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

interface UseUpdateGridDetailsOptions {
  onSuccess?: (data: Grid) => void;
  onError?: (error: AxiosError<ErrorResponse>) => void;
}

// Hook to update grid details
export const useUpdateGridDetails = (gridId: string, options?: UseUpdateGridDetailsOptions) => {
  const queryClient = useQueryClient();
  const {
    mutateAsync: updateGridDetails,
    isPending: isLoading,
    error,
  } = useMutation<Grid, AxiosError<ErrorResponse>, { name?: string; visibility?: boolean; admin_level?: string }>({
    mutationFn: (updatedFields: { name?: string; visibility?: boolean; admin_level?: string }) =>
      adapter.updateGridDetailsApi(gridId, updatedFields),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["gridDetails", gridId] });
      queryClient.invalidateQueries({ queryKey: ["grids"] });
      options?.onSuccess?.(data);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      options?.onError?.(error);
    },
  });

  return { updateGridDetails, isLoading, error };
};

interface UseCreateGridOptions {
  onSuccess?: (data: Grid) => void;
  onError?: (error: AxiosError<ErrorResponse>) => void;
}

// Hook to create a new grid
export const useCreateGrid = (options?: UseCreateGridOptions) => {
  const queryClient = useQueryClient();
  const { mutate: createGrid, isPending: isLoading, error } = useMutation<Grid, AxiosError<ErrorResponse>, CreateGrid>({
    mutationFn: async (newGrid: CreateGrid) =>
      await adapter.createGridApi(newGrid),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["grids"] });
      options?.onSuccess?.(data);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      options?.onError?.(error);
    },
  });

  return { createGrid, isLoading, error };
};

interface UseCreateAdminLevelOptions {
  onSuccess?: (data: AdminLevelResponse) => void;
  onError?: (error: AxiosError<ErrorResponse>) => void;
}

export const useCreateAdminLevel = (options?: UseCreateAdminLevelOptions) => {
  const queryClient = useQueryClient();
  const { mutate: createAdminLevel, isPending: isLoading, error } = useMutation<AdminLevelResponse, AxiosError<ErrorResponse>, { name: string }>({
    mutationFn: (data: { name: string }) => adapter.createAdminLevelApi(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-levels"] });
      options?.onSuccess?.(data);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      options?.onError?.(error);
    
    },
  });

  return { createAdminLevel, isLoading, error };
};

export const useAdminLevels = () => {
  const { data, isLoading, error } = useQuery<AdminLevelsListResponse, AxiosError<ErrorResponse>>({
    queryKey: ["admin-levels"],
    queryFn: () => adapter.getAdminLevelsApi(),
    staleTime: 300_000,
  });

  return {
    adminLevels: data?.admin_levels ?? [],
    isLoading,
    error,
  };
};

interface UseUpdateAdminLevelOptions {
  onSuccess?: (data: AdminLevelResponse) => void;
  onError?: (error: AxiosError<ErrorResponse>) => void;
}

export const useUpdateAdminLevel = (options?: UseUpdateAdminLevelOptions) => {
  const queryClient = useQueryClient();
  const { mutate: updateAdminLevel, isPending: isLoading, error } = useMutation<AdminLevelResponse, AxiosError<ErrorResponse>, { levelId: string; data: { name: string } }>({
    mutationFn: ({ levelId, data }) => adapter.updateAdminLevelApi(levelId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-levels"] });
      options?.onSuccess?.(data);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      options?.onError?.(error);
    },
  });

  return { updateAdminLevel, isLoading, error };
};
