import {
    useQuery,
    UseQueryOptions,
  } from "@tanstack/react-query";
import { useAppDispatch } from "../redux/hooks";
import { roles } from "../apis/roles";
import { RolesState, setRoles, setError } from "../redux/slices/rolesSlice";
import { AxiosError } from "axios";

interface ErrorResponse {
  message: string;
}

export const useRoles = () => {
  const dispatch = useAppDispatch();

  const { data, isLoading, error } = useQuery<
    RolesState,
    AxiosError<ErrorResponse>
  >({
    queryKey: ["roles"],
    queryFn: () => roles.getRolesApi(),
    onSuccess: (data: RolesState) => {
      dispatch(setRoles(data.roles));
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      dispatch(setError(error.message));
    },
  }as UseQueryOptions<RolesState, AxiosError<ErrorResponse>>);

  return {
    roles: data?.roles ?? [],
    isLoading,
    error,
  };
};
