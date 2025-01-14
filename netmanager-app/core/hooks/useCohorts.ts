import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { cohorts } from "../apis/cohorts";
import { setCohorts, setError } from "../redux/slices/cohortsSlice";
import { useAppSelector } from "../redux/hooks";
import { Cohort } from "../redux/slices/cohortsSlice";

export const useCohorts = () => {
  const dispatch = useDispatch();
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);

  const { data, isLoading, error } = useQuery<Cohort[]>({
    queryKey: ["cohorts", activeNetwork?.net_name],
    queryFn: () => cohorts.getCohortsApi(activeNetwork?.net_name || ""),
    enabled: !!activeNetwork?.net_name,
    onSuccess: (data: any) => {
      dispatch(setCohorts(data));
    },
    onError: (error: Error) => {
      dispatch(setError(error.message));
    },
  });

  return {
    cohorts: data || [],
    isLoading,
    error: error as Error | null,
  };
};
