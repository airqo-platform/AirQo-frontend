import { Cohort } from "@/app/types/cohorts";
import createSecureApiClient from "../utils/secureApiProxyClient";

export const cohorts = {
  getCohortsSummary: async (networkId: string) => { 
    try {
      const response = await createSecureApiClient().get(
        `/devices/cohorts/summary?network=${networkId}`,
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
  createCohortFromCohorts: async (payload: { name: string; description?: string; cohort_ids: string[] }) => {
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
  unassignDevicesFromCohort: async (cohortId: string, deviceIds: string[]) => {
    try {
      const response = await createSecureApiClient().delete(
        `/devices/cohorts/${cohortId}/unassign-many-devices`,
        {
          data: { device_ids: deviceIds },
          headers: { 'X-Auth-Type': 'JWT' }
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};