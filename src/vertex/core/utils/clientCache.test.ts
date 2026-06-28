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
    window.localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-28T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("reports that persisted client cache is enabled", () => {
    expect(shouldEnablePersistentClientCache()).toBe(true);
  });

  it("does nothing when the cache version already matches", () => {
    window.localStorage.setItem(VERSION_KEY, VERSION);
    window.localStorage.setItem(`${QUERY_CACHE_PREFIX}devices`, "cached");

    runClientCacheMaintenance();

    expect(window.localStorage.getItem(`${QUERY_CACHE_PREFIX}devices`)).toBe(
      "cached"
    );
    expect(window.localStorage.getItem(MISMATCH_LOG_KEY)).toBeNull();
  });

  it("removes persisted react-query cache entries when the version changes", () => {
    window.localStorage.setItem(VERSION_KEY, "old-version");
    window.localStorage.setItem(`${QUERY_CACHE_PREFIX}devices`, "remove-me");
    window.localStorage.setItem(`${QUERY_CACHE_PREFIX}sites`, "remove-me");
    window.localStorage.setItem("unrelated", "keep-me");

    runClientCacheMaintenance();

    expect(window.localStorage.getItem(`${QUERY_CACHE_PREFIX}devices`)).toBeNull();
    expect(window.localStorage.getItem(`${QUERY_CACHE_PREFIX}sites`)).toBeNull();
    expect(window.localStorage.getItem("unrelated")).toBe("keep-me");
    expect(window.localStorage.getItem(VERSION_KEY)).toBe(VERSION);
    expect(window.localStorage.getItem(MISMATCH_LOG_KEY)).toBe(
      "2026-06-28T12:00:00.000Z"
    );
  });

  it("sets the cache version on first maintenance run", () => {
    runClientCacheMaintenance();

    expect(window.localStorage.getItem(VERSION_KEY)).toBe(VERSION);
  });

  it("tolerates localStorage remove failures while continuing maintenance", () => {
    const fakeLocalStorage = {
      getItem: (key: string) => {
        if (key === VERSION_KEY) return "old-version";
        return null;
      },
      setItem: vi.fn(),
      removeItem: vi.fn(() => {
        throw new Error("storage unavailable");
      }),
      length: 1,
      key: (i: number) => (i === 0 ? `${QUERY_CACHE_PREFIX}devices` : null),
    };

    const originalLocalStorage = window.localStorage;
    Object.defineProperty(window, "localStorage", {
      value: fakeLocalStorage,
      configurable: true,
    });

    expect(() => runClientCacheMaintenance()).not.toThrow();
    expect(fakeLocalStorage.removeItem).toHaveBeenCalledWith(
      `${QUERY_CACHE_PREFIX}devices`
    );

    Object.defineProperty(window, "localStorage", {
      value: originalLocalStorage,
      configurable: true,
    });
  });

  it("tolerates localStorage write failures", () => {
    const fakeLocalStorage = {
      getItem: () => null,
      setItem: vi.fn(() => {
        throw new Error("storage unavailable");
      }),
      removeItem: vi.fn(),
      length: 0,
      key: () => null,
    };

    const originalLocalStorage = window.localStorage;
    Object.defineProperty(window, "localStorage", {
      value: fakeLocalStorage,
      configurable: true,
    });

    expect(() => runClientCacheMaintenance()).not.toThrow();
    expect(fakeLocalStorage.setItem).toHaveBeenCalledWith(VERSION_KEY, VERSION);

    Object.defineProperty(window, "localStorage", {
      value: originalLocalStorage,
      configurable: true,
    });
  });
});
