import axios from "axios";
import type {
  BeaconDeviceIssueSummary,
  BeaconDevicePerformance,
  BeaconHealthContainer,
} from "@/app/types/beacon";
import { HEALTH_WINDOW_DAYS, type HealthWindow } from "../utils/beaconHealth";

// Asking for uptime also returns every device's hourly readings: 1.7 MB on staging for 37 devices
// with only 12 reporting. Turn this on once beacon-api accepts includeSeries=false on
// /cohorts/synced/{id}.
const COHORT_UPTIME_READY = false;

/**
 * Beacon's API, through Vertex's own proxy, which adds the session token on the server. The proxy
 * maps /api/beacon/* to the gateway's /api/v2/beacon/*.
 *
 * A plain client on purpose: secureApiProxy treats repeated 401s as a dead session and signs the
 * user out, and posts other failures to Slack. A Beacon failure should only affect its health card.
 */
const beaconClient = axios.create({
  baseURL: "/api/beacon",
  timeout: 30000,
  headers: { "x-auth-type": "jwt" },
});

export const beacon = {
  getDeviceIssueSummary: async (
    deviceId: string,
    signal?: AbortSignal
  ): Promise<BeaconDeviceIssueSummary> => {
    const response = await beaconClient.get<BeaconDeviceIssueSummary>(
      `/diagnostics/devices/${encodeURIComponent(deviceId)}/issues`,
      { params: { days: HEALTH_WINDOW_DAYS }, signal }
    );
    return response.data;
  },

  /** Null when Beacon returns nothing for this device name. */
  getDevicePerformance: async (
    deviceName: string,
    window: HealthWindow,
    signal?: AbortSignal
  ): Promise<BeaconDevicePerformance | null> => {
    const response = await beaconClient.get<{ data?: BeaconDevicePerformance[] }>(
      "/devices/performance",
      {
        params: { device_name: deviceName, ...window, frequency: "hourly" },
        signal,
      }
    );
    return response.data.data?.[0] ?? null;
  },

  getSiteHealth: async (
    siteId: string,
    window: HealthWindow,
    group?: string,
    signal?: AbortSignal
  ): Promise<BeaconHealthContainer> => {
    const response = await beaconClient.get<{ site: BeaconHealthContainer }>(
      `/sites/${encodeURIComponent(siteId)}`,
      {
        params: {
          includePerformance: true,
          includeDiagnostics: true,
          ...window,
          frequency: "hourly",
          group,
        },
        signal,
      }
    );
    return response.data.site;
  },

  getCohortHealth: async (
    cohortId: string,
    window: HealthWindow,
    signal?: AbortSignal
  ): Promise<BeaconHealthContainer> => {
    const response = await beaconClient.get<{ cohort: BeaconHealthContainer }>(
      `/cohorts/synced/${encodeURIComponent(cohortId)}`,
      {
        params: {
          includeDiagnostics: true,
          ...(COHORT_UPTIME_READY
            ? { includePerformance: true, includeSeries: false, ...window, frequency: "hourly" }
            : {}),
        },
        signal,
      }
    );
    return response.data.cohort;
  },
};
