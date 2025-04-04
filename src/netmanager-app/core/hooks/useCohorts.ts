import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { cohorts } from "../apis/cohorts";
import { setCohorts, setError } from "../redux/slices/cohortsSlice";
import { useAppSelector } from "../redux/hooks";
import React from "react";

export const useCohorts = () => {
  const dispatch = useDispatch();
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);

  const { data, isLoading, error } = useQuery({
    queryKey: ["cohorts", activeNetwork?.net_name],
    queryFn: () => cohorts.getCohortsSummary(activeNetwork?.net_name || ""),
    enabled: !!activeNetwork?.net_name,
  });

  React.useEffect(() => {
    if (data) {
      dispatch(setCohorts(data));
    }
    if (error) {
      dispatch(setError(error.message));
    }
  }, [data, error, dispatch]);

  return {
    cohorts: data?.cohorts || [],
    isLoading,
    error: error as Error | null,
  };
};
