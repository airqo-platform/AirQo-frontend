import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  resolveApiOrigin,
  resolveVersionedApiPath,
  buildServerApiUrl,
  buildBrowserApiUrl,
} from "./api-routing";

describe("api-routing", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe("resolveApiOrigin", () => {
    it("throws error if no API URL environment variables are set", () => {
      delete process.env.API_BASE_URL;
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
      delete process.env.NEXT_PUBLIC_API_URL;
      delete process.env.NEXT_PUBLIC_BASE_URL;
      
      expect(() => resolveApiOrigin()).toThrow(/API base URL is not defined/);
    });

    const envCases = [
      { name: "API_BASE_URL", env: { API_BASE_URL: "https://api.airqo.net" }, expected: "https://api.airqo.net" },
      { name: "NEXT_PUBLIC_API_BASE_URL", env: { NEXT_PUBLIC_API_BASE_URL: "https://api.airqo.net/api/v1/" }, expected: "https://api.airqo.net" },
      { name: "NEXT_PUBLIC_API_URL", env: { NEXT_PUBLIC_API_URL: "https://api.airqo.net/api" }, expected: "https://api.airqo.net" },
      { name: "NEXT_PUBLIC_BASE_URL", env: { NEXT_PUBLIC_BASE_URL: "https://api.airqo.net/" }, expected: "https://api.airqo.net" },
      { name: "prioritizes API_BASE_URL", env: { API_BASE_URL: "https://server.api", NEXT_PUBLIC_API_URL: "https://client.api" }, expected: "https://server.api" },
    ];

    it.each(envCases)("resolves from $name with correct stripping", ({ env, expected }) => {
      delete process.env.API_BASE_URL;
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
      delete process.env.NEXT_PUBLIC_API_URL;
      delete process.env.NEXT_PUBLIC_BASE_URL;
      Object.assign(process.env, env);
      expect(resolveApiOrigin()).toBe(expected);
    });
  });

  describe("resolveVersionedApiPath", () => {
    const pathCases = [
      { name: "empty path", input: "", expected: "/api/v2" },
      { name: "whitespace path", input: "   ", expected: "/api/v2" },
      { name: "absolute URL", input: "https://external.api/data", expected: "https://external.api/data" },
      { name: "already versioned full path", input: "/api/v1/devices", expected: "/api/v1/devices" },
      { name: "already versioned full path without leading slash", input: "api/v1/devices", expected: "/api/v1/devices" },
      { name: "version prefix without api", input: "/v1/devices", expected: "/api/v1/devices" },
      { name: "version prefix without api and slash", input: "v1/devices", expected: "/api/v1/devices" },
      { name: "unversioned path", input: "/devices", expected: "/api/v2/devices" },
      { name: "unversioned path without slash", input: "devices", expected: "/api/v2/devices" },
      { name: "path with query string", input: "/devices?limit=10", expected: "/api/v2/devices?limit=10" },
      { name: "already versioned with query", input: "/api/v1/devices?limit=10", expected: "/api/v1/devices?limit=10" },
    ];

    it.each(pathCases)("resolves $name", ({ input, expected }) => {
      expect(resolveVersionedApiPath(input)).toBe(expected);
    });
  });

  describe("buildServerApiUrl", () => {
    beforeEach(() => {
      process.env.API_BASE_URL = "https://server.api";
    });

    const serverUrlCases = [
      { name: "unversioned path", input: "/devices", expected: "https://server.api/api/v2/devices" },
      { name: "absolute path", input: "https://external.api/data", expected: "https://external.api/data" },
    ];

    it.each(serverUrlCases)("builds $name", ({ input, expected }) => {
      expect(buildServerApiUrl(input)).toBe(expected);
    });
  });

  describe("buildBrowserApiUrl", () => {
    const browserUrlCases = [
      { name: "unversioned path", input: "/devices", expected: "/api/v2/devices" },
      { name: "absolute path", input: "https://external.api/data", expected: "https://external.api/data" },
    ];

    it.each(browserUrlCases)("builds $name", ({ input, expected }) => {
      expect(buildBrowserApiUrl(input)).toBe(expected);
    });
  });
});
