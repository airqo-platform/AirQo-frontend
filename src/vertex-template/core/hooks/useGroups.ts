import { useQuery, useMutation } from "@tanstack/react-query";
import { adapter as groupsApi } from "../adapters";
import { setError, setGroups } from "../redux/slices/groupsSlice";
import { useDispatch } from "react-redux";
import React from "react";

export const useGroups = () => {
  const dispatch = useDispatch();

  const { data, isLoading, error } = useQuery({
    queryKey: ["groups"],
    queryFn: () => groupsApi.getGroupsApi(),
  });

  React.useEffect(() => {
    if (data?.groups) {
      dispatch(setGroups(data.groups));
    }
    if (error) {
      dispatch(setError(error.message));
    }
  }, [data, error, dispatch]);

  return {
    groups: data?.groups ?? [],
    isLoading,
    error,
  };
};

export const useGroupsByCohort = (cohortId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["groups", "cohort", cohortId],
    queryFn: () => groupsApi.getGroupsByCohortApi(cohortId),
    enabled: !!cohortId,
  });

  return {
    groups: data?.groups ?? [],
    isLoading,
    error,
    refetch,
  };
};

export const useGroupDetails = (groupId: string, options?: object) => {
  return useQuery({
    queryKey: ["groupDetails", groupId],
    queryFn: () => groupsApi.getGroupDetailsApi(groupId),
    enabled: !!groupId,
    ...options,
  });
};

export const useUpdateGroupOnboarding = () => {
  return useMutation({
    mutationFn: ({ groupId, payload }: { groupId: string, payload: { action: 'mark_step_complete' | 'dismiss_checklist'; step_id?: string } }) =>
      groupsApi.updateGroupOnboardingApi(groupId, payload),
  });
};

