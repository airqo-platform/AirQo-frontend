/* eslint-disable @typescript-eslint/no-explicit-any --
 * v1 contract preserves the legacy loose response types; tightening
 * these into precise DTOs is tracked for the v2 adapter contract. */

import type {
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
  BulkImportDeviceResponse,
  DeviceUpdateGroupResponse,
  MaintenanceLogData,
  DecryptionRequest,
  DecryptionResponse,
} from "@/app/types/devices";

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

export interface DeviceActivity {
  _id: string;
  device: string;
  date: string;
  description: string;
  activityType: string;
  activity_by?: {
    user_id: string;
    name: string;
    email: string;
  };
  site_id?: string;
  network?: string;
  nextMaintenance?: string;
  deployment_type?: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface DeviceActivitiesResponse {
  success: boolean;
  message: string;
  site_activities: DeviceActivity[];
  meta: {
    total: number;
    limit: number;
    skip: number;
    page: number;
    totalPages: number;
  };
}

export type GetDevicesSummaryParams = Partial<Device> & {
  limit?: number;
  skip?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  group?: string;
};

/** Device fleet: listing, detail, lifecycle (claim, deploy, recall, maintain), and import. */
export interface DeviceAdapter {
  getDevicesSummaryApi(params: GetDevicesSummaryParams, signal?: AbortSignal): Promise<any>;
  getDevicesByCohorts(params: Partial<Device> & { cohort_ids: string[]; limit?: number; skip?: number; search?: string; sortBy?: string; order?: "asc" | "desc"; }, signal?: AbortSignal): Promise<any>;
  getDevicesByStatusApi(params: { status: string; cohort_id?: string[]; limit?: number; skip?: number; search?: string; sortBy?: string; order?: "asc" | "desc"; network?: string; }): Promise<any>;
  getDeviceCountApi(params: { cohort_id?: string[]; network?: string; }): Promise<DeviceCountResponse>;
  checkDeviceAvailability(deviceName: string): Promise<DeviceAvailabilityResponse>;
  claimDevice(claimData: DeviceClaimRequest): Promise<DeviceClaimResponse>;
  claimDevicesBulk(claimData: BulkDeviceClaimRequest): Promise<BulkDeviceClaimResponse>;
  getMyDevices(userId: string, groupIds?: string[], cohortIds?: string[]): Promise<MyDevicesResponse>;
  assignDeviceToOrganization(assignmentData: DeviceAssignmentRequest): Promise<DeviceAssignmentResponse>;
  unassignDeviceFromOrganization(deviceName: string, userId: string): Promise<DeviceAssignmentResponse>;
  getDeviceDetails(deviceId: string): Promise<DeviceDetailsResponse>;
  getDeviceStatusFeed(deviceNumber: number): Promise<any>;
  deployDevice(deviceData: { deviceName: string; height: string; mountType: string; powerType: string; isPrimaryInLocation: boolean; latitude: string; longitude: string; site_name?: string; site_id?: string; network: string; user_id: string; deployment_date: string | undefined; firstName?: string; lastName?: string; email?: string; userName?: string; }): Promise<any>;
  recallDevice(deviceName: string, recallData: { recallType: string; user_id: string; date: string; firstName?: string; lastName?: string; email?: string; userName?: string; }): Promise<any>;
  createDevice(deviceData: { long_name: string; category: string; description?: string; network: string; tags?: string[]; }): Promise<DeviceCreationResponse>;
  importDevice(deviceData: { long_name: string; category: string; network: string; device_number?: string; writeKey?: string; readKey?: string; description?: string; serial_number: string; api_code?: string; cohort_id?: string; user_id: string; tags?: string[]; }): Promise<DeviceCreationResponse>;
  importBulkDevicesCSV(formData: FormData): Promise<BulkImportDeviceResponse>;
  importBulkDevicesJSON(payload: { user_id: string; cohort_id?: string; network_override?: string; devices: Array<{ long_name: string; serial_number: string; network?: string; latitude?: number; longitude?: number; api_code?: string; category?: string; description?: string; device_number?: number; tags?: string[]; }>; }): Promise<BulkImportDeviceResponse>;
  updateDeviceLocal(deviceId: string, deviceData: Partial<Device>): Promise<any>;
  updateDeviceGlobal(deviceId: string, deviceData: Partial<Device>): Promise<any>;
  addMaintenanceLog(deviceName: string, logData: MaintenanceLogData): Promise<any>;
  bulkUpdateDeviceDetails(deviceIds: string[], updateData: Record<string, unknown>): Promise<DeviceUpdateGroupResponse>;
  decryptDeviceKeys(requestBody: DecryptionRequest[]): Promise<DecryptionResponse>;
  getOrphanedDevices(userId: string): Promise<any>;
  getDeviceActivities(deviceName: string, params?: { page?: number; limit?: number }): Promise<DeviceActivitiesResponse>;
}
