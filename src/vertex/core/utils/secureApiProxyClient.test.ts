import { describe, it, expect, vi, beforeEach } from "vitest";
import { clearTokenCache, hasValidToken } from "./secureApiProxyClient";
import { mockGetSession, createMockSession, resetNextAuthMocks } from "@/test/mocks/nextAuth";
import logger from "@/lib/logger";

const { interceptors } = vi.hoisted(() => {
  let reqCb: any, resSuccCb: any, resErrCb: any;
  return {
    interceptors: {
      setRequest: (cb: any) => { reqCb = cb; },
      setResponse: (succCb: any, errCb: any) => { resSuccCb = succCb; resErrCb = errCb; },
      getRequest: () => reqCb,
      getResponseSuccess: () => resSuccCb,
      getResponseError: () => resErrCb
    }
  };
});

vi.mock("axios", async () => {
  const actual = await vi.importActual("axios") as any;
  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn(() => ({
        interceptors: {
          request: { use: interceptors.setRequest },
          response: { use: interceptors.setResponse }
        },
        get: vi.fn(),
      })),
      isCancel: vi.fn().mockReturnValue(false)
    }
  };
});

vi.mock("next-auth/react", async () => {
  const { mockGetSession } = await import("@/test/mocks/nextAuth");
  return { getSession: (...args: any[]) => mockGetSession(...args) };
});

vi.mock("@/lib/envConstants", () => ({
  getApiToken: vi.fn().mockReturnValue("test-api-token"),
}));

vi.mock("@/lib/logger", () => ({
  default: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

describe("secureApiProxyClient", () => {
  beforeEach(() => {
    clearTokenCache();
    resetNextAuthMocks();
    vi.mocked(logger.error).mockClear();
    vi.mocked(logger.warn).mockClear();
  });

  it("request interceptor adds JWT token to headers", async () => {
    mockGetSession.mockResolvedValueOnce(createMockSession());
    
    const config = { headers: { set: vi.fn() } as any };
    const requestHandler = interceptors.getRequest();
    const updatedConfig = await requestHandler(config);

    expect(updatedConfig.headers.set).toHaveBeenCalledWith("Authorization", "test-access-token");
  });

  it("request interceptor adds API token to URL", async () => {
    const config = { url: "/test", headers: { "X-Auth-Type": "API_TOKEN", set: vi.fn() } as any };
    const requestHandler = interceptors.getRequest();
    const updatedConfig = await requestHandler(config);

    expect(updatedConfig.url).toContain("token=test-api-token");
  });

  it("response error interceptor dispatches network degraded event", async () => {
    const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");
    const error = { code: "ERR_NETWORK", config: { url: "/test", headers: {} }, response: undefined };
    
    const responseErrorHandler = interceptors.getResponseError();
    await expect(responseErrorHandler(error)).rejects.toThrow();

    const degradedEvent = dispatchEventSpy.mock.calls.find(
      (call) => call[0].type === "vertex-network-degraded"
    );
    expect(degradedEvent).toBeDefined();
  });

  it("response error interceptor clears token on 401", async () => {
    mockGetSession.mockResolvedValueOnce(createMockSession());
    expect(await hasValidToken()).toBe(true);

    const error = { response: { status: 401 }, config: { url: "/test", headers: { "x-auth-type": "jwt" } } };
    
    const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");

    const responseErrorHandler = interceptors.getResponseError();
    await expect(responseErrorHandler(error)).rejects.toThrow();

    const authEvent = dispatchEventSpy.mock.calls.find(
      (call) => call[0].type === "auth-token-expired"
    );
    expect(authEvent).toBeDefined();
    
    mockGetSession.mockResolvedValueOnce(null);
    expect(await hasValidToken()).toBe(false);
  });

  it("keeps JWT auth rejections out of the error log", async () => {
    const responseErrorHandler = interceptors.getResponseError();

    for (const status of [401, 403]) {
      const error = { response: { status }, config: { url: "/devices/networks", headers: { "x-auth-type": "jwt" } } };
      await expect(responseErrorHandler(error)).rejects.toBe(error);
    }

    expect(logger.error).not.toHaveBeenCalled();
  });

  it("still reports server errors", async () => {
    const error = {
      message: "Request failed with status code 500",
      response: { status: 500, data: { message: "unable to categorise device" } },
      config: { url: "/devices/feeds/transform/recent", headers: { "x-auth-type": "jwt" } },
    };

    const responseErrorHandler = interceptors.getResponseError();
    await expect(responseErrorHandler(error)).rejects.toBe(error);

    expect(logger.error).toHaveBeenCalledWith(
      "API request failed:",
      expect.objectContaining({ url: "/devices/feeds/transform/recent", status: 500 })
    );
  });

  it("names the request when there is no JWT in the session", async () => {
    mockGetSession.mockResolvedValueOnce(null);

    const config = { url: "/users/permissions", headers: { set: vi.fn() } };
    await interceptors.getRequest()(config);

    expect(logger.warn).toHaveBeenCalledWith("No JWT token found in NextAuth session.", {
      url: "/users/permissions",
    });
  });
});
