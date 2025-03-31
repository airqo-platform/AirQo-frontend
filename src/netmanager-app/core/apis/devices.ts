import createAxiosInstance from "./axiosConfig";
import { DEVICES_MGT_URL } from "../urls";
import { AxiosError } from "axios";
import type { DevicesSummaryResponse } from "@/app/types/devices";

const axiosInstance = createAxiosInstance();
const axiosInstanceWithTokenAccess = createAxiosInstance(false);

interface ErrorResponse {
  message: string;
}

export const devices = {
  getDevicesSummaryApi: async (networkId: string, groupName: string) => {
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
  getMapReadingsApi: async () => {
    try {
      const response =
        await axiosInstanceWithTokenAccess.get<DevicesSummaryResponse>(
          `${DEVICES_MGT_URL}/readings/map`
        );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch events"
      );
    }
  },

  getDevicesApi: async (networkId: string,) => {
    try {
      const response = await axiosInstance.get<DevicesSummaryResponse>(
        `${DEVICES_MGT_URL}/summary?network=${networkId}`
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
