import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { GetCohortsSummaryParams, cohorts as cohortsApi } from "../apis/cohorts";
import { setCohorts, setError } from "../redux/slices/cohortsSlice";
import { useAppSelector } from "../redux/hooks";
import React from "react";
import ReusableToast from "@/components/shared/toast/ReusableToast";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import { AxiosError } from "axios";
import { CohortsSummaryResponse } from "@/app/types/cohorts";

interface ErrorResponse {
  message: string;
}

export interface CohortListingOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export const useCohorts = (options: CohortListingOptions = {}) => {
  const dispatch = useDispatch();
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);

  const { page = 1, limit = 25, search, sortBy, order } = options;
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const skip = (safePage - 1) * safeLimit;

  const { data, isLoading, isFetching, error } = useQuery<CohortsSummaryResponse, AxiosError<ErrorResponse>>({
    queryKey: ["cohorts", activeNetwork?.net_name, { page, limit, search, sortBy, order }],
    queryFn: () => {
      const params: GetCohortsSummaryParams = {
        network: activeNetwork?.net_name || "",
        limit: safeLimit,
        skip,
        ...(search && { search }),
        ...(sortBy && { sortBy }),
        ...(order && { order }),
      };
      return cohortsApi.getCohortsSummary(params);
    },
    enabled: !!activeNetwork?.net_name,
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });

  return {
    cohorts: data?.cohorts ?? [],
    meta: data?.meta,
    isLoading,
    isFetching,
    error: error as Error | null,
  };
};

type UseCohortDetailsOptions = { enabled?: boolean };

export const useCohortDetails = (cohortId: string, options: UseCohortDetailsOptions = {}) => {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ["cohort-details", cohortId],
    queryFn: async () => {
      const resp = await cohortsApi.getCohortDetailsApi(cohortId);
      const cohort = Array.isArray(resp?.cohorts) ? resp.cohorts[0] : null;
      return cohort;
    },
    enabled: !!cohortId && enabled,
  });
};

export const useUpdateCohortDetails = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cohortId, data }: { cohortId: string; data: Partial<{ name: string; visibility: boolean }> }) =>
      cohortsApi.updateCohortDetailsApi(cohortId, data),
    onSuccess: (data, variables) => {
      ReusableToast({
        message: "Cohort details updated successfully",
        type: "SUCCESS",
      });
      queryClient.invalidateQueries({ queryKey: ["cohort-details", variables.cohortId] });
      queryClient.invalidateQueries({ queryKey: ["cohorts"] });
    },
    onError: (error) => {
      ReusableToast({
        message: `Failed to update cohort: ${getApiErrorMessage(error)}`,
        type: "ERROR",
      });
    }
  });
}; 

export const useCreateCohortWithDevices = () => {
  const queryClient = useQueryClient();
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);

  return useMutation({
    mutationFn: async ({ name, network, deviceIds }: { name: string; network: string; deviceIds: string[] }) => {
      const createResp = await cohortsApi.createCohort({ name, network });
      const cohortId = createResp?.cohort?._id;
      if (!cohortId) throw new Error("Cohort created but missing id");
      if (Array.isArray(deviceIds) && deviceIds.length > 0) {
        await cohortsApi.assignDevicesToCohort(cohortId, deviceIds);
      }
      return createResp;
    },
    onSuccess: (resp, variables) => {
      ReusableToast({
        message: `${variables.name} created${variables.deviceIds?.length ? " and devices assigned" : ""}.`,
        type: "SUCCESS",
      });
      queryClient.invalidateQueries({ queryKey: ["cohorts", activeNetwork?.net_name] });
    },
    onError: (error) => {
      ReusableToast({
        message: `Failed to create cohort: ${getApiErrorMessage(error)}`,
        type: "ERROR",
      });
    },
  });
};

export const useCreateCohortFromCohorts = () => {
  const queryClient = useQueryClient();
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);

  return useMutation({
    mutationFn: ({ name, description, cohort_ids }: { name: string; description?: string; cohort_ids: string[] }) =>
      cohortsApi.createCohortFromCohorts({ name, description, cohort_ids }),
    onSuccess: (data, variables) => {
      ReusableToast({
        message: `Cohort '${variables.name}' created successfully.`,
        type: "SUCCESS",
      });
      queryClient.invalidateQueries({ queryKey: ["cohorts", activeNetwork?.net_name] });
    },
    onError: (error) => {
      ReusableToast({
        message: `Failed to create from cohorts: ${getApiErrorMessage(error)}`,
        type: "ERROR",
      });
    },
  });
};

export const useAssignDevicesToCohort = () => {
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: async ({ 
      cohortId, 
      deviceIds 
    }: { 
      cohortId: string; 
      deviceIds: string[] 
    }) => {
      if (!cohortId || !deviceIds?.length) {
        throw new Error("Cohort ID and at least one device ID are required");
      }
      return cohortsApi.assignDevicesToCohort(cohortId, deviceIds);
    },
    onSuccess: (data, variables) => {
      ReusableToast({
        message: `${variables.deviceIds.length} device(s) assigned to cohort successfully`,
        type: "SUCCESS",
      });
      queryClient.invalidateQueries({ queryKey: ["cohorts"] });
      queryClient.invalidateQueries({ queryKey: ["devices"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["cohort-details", variables.cohortId] });
    },
    onError: (error) => {
      ReusableToast({
        message: `Failed to assign devices: ${getApiErrorMessage(error)}`,
        type: "ERROR",
      });
    },
  });
};

export const useAssignCohortsToGroup = () => {
  const queryClient = useQueryClient();
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);

  return useMutation({
    mutationFn: async ({ groupId, cohortIds }: { groupId: string; cohortIds: string[] }) => {
      if (!groupId) {
        throw new Error("Group ID is required");
      }
      if (!cohortIds?.length) {
        throw new Error("At least one cohort ID is required");
      }
      return cohortsApi.assignCohortsToGroup(groupId, cohortIds);
    },
    onSuccess: (data, variables) => {
      ReusableToast({
        message: `${variables.cohortIds.length} cohort(s) assigned to group successfully`,
        type: "SUCCESS",
      });
      queryClient.invalidateQueries({ queryKey: ["cohorts", activeNetwork?.net_name] });
    },
    onError: (error) => {
      ReusableToast({
        message: `Failed to assign cohorts to group: ${getApiErrorMessage(error)}`,
        type: "ERROR",
      });
    },
  });
};