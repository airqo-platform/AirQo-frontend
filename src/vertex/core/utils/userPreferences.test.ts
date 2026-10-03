import {
  PAGE_SATISFACTION_COOLDOWN_MS,
  getLastActiveGroupId,
  getLastActiveModule,
  getLoginFeedbackRecord,
  isPageSatisfactionSuppressed,
  setLastActiveGroupId,
  setLastActiveModule,
  setLoginFeedbackRecord,
  suppressPageSatisfaction,
  suppressPageSatisfactionForSession,
} from "./userPreferences";

describe("userPreferences utilities", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-28T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it("stores and reads the last active module globally and per identifier", () => {
    setLastActiveModule("devices");
    setLastActiveModule("sites", "org-1");

    expect(getLastActiveModule()).toBe("devices");
    expect(getLastActiveModule("org-1")).toBe("sites");
    expect(getLastActiveModule("org-2")).toBeNull();
  });

  it("stores and reads the last active group id when user and group are present", () => {
    setLastActiveGroupId("user-1", "group-1");
    setLastActiveGroupId("", "group-2");
    setLastActiveGroupId("user-2", "");

    expect(getLastActiveGroupId("user-1")).toBe("group-1");
    expect(getLastActiveGroupId("")).toBeNull();
    expect(getLastActiveGroupId("user-2")).toBeNull();
  });

  it("stores a login feedback record with a 30-day expiry", () => {
    setLoginFeedbackRecord("user-1");

    expect(getLoginFeedbackRecord("user-1")).toEqual({
      submittedAt: Date.parse("2026-06-28T12:00:00.000Z"),
      expiresAt: Date.parse("2026-07-28T12:00:00.000Z"),
    });
  });

  it("returns null for missing, empty, invalid, or expired login feedback records", () => {
    expect(getLoginFeedbackRecord("")).toBeNull();
    expect(getLoginFeedbackRecord("missing")).toBeNull();

    localStorage.setItem("vertex_login_feedback_invalid", "{bad-json");
    expect(getLoginFeedbackRecord("invalid")).toBeNull();

    localStorage.setItem(
      "vertex_login_feedback_expired",
      JSON.stringify({
        submittedAt: Date.parse("2026-05-01T00:00:00.000Z"),
        expiresAt: Date.parse("2026-06-01T00:00:00.000Z"),
      })
    );

    expect(getLoginFeedbackRecord("expired")).toBeNull();
    expect(localStorage.getItem("vertex_login_feedback_expired")).toBeNull();
  });
});

describe("page satisfaction suppression", () => {
  const STORAGE_KEY = "vertex_page_satisfaction";

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-28T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("asks on a page that has no record yet", () => {
    expect(isPageSatisfactionSuppressed("/devices")).toBe(false);
  });

  it("stays quiet on a rated page for the cooldown, then asks again", () => {
    suppressPageSatisfaction("/devices");
    expect(isPageSatisfactionSuppressed("/devices")).toBe(true);

    vi.advanceTimersByTime(PAGE_SATISFACTION_COOLDOWN_MS - 1_000);
    expect(isPageSatisfactionSuppressed("/devices")).toBe(true);

    vi.advanceTimersByTime(2_000);
    expect(isPageSatisfactionSuppressed("/devices")).toBe(false);
  });

  it("keeps a page's suppression to that page", () => {
    suppressPageSatisfaction("/devices");

    expect(isPageSatisfactionSuppressed("/sites")).toBe(false);
  });

  it("stays quiet everywhere for the rest of the session once dismissed", () => {
    suppressPageSatisfactionForSession();

    expect(isPageSatisfactionSuppressed("/devices")).toBe(true);
    expect(isPageSatisfactionSuppressed("/sites")).toBe(true);
  });

  it("drops expired records rather than letting the map grow", () => {
    suppressPageSatisfaction("/devices");
    vi.advanceTimersByTime(PAGE_SATISFACTION_COOLDOWN_MS + 1);

    suppressPageSatisfaction("/sites");

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}")).toEqual({
      "/sites": Date.now() + PAGE_SATISFACTION_COOLDOWN_MS,
    });
  });

  it("ignores a corrupt record", () => {
    localStorage.setItem(STORAGE_KEY, "not json");

    expect(isPageSatisfactionSuppressed("/devices")).toBe(false);
  });

  it("has nothing to ask about without a page", () => {
    expect(isPageSatisfactionSuppressed("")).toBe(true);
  });
});
