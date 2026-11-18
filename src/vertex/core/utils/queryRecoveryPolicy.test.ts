import { QueryClient, QueryObserver, focusManager, onlineManager } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/core/providers/query-provider";
import {
  backoffWithJitter,
  checkApiReachable,
  countFailedQueries,
  getQueryRetryDelay,
  isNetworkLevelError,
  isRepaired,
  isSettled,
  refetchAfterReconnect,
  shouldRetryQuery,
} from "./queryRecoveryPolicy";

// Shaped like the errors the axios interceptors produce when a request gets no answer.
const networkError = (code = "ERR_NETWORK") =>
  Object.assign(new Error("Network Error"), { code, response: { status: 0 } });
const httpError = (status: number) => Object.assign(new Error("Request failed"), { response: { status } });

afterEach(() => {
  onlineManager.setOnline(true);
  focusManager.setFocused(undefined);
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

const mountFailedQuery = async (client: QueryClient, key: string, error: unknown) => {
  const queryFn = vi.fn().mockRejectedValueOnce(error).mockResolvedValue("ok");
  const observer = new QueryObserver(client, { queryKey: [key], queryFn, retry: false, staleTime: Infinity });
  const unsubscribe = observer.subscribe(() => undefined);
  await vi.waitFor(() => expect(client.getQueryState([key])?.status).toBe("error"));
  return { queryFn, unsubscribe, query: client.getQueryCache().find({ queryKey: [key] })! };
};

const mountLoadedQuery = async (client: QueryClient, key: string, staleTime: number) => {
  const queryFn = vi.fn().mockResolvedValue("ok");
  const observer = new QueryObserver(client, { queryKey: [key], queryFn, retry: false, staleTime });
  const unsubscribe = observer.subscribe(() => undefined);
  await vi.waitFor(() => expect(client.getQueryState([key])?.status).toBe("success"));
  return { queryFn, unsubscribe };
};

describe("refetchAfterReconnect", () => {
  it("re-runs network and server failures but not 4xx rejections", async () => {
    const client = new QueryClient();
    const network = await mountFailedQuery(client, "network", networkError());
    const server = await mountFailedQuery(client, "server", httpError(503));
    const forbidden = await mountFailedQuery(client, "forbidden", httpError(403));

    expect(countFailedQueries(client)).toBe(2);
    const started = refetchAfterReconnect(client);

    expect(started).toEqual([network.query, server.query]);
    await vi.waitFor(() => expect(countFailedQueries(client)).toBe(0));
    expect(network.queryFn).toHaveBeenCalledTimes(2);
    expect(server.queryFn).toHaveBeenCalledTimes(2);
    expect(forbidden.queryFn).toHaveBeenCalledTimes(1);
  });

  it("refreshes stale data and leaves fresh data alone", async () => {
    const client = new QueryClient();
    const stale = await mountLoadedQuery(client, "stale", 0);
    const fresh = await mountLoadedQuery(client, "fresh", Infinity);

    refetchAfterReconnect(client);

    await vi.waitFor(() => expect(stale.queryFn).toHaveBeenCalledTimes(2));
    expect(fresh.queryFn).toHaveBeenCalledTimes(1);
  });

  it("ignores queries with nothing mounted", async () => {
    const client = new QueryClient();
    const { queryFn, unsubscribe } = await mountFailedQuery(client, "gone", networkError());
    unsubscribe();

    expect(refetchAfterReconnect(client)).toEqual([]);
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

    refetchAfterReconnect(client);

    await vi.waitFor(() => expect(client.getQueryData(["fresh"])).toBe("ok"));
    unsubscribe();
  });

  it("does not start a second request for a query already refetching", async () => {
    const client = new QueryClient();
    const { queryFn, unsubscribe } = await mountFailedQuery(client, "busy", networkError());
    queryFn.mockReset();
    queryFn.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve("ok"), 20)));

    refetchAfterReconnect(client);
    refetchAfterReconnect(client);

    await vi.waitFor(() => expect(client.getQueryState(["busy"])?.status).toBe("success"));
    expect(queryFn).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});

describe("isSettled and isRepaired", () => {
  it("counts a retry paused in a hidden tab as unfinished, and as not yet repaired", async () => {
    const client = new QueryClient();
    client.mount();
    focusManager.setFocused(false);
    const queryFn = vi.fn().mockRejectedValueOnce(networkError()).mockResolvedValue("ok");
    const observer = new QueryObserver(client, {
      queryKey: ["paused"],
      queryFn,
      retry: 1,
      retryDelay: 1,
      refetchOnWindowFocus: false,
    });
    const unsubscribe = observer.subscribe(() => undefined);
    const query = client.getQueryCache().find({ queryKey: ["paused"] })!;

    await vi.waitFor(() => expect(query.state.fetchStatus).toBe("paused"));
    expect(query.state.status).toBe("pending");
    expect(countFailedQueries(client)).toBe(0);
    expect(isSettled(query)).toBe(false);
    expect(isRepaired(query)).toBe(false);

    focusManager.setFocused(true);
    await vi.waitFor(() => expect(query.state.status).toBe("success"));
    expect(isSettled(query)).toBe(true);
    expect(isRepaired(query)).toBe(true);
    unsubscribe();
    client.unmount();
  });

  it("does not count a failed query as repaired while its replacement request runs", async () => {
    const client = new QueryClient();
    const { query, queryFn, unsubscribe } = await mountFailedQuery(client, "replaced", networkError());
    queryFn.mockReset();
    queryFn.mockRejectedValue(httpError(503));

    void query.fetch().catch(() => undefined);
    expect(query.state.status).toBe("pending");
    expect(isRepaired(query)).toBe(false);

    await vi.waitFor(() => expect(query.state.status).toBe("error"));
    expect(isRepaired(query)).toBe(false);
    unsubscribe();
  });

  it("counts a query nothing shows any more as settled and repaired", async () => {
    const client = new QueryClient();
    const { query, unsubscribe } = await mountFailedQuery(client, "left", networkError());
    unsubscribe();

    expect(isSettled(query)).toBe(true);
    expect(isRepaired(query)).toBe(true);
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
