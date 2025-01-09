import createAxiosInstance from "./axiosConfig";
import { DEVICES_MGT_URL } from "../urls";

const axiosInstance = createAxiosInstance();

export const devices = {
  getDeviceSummary: async (networkId: string) => {
    try {
      const response = await axiosInstance.get(
        `${DEVICES_MGT_URL}/summary?network=${networkId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch sites summary"
      );
    }
  },

};
