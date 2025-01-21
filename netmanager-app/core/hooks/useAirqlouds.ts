import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { getGrids } from "@/core/apis/grids";
import { setAirqlouds, setError } from "../redux/slices/analyticsSlice";
import { useAppSelector } from "../redux/hooks";
import { Airqloud } from "@/redux/slices/analyticsSlice";

export const useAirqlouds = () => {
  const dispatch = useDispatch();
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);

  const { data, isLoading, error } = useQuery({
    queryKey: ["airqlouds", activeNetwork?.net_name],
    queryFn: () => airqlouds.getGri(activeNetwork?.net_name || ""),
    enabled: !!activeNetwork?.net_name,
    onSuccess: (data: { airqlouds: Airqloud[] }) => {
      dispatch(setAirqlouds(data.airqlouds));
    },
    onError: (error: Error) => {
      dispatch(setError(error.message));
    },
  });

  return {
    airqlouds: data?.airqlouds || [],
    isLoading,
    error: error as Error | null,
  };
};

