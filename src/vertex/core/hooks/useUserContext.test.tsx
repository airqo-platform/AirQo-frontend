import { describe, it, expect, vi, beforeEach } from "vitest";
import { useUserContext } from "./useUserContext";
import { renderHookWithProviders } from "../../test/utils/renderHookWithProviders";
import * as usePermissionsModule from "./usePermissions";
import { createMockUser } from "../../test/factories/userFactory";
import { PERMISSIONS } from "@/core/permissions/constants";

vi.mock("./usePermissions", () => ({
  usePermission: vi.fn(),
}));

describe("useUserContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates loading states correctly when not initialized", () => {
    const { result } = renderHookWithProviders(() => useUserContext(), {
      preloadedState: {
        user: { isInitialized: false, isAuthenticated: false, userDetails: null }
      }
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isPermissionsLoading).toBe(false);
  });

  it("identifies personal context and computes scopes", () => {
    const { result } = renderHookWithProviders(() => useUserContext(), {
      preloadedState: {
        user: {
          isInitialized: true,
          isAuthenticated: true,
          userDetails: createMockUser(),
          userContext: "personal"
        }
      }
    });

    expect(result.current.isPersonalContext).toBe(true);
    expect(result.current.userScope).toBe("personal");
    expect(result.current.isPersonalScope).toBe(true);
  });

  it("provides sidebar config based on permissions in personal context", () => {
    // Mock view sites = true, view devices = false
    (usePermissionsModule.usePermission as any).mockImplementation((perm: string) => {
      return perm === PERMISSIONS.SITE.VIEW; 
    });

    const { result } = renderHookWithProviders(() => useUserContext(), {
      preloadedState: {
        user: {
          isInitialized: true,
          isAuthenticated: true,
          userDetails: createMockUser(),
          userContext: "personal"
        }
      }
    });

    const sidebar = result.current.getSidebarConfig();
    expect(sidebar.showSites).toBe(true);
    expect(sidebar.showDeviceOverview).toBe(false);
  });
});
