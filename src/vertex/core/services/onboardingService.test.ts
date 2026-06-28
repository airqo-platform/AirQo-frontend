import { describe, it, expect, vi, beforeEach } from "vitest";
import { onboardingService } from "./onboardingService";
import { secureApiProxy } from "@/core/utils/secureApiProxyClient";

vi.mock("@/core/utils/secureApiProxyClient", () => ({
  secureApiProxy: {
    patch: vi.fn()
  }
}));

describe("onboardingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updateUserOnboarding calls correctly", async () => {
    vi.mocked(secureApiProxy.patch).mockResolvedValueOnce({ data: { success: true } });

    const payload = { action: "mark_step_complete" as const, step_id: "step1" };
    const res = await onboardingService.updateUserOnboarding(payload);

    expect(res.success).toBe(true);
    expect(secureApiProxy.patch).toHaveBeenCalledWith("/users/onboarding", payload, {
      headers: { "X-Auth-Type": "JWT" }
    });
  });

  it("updateGroupOnboarding calls correctly", async () => {
    vi.mocked(secureApiProxy.patch).mockResolvedValueOnce({ data: { success: true } });

    const payload = { action: "dismiss_checklist" as const };
    const res = await onboardingService.updateGroupOnboarding("grp_123", payload);

    expect(res.success).toBe(true);
    expect(secureApiProxy.patch).toHaveBeenCalledWith("/users/groups/grp_123/onboarding", payload, {
      headers: { "X-Auth-Type": "JWT" }
    });
  });
});
