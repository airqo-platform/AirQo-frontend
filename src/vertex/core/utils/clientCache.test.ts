import {
  runClientCacheMaintenance,
  shouldEnablePersistentClientCache,
} from "./clientCache";

const VERSION = "2026-04-30.1";
const VERSION_KEY = "airqo:vertex:client-cache:version";
const QUERY_CACHE_PREFIX = "airqo:vertex:react-query:";
const MISMATCH_LOG_KEY = "airqo:vertex:cache-version-mismatch:last";

describe("clientCache utilities", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-28T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("reports that persisted client cache is enabled", () => {
    expect(shouldEnablePersistentClientCache()).toBe(true);
  });

  it("does nothing when the cache version already matches", () => {
    localStorage.setItem(VERSION_KEY, VERSION);
    localStorage.setItem(`${QUERY_CACHE_PREFIX}devices`, "cached");

    runClientCacheMaintenance();

    expect(localStorage.getItem(`${QUERY_CACHE_PREFIX}devices`)).toBe(
      "cached"
    );
    expect(localStorage.getItem(MISMATCH_LOG_KEY)).toBeNull();
  });

  it("removes persisted react-query cache entries when the version changes", () => {
    localStorage.setItem(VERSION_KEY, "old-version");
    localStorage.setItem(`${QUERY_CACHE_PREFIX}devices`, "remove-me");
    localStorage.setItem(`${QUERY_CACHE_PREFIX}sites`, "remove-me");
    localStorage.setItem("unrelated", "keep-me");

    runClientCacheMaintenance();

    expect(localStorage.getItem(`${QUERY_CACHE_PREFIX}devices`)).toBeNull();
    expect(localStorage.getItem(`${QUERY_CACHE_PREFIX}sites`)).toBeNull();
    expect(localStorage.getItem("unrelated")).toBe("keep-me");
    expect(localStorage.getItem(VERSION_KEY)).toBe(VERSION);
    expect(localStorage.getItem(MISMATCH_LOG_KEY)).toBe(
      "2026-06-28T12:00:00.000Z"
    );
  });

  it("sets the cache version on first maintenance run", () => {
    runClientCacheMaintenance();

    expect(localStorage.getItem(VERSION_KEY)).toBe(VERSION);
  });

  it("tolerates localStorage remove failures while continuing maintenance", () => {
    localStorage.setItem(VERSION_KEY, "old-version");
    localStorage.setItem(`${QUERY_CACHE_PREFIX}devices`, "remove-me");
    const removeSpy = vi
      .spyOn(window.localStorage, "removeItem")
      .mockImplementation(() => {
        throw new Error("storage unavailable");
      });

    expect(() => runClientCacheMaintenance()).not.toThrow();
    expect(removeSpy).toHaveBeenCalledWith(`${QUERY_CACHE_PREFIX}devices`);
    expect(localStorage.getItem(VERSION_KEY)).toBe(VERSION);
  });

  it("tolerates localStorage write failures", () => {
    const setSpy = vi
      .spyOn(window.localStorage, "setItem")
      .mockImplementation(() => {
        throw new Error("storage unavailable");
      });

    expect(() => runClientCacheMaintenance()).not.toThrow();
    expect(setSpy).toHaveBeenCalledWith(VERSION_KEY, VERSION);
  });
});
