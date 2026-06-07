import type {
  Device,
  DeviceAvailabilityResponse,
  DeviceClaimRequest,
  DeviceClaimResponse,
  DeviceCreationResponse,
  DevicesSummaryResponse,
  DeviceUpdateGroupResponse,
  MaintenanceLogData,
  MyDevicesResponse,
} from "@/app/types/devices";
import type {
  Cohort,
  CohortsSummaryResponse,
  GroupCohortsResponse,
  OriginalCohortResponse,
} from "@/app/types/cohorts";
import type { Site } from "@/app/types/sites";
import type { UserDetailsResponse, LoginCredentials } from "@/app/types/users";
import type { Network } from "@/core/apis/networks";
import type {
  DeviceActivitiesResponse,
  DeviceCountResponse,
  DeviceDetailsResponse,
  GetDevicesSummaryParams,
} from "@/core/apis/devices";
import type {
  CreateSiteResponse,
  GetSitesSummaryParams,
  SitesSummaryCountResponse,
  SitesSummaryResponse,
} from "@/core/apis/sites";
import type { GetCohortsSummaryParams } from "@/core/apis/cohorts";

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface Reading {
  _id: string;
  device_id: string;
  device_name: string;
  site_id?: string;
  time: string;
  pm2_5: number;
  pm10: number;
  latitude?: number;
  longitude?: number;
}

export interface DeviceDeployInput {
  deviceName: string;
  height: string;
  mountType: string;
  powerType: string;
  isPrimaryInLocation: boolean;
  latitude: string;
  longitude: string;
  site_name?: string;
  site_id?: string;
  network: string;
  user_id: string;
  deployment_date: string | undefined;
  firstName?: string;
  lastName?: string;
  email?: string;
  userName?: string;
}

export interface DeviceRecallInput {
  recallType: string;
  user_id: string;
  date: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  userName?: string;
}

export interface CreateDeviceInput {
  long_name: string;
  category: string;
  description?: string;
  network: string;
  tags?: string[];
}

export interface CreateSiteInput {
  name: string;
  latitude: string;
  longitude: string;
  network: string;
}

export interface VertexAdapter {
  getCurrentUser(userId?: string): Promise<UserDetailsResponse>;
  login?(credentials: LoginCredentials): Promise<any>;

  getDevices(
    params?: GetDevicesSummaryParams,
    signal?: AbortSignal,
  ): Promise<DevicesSummaryResponse>;
  getDevicesByStatus(params: {
    status: string;
    limit?: number;
    skip?: number;
    search?: string;
    sortBy?: string;
    order?: "asc" | "desc";
    network?: string;
  }): Promise<DevicesSummaryResponse>;
  getDeviceCount(params?: { network?: string }): Promise<DeviceCountResponse>;
  getDevice(id: string): Promise<DeviceDetailsResponse>;
  createDevice(data: CreateDeviceInput): Promise<DeviceCreationResponse>;
  updateDevice(
    deviceId: string,
    deviceData: Partial<Device>,
  ): Promise<{ success: boolean; message: string; updated_device: Device }>;
  deployDevice(data: DeviceDeployInput): Promise<{ success: boolean; message: string }>;
  recallDevice(
    deviceName: string,
    recallData: DeviceRecallInput,
  ): Promise<{ success: boolean; message: string }>;
  addMaintenanceLog(
    deviceName: string,
    logData: MaintenanceLogData,
  ): Promise<{ success: boolean; message: string; data: MaintenanceLogData }>;
  getDeviceActivities(
    deviceName: string,
    params?: { page?: number; limit?: number },
  ): Promise<DeviceActivitiesResponse>;

  getSites(
    params: GetSitesSummaryParams,
    signal?: AbortSignal,
  ): Promise<SitesSummaryResponse>;
  getSitesByStatus(params: {
    status: string;
    limit?: number;
    skip?: number;
    search?: string;
    sortBy?: string;
    order?: "asc" | "desc";
    network?: string;
    group?: string;
  }): Promise<SitesSummaryResponse>;
  getSite(id: string): Promise<{ message: string; data: Site }>;
  getSiteActivities(
    siteId: string,
    params?: { page?: number; limit?: number },
  ): Promise<DeviceActivitiesResponse>;

  getNetworks(): Promise<Network[]>;
}

