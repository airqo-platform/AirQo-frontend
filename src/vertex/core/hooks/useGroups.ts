import { useQuery, useMutation } from "@tanstack/react-query";
import { groupsApi } from "../apis/organizations";
import { users } from "../apis/users";
import { setError, setGroups } from "../redux/slices/groupsSlice";
import { useDispatch } from "react-redux";
import React from "react";

export const useGroups = () => {
  const dispatch = useDispatch();

  const { data, isLoading, error } = useQuery({
    queryKey: ["groups"],
    queryFn: () => groupsApi.getGroupsApi(),
  });

  React.useEffect(() => {
    if (data?.groups) {
      dispatch(setGroups(data.groups));
    }
    if (error) {
      dispatch(setError(error.message));
    }
  }, [data, error, dispatch]);

  return {
    groups: data?.groups ?? [],
    isLoading,
    error,
  };
};

interface CreateOrganizationRequestData {
  organization_name: string;
  organization_slug: string;
  contact_email: string;
  contact_name: string;
  contact_phone: string;
  use_case: string;
  organization_type: string;
  country: string;
  branding_settings: {
    logo_url: string;
    primary_color: string;
    secondary_color: string;
  };
}

export const useCreateOrganizationRequest = () => {
    return useMutation({
        mutationFn: (data: CreateOrganizationRequestData) => users.createOrganizationRequestApi(data)
    });
};

export const useCheckSlugAvailability = () => {
    return useMutation({
        mutationFn: (slug: string) => users.checkSlugAvailabilityApi(slug)
    });
};
