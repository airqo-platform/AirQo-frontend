import type { VertexAdapter } from "./types";
import { devices } from "../apis/devices";
import { sites } from "../apis/sites";
import { users } from "../apis/users";
import { networks } from "../apis/networks";

export function createAirQoAdapter(): VertexAdapter {
  return {
    getCurrentUser: async (userId?: string) => {
      if (!userId) {
        throw new Error("userId is required for AirQo adapter getCurrentUser");
      }
      return users.getUserDetails(userId);
    },
    login: users.loginWithDetails,

    getDevices: devices.getDevicesSummaryApi,
    getDevicesByStatus: devices.getDevicesByStatusApi,
    getDeviceCount: devices.getDeviceCountApi,
    getDevice: devices.getDeviceDetails,
    createDevice: devices.createDevice,
    updateDevice: devices.updateDeviceLocal,
    deployDevice: devices.deployDevice,
    recallDevice: devices.recallDevice,
    addMaintenanceLog: devices.addMaintenanceLog,
    getDeviceActivities: devices.getDeviceActivities,

    getSites: sites.getSitesSummary,
    getSitesByStatus: sites.getSitesByStatusApi,
    getSite: sites.getSiteDetails,
    getSiteActivities: sites.getSiteActivities,

    getNetworks: networks.getNetworksApi,
  };
}
