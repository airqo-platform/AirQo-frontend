import { LoginCredentials } from "@/app/types/users";
import createSecureApiClient from "../utils/secureApiProxyClient";

export const users = {
  loginUser: async (data: LoginCredentials) => {
    return await createSecureApiClient()
      .post(`/users/loginUser`, data)
      .then((response) => response.data);
  },
  getUserDetails: async (userID: string) => {
    return await createSecureApiClient()
      .get(`/users/${userID}`, { headers: { 'X-Auth-Type': 'JWT' } })
      .then((response) => response.data);
  },
  getNetworkPermissionsApi: async () => {
    return await createSecureApiClient()
      .get(`/users/permissions`, { headers: { 'X-Auth-Type': 'JWT' } })
      .then((response) => response.data);
  },
  assignPermissionsToRoleApi: async (roleID: string, data: { permission_ids: string[] }) => {
    return await createSecureApiClient()
      .post(`/users/roles/${roleID}/permissions`, data, { headers: { 'X-Auth-Type': 'JWT' } })
      .then((response) => response.data);
  },
  removePermissionsFromRoleApi: async (roleID:string, permissionID:string) => {
    return await createSecureApiClient()
      .delete(`/users/roles/${roleID}/permissions/${permissionID}`, { headers: { 'X-Auth-Type': 'JWT' } })
      .then((response) => response.data);
  },
  updatePermissionsToRoleApi: async (roleID: string, data: { permission_ids: string[] }) => {
    return await createSecureApiClient()
      .put(`/users/roles/${roleID}/permissions`, data, { headers: { 'X-Auth-Type': 'JWT' } })
      .then((response) => response.data);
  },
};
