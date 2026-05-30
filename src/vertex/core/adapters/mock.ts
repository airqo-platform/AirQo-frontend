import type {
  Device,
  DeviceClaimRequest,
  MaintenanceLogData,
  PaginationMeta,
} from "@/app/types/devices";
import type { Site } from "@/app/types/sites";
import type { Cohort } from "@/app/types/cohorts";
import type { GetDevicesSummaryParams } from "@/core/apis/devices";
import type { GetSitesSummaryParams } from "@/core/apis/sites";
import type { GetCohortsSummaryParams } from "@/core/apis/cohorts";
import {
  mockCohorts,
  mockDeviceActivities,
  mockDevices,
  mockNetworks,
  mockPaginationMeta,
  mockReadings,
  mockSites,
  mockUser,
} from "./mock-fixtures";
import type {
  CreateDeviceInput,
  CreateSiteInput,
  DateRange,
  DeviceDeployInput,
  DeviceRecallInput,
  Reading,
  VertexAdapter,
} from "./types";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function assertNotAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("The operation was aborted.", "AbortError");
  }
}

function pageFromSkip(skip = 0, limit = 100) {
  return Math.floor(skip / Math.max(1, limit)) + 1;
}

function createMeta(total: number, limit = 100, skip = 0): PaginationMeta {
  const safeLimit = Math.max(1, limit);
  return {
    ...mockPaginationMeta,
    total,
    totalResults: total,
    limit: safeLimit,
    skip,
    page: pageFromSkip(skip, safeLimit),
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
  };
}

function paginate<T>(items: T[], limit = 100, skip = 0) {
  return items.slice(skip, skip + Math.max(1, limit));
}

function matchesSearch(search: string | undefined, values: Array<string | undefined>) {
  if (!search?.trim()) return true;
  const needle = search.trim().toLowerCase();
  return values.some((value) => value?.toLowerCase().includes(needle));
}

function filterDevices(
  params: Partial<Device> & GetDevicesSummaryParams = {},
): Device[] {
  const search = params.search;
  const network = typeof params.network === "string" ? params.network : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;

  return mockDevices.filter((device) => {
    if (network && device.network !== network) return false;
    if (status && device.status !== status) return false;
    return matchesSearch(search, [
      device.name,
      device.long_name,
      device.alias,
      device.serial_number,
      device.site_name,
    ]);
  });
}

function filterSites(params: Partial<Site> & Partial<GetSitesSummaryParams>): Site[] {
  const { network, search } = params;

  return mockSites.filter((site) => {
    if (network && site.network !== network) return false;
    return matchesSearch(search, [
      site.name,
      site.formatted_name,
      site.location_name,
      site.search_name,
      site.district,
      site.region,
    ]);
  });
}

function filterCohorts(params: GetCohortsSummaryParams = {}): Cohort[] {
  const { network, search, cohort_id } = params;

  return mockCohorts.filter((cohort) => {
    if (network && cohort.network !== network) return false;
    if (cohort_id?.length && !cohort_id.includes(cohort._id)) return false;
    return matchesSearch(search, [cohort.name, cohort.network]);
  });
}

function readingIsInRange(reading: Reading, range: DateRange) {
  const readingTime = new Date(reading.time).getTime();
  const startTime = new Date(range.startDate).getTime();
  const endTime = new Date(range.endDate).getTime();
  return readingTime >= startTime && readingTime <= endTime;
}

