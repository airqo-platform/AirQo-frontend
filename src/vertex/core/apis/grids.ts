import createSecureApiClient from "../utils/secureApiProxyClient";
import { AxiosError } from "axios";
import { CreateGrid } from "@/app/types/grids";

interface ErrorResponse {
  message: string;
}

export const grids = {
  getGridsApi: async (networkId: string) => {
    try {
      const response = await createSecureApiClient().get(
        `/devices/grids/summary?network=${networkId}`,
        { headers: { 'X-Auth-Type': 'JWT' } }
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
      const response = await createSecureApiClient().get(
        `/devices/grids/${gridId}`,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch grid details"
      );
    }
  },
  updateGridDetailsApi: async (
    gridId: string,
    updatePayload: { name?: string; visibility?: boolean }
  ) => {
    try {
      const response = await createSecureApiClient().put(
        `/devices/grids/${gridId}`,
        updatePayload,
        { headers: { 'X-Auth-Type': 'JWT' } }
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
      const response = await createSecureApiClient().post(
        `/devices/grids`,
        data,
        { headers: { 'X-Auth-Type': 'JWT' } }
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
