import createSecureApiClient from "../utils/secureApiProxyClient";

export const groupsApi = {
  getGroupsApi: async () => {
    try {
      const response = await createSecureApiClient().get(`/users/groups/summary`, { headers: { 'X-Auth-Type': 'JWT' } });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
