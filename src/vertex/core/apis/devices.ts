import createSecureApiClient from "../utils/secureApiProxyClient";
import { AxiosError } from "axios";
import type { 
  DevicesSummaryResponse,
  DeviceAvailabilityResponse,
  DeviceClaimRequest,
  DeviceClaimResponse,
  MyDevicesResponse,
  DeviceAssignmentRequest,
  DeviceAssignmentResponse,
  Device,
  DeviceCreationResponse,
  DeviceUpdateGroupResponse,
  MaintenanceLogData,
} from "@/app/types/devices";

// Create secure API clients that use the proxy
const jwtApiClient = createSecureApiClient();
const tokenApiClient = createSecureApiClient();

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
      const response = await jwtApiClient.get<DevicesSummaryResponse>(
        `/devices/summary?network=${networkId}&group=${groupName}`,
        { headers: { 'X-Auth-Type': 'JWT' } }
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
      const response = await tokenApiClient.get<DevicesSummaryResponse>(
        `/devices/readings/map`,
        { headers: { 'X-Auth-Type': 'API_TOKEN' } }
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
      const response = await jwtApiClient.get<DevicesSummaryResponse>(
        `/devices/summary?network=${networkId}`,
        { headers: { 'X-Auth-Type': 'JWT' } }
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

    const response = await jwtApiClient.get(
      `/monitor/devices/status?tenant=airqo&startDate=${startDate}&endDate=${endDate}&limit=${limit}`,
      { headers: { 'X-Auth-Type': 'JWT' } }
    );
    return response.data;
  },

  // New API methods for device claiming and management
  checkDeviceAvailability: async (deviceName: string): Promise<DeviceAvailabilityResponse> => {
    try {
      const response = await jwtApiClient.get<DeviceAvailabilityResponse>(
        `/devices/check-availability/${deviceName}`,
        { headers: { 'X-Auth-Type': 'JWT' } }
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
      const response = await jwtApiClient.post<DeviceClaimResponse>(
        `/devices/claim`,
        claimData,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to claim device"
      );
    }
  },

  getMyDevices: async (userId: string): Promise<MyDevicesResponse> => {
    try {
      const params = new URLSearchParams({ user_id: userId });
      
      const response = await jwtApiClient.get<MyDevicesResponse>(
        `/devices/my-devices?${params.toString()}`,
        { headers: { 'X-Auth-Type': 'JWT' } }
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
      const response = await jwtApiClient.post<DeviceAssignmentResponse>(
        `/devices/assign-organization`,
        assignmentData,
        { headers: { 'X-Auth-Type': 'JWT' } }
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
      const response = await jwtApiClient.post<DeviceAssignmentResponse>(
        `/devices/unassign-organization`,
        { device_name: deviceName, user_id: userId },
        { headers: { 'X-Auth-Type': 'JWT' } }
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
      const response = await jwtApiClient.get<DeviceDetailsResponse>(
        `/devices/${deviceId}`,
        { headers: { 'X-Auth-Type': 'JWT' } }
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
      const response = await jwtApiClient.get(
        `/devices/feeds/transform/recent?channel=${deviceNumber}`,
        { headers: { 'X-Auth-Type': 'JWT' } }
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

      const response = await jwtApiClient.post(
        `/devices/activities/deploy/batch`,
        deploymentPayload,
        { headers: { 'X-Auth-Type': 'JWT' } }
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
      const response = await jwtApiClient.post(
        `/devices/activities/recall?deviceName=${deviceName}`,
        recallData,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to recall device"
      );
    }
  },

  createDevice: async (deviceData: {
    long_name: string;
    category: string;
    description?: string;
    network: string;
  }): Promise<DeviceCreationResponse> => {
    try {
      const response = await jwtApiClient.post(
        `/devices`,
        deviceData,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to create device"
      );
    }
  },

  importDevice: async (deviceData: {
    long_name: string;
    category: string;
    network: string;
    device_number?: string;
    writeKey?: string;
    readKey?: string;
    description?: string;
    serial_number: string;
  }): Promise<DeviceCreationResponse> => {
    try {
      const response = await jwtApiClient.post(
        `/devices/soft`,
        deviceData,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to import device"
      );
    }
  },

  updateDeviceLocal: async (deviceId: string, deviceData: Partial<Device>) => {
    try {
      // Remove network field if present
      const { network, ...updateData } = deviceData;
      const response = await jwtApiClient.put(
        `/devices?id=${deviceId}`,
        updateData,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to update device locally"
      );
    }
  },

  updateDeviceGlobal: async (deviceId: string, deviceData: Partial<Device>) => {
    try {
      // Remove network field if present
      const { network, ...updateData } = deviceData;
      const response = await jwtApiClient.put(
        `/devices/soft?id=${deviceId}`,
        updateData,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to update device globally"
      );
    }
  },

  addMaintenanceLog: async (deviceName: string, logData: MaintenanceLogData) => {
    try {
      const response = await jwtApiClient.post(
        `/devices/activities/maintain?deviceName=${deviceName}`,
        logData,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to add maintenance log"
      );
    }
  },

  updateDeviceGroup: async (
    deviceId: string,
    groupName: string
  ): Promise<DeviceUpdateGroupResponse> => {
    try {
      const requestBody = {
        deviceIds: [deviceId],
        updateData: {
          groups: [groupName],
        },
      };
      const response = await jwtApiClient.put(
        `/devices/bulk`,
        requestBody,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to update device group"
      );
    }
  },
};
