import createAxiosInstance from "./axiosConfig";
import { USERS_MGT_URL } from "../urls";
import { AxiosError } from "axios";
import { Role } from "@/app/types/roles";

const axiosInstance = createAxiosInstance();

interface ErrorResponse {
  message: string;
}

export const roles = {
  getRolesApi: async () => {
    try {
      const response = await axiosInstance.get(
        `${USERS_MGT_URL}/roles/summary`
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
      const response = await axiosInstance.get(
        `${USERS_MGT_URL}/roles/${roleId}`
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
      const response = await axiosInstance.get(
        `${USERS_MGT_URL}/groups/${groupId}/roles`
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
      const response = await axiosInstance.put(
        `${USERS_MGT_URL}/roles/${roleId}`, data
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
      const response = await axiosInstance.post(
        `${USERS_MGT_URL}/roles`,
        data
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
