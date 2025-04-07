import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { settings } from "../apis/settings";
import { setClients, setError} from "../redux/slices/clientsSlice";
import React from "react";

export const useClients = () => {
  const dispatch = useDispatch();

  const { data, isLoading, error } = useQuery({
    queryKey: ["clients"],
    queryFn: () => settings.getClientsApi(),
  });

  React.useEffect(() => {
    if (data) {
      dispatch(setClients(data));
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
