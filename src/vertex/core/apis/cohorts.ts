import { Cohort, CohortsSummaryResponse, GroupCohortsResponse } from "@/app/types/cohorts";
import createSecureApiClient from "../utils/secureApiProxyClient";

export interface GetCohortsSummaryParams {
  network?: string;
  limit?: number;
  skip?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  cohort_id?: string[];
}

export const cohorts = {
  getCohortsSummary: async (params: GetCohortsSummaryParams): Promise<CohortsSummaryResponse> => {
    try {
      const { network, limit, skip, search, sortBy, order } = params;
      const queryParams = new URLSearchParams();

      if (network) queryParams.set("network", network);
      if (limit !== undefined) queryParams.set("limit", String(limit));
      if (skip !== undefined) queryParams.set("skip", String(skip));
      if (search) queryParams.set("search", search);
      if (sortBy) queryParams.set("sortBy", sortBy);
      if (sortBy && order) queryParams.set("order", order);
      if (params.cohort_id && params.cohort_id.length > 0) {
        queryParams.set("cohort_id", params.cohort_id.join(","));
      }

      const response = await createSecureApiClient().get(
        `/devices/cohorts/summary?${queryParams.toString()}`,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getUserCohortsSummary: async (params: GetCohortsSummaryParams): Promise<CohortsSummaryResponse> => {
    try {
      const { network, limit, skip, search, sortBy, order } = params;
      const queryParams = new URLSearchParams();

      if (network) queryParams.set("network", network);
      if (limit !== undefined) queryParams.set("limit", String(limit));
      if (skip !== undefined) queryParams.set("skip", String(skip));
      if (search) queryParams.set("search", search);
      if (sortBy) queryParams.set("sortBy", sortBy);
      if (sortBy && order) queryParams.set("order", order);
      if (params.cohort_id && params.cohort_id.length > 0) {
        queryParams.set("cohort_id", params.cohort_id.join(","));
      }

      const response = await createSecureApiClient().get(
        `/devices/cohorts/users?${queryParams.toString()}`,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getCohortDetailsApi: async (cohortId: string) => {
    try {
      const response = await createSecureApiClient().get(
        `/devices/cohorts/${cohortId}`,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createCohort: async (payload: { name: string; network: string }) => {
    try {
      const response = await createSecureApiClient().post(
        `/devices/cohorts`,
        payload,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data as {
        success: boolean;
        message: string;
        cohort: Cohort & { _id: string; network: string };
      };
    } catch (error) {
      throw error;
    }
  },
  assignCohortsToGroup: async (groupId: string, cohortIds: string[]) => {
    try {
      const response = await createSecureApiClient().post(
        `/users/groups/${groupId}/cohorts/assign`,
        { cohort_ids: cohortIds },
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  assignCohortsToUser: async (userId: string, cohortIds: string[]) => {
    try {
      const response = await createSecureApiClient().post(
        `/users/${userId}/cohorts/assign`,
        { cohort_ids: cohortIds },
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateCohortDetailsApi: async (cohortId: string, cohortData: Partial<Cohort>) => {
    try {
      const response = await createSecureApiClient().put(
        `/devices/cohorts/${cohortId}`,
        cohortData,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createCohortFromCohorts: async (payload: { name: string; description?: string; cohort_ids: string[]; network?: string }) => {
    try {
      const response = await createSecureApiClient().post(
        `/devices/cohorts/from-cohorts`,
        payload,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data as {
        success: boolean;
        message: string;
        data: Cohort & { _id: string };
      };
    } catch (error) {
      throw error;
    }
  },
  assignDevicesToCohort: async (cohortId: string, deviceIds: string[]) => {
    try {
      const response = await createSecureApiClient().post(
        `/devices/cohorts/${cohortId}/assign-devices`,
        { device_ids: deviceIds },
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data as {
        message: string;
        updated_cohort: Cohort & { _id: string };
        success: boolean;
      };
    } catch (error) {
      throw error;
    }
  },
  unassignDevicesFromCohort: async (params: { cohortId: string; device_ids: string[] }) => {
    const { cohortId, device_ids } = params;
    try {
      const response = await createSecureApiClient().delete(
        `/devices/cohorts/${cohortId}/unassign-many-devices`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Auth-Type": "JWT",
          },
          data: { device_ids },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getGroupCohorts: async (groupId: string): Promise<GroupCohortsResponse> => {
    try {
      const response = await createSecureApiClient().get<GroupCohortsResponse>(
        `/users/groups/${groupId}/cohorts`,
        {
          headers: { "X-Auth-Type": "JWT" },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  verifyCohortIdApi: async (cohortId: string) => {
    try {
      if (!cohortId?.trim()) {
        throw new Error('Cohort ID is required');
      }
      const response = await createSecureApiClient().get(
        `/devices/cohorts/verify/${cohortId}`,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data as {
        success: boolean;
        message: string;
        errors?: { message: string };
        cohort?: { name: string };
      };
    } catch (error) {
      throw error;
    }
  },
};