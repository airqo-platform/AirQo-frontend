import createAxiosInstance from "./axiosConfig";
import { DEVICES_MGT_URL } from "../urls";
import { AxiosError } from "axios";
import type { DevicesSummaryResponse } from "@/app/types/devices";

const axiosInstance = createAxiosInstance();
const axiosInstanceWithTokenAccess = createAxiosInstance(false);

interface ErrorResponse {
  message: string;
}

export interface DeviceStatus {
  _id: string;
  name: string;
  device_number: number;
  latitude: number;
  longitude: number;
  isActive: boolean;
  mobility: boolean;
  status?: "online" | "offline";
  maintenance_status: "good" | "due" | "overdue" | -1;
  powerType: "solar" | "alternator" | "mains";
  nextMaintenance?: { $date: string };
  network: string;
  site_id?: string;
  elapsed_time: number;
}

interface DeviceStatusSummary {
  _id: string;
  created_at: { $date: string };
  total_active_device_count: number;
  count_of_online_devices: number;
  count_of_offline_devices: number;
  count_of_mains: number;
  count_of_solar_devices: number;
  count_of_alternator_devices: number;
  count_due_maintenance: number;
  count_overdue_maintenance: number;
  count_unspecified_maintenance: number;
  online_devices: DeviceStatus[];
  offline_devices: DeviceStatus[];
}

export interface DeviceStatusResponse {
  message: string;
  data: DeviceStatusSummary[];
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

  getDevicesStatus: async (): Promise<DeviceStatusResponse> => {
    // Get today's date and yesterday's date
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const response = await axiosInstance.get(
      `/monitor/devices/status?tenant=airqo&startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  },
};
