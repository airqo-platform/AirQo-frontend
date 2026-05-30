import type { VertexAdapter } from "./types";

function issue4Method(methodName: string) {
  return async () => {
    throw new Error(
      `AirQo adapter method "${methodName}" will be implemented in Issue 4.`,
    );
  };
}

export function createAirQoAdapter(): VertexAdapter {
  return {
    getCurrentUser: issue4Method("getCurrentUser"),
    getDevices: issue4Method("getDevices"),
    getDevicesByCohorts: issue4Method("getDevicesByCohorts"),
    getDevicesByStatus: issue4Method("getDevicesByStatus"),
    getDevice: issue4Method("getDevice"),
    getMyDevices: issue4Method("getMyDevices"),
    getDeviceCount: issue4Method("getDeviceCount"),
    checkDeviceAvailability: issue4Method("checkDeviceAvailability"),
    claimDevice: issue4Method("claimDevice"),
    deployDevice: issue4Method("deployDevice"),
    recallDevice: issue4Method("recallDevice"),
    createDevice: issue4Method("createDevice"),
    updateDevice: issue4Method("updateDevice"),
    addMaintenanceLog: issue4Method("addMaintenanceLog"),
    updateDeviceGroup: issue4Method("updateDeviceGroup"),
    getDeviceActivities: issue4Method("getDeviceActivities"),
    getSites: issue4Method("getSites"),
    getSitesByCohorts: issue4Method("getSitesByCohorts"),
    getSitesByStatus: issue4Method("getSitesByStatus"),
    getSite: issue4Method("getSite"),
    createSite: issue4Method("createSite"),
    getSitesSummaryCount: issue4Method("getSitesSummaryCount"),
    getSiteActivities: issue4Method("getSiteActivities"),
    getCohorts: issue4Method("getCohorts"),
    getCohort: issue4Method("getCohort"),
    getGroupCohorts: issue4Method("getGroupCohorts"),
    getOriginalCohort: issue4Method("getOriginalCohort"),
    getNetworks: issue4Method("getNetworks"),
    getLatestReadings: issue4Method("getLatestReadings"),
    getReadingHistory: issue4Method("getReadingHistory"),
  } as VertexAdapter;
}
