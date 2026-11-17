import { QueryClient, QueryObserver, onlineManager } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/core/providers/query-provider";
import {
  backoffWithJitter,
  checkApiReachable,
  countFailedQueries,
  getQueryRetryDelay,
  isNetworkLevelError,
  refetchFailedQueries,
  shouldRetryQuery,
} from "./queryRecoveryPolicy";

// Shaped like the errors the axios interceptors produce when a request gets no answer.
const networkError = (code = "ERR_NETWORK") =>
  Object.assign(new Error("Network Error"), { code, response: { status: 0 } });
const httpError = (status: number) => Object.assign(new Error("Request failed"), { response: { status } });

afterEach(() => {
  onlineManager.setOnline(true);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("shouldRetryQuery", () => {
  it.each([401, 403, 404, 422, 500, 502, 503, 504])("does not retry a %i", (status) => {
    expect(shouldRetryQuery(0, httpError(status))).toBe(false);
  });

  it("does not retry a cancelled request, even one rewritten to status 0", () => {
    expect(shouldRetryQuery(0, networkError("ERR_CANCELED"))).toBe(false);
  });

  it("retries a dropped connection three times", () => {
    const error = networkError("ERR_NETWORK");
    expect(shouldRetryQuery(2, error)).toBe(true);
    expect(shouldRetryQuery(3, error)).toBe(false);
  });

  it.each(["ECONNABORTED", "ETIMEDOUT"])("retries a %s timeout twice, since each retry waits it out again", (code) => {
    const error = networkError(code);
    expect(shouldRetryQuery(1, error)).toBe(true);
    expect(shouldRetryQuery(2, error)).toBe(false);
    expect(getQueryRetryDelay(0, error)).toBe(1000);
  });

  it("keeps the shorter budget for other failures", () => {
    const error = httpError(400);
    expect(shouldRetryQuery(1, error)).toBe(true);
    expect(shouldRetryQuery(2, error)).toBe(false);
  });

  it("does not give up because the browser reports offline", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    expect(shouldRetryQuery(0, networkError())).toBe(true);
  });
});

describe("isNetworkLevelError", () => {
  it("recognises the status 0 written by the axios interceptors", () => {
    expect(isNetworkLevelError({ response: { status: 0 } })).toBe(true);
  });

  it("counts a timeout as network-level, so it still re-runs after a reconnect", () => {
    expect(isNetworkLevelError(networkError("ECONNABORTED"))).toBe(true);
  });

  it("does not treat an answered request or a plain error as network-level", () => {
    expect(isNetworkLevelError(httpError(500))).toBe(false);
    expect(isNetworkLevelError(new Error("boom"))).toBe(false);
  });
});

describe("retry delays", () => {
  it("spends about 20 seconds on network failures at most", () => {
    vi.spyOn(Math, "random").mockReturnValue(1);
    const total = [0, 1, 2].reduce((sum, attempt) => sum + getQueryRetryDelay(attempt, networkError()), 0);
    expect(total).toBe(21000);
  });

  it("jitters network retries down to half the delay", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(getQueryRetryDelay(0, networkError())).toBe(1500);
  });

  it("leaves other failures on the existing backoff", () => {
    expect(getQueryRetryDelay(0, httpError(400))).toBe(1000);
    expect(getQueryRetryDelay(1, httpError(400))).toBe(2000);
    expect(getQueryRetryDelay(9, httpError(400))).toBe(10000);
  });

  it("caps the backoff", () => {
    vi.spyOn(Math, "random").mockReturnValue(1);
    expect(backoffWithJitter(20, 1000, 30000)).toBe(30000);
  });
});

