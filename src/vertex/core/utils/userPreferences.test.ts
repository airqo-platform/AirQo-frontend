import {
  getLastActiveGroupId,
  getLastActiveModule,
  getLoginFeedbackRecord,
  setLastActiveGroupId,
  setLastActiveModule,
  setLoginFeedbackRecord,
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
