import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { cohorts as cohortsApi } from "../apis/cohorts";
import { setCohorts, setError } from "../redux/slices/cohortsSlice";
import { useAppSelector } from "../redux/hooks";
import React from "react";
import ReusableToast from "@/components/shared/toast/ReusableToast";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

export const useCohorts = () => {
  const dispatch = useDispatch();
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);

  const { data, isLoading, error } = useQuery({
    queryKey: ["cohorts", activeNetwork?.net_name],
    queryFn: () => cohortsApi.getCohortsSummary(activeNetwork?.net_name || ""),
    enabled: !!activeNetwork?.net_name,
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });

  React.useEffect(() => {
    if (data) {
      dispatch(setCohorts(data));
    }
    if (error) {
      dispatch(setError((error as Error).message));
    }
  }, [data, error, dispatch]);

  return {
    cohorts: data?.cohorts || data?.data || [],
    isLoading,
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
      queryClient.invalidateQueries({ queryKey: ["devices"] });
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