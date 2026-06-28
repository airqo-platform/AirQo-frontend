import { clearSessionData } from "./sessionManager";

describe("sessionManager utilities", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("removes non-whitelisted localStorage keys", () => {
    localStorage.setItem("temporary_auth_payload", "remove-me");
    localStorage.setItem("feature-cache", "remove-me");

    clearSessionData();

    expect(localStorage.getItem("temporary_auth_payload")).toBeNull();
    expect(localStorage.getItem("feature-cache")).toBeNull();
  });

  it("preserves whitelisted localStorage keys", () => {
    const preservedKeys = [
      "next-auth.session-token",
      "vertex_remembered_accounts_v1",
      "lastActiveModule_org-1",
      "lastActiveGroupId_user-1",
      "vertex_login_feedback_user-1",
      "vertex_cookies_accepted",
    ];

    preservedKeys.forEach((key) => localStorage.setItem(key, "keep-me"));

    clearSessionData();

    preservedKeys.forEach((key) => {
      expect(localStorage.getItem(key)).toBe("keep-me");
    });
  });

  it("clears sessionStorage", () => {
    sessionStorage.setItem("session-only", "remove-me");

    clearSessionData();

    expect(sessionStorage.getItem("session-only")).toBeNull();
  });
});
