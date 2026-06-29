import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getEndpointConfig,
  getAuthOptions,
  validateProxyConfig,
  AUTH_TYPES,
  DEFAULT_ENDPOINT_CONFIG,
} from "./proxyConfig";
import logger from "@/lib/logger";

vi.mock("@/lib/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

describe("proxyConfig", () => {
  describe("getEndpointConfig", () => {
    const endpointCases = [
      { name: "known endpoint (users)", endpoint: "users", expectedAuth: true, expectedToken: false },
      { name: "known endpoint (data)", endpoint: "data", expectedAuth: false, expectedToken: true },
      { name: "known endpoint mixed (user-devices)", endpoint: "user-devices", expectedAuth: true, expectedToken: true },
      { name: "known endpoint public (health)", endpoint: "health", expectedAuth: false, expectedToken: false },
      { name: "unknown endpoint", endpoint: "unknown", expectedAuth: DEFAULT_ENDPOINT_CONFIG.requiresAuth, expectedToken: DEFAULT_ENDPOINT_CONFIG.requiresApiToken },
      { name: "case insensitive", endpoint: "USERS", expectedAuth: true, expectedToken: false },
    ];

    it.each(endpointCases)("returns correct config for $name", ({ endpoint, expectedAuth, expectedToken }) => {
      const config = getEndpointConfig(endpoint);
      expect(config.requiresAuth).toBe(expectedAuth);
      expect(config.requiresApiToken).toBe(expectedToken);
    });
  });

  describe("getAuthOptions", () => {
    const authCases = [
      { name: "explicit NONE", path: ["users"], header: AUTH_TYPES.NONE, expectedAuth: false, expectedToken: false },
      { name: "explicit JWT", path: ["data"], header: AUTH_TYPES.JWT, expectedAuth: true, expectedToken: false },
      { name: "explicit API_TOKEN", path: ["users"], header: AUTH_TYPES.API_TOKEN, expectedAuth: false, expectedToken: true },
      { name: "explicit AUTO fallback to endpoint", path: ["users"], header: AUTH_TYPES.AUTO, expectedAuth: true, expectedToken: false },
      { name: "no header fallback to endpoint (array path)", path: ["data", "123"], header: undefined, expectedAuth: false, expectedToken: true },
      { name: "no header fallback to endpoint (string path)", path: "measurements/recent", header: undefined, expectedAuth: false, expectedToken: true },
      { name: "unknown endpoint fallback", path: ["unknown"], header: undefined, expectedAuth: DEFAULT_ENDPOINT_CONFIG.requiresAuth, expectedToken: DEFAULT_ENDPOINT_CONFIG.requiresApiToken },
      { name: "empty path fallback", path: [], header: undefined, expectedAuth: DEFAULT_ENDPOINT_CONFIG.requiresAuth, expectedToken: DEFAULT_ENDPOINT_CONFIG.requiresApiToken },
      { name: "empty string path fallback", path: "", header: undefined, expectedAuth: DEFAULT_ENDPOINT_CONFIG.requiresAuth, expectedToken: DEFAULT_ENDPOINT_CONFIG.requiresApiToken },
    ];

    it.each(authCases)("resolves auth for $name", ({ path, header, expectedAuth, expectedToken }) => {
      const config = getAuthOptions(path, header);
      expect(config.requiresAuth).toBe(expectedAuth);
      expect(config.requiresApiToken).toBe(expectedToken);
    });
  });

  describe("validateProxyConfig", () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
      originalEnv = process.env;
      process.env = { ...originalEnv };
      vi.clearAllMocks();
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it("returns false and logs error if NEXT_PUBLIC_API_URL is missing", () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      process.env.NEXT_PUBLIC_API_TOKEN = "token";
      expect(validateProxyConfig()).toBe(false);
      expect(logger.error).toHaveBeenCalledWith("NEXT_PUBLIC_API_URL is not set in environment variables");
    });

    it("returns false and logs error if NEXT_PUBLIC_API_URL is invalid", () => {
      process.env.NEXT_PUBLIC_API_URL = "not-a-url";
      process.env.NEXT_PUBLIC_API_TOKEN = "token";
      expect(validateProxyConfig()).toBe(false);
      expect(logger.error).toHaveBeenCalledWith("NEXT_PUBLIC_API_URL is not a valid URL", { url: "not-a-url" });
    });

    it("returns false and logs error if NEXT_PUBLIC_API_TOKEN is missing", () => {
      process.env.NEXT_PUBLIC_API_URL = "https://api.airqo.net";
      delete process.env.NEXT_PUBLIC_API_TOKEN;
      expect(validateProxyConfig()).toBe(false);
      expect(logger.error).toHaveBeenCalledWith("Missing required environment variables for proxy:", { missing: ["NEXT_PUBLIC_API_TOKEN"] });
    });

    it("returns true when configuration is valid", () => {
      process.env.NEXT_PUBLIC_API_URL = "https://api.airqo.net";
      process.env.NEXT_PUBLIC_API_TOKEN = "valid-token";
      expect(validateProxyConfig()).toBe(true);
      expect(logger.error).not.toHaveBeenCalled();
    });
  });
});
