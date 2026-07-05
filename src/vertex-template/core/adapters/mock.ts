import type {
  Device,
  MaintenanceLogData,
  PaginationMeta,
} from "@/app/types/devices";
import type { Site } from "@/app/types/sites";
import type { Cohort } from "@/app/types/cohorts";
import type { GetDevicesSummaryParams } from "./contracts/devices";
import type { GetSitesSummaryParams } from "./contracts/sites";
import type { GetCohortsSummaryParams } from "./contracts/cohorts";
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
    async login() {
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

    async getMyDevices(userId, groupIds, cohortIds) {
      let devices = mockDevices;

      if (cohortIds && cohortIds.length > 0) {
        devices = devices.filter((device) =>
          device.cohorts?.some(
            (cohort) => typeof cohort === "string" && cohortIds.includes(cohort),
          ),
        );
      } else if (groupIds && groupIds.length > 0) {
        devices = devices.filter((device) =>
          device.groups?.some((group) => groupIds.includes(group)),
        );
      }

      return {
        success: true,
        message: "Mock my-devices loaded successfully",
        devices: clone(devices),
        total_devices: devices.length,
        deployed_devices: devices.filter(
          (device) => device.status === "deployed",
        ).length,
      };
    },

    async getSitesSummaryCount(params = {}) {
      const sites = filterSites(params);

      return {
        message: "Mock site count loaded successfully",
        summary: {
          total_sites: sites.length,
          operational: sites.filter(
            (site) => site.rawOnlineStatus && site.isOnline,
          ).length,
          transmitting: sites.filter((site) => site.rawOnlineStatus === true)
            .length,
          not_transmitting: sites.filter((site) => !site.rawOnlineStatus)
            .length,
          data_available: sites.filter((site) => site.isOnline).length,
        },
      };
    },

    async getDeviceStatusFeed() {
      return {
        isCache: false,
        created_at: new Date().toISOString(),
      };
    },

    async getDevicesByCohorts(params, signal) {
      assertNotAborted(signal);
      const { cohort_ids, limit = 100, skip = 0, ...rest } = params;
      const devices = filterDevices(rest).filter((device) =>
        device.cohorts?.some(
          (cohort) => typeof cohort === "string" && cohort_ids.includes(cohort),
        ),
      );

      return {
        success: true,
        message: "Mock cohort devices loaded successfully",
        devices: clone(paginate(devices, limit, skip)),
        meta: createMeta(devices.length, limit, skip),
      };
    },

    async getSitesByCohorts(params, signal) {
      assertNotAborted(signal);
      const { cohort_ids, limit = 100, skip = 0, ...rest } = params;
      const cohortSiteIds = new Set(
        mockDevices
          .filter((device) =>
            device.cohorts?.some(
              (cohort) =>
                typeof cohort === "string" && cohort_ids.includes(cohort),
            ),
          )
          .map((device) => device.site_id)
          .filter(Boolean),
      );
      const sites = filterSites(rest).filter((site) =>
        cohortSiteIds.has(site._id),
      );

      return {
        success: true,
        message: "Mock cohort sites loaded successfully",
        sites: clone(paginate(sites, limit, skip)),
        meta: createMeta(sites.length, limit, skip),
      };
    },

    async getCohortsSummary(params = {}, signal) {
      assertNotAborted(signal);
      const cohorts = filterCohorts(params);
      const limit = params.limit ?? 100;
      const skip = params.skip ?? 0;

      return {
        success: true,
        message: "Mock cohorts loaded successfully",
        cohorts: clone(paginate(cohorts, limit, skip)),
        meta: createMeta(cohorts.length, limit, skip),
      };
    },

    async getUserCohortsSummary(params = {}, signal) {
      assertNotAborted(signal);
      const cohorts = filterCohorts(params);
      const limit = params.limit ?? 100;
      const skip = params.skip ?? 0;

      return {
        success: true,
        message: "Mock user cohorts loaded successfully",
        cohorts: clone(paginate(cohorts, limit, skip)),
        meta: createMeta(cohorts.length, limit, skip),
      };
    },

    async getCohortDetailsApi(cohortId) {
      const cohort = mockCohorts.find(
        (item) => item._id === cohortId || item.name === cohortId,
      );

      if (!cohort) {
        throw new Error(`Mock cohort not found: ${cohortId}`);
      }

      return {
        success: true,
        message: "Mock cohort loaded successfully",
        cohorts: [clone(cohort)],
      };
    },

    async verifyCohortIdApi(cohortId) {
      const cohort = mockCohorts.find(
        (item) => item._id === cohortId || item.name === cohortId,
      );

      if (!cohort) {
        throw new Error(`Mock cohort not found: ${cohortId}`);
      }

      return {
        success: true,
        message: "Mock cohort verified successfully",
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

    async getPersonalUserCohorts() {
      return {
        success: true,
        message: "Mock personal cohorts loaded successfully",
        cohorts: mockCohorts.map((cohort) => cohort._id),
      };
    },

    async getGroupsApi() {
      return {
        success: true,
        message: "Mock groups loaded successfully",
        groups: clone(mockUser.groups ?? []),
      };
    },

    async getGroupDetailsApi(groupId) {
      const group =
        mockUser.groups?.find((item) => item._id === groupId) ??
        mockUser.groups?.[0];

      return {
        success: true,
        message: "Mock group loaded successfully",
        group: {
          ...clone(group),
          onboarding_checklist: { completed_steps: [], is_dismissed: false },
        },
      };
    },
  };

  // Unimplemented methods fail loudly so contributors can tell what the
  // mock adapter actually supports. Add missing methods to coreMocks above.
  return new Proxy(coreMocks as VertexAdapter, {
    get(target, prop, receiver) {
      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }
      // Runtime protocol probes (e.g. awaiting the adapter, serialization)
      // must not turn into fake adapter methods.
      if (typeof prop === "symbol" || prop === "then" || prop === "toJSON") {
        return undefined;
      }
      return async () => {
        throw new Error(
          `[Mock Adapter] '${String(prop)}' is not implemented. ` +
            "Implement it in core/adapters/mock.ts to support this feature in mock mode.",
        );
      };
    },
  });
})();
