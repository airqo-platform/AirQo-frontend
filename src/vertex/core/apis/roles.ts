import createSecureApiClient from "../utils/secureApiProxyClient";
import { AxiosError } from "axios";
import { Role } from "@/app/types/roles";

interface ErrorResponse {
  message: string;
}

export const roles = {
  getRolesApi: async () => {
    try {
      const response = await createSecureApiClient().get(
        `/users/roles/summary`,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch roles summary"
      );
    }
  },
  getRolesDetailsApi: async (roleId: string) => {
    try {
      const response = await createSecureApiClient().get(
        `/users/roles/${roleId}`,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch role details" 
      );
    }
  },

  getOrgRolesApi: async (groupId: string) => {
    try {
      const response = await createSecureApiClient().get(
        `/users/groups/${groupId}/roles`,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch group roles" 
      );
    }
  },
  updateRoleDetailsApi: async (roleId: string, data: Role) => {
    try {
      const response = await createSecureApiClient().put(
        `/users/roles/${roleId}`, data,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to update role details"
      );
    }
  },
  createRoleApi: async (data: any) => {
    try {
      const response = await createSecureApiClient().post(
        `/users/roles`,
        data,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to create role"
      );
    }
  },
};
