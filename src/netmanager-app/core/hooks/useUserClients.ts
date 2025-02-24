import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { settings } from "../apis/settings";
import { setUserClients, setError } from "../redux/slices/clientsSlice";
import { useAppSelector } from "../redux/hooks";

export const useUserClients = () => {
  const dispatch = useDispatch();
  const userDetails = useAppSelector((state) => state.user.userDetails);

  const { data, isLoading, error } = useQuery({
    queryKey: ["clients", userDetails?._id],
    queryFn: () =>
      settings.getUserClientsApi(userDetails?._id || ""),
    onSuccess: (data: any) => {
      dispatch(setUserClients(data));
    },
    onError: (error: Error) => {
      dispatch(setError(error.message));
    },
  });

  return {
    clients: data?.clients || [],
    isLoading,
    error: error as Error | null,
  };
};


