import { Cohort } from "@/app/types/cohorts";
import createSecureApiClient from "../utils/secureApiProxyClient";
import { AxiosError } from "axios";

export const cohorts = {
  getCohortsSummary: async (networkId: string) => { 
    try {
      const response = await createSecureApiClient().get(
        `/devices/cohorts/summary?network=${networkId}`,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch cohorts summary"
      );
    }
  },
  getCohortDetailsApi: async (cohortId: string) => {
    try {
      const response = await createSecureApiClient().get(
        `/devices/cohorts/${cohortId}`,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch cohort information"
      );
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
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to create cohort"
      );
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
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to assign devices to cohort"
      );
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
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to update cohort information"
      );
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
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to create cohort from cohorts"
      );
    }
  }
};