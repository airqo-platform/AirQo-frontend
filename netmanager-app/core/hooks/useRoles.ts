import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { roles } from "../apis/roles";
import { setRoles, setError } from "../redux/slices/rolesSlice";
import { AxiosError } from "axios";

interface ErrorResponse {
  message: string;
}

export const useRoles = () => {
  const dispatch = useAppDispatch();

  const { data, isLoading, error } = useQuery<AxiosError<ErrorResponse>>({
    queryKey: ["roles"],
    queryFn: () => roles.getRolesApi(),
    onSuccess: (data: any) => {
      dispatch(setRoles(data.roles));
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      dispatch(setError(error.message));
    },
  } as UseQueryOptions<AxiosError<ErrorResponse>>);

  return {
    roles: data?.roles ?? [],
    isLoading,
    error,
  };
};

export const useGroupRoles = (groupId: string) => {
  const dispatch = useAppDispatch();

  const { data, isLoading, error } = useQuery({
    queryKey: ["grouproles", groupId],
    queryFn: () => roles.getOrgRolesApi(groupId || ""),
    onSuccess: (data: any) => {
      dispatch(setRoles(data));
    },
    onError: (error: Error) => {
      dispatch(setError(error.message));
    },
  });

  return {
    grproles: data?.group_roles || [],
    isLoading,
    error: error as Error | null,
  };
};
