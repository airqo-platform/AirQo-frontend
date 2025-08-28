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
  }
};