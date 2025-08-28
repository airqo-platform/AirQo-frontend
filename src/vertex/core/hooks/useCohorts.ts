import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { cohorts as cohortsApi } from "../apis/cohorts";
import { setCohorts, setError } from "../redux/slices/cohortsSlice";
import { useAppSelector } from "../redux/hooks";
import React from "react";
import { toast } from "sonner";

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
  });
}; 