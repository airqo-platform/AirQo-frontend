import { LoginCredentials } from "@/app/types/users";
import createSecureApiClient from "../utils/secureApiProxyClient";
import axios from "axios";
import { getApiBaseUrl } from "@/lib/envConstants";

export const users = {
  loginWithDetails: async (data: LoginCredentials) => {
    try {
      const apiUrl = getApiBaseUrl();
      const response = await axios.post(`${apiUrl}/users/login-with-details`, data, {
        timeout: 15000, // 15-second timeout for login request
      });
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
  createOrganizationRequestApi: async (data: any) => {
    try {
      const response = await createSecureApiClient().post(
        `/users/org-requests`,
        data,
        { headers: { "X-Auth-Type": "JWT" } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  checkSlugAvailabilityApi: async (slug: string) => {
    try {
      const response = await createSecureApiClient().get(
        `/users/org-requests/slug-availability/${slug}`,
        { headers: { "X-Auth-Type": "JWT" } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
