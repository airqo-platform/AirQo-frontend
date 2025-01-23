import createAxiosInstance from "./axiosConfig";
import { DEVICES_MGT_URL } from "../urls";
import { AxiosError } from "axios";
import { CreateGrid } from "@/app/types/grids";

const axiosInstance = createAxiosInstance();

interface ErrorResponse {
  message: string;
}

export const grids = {
  getGridsApi: async (networkId: string) => {
    try {
      const response = await axiosInstance.get(
        `${DEVICES_MGT_URL}/grids/summary?network=${networkId}`
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch grids summary"
      );
    }
  },
  getGridDetailsApi: async (gridId: string) => {
    try {
      const response = await axiosInstance.get(
        `${DEVICES_MGT_URL}/grids/${gridId}`
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch grid details"
      );
    }
  },
  updateGridDetailsApi: async (gridId: string) => {
    try {
      const response = await axiosInstance.put(
        `${DEVICES_MGT_URL}/grids/${gridId}`
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to update grid details"
      );
    }
  },
  createGridApi: async (data: CreateGrid) => {
    try {
      const response = await axiosInstance.post(
        `${DEVICES_MGT_URL}/grids`,
        data
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to create grid"
      );
    }
  },
};
