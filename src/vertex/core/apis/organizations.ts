import { CohortGroupsResponse } from "@/app/types/groups";
import { secureApiProxy } from "../utils/secureApiProxyClient";

export const groupsApi = {
  getGroupsApi: async () => {
    try {
      const response = await secureApiProxy.get(`/users/groups/summary`, { headers: { 'X-Auth-Type': 'JWT' } });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getGroupsByCohortApi: async (cohortId: string): Promise<CohortGroupsResponse> => {
    try {
      const response = await secureApiProxy.get(`/users/groups?cohort_id=${cohortId}`, { headers: { 'X-Auth-Type': 'JWT' } });
      return response.data as CohortGroupsResponse;
    } catch (error) {
      throw error;
    }
  },

  getGroupDetailsApi: async (groupId: string) => {
    try {
      const response = await secureApiProxy.get(`/users/groups/${groupId}`, { headers: { 'X-Auth-Type': 'JWT' } });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

