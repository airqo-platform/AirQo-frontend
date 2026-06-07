import { CohortGroupsResponse } from "@/app/types/groups";
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
  getGroupsByCohortApi: async (cohortId: string): Promise<CohortGroupsResponse> => {
    try {
      const response = await createSecureApiClient().get(`/users/groups?cohort_id=${cohortId}`, { headers: { 'X-Auth-Type': 'JWT' } });
      return response.data as CohortGroupsResponse;
    } catch (error) {
      throw error;
    }
  },
  updateGroupOnboardingApi: async (groupId: string, payload: { action: 'mark_step_complete' | 'dismiss_checklist'; step_id?: string }) => {
    try {
      const response = await createSecureApiClient().patch(`/users/groups/${groupId}/onboarding`, payload, { headers: { 'X-Auth-Type': 'JWT' } });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getGroupDetailsApi: async (groupId: string) => {
    try {
      const response = await createSecureApiClient().get(`/users/groups/${groupId}`, { headers: { 'X-Auth-Type': 'JWT' } });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

