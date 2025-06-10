import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setAirqlouds, setError } from "../redux/slices/analyticsSlice";
import { useAppSelector } from "../redux/hooks";
import { grids } from "../apis/grids";
import React from "react";

export const useAirqlouds = () => {
  const dispatch = useDispatch();
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);

  const { data, isLoading, error } = useQuery({
    queryKey: ["airqlouds", activeNetwork?.net_name],
    queryFn: () => grids.getGridsApi(activeNetwork?.net_name || ""),
    enabled: !!activeNetwork?.net_name,
  });

  React.useEffect(() => {
    if (data?.airqlouds) {
      dispatch(setAirqlouds(data.airqlouds));
    }
    if (error) {
      dispatch(setError(error.message));
    }
  }, [data, error, dispatch]);

  return {
    airqlouds: data?.airqlouds || [],
    isLoading,
    error: error as Error | null,
  };
};

