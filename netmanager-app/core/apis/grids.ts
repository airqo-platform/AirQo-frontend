import createAxiosInstance from "./axiosConfig";
import { DEVICES_MGT_URL } from "../urls";

const axiosInstance = createAxiosInstance();

export const grids = {
  getGrids: async (networkId: string) => { 
    try {
      const response = await axiosInstance.get(
        `${DEVICES_MGT_URL}/grids/summary?network=${networkId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch sites summary"
      );
    }
  },

  getGridsApi: async (networkId: string) => {
    try {
      const response = await axiosInstance.get(
        `${DEVICES_MGT_URL}/grids&network=${networkId}`
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