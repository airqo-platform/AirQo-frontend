import { LoginCredentials } from "@/app/types/users";
import createSecureApiClient from "../utils/secureApiProxyClient";

export const users = {
  loginUser: async (data: LoginCredentials) => {
    try {
      const response = await createSecureApiClient().post(`/users/loginUser`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  loginWithDetails: async (data: LoginCredentials) => {
    try {
      const response = await createSecureApiClient().post(`/users/login-with-details`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getUserDetails: async (userID: string) => {
    try {
      const response = await createSecureApiClient().get(`/users/${userID}`, {
        headers: { "X-Auth-Type": "JWT" },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getNetworkPermissionsApi: async () => {
    try {
      const response = await createSecureApiClient().get(`/users/permissions`, {
        headers: { "X-Auth-Type": "JWT" },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  assignPermissionsToRoleApi: async (roleID: string, data: { permission_ids: string[] }) => {
    try {
      const response = await createSecureApiClient().post(
        `/users/roles/${roleID}/permissions`,
        data,
        { headers: { "X-Auth-Type": "JWT" } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  removePermissionsFromRoleApi: async (roleID:string, permissionID:string) => {
    try {
      const response = await createSecureApiClient().delete(
        `/users/roles/${roleID}/permissions/${permissionID}`,
        { headers: { "X-Auth-Type": "JWT" } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updatePermissionsToRoleApi: async (roleID: string, data: { permission_ids: string[] }) => {
    try {
      const response = await createSecureApiClient().put(
        `/users/roles/${roleID}/permissions`,
        data,
        { headers: { "X-Auth-Type": "JWT" } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
