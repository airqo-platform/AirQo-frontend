import createSecureApiClient from "../utils/secureApiProxyClient";
import type {
  DevicesSummaryResponse,
  DeviceAvailabilityResponse,
  DeviceClaimRequest,
  DeviceClaimResponse,
  BulkDeviceClaimRequest,
  BulkDeviceClaimResponse,
  MyDevicesResponse,
  DeviceAssignmentRequest,
  DeviceAssignmentResponse,
  Device,
  DeviceCreationResponse,
  DeviceUpdateGroupResponse,
  MaintenanceLogData,
  DecryptionRequest,
  DecryptionResponse,
  PrepareDeviceResponse,
  BulkPrepareResponse,
  GenerateLabelsResponse,
  ShippingStatusResponse,
  ShippingBatchesResponse,
  ShippingBatchDetailsResponse,
} from "@/app/types/devices";

// Create secure API clients that use the proxy
const jwtApiClient = createSecureApiClient();
const tokenApiClient = createSecureApiClient();
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

export interface DeviceCountSummary {
  total_monitors: number;
  operational: number;
  transmitting: number;
  not_transmitting: number;
  data_available: number;
}

export interface DeviceCountResponse {
  success: boolean;
  message: string;
  summary: DeviceCountSummary;
}

export interface DeviceDetailsResponse {
  message: string;
  data: Device;
}

// Response for device maintenance activities
export interface MaintenanceActivity {
  _id: string;
  activity_codes?: string[];
  tags: string[];
  device: string;
  date: string;
  description?: string;
  activityType: "maintenance";
  nextMaintenance?: string;
  createdAt: string;
  updatedAt: string;
  network?: string;
}

export interface MaintenanceActivitiesResponse {
  success: boolean;
  message: string;
  site_activities: MaintenanceActivity[];
}

export type GetDevicesSummaryParams = Partial<Device> & {
  limit?: number;
  skip?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  group?: string;
};

