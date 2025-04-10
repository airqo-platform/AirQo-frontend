import { LoginCredentials } from "@/app/types/users";
import { USERS_MGT_URL } from "../urls";
import createAxiosInstance from "./axiosConfig";

export const users = {
  loginUser: async (data: LoginCredentials) => {
    return await createAxiosInstance()
      .post(`${USERS_MGT_URL}/loginUser`, data)
      .then((response) => response.data);
  },
  getUserDetails: async (userID: string) => {
    return await createAxiosInstance()
      .get(`${USERS_MGT_URL}/${userID}`)
      .then((response) => response.data);
  },
  // addRoleApi: async (data:any) => {
  //   return await createAxiosInstance()
  //     .post(`${USERS_MGT_URL}/roles`, data)
  //     .then((response) => response.data);
  // },
  // getRolesApi: async (networkID:string) => {
  //   return await createAxiosInstance()
  //     .get(`${USERS_MGT_URL}/roles`, { params: { network_id: networkID } })
  //     .then((response) => response.data);
  // },
  // getRoleDetailsApi: async (roleID:string) => {
  //   return await createAxiosInstance()
  //     .get(`${USERS_MGT_URL}/roles/${roleID}`)
  //     .then((response) => response.data);
  // },
  // getRolesSummaryApi: async (networkID:string) => {
  //   return await createAxiosInstance()
  //     .get(`${USERS_MGT_URL}/roles/summary`, { params: { network_id: networkID } })
  //     .then((response) => response.data);
  // },
  // assignUserToRoleApi: async (roleID:string, data:any) => {
  //   return await createAxiosInstance()
  //     .post(`${USERS_MGT_URL}/roles/${roleID}/user`, data)
  //     .then((response) => response.data);
  // },
  // getUsersWithRole: async (roleID:string) => {
  //   return await createAxiosInstance()
  //     .get(`${USERS_MGT_URL}/roles/${roleID}/users`)
  //     .then((response) => response.data);
  // },
  // updateRoleApi: async (roleID:string, data:any) => {
  //   return await createAxiosInstance()
  //     .put(`${USERS_MGT_URL}/roles/${roleID}`, data)
  //     .then((response) => response.data);
  // },
  // deleteRoleApi: async (roleID:string) => {
  //   return await createAxiosInstance()
  //     .delete(`${USERS_MGT_URL}/roles/${roleID}`)
  //     .then((response) => response.data);
  // },
  // createNetworkApi: async (data:any) => {
  //   return await createAxiosInstance()
  //     .post(`${USERS_MGT_URL}/networks`, data)
  //     .then((response) => response.data);
  // },
  // getNetworksApi: async () => {
  //   return await createAxiosInstance()
  //     .get(`${USERS_MGT_URL}/networks`)
  //     .then((response) => response.data);
  // },
  // getNetworkListSummaryApi: async () => {
  //   return await createAxiosInstance()
  //     .get(`${USERS_MGT_URL}/networks/summary`)
  //     .then((response) => response.data);
  // },
  // assignUserNetworkApi: async (networkID:string, userID:string) => {
  //   return await createAxiosInstance()
  //     .put(`${USERS_MGT_URL}/networks/${networkID}/assign-user/${userID}`)
  //     .then((response) => response.data);
  // },
  // getNetworkUsersListApi: async (networkId:string, params:any) => {
  //   return await createAxiosInstance()
  //     .get(`${USERS_MGT_URL}/networks/${networkId}/assigned-users`, { params })
  //     .then((response) => response.data);
  // },
  // getAvailableNetworkUsersListApi: async (networkId:string, params:any) => {
  //   return await createAxiosInstance()
  //     .get(`${USERS_MGT_URL}/networks/${networkId}/available-users`, { params })
  //     .then((response) => response.data);
  // },
  getNetworkPermissionsApi: async () => {
    return await createAxiosInstance()
      .get(`${USERS_MGT_URL}/permissions`)
      .then((response) => response.data);
  },
  assignPermissionsToRoleApi: async (roleID: string, data: { permissionIds: string[] }) => {
    return await createAxiosInstance()
      .post(`${USERS_MGT_URL}/roles/${roleID}/permissions`, data)
      .then((response) => response.data);
  },
  removePermissionsFromRoleApi: async (roleID:string, permissionID:string) => {
    return await createAxiosInstance()
      .delete(`${USERS_MGT_URL}/roles/${roleID}/permissions/${permissionID}`, {})
      .then((response) => response.data);
  },
  updatePermissionsToRoleApi: async (roleID: string, data: { permissionIds: string[] }) => {
    return await createAxiosInstance()
      .put(`${USERS_MGT_URL}/roles/${roleID}/permissions`, data)
      .then((response) => response.data);
  },
  // createTeamApi: async (data:any) => {
  //   return await createAxiosInstance()
  //     .post(`${USERS_MGT_URL}/teams`, data)
  //     .then((response) => response.data);
  // },
  // getTeamsApi: async () => {
  //   return await createAxiosInstance()
  //     .get(`${USERS_MGT_URL}/teams`)
  //     .then((response) => response.data);
  // },
  // getTeamDetailsApi: async (teamID:string) => {
  //   return await createAxiosInstance()
  //     .get(`${USERS_MGT_URL}/teams/${teamID}`)
  //     .then((response) => response.data);
  // },
  // updateTeamApi: async (teamID:string, data:any) => {
  //   return await createAxiosInstance()
  //     .put(`${USERS_MGT_URL}/teams/${teamID}`, data)
  //     .then((response) => response.data);
  // },
  // createAccessToken: async (data:any) => {
  //   return await createAxiosInstance()
  //     .post(`${USERS_MGT_URL}/tokens`, data)
  //     .then((response) => response.data);
  // },
};
