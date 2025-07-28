import createAxiosInstance from "./axiosConfig";
import { DEVICES_MGT_URL } from "../urls";
import { AxiosError } from "axios";
import type { 
  DevicesSummaryResponse,
  DeviceAvailabilityResponse,
  DeviceClaimRequest,
  DeviceClaimResponse,
  MyDevicesResponse,
  DeviceAssignmentRequest,
  DeviceAssignmentResponse,
  Device
} from "@/app/types/devices";

const axiosInstance = createAxiosInstance();
const axiosInstanceWithTokenAccess = createAxiosInstance(false);

interface ErrorResponse {
  message: string;
  errors?: {
    message: string;
  }
}

interface DeviceStatusSummary {
  _id: string;
  created_at: string;
  total_active_device_count: number;
  count_of_online_devices: number;
  count_of_offline_devices: number;
  count_of_mains: number;
  count_of_solar_devices: number;
  count_of_alternator_devices: number;
  count_due_maintenance: number;
  count_overdue_maintenance: number;
  count_unspecified_maintenance: number;
  online_devices: Device[];
  offline_devices: Device[];
}

export interface DeviceStatusResponse {
  message: string;
  data: DeviceStatusSummary[];
}

export interface DeviceDetailsResponse {
  message: string;
  data: {
    id: string;
    name: string;
    alias: string;
    mobility: boolean;
    network: string;
    groups: string[];
    serial_number: string;
    authRequired: boolean;
    long_name: string;
    createdAt: string;
    visibility?: boolean;
    isPrimaryInLocation: boolean;
    nextMaintenance: string;
    device_number: number;
    status: string;
    isActive: boolean;
    writeKey: string;
    isOnline: boolean;
    readKey: string;
    pictures: unknown[];
    height: number;
    device_codes: string[];
    category: string;
    cohorts: unknown[];
    description?: string;
    phoneNumber?: string;
    latitude?: string;
    longitude?: string;
    generation_version?: string;
    generation_count?: string;
  };
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
    const limit = 1;

    const response = await axiosInstance.get(
      `/monitor/devices/status?tenant=airqo&startDate=${startDate}&endDate=${endDate}&limit=${limit}`
    );
    return response.data;
  },

  // New API methods for device claiming and management
  checkDeviceAvailability: async (deviceName: string): Promise<DeviceAvailabilityResponse> => {
    try {
      const response = await axiosInstance.get<DeviceAvailabilityResponse>(
        `${DEVICES_MGT_URL}/check-availability/${deviceName}`
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to check device availability"
      );
    }
  },

  claimDevice: async (claimData: DeviceClaimRequest): Promise<DeviceClaimResponse> => {
    try {
      const response = await axiosInstance.post<DeviceClaimResponse>(
        `${DEVICES_MGT_URL}/claim`,
        claimData
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to claim device"
      );
    }
  },

  getMyDevices: async (userId: string, organizationId?: string): Promise<MyDevicesResponse> => {
    try {
      const params = new URLSearchParams({ user_id: userId });
      if (organizationId) {
        params.append('organization_id', organizationId);
      }
      
      const response = await axiosInstance.get<MyDevicesResponse>(
        `${DEVICES_MGT_URL}/my-devices?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch user devices"
      );
    }
  },

  assignDeviceToOrganization: async (assignmentData: DeviceAssignmentRequest): Promise<DeviceAssignmentResponse> => {
    try {
      const response = await axiosInstance.post<DeviceAssignmentResponse>(
        `${DEVICES_MGT_URL}/assign-organization`,
        assignmentData
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to assign device to organization"
      );
    }
  },

  unassignDeviceFromOrganization: async (deviceName: string, userId: string): Promise<DeviceAssignmentResponse> => {
    try {
      const response = await axiosInstance.post<DeviceAssignmentResponse>(
        `${DEVICES_MGT_URL}/unassign-organization`,
        { device_name: deviceName, user_id: userId }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to unassign device from organization"
      );
    }
  },

  getDeviceDetails: async (deviceId: string): Promise<DeviceDetailsResponse> => {
    try {
      const response = await axiosInstance.get<DeviceDetailsResponse>(
        `${DEVICES_MGT_URL}/${deviceId}`
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch device details"
      );
    }
  },

  getDeviceStatusFeed: async (deviceNumber: number) => {
    try {
      const response = await axiosInstance.get(
        `${DEVICES_MGT_URL}/feeds/transform/recent?channel=${deviceNumber}`
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch device status feed"
      );
    }
  },

  deployDevice: async (deviceData: {
    deviceName: string;
    height: string;
    mountType: string;
    powerType: string;
    isPrimaryInLocation: boolean;
    latitude: string;
    longitude: string;
    site_name: string;
    network: string;
    user_id: string;
  }) => {
    try {
      // Transform data to match expected API format
      const deploymentPayload = [{
        date: new Date().toISOString(),
        mountType: deviceData.mountType,
        powerType: deviceData.powerType,
        isPrimaryInLocation: deviceData.isPrimaryInLocation,
        latitude: parseFloat(deviceData.latitude),
        longitude: parseFloat(deviceData.longitude),
        site_name: deviceData.site_name,
        network: deviceData.network,
        deviceName: deviceData.deviceName,
        height: parseFloat(deviceData.height),
        user_id: deviceData.user_id
      }];

      const response = await axiosInstance.post(
        `${DEVICES_MGT_URL}/activities/deploy/batch`,
        deploymentPayload
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to deploy device"
      );
    }
  },

  recallDevice: async (deviceName: string, recallData: {
    recallType: string;
    user_id: string;
    date: string;
  }) => {
    try {
      const response = await axiosInstance.post(
        `${DEVICES_MGT_URL}/activities/recall?deviceName=${deviceName}`,
        recallData
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to recall device"
      );
    }
  }
};
