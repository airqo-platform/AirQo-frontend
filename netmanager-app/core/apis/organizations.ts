import createAxiosInstance from "./axiosConfig";
import { USERS_MGT_URL } from "../urls";
import { AxiosError } from "axios";
import { CreateGrid } from "@/app/types/grids";

const axiosInstance = createAxiosInstance();

interface ErrorResponse {
  message: string;
}

export const grids = {
  getGroupsApi: async () => {
    try {
      const response = await axiosInstance.get(
        `${USERS_MGT_URL}/groups/summary`
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch grids summary"
      );
    }
  },
  getGroupDetailsApi: async (gridId: string) => {
    try {
      const response = await axiosInstance.get(
        `${USERS_MGT_URL}/groups/${gridId}`
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch grid details"
      );
    }
  },
  updateGroupDetailsApi: async (gridId: string) => {
    try {
      const response = await axiosInstance.put(
        `${USERS_MGT_URL}/groups/${gridId}`
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to update grid details"
      );
    }
  },
  createGroupApi: async (data: CreateGrid) => {
    try {
      const response = await axiosInstance.post(
        `${USERS_MGT_URL}/groups`,
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
