import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { settings } from "../apis/settings";
import { setUserClients, setError } from "../redux/slices/clientsSlice";
import { useAppSelector } from "../redux/hooks";
import React from "react";

export const useUserClients = () => {
  const dispatch = useDispatch();
  const userDetails = useAppSelector((state) => state.user.userDetails);

  const { data, isLoading, error } = useQuery({
    queryKey: ["clients", userDetails?._id],
    queryFn: () =>
      settings.getUserClientsApi(userDetails?._id || ""),
  });

  React.useEffect(() => {
    if (data) {
      dispatch(setUserClients(data));
    }
    if (error) {
      dispatch(setError(error.message));
    }
  }, [data, error, dispatch]);

  return {
    clients: data?.clients || [],
    isLoading,
    error: error as Error | null,
  };
};


