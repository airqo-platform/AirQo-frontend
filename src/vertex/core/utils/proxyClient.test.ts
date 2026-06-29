import { describe, it, expect, vi, beforeEach } from "vitest";
import { createProxyHandler } from "./proxyClient";
import axios from "axios";
import { NextRequest } from "next/server";
import { mockGetServerSession, createMockSession, resetNextAuthMocks } from "@/test/mocks/nextAuth";
import { mockAxiosSuccess, mockAxiosError } from "@/test/factories/apiResponseFactory";

vi.mock("axios", async () => {
  const actual = await vi.importActual("axios") as any;
  const mockAxios = vi.fn() as any;
  Object.assign(mockAxios, actual.default);
  mockAxios.create = vi.fn().mockReturnValue({
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
    get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn()
  });
  return { 
    ...actual,
    default: mockAxios 
  };
});

vi.mock("next-auth", async () => {
  const { mockGetServerSession } = await import("@/test/mocks/nextAuth");
  return { getServerSession: (...args: any[]) => mockGetServerSession(...args) };
});

vi.mock("@/lib/envConstants", () => ({
  getApiToken: vi.fn().mockReturnValue("test-api-token"),
}));
vi.mock("@/lib/api-routing", () => ({
  buildServerApiUrl: vi.fn((path) => `https://api.airqo.net/v2/${path}`),
}));

describe("proxyClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetNextAuthMocks();
  });

  const createRequest = (method = "GET", url = "http://localhost:3000/api/users", body?: any) => {
    return new NextRequest(url, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: new Headers({
        "content-type": body ? "application/json" : "text/plain",
      })
    });
  };

  it("returns 405 for unsupported methods", async () => {
    const handler = createProxyHandler();
    const req = createRequest("OPTIONS");
    const res = await handler(req, { params: { path: ["users"] } });
    
    expect(res.status).toBe(405);
  });

  it("forwards GET request successfully", async () => {
    const handler = createProxyHandler();
    const req = createRequest("GET", "http://localhost:3000/api/users?status=active");
    
    vi.mocked(axios).mockResolvedValueOnce(mockAxiosSuccess({ users: [] }));
    
    const res = await handler(req, { params: { path: ["users"] } });
    
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      method: "GET",
      url: "https://api.airqo.net/v2/users",
      params: { status: "active" },
    }));
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ users: [] });
  });

  it("handles auth token injection when requiresAuth is true", async () => {
    const handler = createProxyHandler({ requiresAuth: true });
    const req = createRequest("GET");
    
    mockGetServerSession.mockResolvedValueOnce(createMockSession());
    vi.mocked(axios).mockResolvedValueOnce(mockAxiosSuccess({}));
    
    await handler(req, { params: { path: ["users"] } });
    
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: "JWT test-access-token",
      }),
    }));
  });

  it("handles API token injection when requiresApiToken is true", async () => {
    const handler = createProxyHandler({ requiresApiToken: true });
    const req = createRequest("GET");
    
    vi.mocked(axios).mockResolvedValueOnce(mockAxiosSuccess({}));
    
    const res = await handler(req, { params: { path: ["users"] } });
    if (res.status !== 200) {
      console.log(await res.json());
    }
    expect(res.status).toBe(200);
    
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      params: expect.objectContaining({
        token: "test-api-token",
      }),
    }));
  });

  it("forwards POST body", async () => {
    const handler = createProxyHandler();
    const req = createRequest("POST", "http://localhost:3000/api/users", { name: "Test" });
    
    vi.mocked(axios).mockResolvedValueOnce(mockAxiosSuccess({ id: 1 }));
    
    await handler(req, { params: { path: ["users"] } });
    
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      method: "POST",
      data: { name: "Test" },
    }));
  });

  it("handles downstream API errors", async () => {
    const handler = createProxyHandler();
    const req = createRequest("GET");
    
    vi.mocked(axios).mockRejectedValueOnce(mockAxiosError(404, "Not Found"));
    
    const res = await handler(req, { params: { path: ["users"] } });
    
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data).toEqual({ message: "Not Found" });
  });
});
