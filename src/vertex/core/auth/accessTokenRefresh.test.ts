import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { JWT } from "next-auth/jwt";
import {
  ACCESS_TOKEN_REFRESH_ERROR,
  getAccessTokenExpiry,
  refreshAccessTokenIfNeeded,
} from "./accessTokenRefresh";

vi.mock("@/lib/api-routing", () => ({
  buildServerApiUrl: (path: string) => `https://api.test/api/v2${path}`,
  buildBrowserApiUrl: (path: string) => `/api/v2${path}`,
}));

vi.mock("@/lib/logger", () => ({
  default: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

const base64Url = (value: object) =>
  Buffer.from(JSON.stringify(value)).toString("base64url");

// Each test uses its own token so refresh results cached by token never leak between tests.
let tokenCounter = 0;
const makeApiToken = (secondsFromNow: number) => {
  tokenCounter += 1;
  const exp = Math.floor(Date.now() / 1000) + secondsFromNow;
  return `${base64Url({ alg: "HS256", typ: "JWT" })}.${base64Url({ exp, id: tokenCounter })}.signature`;
};

const makeSessionToken = (accessToken: string): JWT => ({
  id: "user-1",
  accessToken,
  userName: "user",
  organization: "airqo",
  privilege: "user",
  firstName: "Test",
  lastName: "User",
  country: "UG",
  timezone: "Africa/Kampala",
  phoneNumber: "",
});

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("accessTokenRefresh", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads the API token's expiry with or without the JWT prefix", () => {
    const raw = makeApiToken(3600);
    const expected = Math.floor(Date.now() / 1000) + 3600;

    expect(getAccessTokenExpiry(raw)).toBe(expected);
    expect(getAccessTokenExpiry(`JWT ${raw}`)).toBe(expected);
    expect(getAccessTokenExpiry("not-a-jwt")).toBeUndefined();
  });

  it("leaves a token that is not close to expiry alone", async () => {
    const token = makeSessionToken(`JWT ${makeApiToken(60 * 60)}`);

    await expect(refreshAccessTokenIfNeeded(token)).resolves.toBe(token);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refreshes a token close to expiry and keeps the JWT prefix", async () => {
    const raw = makeApiToken(5 * 60);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, { success: true, token: "JWT renewed-token", expiresIn: 86400 })
    );

    const result = await refreshAccessTokenIfNeeded(makeSessionToken(`JWT ${raw}`));

    expect(result.accessToken).toBe("JWT renewed-token");
    expect(result.error).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.test/api/v2/users/token/refresh");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe(`JWT ${raw}`);
  });

  it("stores a refreshed OAuth token without the prefix, like the original", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, { success: true, token: "JWT renewed-oauth-token" })
    );

    const result = await refreshAccessTokenIfNeeded(makeSessionToken(makeApiToken(-60 * 60)));

    expect(result.accessToken).toBe("renewed-oauth-token");
  });

  it("shares one refresh between concurrent session reads of the same token", async () => {
    const accessToken = `JWT ${makeApiToken(-60)}`;
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { success: true, token: "JWT shared" }));

    const results = await Promise.all([
      refreshAccessTokenIfNeeded(makeSessionToken(accessToken)),
      refreshAccessTokenIfNeeded(makeSessionToken(accessToken)),
      refreshAccessTokenIfNeeded(makeSessionToken(accessToken)),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(results.map((result) => result.accessToken)).toEqual(["JWT shared", "JWT shared", "JWT shared"]);
  });

  it("flags the session when the API refuses to renew the token", async () => {
    const accessToken = `JWT ${makeApiToken(-60 * 60)}`;
    fetchMock.mockResolvedValueOnce(
      jsonResponse(401, { success: false, message: "User from token no longer exists" })
    );

    const result = await refreshAccessTokenIfNeeded(makeSessionToken(accessToken));

    expect(result.error).toBe(ACCESS_TOKEN_REFRESH_ERROR);
    expect(result.accessToken).toBe(accessToken);
  });

  it("keeps the current token without flagging it when the refresh fails transiently", async () => {
    const accessToken = `JWT ${makeApiToken(-60)}`;
    fetchMock.mockResolvedValueOnce(jsonResponse(503, { success: false }));

    const result = await refreshAccessTokenIfNeeded(makeSessionToken(accessToken));

    expect(result.accessToken).toBe(accessToken);
    expect(result.error).toBeUndefined();
  });

  it("clears an earlier refresh error once a refresh succeeds", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { success: true, token: "JWT recovered" }));

    const result = await refreshAccessTokenIfNeeded({
      ...makeSessionToken(`JWT ${makeApiToken(-60)}`),
      error: ACCESS_TOKEN_REFRESH_ERROR,
    });

    expect(result.accessToken).toBe("JWT recovered");
    expect(result.error).toBeUndefined();
  });

  it("does not try to refresh a token it cannot decode", async () => {
    const token = makeSessionToken("JWT opaque-token");

    await expect(refreshAccessTokenIfNeeded(token)).resolves.toBe(token);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
