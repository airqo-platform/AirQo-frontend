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
import type { UserDetailsResponse } from "@/app/types/users";
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

  getDevices(
    params?: GetDevicesSummaryParams,
    signal?: AbortSignal,
  ): Promise<DevicesSummaryResponse>;
  getDevicesByCohorts(
    params: Partial<Device> & {
      cohort_ids: string[];
      limit?: number;
      skip?: number;
      search?: string;
      sortBy?: string;
      order?: "asc" | "desc";
    },
    signal?: AbortSignal,
  ): Promise<DevicesSummaryResponse>;
  getDevicesByStatus(params: {
    status: string;
    cohort_id?: string[];
    limit?: number;
    skip?: number;
    search?: string;
    sortBy?: string;
    order?: "asc" | "desc";
    network?: string;
  }): Promise<DevicesSummaryResponse>;
  getDevice(id: string): Promise<DeviceDetailsResponse>;
  getMyDevices(
    userId: string,
    groupIds?: string[],
    cohortIds?: string[],
  ): Promise<MyDevicesResponse>;
  getDeviceCount(params?: {
    cohort_id?: string[];
    network?: string;
  }): Promise<DeviceCountResponse>;
  checkDeviceAvailability(
    deviceName: string,
  ): Promise<DeviceAvailabilityResponse>;
  claimDevice(data: DeviceClaimRequest): Promise<DeviceClaimResponse>;
  deployDevice(data: DeviceDeployInput): Promise<{ success: boolean; message: string }>;
  recallDevice(
    deviceName: string,
    recallData: DeviceRecallInput,
  ): Promise<{ success: boolean; message: string }>;
  createDevice(data: CreateDeviceInput): Promise<DeviceCreationResponse>;
  updateDevice(
    deviceId: string,
    deviceData: Partial<Device>,
  ): Promise<{ success: boolean; message: string; updated_device: Device }>;
  addMaintenanceLog(
    deviceName: string,
    logData: MaintenanceLogData,
  ): Promise<{ success: boolean; message: string; data: MaintenanceLogData }>;
  updateDeviceGroup(
    deviceId: string,
    groupName: string,
  ): Promise<DeviceUpdateGroupResponse>;
  getDeviceActivities(
    deviceName: string,
    params?: { page?: number; limit?: number },
  ): Promise<DeviceActivitiesResponse>;

  getSites(
    params: GetSitesSummaryParams,
    signal?: AbortSignal,
  ): Promise<SitesSummaryResponse>;
  getSitesByCohorts(
    params: {
      cohort_ids: string[];
      limit?: number;
      skip?: number;
      search?: string;
      sortBy?: string;
      order?: "asc" | "desc";
      network?: string;
    },
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
  createSite(data: CreateSiteInput): Promise<CreateSiteResponse>;
  getSitesSummaryCount(params?: {
    network?: string;
  }): Promise<SitesSummaryCountResponse>;
  getSiteActivities(
    siteId: string,
    params?: { page?: number; limit?: number },
  ): Promise<DeviceActivitiesResponse>;

  getCohorts(
    params?: GetCohortsSummaryParams,
    signal?: AbortSignal,
  ): Promise<CohortsSummaryResponse>;
  getCohort(id: string): Promise<{ success: boolean; message: string; cohort: Cohort }>;
  getGroupCohorts(groupId: string): Promise<GroupCohortsResponse>;
  getOriginalCohort(cohortId: string): Promise<OriginalCohortResponse>;

  getNetworks(): Promise<Network[]>;
  getLatestReadings(deviceIds: string[]): Promise<Reading[]>;
  getReadingHistory(deviceId: string, range: DateRange): Promise<Reading[]>;
}