describe("refetchFailedQueries", () => {
  const mountFailedQuery = async (client: QueryClient, key: string, error: unknown) => {
    const queryFn = vi.fn().mockRejectedValueOnce(error).mockResolvedValue("ok");
    const observer = new QueryObserver(client, { queryKey: [key], queryFn, retry: false, staleTime: Infinity });
    const unsubscribe = observer.subscribe(() => undefined);
    await vi.waitFor(() => expect(client.getQueryState([key])?.status).toBe("error"));
    return { queryFn, unsubscribe };
  };

  it("re-runs network and server failures but not 4xx rejections", async () => {
    const client = new QueryClient();
    const network = await mountFailedQuery(client, "network", networkError());
    const server = await mountFailedQuery(client, "server", httpError(503));
    const forbidden = await mountFailedQuery(client, "forbidden", httpError(403));

    expect(countFailedQueries(client)).toBe(2);
    await refetchFailedQueries(client);

    expect(network.queryFn).toHaveBeenCalledTimes(2);
    expect(server.queryFn).toHaveBeenCalledTimes(2);
    expect(forbidden.queryFn).toHaveBeenCalledTimes(1);
    expect(countFailedQueries(client)).toBe(0);
  });

  it("ignores queries with nothing mounted", async () => {
    const client = new QueryClient();
    const { queryFn, unsubscribe } = await mountFailedQuery(client, "gone", networkError());
    unsubscribe();

    await refetchFailedQueries(client);

    expect(queryFn).toHaveBeenCalledTimes(1);
  });

  it("re-runs a failed query that still holds fresh data", async () => {
    const client = new QueryClient();
    client.setQueryData(["fresh"], "cached");
    const queryFn = vi.fn().mockRejectedValueOnce(networkError()).mockResolvedValue("ok");
    const observer = new QueryObserver(client, { queryKey: ["fresh"], queryFn, retry: false, staleTime: Infinity });
    const unsubscribe = observer.subscribe(() => undefined);
    await client.refetchQueries({ queryKey: ["fresh"] });
    expect(client.getQueryState(["fresh"])?.status).toBe("error");

    await refetchFailedQueries(client);

    expect(client.getQueryData(["fresh"])).toBe("ok");
    unsubscribe();
  });

  it("does not start a second request for a query already refetching", async () => {
    const client = new QueryClient();
    const { queryFn, unsubscribe } = await mountFailedQuery(client, "busy", networkError());
    queryFn.mockReset();
    queryFn.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve("ok"), 20)));

    await Promise.all([refetchFailedQueries(client), refetchFailedQueries(client)]);

    expect(queryFn).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});

describe("offline behaviour of the query client", () => {
  it("pauses a request interrupted by going offline and finishes it after the reconnect", async () => {
    const client = createQueryClient();
    client.mount();
    const queryFn = vi
      .fn()
      .mockImplementationOnce(async () => {
        onlineManager.setOnline(false);
        throw networkError();
      })
      .mockResolvedValue("ok");
    const observer = new QueryObserver(client, { queryKey: ["interrupted"], queryFn, retryDelay: 1 });
    const unsubscribe = observer.subscribe(() => undefined);

    await vi.waitFor(() => expect(client.getQueryState(["interrupted"])?.fetchStatus).toBe("paused"));
    expect(client.getQueryState(["interrupted"])?.status).toBe("pending");

    onlineManager.setOnline(true);

    await vi.waitFor(() => expect(client.getQueryState(["interrupted"])?.status).toBe("success"));
    expect(queryFn).toHaveBeenCalledTimes(2);
    unsubscribe();
    client.unmount();
  });
});

describe("checkApiReachable", () => {
  it("sends an uncached HEAD request to the ping route", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await expect(checkApiReachable()).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/ping",
      expect.objectContaining({ method: "HEAD", cache: "no-store" })
    );
  });

  it("is false when a proxy answers with an error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(checkApiReachable()).resolves.toBe(false);
  });

  it("is false when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(checkApiReachable()).resolves.toBe(false);
  });

  it("gives up after five seconds", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
          })
      )
    );

    const result = checkApiReachable();
    await vi.advanceTimersByTimeAsync(5000);

    await expect(result).resolves.toBe(false);
  });
});
