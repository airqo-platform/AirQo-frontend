import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { cohorts as cohortsApi } from "../apis/cohorts";
import { setCohorts, setError } from "../redux/slices/cohortsSlice";
import { useAppSelector } from "../redux/hooks";
import React from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface ErrorResponse {
  message: string;
  errors?: {
    message: string;
  };
}

export const useCohorts = () => {
  const dispatch = useDispatch();
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);

  const { data, isLoading, error } = useQuery({
    queryKey: ["cohorts", activeNetwork?.net_name],
    queryFn: () => cohortsApi.getCohortsSummary(activeNetwork?.net_name || ""),
    enabled: !!activeNetwork?.net_name,
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
    onSuccess: (_data, variables) => {
      toast("Cohort Details Updated Successfully!");
      queryClient.invalidateQueries({ queryKey: ["cohort-details", variables.cohortId] });
      queryClient.invalidateQueries({ queryKey: ["cohorts"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error("Update Failed", {
        description: error.response?.data?.message || "Failed to update cohort details",
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
    onSuccess: (_resp, variables) => {
      toast("Cohort created", {
        description: `${variables.name} created${variables.deviceIds?.length ? " and devices assigned" : ""}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["cohorts", activeNetwork?.net_name] });
    },
    onError: (error: AxiosError<ErrorResponse> | Error) => {
      const message = (error as AxiosError<ErrorResponse>)?.response?.data?.message || (error as Error).message;
      toast.error("Failed to create cohort", { description: message });
    },
  });
};

export const useCreateCohortFromCohorts = () => {
  const queryClient = useQueryClient();
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);

  return useMutation({
    mutationFn: ({ name, description, cohort_ids }: { name: string; description?: string; cohort_ids: string[] }) =>
      cohortsApi.createCohortFromCohorts({ name, description, cohort_ids }),
    onSuccess: (_resp) => {
      toast("Cohort created from cohorts", {
        description: "The new cohort has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["cohorts", activeNetwork?.net_name] });
    },
    onError: (error: AxiosError<ErrorResponse> | Error) => {
      const message = (error as AxiosError<ErrorResponse>)?.response?.data?.message || (error as Error).message;
      toast.error("Failed to create from cohorts", { description: message });
    },
  });
};