import axios, { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from "axios";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { beacon as BeaconApi } from "./beacon";

const adapter = vi.fn<AxiosAdapter>();
const window_ = { startDateTime: "2026-10-23T00:00:00.000Z", endDateTime: "2026-11-05T23:59:59.999Z" };

const respondWith = (data: unknown) =>
  adapter.mockImplementation(async (config) => ({
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: config as InternalAxiosRequestConfig,
  }));

const lastRequest = () => adapter.mock.calls[adapter.mock.calls.length - 1][0];

describe("beacon API", () => {
  let beacon: typeof BeaconApi;

  beforeAll(async () => {
    // The client takes its adapter from axios's defaults when the module creates it
    axios.defaults.adapter = adapter;
    ({ beacon } = await import("./beacon"));
  });

  beforeEach(() => {
    adapter.mockReset();
  });

  it("goes through Vertex's proxy and asks it to add the session token", async () => {
    respondWith({ device_id: "d1", issues: [], health_trend: [], days_diagnosed: 0 });

    await beacon.getDeviceIssueSummary("d1");

    const request = lastRequest();
    expect(request.baseURL).toBe("/api/beacon");
    expect(request.url).toBe("/diagnostics/devices/d1/issues");
    expect(request.params).toEqual({ days: 14 });
    expect(request.headers.get("x-auth-type")).toBe("jwt");
    expect(request.headers.get("Authorization")).toBeFalsy();
  });

  it("returns the device's performance row, or null when there is none", async () => {
    respondWith({ data: [{ device_name: "g1", uptime: 64.5, data: [] }] });
    await expect(beacon.getDevicePerformance("g1", window_)).resolves.toMatchObject({ uptime: 64.5 });
    expect(lastRequest().params).toEqual({ device_name: "g1", ...window_, frequency: "hourly" });

    respondWith({ data: [] });
    await expect(beacon.getDevicePerformance("g1", window_)).resolves.toBeNull();
  });

  it("asks for a site's uptime and diagnoses, scoped to the group when there is one", async () => {
    respondWith({ site: { name: "Site" } });

    await expect(beacon.getSiteHealth("s1", window_, "kcca")).resolves.toEqual({ name: "Site" });

    expect(lastRequest().url).toBe("/sites/s1");
    expect(lastRequest().params).toEqual({
      includePerformance: true,
      includeDiagnostics: true,
      ...window_,
      frequency: "hourly",
      group: "kcca",
    });
  });

  it("doesn't ask for a cohort's hourly readings", async () => {
    respondWith({ cohort: { name: "Cohort" } });

    await expect(beacon.getCohortHealth("c1", window_)).resolves.toEqual({ name: "Cohort" });

    expect(lastRequest().url).toBe("/cohorts/synced/c1");
    expect(lastRequest().params).toEqual({ includeDiagnostics: true });
  });

  it("leaves a rejected token to the card: no sign-out event", async () => {
    const onExpired = vi.fn();
    window.addEventListener("auth-token-expired", onExpired);
    adapter.mockImplementation(async (config) => {
      throw new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config as InternalAxiosRequestConfig, null, {
        status: 401,
        statusText: "Unauthorized",
        data: {},
        headers: {},
        config: config as InternalAxiosRequestConfig,
      });
    });

    const error = await beacon.getDeviceIssueSummary("d1").catch((reason) => reason);

    expect(error.response.status).toBe(401);
    expect(onExpired).not.toHaveBeenCalled();
    window.removeEventListener("auth-token-expired", onExpired);
  });
});
