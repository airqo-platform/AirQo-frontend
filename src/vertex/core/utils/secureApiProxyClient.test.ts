import { describe, it, expect, vi, beforeEach } from "vitest";
import { clearTokenCache, hasValidToken } from "./secureApiProxyClient";
import { mockGetSession, createMockSession, resetNextAuthMocks } from "@/test/mocks/nextAuth";

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

describe("secureApiProxyClient", () => {
  beforeEach(() => {
    clearTokenCache();
    resetNextAuthMocks();
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
});
