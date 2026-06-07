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

  mockSites,
  mockUser,
} from "./mock-fixtures";
import type {
  CreateDeviceInput,
  CreateSiteInput,
  DateRange,
  DeviceDeployInput,
  DeviceRecallInput,

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

export const mockAdapter: VertexAdapter = (() => {
  const coreMocks: Partial<VertexAdapter> = {
    async getCurrentUser() {
      return {
        success: true,
        message: "Mock user loaded successfully",
        users: [clone(mockUser)],
      };
    },
    async login(credentials) {
      return {
        success: true,
        message: "Mock login successful",
        token: "mock-jwt-token",
        user: clone(mockUser),
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

    async getDeviceCount(params = {}) {
      const devices = filterDevices({ network: params.network });

      return {
        success: true,
        message: "Mock device count loaded successfully",
        summary: {
          total_monitors: devices.length,
          operational: devices.filter((device) => device.isActive).length,
          transmitting: devices.filter((device) => device.isOnline).length,
          not_transmitting: devices.filter((device) => !device.isOnline).length,
          data_available: devices.filter((device) => device.lastActive).length,
        },
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

    async addMaintenanceLog(deviceName, logData: MaintenanceLogData) {
      return {
        success: true,
        message: `[mock] Maintenance log added for ${deviceName}`,
        data: clone(logData),
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

    async getNetworks() {
      return clone(mockNetworks);
    },
  };

  return new Proxy(coreMocks as VertexAdapter, {
    get(target, prop, receiver) {
      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }
      return async (...args: any[]) => {
        console.warn(`[Mock Adapter] Method '${String(prop)}' is not implemented.`);
        return { success: true, message: `Mocked call to ${String(prop)}` };
      };
    }
  });
})();
