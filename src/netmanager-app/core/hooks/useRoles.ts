import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useAppDispatch } from "../redux/hooks";
import { roles } from "../apis/roles";
import { setRoles, setError } from "../redux/slices/rolesSlice";
import { AxiosError } from "axios";
import { Role } from "@/app/types/roles";
import React from "react";

interface ErrorResponse {
  message: string;
}

interface RolesResponse {
  roles: Role[];
}

export const useRoles = () => {
  const dispatch = useAppDispatch();

  const { data, isLoading, error } = useQuery<RolesResponse, AxiosError<ErrorResponse>>({
    queryKey: ["roles"],
    queryFn: () => roles.getRolesApi(),
    onSuccess: (data: RolesResponse) => {
      dispatch(setRoles(data.roles));
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      dispatch(setError(error.message));
    },
  } as UseQueryOptions<RolesResponse, AxiosError<ErrorResponse>>);

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
  });

  React.useEffect(() => {
    if (data) {
      dispatch(setRoles(data));
    }
    if (error) {
      dispatch(setError(error.message));
    }
  }, [data, error, dispatch]);

  return {
    grproles: data?.group_roles || [],
    isLoading,
    error: error as Error | null,
  };
};
