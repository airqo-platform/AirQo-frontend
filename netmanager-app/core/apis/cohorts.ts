import createAxiosInstance from "./axiosConfig";
import { DEVICES_MGT_URL } from "../urls";

const axiosInstance = createAxiosInstance();

export const cohorts = {
  getCohortsSummary: async (networkId: string) => { 
    try {
      const response = await axiosInstance.get(
        `${DEVICES_MGT_URL}/cohorts/summary?network=${networkId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch sites summary"
      );
    }
  },

  getCohortsApi: async (networkId: string) => {
    try {
      const response = await axiosInstance.get(
        `${DEVICES_MGT_URL}/cohorts&network=${networkId}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error fetching grid summary:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch grid summary"
      );
    }
  },

};
