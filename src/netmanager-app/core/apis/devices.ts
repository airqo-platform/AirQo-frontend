import createAxiosInstance from "./axiosConfig";
import { DEVICES_MGT_URL } from "../urls";
import { AxiosError } from "axios";
import type { DevicesSummaryResponse } from "@/app/types/devices";

const axiosInstance = createAxiosInstance();

interface ErrorResponse {
  message: string;
}

export const devices = {
  getDevicesSummary: async (networkId: string, groupName: string) => {
    try {
      const response = await axiosInstance.get<DevicesSummaryResponse>(
        `${DEVICES_MGT_URL}/summary?network=${networkId}&group=${groupName}`
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch devices summary"
      );
    }
  },
};