export function createMockAdapter(): VertexAdapter {
  return {
    async getCurrentUser() {
      return {
        success: true,
        message: "Mock user loaded successfully",
        users: [clone(mockUser)],
      };
    },

    async getDevices(params = {}, signal) {
      assertNotAborted(signal);
      const devices = filterDevices(params);
      const limit = params.limit ?? 100;
      const skip = params.skip ?? 0;

      return {
        success: true,
        message: "Mock devices loaded successfully",
        devices: clone(paginate(devices, limit, skip)),
        meta: createMeta(devices.length, limit, skip),
        cache_generated_at: new Date().toISOString(),
      };
    },

    async getDevicesByCohorts(params, signal) {
      assertNotAborted(signal);
      const devices = filterDevices(params).filter((device) =>
        params.cohort_ids.some((cohortId) => device.cohorts.includes(cohortId)),
      );
      const limit = params.limit ?? 100;
      const skip = params.skip ?? 0;

      return {
        success: true,
        message: "Mock cohort devices loaded successfully",
        devices: clone(paginate(devices, limit, skip)),
        meta: createMeta(devices.length, limit, skip),
        cache_generated_at: new Date().toISOString(),
      };
    },

    async getDevicesByStatus(params) {
      const status = params.status.replace(/-/g, " ") as Device["status"];
      const devices = filterDevices({ ...params, status });
      const limit = params.limit ?? 100;
      const skip = params.skip ?? 0;

      return {
        success: true,
        message: "Mock status devices loaded successfully",
        devices: clone(paginate(devices, limit, skip)),
        meta: createMeta(devices.length, limit, skip),
      };
    },

    async getDevice(id) {
      const device = mockDevices.find(
        (item) => item._id === id || item.id === id || item.name === id,
      );

      if (!device) {
        throw new Error(`Mock device not found: ${id}`);
      }

      return {
        message: "Mock device loaded successfully",
        data: clone(device),
      };
    },

    async getMyDevices(userId, groupIds = [], cohortIds = []) {
      const devices = mockDevices.filter((device) => {
        const groupMatch =
          groupIds.length === 0 ||
          groupIds.some((groupId) => device.groups?.includes(groupId));
        const cohortMatch =
          cohortIds.length === 0 ||
          cohortIds.some((cohortId) => device.cohorts.includes(cohortId));
        return groupMatch || cohortMatch || userId === mockUser._id;
      });

      return {
        success: true,
        message: "Mock personal devices loaded successfully",
        devices: clone(devices),
        total_devices: devices.length,
        deployed_devices: devices.filter((device) => device.status === "deployed")
          .length,
      };
    },

    async getDeviceCount(params = {}) {
      const devices = filterDevices({ network: params.network });
      const scopedDevices = params.cohort_id?.length
        ? devices.filter((device) =>
            params.cohort_id?.some((cohortId) =>
              device.cohorts.includes(cohortId),
            ),
          )
        : devices;

      return {
        success: true,
        message: "Mock device count loaded successfully",
        summary: {
          total_monitors: scopedDevices.length,
          operational: scopedDevices.filter((device) => device.isActive).length,
          transmitting: scopedDevices.filter((device) => device.isOnline).length,
          not_transmitting: scopedDevices.filter((device) => !device.isOnline)
            .length,
          data_available: scopedDevices.filter((device) => device.lastActive)
            .length,
        },
      };
    },

    async checkDeviceAvailability(deviceName) {
      const existingDevice = mockDevices.find(
        (device) => device.name.toLowerCase() === deviceName.toLowerCase(),
      );

      return {
        success: true,
        message: existingDevice
          ? "Mock device already exists"
          : "Mock device is available",
        data: {
          available: !existingDevice,
          status: existingDevice?.claim_status || "unclaimed",
        },
      };
    },

    async claimDevice(data: DeviceClaimRequest) {
      return {
        success: true,
        message: "Mock device claimed successfully",
        device: {
          name: data.device_name,
          long_name: data.device_name,
          status: "claimed",
          claim_status: "claimed",
          claimed_at: new Date().toISOString(),
        },
      };
    },

    async deployDevice(data: DeviceDeployInput) {
      return {
        success: true,
        message: `[mock] ${data.deviceName} deployed successfully`,
      };
    },

    async recallDevice(deviceName: string, recallData: DeviceRecallInput) {
      return {
        success: true,
        message: `[mock] ${deviceName} recalled using ${recallData.recallType}`,
      };
    },

    async createDevice(data: CreateDeviceInput) {
      const createdDevice: Device = {
        _id: `mock-${Date.now()}`,
        id: `mock-${Date.now()}`,
        name: data.long_name.toLowerCase().replace(/\s+/g, "_"),
        long_name: data.long_name,
        network: data.network,
        groups: ["system"],
        serial_number: `MOCK-${Date.now()}`,
        createdAt: new Date().toISOString(),
        visibility: false,
        description: data.description,
        isActive: true,
        isOnline: false,
        device_codes: [],
        category: data.category,
        cohorts: [],
        status: "not deployed",
        claim_status: "claimed",
        tags: data.tags,
      };

      return {
        success: true,
        message: "Mock device created successfully",
        created_device: createdDevice,
      };
    },

    async updateDevice(deviceId, deviceData) {
      const existingDevice =
        mockDevices.find(
          (device) =>
            device._id === deviceId || device.id === deviceId || device.name === deviceId,
        ) || mockDevices[0];

      const updatedDevice = { ...existingDevice, ...deviceData };

      return {
        success: true,
        message: "Mock device updated successfully",
        updated_device: clone(updatedDevice),
      };
    },

    async addMaintenanceLog(deviceName, logData: MaintenanceLogData) {
      return {
        success: true,
        message: `[mock] Maintenance log added for ${deviceName}`,
        data: clone(logData),
      };
    },

    async updateDeviceGroup(deviceId, groupName) {
      const device = mockDevices.find(
        (item) => item._id === deviceId || item.id === deviceId,
      );

      return {
        success: true,
        message: `[mock] Device group updated to ${groupName}`,
        updated_device: device ? clone(device) : undefined,
      };
    },

    async getDeviceActivities(deviceName, params = {}) {
      const activities = mockDeviceActivities.filter(
        (activity) => activity.device === deviceName,
      );
      const limit = params.limit ?? 10;
      const page = params.page ?? 1;
      const skip = (page - 1) * limit;

      return {
        success: true,
        message: "Mock device activities loaded successfully",
        site_activities: clone(paginate(activities, limit, skip)),
        meta: {
          total: activities.length,
          limit,
          skip,
          page,
          totalPages: Math.max(1, Math.ceil(activities.length / limit)),
        },
      };
    },

    async getSites(params, signal) {
      assertNotAborted(signal);
      const sites = filterSites(params);
      const limit = params.limit ?? 100;
      const skip = params.skip ?? 0;

      return {
        success: true,
        message: "Mock sites loaded successfully",
        sites: clone(paginate(sites, limit, skip)),
        meta: createMeta(sites.length, limit, skip),
        cache_generated_at: new Date().toISOString(),
      };
    },

    async getSitesByCohorts(params, signal) {
      assertNotAborted(signal);
      const devicesInCohorts = mockDevices.filter((device) =>
        params.cohort_ids.some((cohortId) => device.cohorts.includes(cohortId)),
      );
      const siteIds = new Set(devicesInCohorts.map((device) => device.site_id));
      const sites = mockSites.filter((site) => site._id && siteIds.has(site._id));
      const limit = params.limit ?? 100;
      const skip = params.skip ?? 0;

      return {
        success: true,
        message: "Mock cohort sites loaded successfully",
        sites: clone(paginate(sites, limit, skip)),
        meta: createMeta(sites.length, limit, skip),
        cache_generated_at: new Date().toISOString(),
      };
    },

    async getSitesByStatus(params) {
      const sites = filterSites(params).filter((site) => {
        if (params.status === "online") return site.isOnline;
        if (params.status === "offline") return !site.isOnline;
        return true;
      });
      const limit = params.limit ?? 100;
      const skip = params.skip ?? 0;

      return {
        success: true,
        message: "Mock status sites loaded successfully",
        sites: clone(paginate(sites, limit, skip)),
        meta: createMeta(sites.length, limit, skip),
      };
    },

    async getSite(id) {
      const site = mockSites.find((item) => item._id === id || item.name === id);

      if (!site) {
        throw new Error(`Mock site not found: ${id}`);
      }

      return {
        message: "Mock site loaded successfully",
        data: clone(site),
      };
    },

    async createSite(data: CreateSiteInput) {
      return {
        success: true,
        message: "Mock site created successfully",
        site: {
          _id: `mock-site-${Date.now()}`,
          name: data.name,
          formatted_name: data.name,
          location_name: data.name,
          search_name: data.name,
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          network: data.network,
          groups: ["system"],
          isOnline: false,
          createdAt: new Date().toISOString(),
        },
      };
    },

    async getSitesSummaryCount(params = {}) {
      const sites = filterSites({ network: params.network || "" });

      return {
        message: "Mock site count loaded successfully",
        summary: {
          total_sites: sites.length,
          operational: sites.length,
          transmitting: sites.filter((site) => site.isOnline).length,
          not_transmitting: sites.filter((site) => !site.isOnline).length,
          data_available: sites.filter((site) => site.lastActive).length,
        },
      };
    },

    async getSiteActivities(siteId, params = {}) {
      const activities = mockDeviceActivities.filter(
        (activity) => activity.site_id === siteId,
      );
      const limit = params.limit ?? 10;
      const page = params.page ?? 1;
      const skip = (page - 1) * limit;

      return {
        success: true,
        message: "Mock site activities loaded successfully",
        site_activities: clone(paginate(activities, limit, skip)),
        meta: {
          total: activities.length,
          limit,
          skip,
          page,
          totalPages: Math.max(1, Math.ceil(activities.length / limit)),
        },
      };
    },

    async getCohorts(params = {}, signal) {
      assertNotAborted(signal);
      const cohorts = filterCohorts(params);
      const limit = params.limit ?? 100;
      const skip = params.skip ?? 0;

      return {
        success: true,
        message: "Mock cohorts loaded successfully",
        cohorts: clone(paginate(cohorts, limit, skip)),
        meta: {
          total: cohorts.length,
          limit,
          skip,
          page: pageFromSkip(skip, limit),
          totalPages: Math.max(1, Math.ceil(cohorts.length / limit)),
        },
      };
    },

    async getCohort(id) {
      const cohort = mockCohorts.find((item) => item._id === id || item.name === id);

      if (!cohort) {
        throw new Error(`Mock cohort not found: ${id}`);
      }

      return {
        success: true,
        message: "Mock cohort loaded successfully",
        cohort: clone(cohort),
      };
    },

    async getGroupCohorts() {
      return {
        success: true,
        message: "Mock group cohorts loaded successfully",
        data: mockCohorts.map((cohort) => cohort._id),
      };
    },

    async getOriginalCohort(cohortId) {
      const cohort =
        mockCohorts.find((item) => item._id === cohortId) || mockCohorts[0];

      return {
        success: true,
        message: "Mock original cohort loaded successfully",
        original_cohort: clone(cohort),
      };
    },

    async getNetworks() {
      return clone(mockNetworks);
    },

    async getLatestReadings(deviceIds) {
      const requestedIds = new Set(deviceIds);
      return clone(
        mockReadings.filter(
          (reading) =>
            requestedIds.has(reading.device_id) ||
            requestedIds.has(reading.device_name),
        ),
      );
    },

    async getReadingHistory(deviceId, range) {
      return clone(
        mockReadings.filter(
          (reading) =>
            (reading.device_id === deviceId || reading.device_name === deviceId) &&
            readingIsInRange(reading, range),
        ),
      );
    },
  };
}