export const devices = {
  getDevicesSummaryApi: async (params: GetDevicesSummaryParams) => {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.set(key, String(value));
        }
      });

      const response = await jwtApiClient.get<DevicesSummaryResponse>(
        `/devices/summary?${queryParams.toString()}`,
        { headers: { "X-Auth-Type": "JWT" } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDevicesByCohorts: async (params: Partial<Device> & {
    cohort_ids: string[];
    limit?: number;
    skip?: number;
    search?: string;
    sortBy?: string;
    order?: "asc" | "desc";
  }) => {
    try {
      const { cohort_ids, ...rest } = params;
      const queryParams = new URLSearchParams();
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.set(key, String(value));
        }
      });

      const response = await jwtApiClient.post<DevicesSummaryResponse>(
        `/devices/cohorts/devices?${queryParams.toString()}`,
        { cohort_ids },
        { headers: { "X-Auth-Type": "JWT" } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getDeviceCountApi: async (params: {
    cohort_id?: string[];
  }): Promise<DeviceCountResponse> => {
    try {
      const { cohort_id } = params;
      const queryParams = new URLSearchParams();

      if (cohort_id && cohort_id.length > 0) {
        queryParams.set("cohort_id", cohort_id.join(","));
      }

      const response = await jwtApiClient.get<DeviceCountResponse>(
        `/devices/summary/count?${queryParams.toString()}`,
        { headers: { "X-Auth-Type": "JWT" } }
      );
      return response.data;
    } catch (error) {
      throw error;
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
      throw error;
    }
  },

  checkDeviceAvailability: async (deviceName: string): Promise<DeviceAvailabilityResponse> => {
    try {
      const response = await jwtApiClient.get<DeviceAvailabilityResponse>(
        `/devices/check-availability/${deviceName}`,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      throw error;
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
      throw error;
    }
  },

  claimDevicesBulk: async (claimData: BulkDeviceClaimRequest): Promise<BulkDeviceClaimResponse> => {
    try {
      const response = await jwtApiClient.post<BulkDeviceClaimResponse>(
        `/devices/claim/bulk`,
        claimData,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getMyDevices: async (
    userId: string,
    groupIds?: string[],
    cohortIds?: string[]
  ): Promise<MyDevicesResponse> => {
    try {
      const params = new URLSearchParams({ user_id: userId });

      if (groupIds && groupIds.length > 0) {
        params.append("group_ids", groupIds.join(","));
      }

      if (cohortIds && cohortIds.length > 0) {
        params.append("cohort_ids", cohortIds.join(","));
      }

      const response = await jwtApiClient.get<MyDevicesResponse>(
        `/devices/my-devices?${params.toString()}`,
        { headers: { "X-Auth-Type": "JWT" } }
      );
      return response.data;
    } catch (error) {
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
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
    deployment_date: string | undefined;
  }) => {
    try {
      const toIso = (d?: string) =>
        d ? new Date(d).toISOString() : new Date().toISOString();
      const latitude = Number(deviceData.latitude);
      const longitude = Number(deviceData.longitude);
      const height = Number(deviceData.height);
      if (Number.isNaN(latitude) || Number.isNaN(longitude) || Number.isNaN(height)) {
        throw new Error("Invalid numeric values for latitude, longitude or height.");
      }
      const deploymentPayload = [{
        date: toIso(deviceData.deployment_date),
        mountType: deviceData.mountType,
        powerType: deviceData.powerType,
        isPrimaryInLocation: deviceData.isPrimaryInLocation,
        latitude,
        longitude,
        site_name: deviceData.site_name,
        network: deviceData.network,
        deviceName: deviceData.deviceName,
        height,
        user_id: deviceData.user_id
      }];

      const response = await jwtApiClient.post(
        `/devices/activities/deploy/batch`,
        deploymentPayload,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      throw error;
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
      throw error;
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
      throw error;
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
    api_code?: string;
  }): Promise<DeviceCreationResponse> => {
    try {
      const response = await jwtApiClient.post(
        `/devices/soft`,
        deviceData,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateDeviceLocal: async (deviceId: string, deviceData: Partial<Device>) => {
    try {
      const { ...updateData } = deviceData;
      const response = await jwtApiClient.put(
        `/devices?id=${deviceId}`,
        updateData,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateDeviceGlobal: async (deviceId: string, deviceData: Partial<Device>) => {
    try {
      const { ...updateData } = deviceData;
      const response = await jwtApiClient.put(
        `/devices/soft?id=${deviceId}`,
        updateData,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      throw error;
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
      throw error;
    }
  },

  getDeviceMaintenanceLogs: async (
    deviceName: string
  ): Promise<MaintenanceActivitiesResponse> => {
    try {
      const params = new URLSearchParams({
        device: deviceName,
        activity_type: "maintenance",
      });
      const response = await jwtApiClient.get<MaintenanceActivitiesResponse>(
        `/devices/activities?${params.toString()}`,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      throw error;
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
      throw error;
    }
  },

  decryptDeviceKeys: async (
    requestBody: DecryptionRequest[]
  ): Promise<DecryptionResponse> => {
    try {
      const response = await jwtApiClient.post<DecryptionResponse>(
        `/devices/decrypt/bulk`,
        requestBody,
        { headers: { "X-Auth-Type": "JWT" } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  prepareDeviceForShipping: async (
    deviceName: string,
    tokenType: "hex" | "readable" = "hex"
  ): Promise<PrepareDeviceResponse> => {
    try {
      const response = await jwtApiClient.post<PrepareDeviceResponse>(
        `/devices/prepare-for-shipping`,
        { device_name: deviceName, token_type: tokenType },
        { headers: { "X-Auth-Type": "JWT" } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  prepareBulkDevicesForShipping: async (
    deviceNames: string[],
    tokenType: "hex" | "readable" = "hex",
    batchName?: string
  ): Promise<BulkPrepareResponse> => {
    try {
      const requestBody: {
        device_names: string[];
        token_type: string;
        batch_name?: string;
      } = {
        device_names: deviceNames,
        token_type: tokenType,
      };

      if (batchName) {
        requestBody.batch_name = batchName;
      }

      const response = await jwtApiClient.post<BulkPrepareResponse>(
        `/devices/prepare-bulk-for-shipping`,
        requestBody,
        { headers: { "X-Auth-Type": "JWT" } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  generateShippingLabels: async (
    deviceNames: string[]
  ): Promise<GenerateLabelsResponse> => {
    try {
      const response = await jwtApiClient.post<GenerateLabelsResponse>(
        `/devices/generate-shipping-labels`,
        { device_names: deviceNames },
        { headers: { "X-Auth-Type": "JWT" } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getShippingStatus: async (
    deviceNames?: string[]
  ): Promise<ShippingStatusResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (deviceNames && deviceNames.length > 0) {
        queryParams.set("device_names", deviceNames.join(","));
      }

      const response = await jwtApiClient.get<ShippingStatusResponse>(
        `/devices/shipping-status?${queryParams.toString()}`,
        { headers: { "X-Auth-Type": "JWT" } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getOrphanedDevices: async (userId: string) => {
    try {
      const params = new URLSearchParams({ user_id: userId });
      const response = await jwtApiClient.get(
        `/devices/orphaned?${params.toString()}`,
        { headers: { "X-Auth-Type": "JWT" } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getShippingBatches: async (params: {
    limit?: number;
    skip?: number;
  }): Promise<ShippingBatchesResponse> => {
    try {
      const response = await jwtApiClient.get<ShippingBatchesResponse>(
        `/devices/shipping-batches`,
        {
          params,
          headers: { "X-Auth-Type": "JWT" },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getShippingBatchDetails: async (
    batchId: string
  ): Promise<ShippingBatchDetailsResponse> => {
    try {
      const response = await jwtApiClient.get<ShippingBatchDetailsResponse>(
        `/devices/shipping-batches/${batchId}`,
        { headers: { "X-Auth-Type": "JWT" } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
