import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { getClientsApi } from "../apis/settings";
import { setClients, setError} from "../redux/slices/clientsSlice";

export const useClients = () => {
  const dispatch = useDispatch();


  const { data, isLoading, error } = useQuery({
    queryKey: ["clients"],
    queryFn: () => getClientsApi(),
    onSuccess: (data: any) => {
      dispatch(setClients(data));
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
