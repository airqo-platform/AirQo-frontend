import createAxiosInstance from "./axiosConfig";
import { SITES_MGT_URL } from "../urls";

const axiosInstance = createAxiosInstance();

export const sites = {
  getSitesSummary: async (networkId: string) => {
    try {
      const response = await axiosInstance.get(
        `${SITES_MGT_URL}/summary?network=${networkId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch sites summary"
      );
    }
  },
};
