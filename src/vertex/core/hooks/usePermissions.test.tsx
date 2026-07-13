import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePermission, useHasAnyPermission } from "./usePermissions";
import { renderHookWithProviders } from "../../test/utils/renderHookWithProviders";
import { permissionService } from "@/core/permissions/permissionService";
import { PERMISSIONS } from "@/core/permissions/constants";
import { createMockUser } from "../../test/factories/userFactory";

vi.mock("@/core/permissions/permissionService", () => ({
  permissionService: {
    hasPermission: vi.fn(),
    checkPermission: vi.fn(),
    getEffectivePermissions: vi.fn(),
    getUserRole: vi.fn(),
    getUserRoles: vi.fn(),
    isSuperAdmin: vi.fn(),
    canPerformAction: vi.fn(),
    canManageOrganization: vi.fn(),
    canViewOrganization: vi.fn(),
    getPermissionDescription: vi.fn(),
  },
}));

describe("usePermissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("usePermission", () => {
    it("returns false if user is not authenticated", () => {
      const { result } = renderHookWithProviders(() => usePermission(PERMISSIONS.DEVICE.VIEW), {
        preloadedState: { user: { userDetails: null } },
      });
      expect(result.current).toBe(false);
      expect(permissionService.hasPermission).not.toHaveBeenCalled();
    });

    it("calls permissionService with correct user and returns true", () => {
      (permissionService.hasPermission as any).mockReturnValue(true);
      const mockUser = createMockUser();
      
      const { result } = renderHookWithProviders(() => usePermission(PERMISSIONS.DEVICE.VIEW), {
        preloadedState: { 
          user: { 
            userDetails: mockUser,
            activeGroup: { _id: "org-1" },
            activeNetwork: { _id: "net-1" },
          } 
        },
      });

      expect(result.current).toBe(true);
      expect(permissionService.hasPermission).toHaveBeenCalledWith(
        mockUser, 
        PERMISSIONS.DEVICE.VIEW, 
        expect.objectContaining({
          activeOrganization: { _id: "org-1" },
          activeNetwork: { _id: "net-1" }
        })
      );
    });
  });

  describe("mock permissions consistency", () => {
    // usePermission has always honored the NEXT_PUBLIC_MOCK_PERMISSIONS_ENABLED
    // dev flag; useHasAnyPermission (RouteGuard's resolution path) and
    // useHasAllPermissions must honor it identically, otherwise mocking
    // permissions in development changes action buttons but not route guards.
    // The flag is read at module load, so re-import everything fresh with the
    // env stubbed.
    it("useHasAnyPermission and useHasAllPermissions honor MOCK_PERMISSIONS when enabled", async () => {
      vi.resetModules();
      vi.stubEnv("NEXT_PUBLIC_MOCK_PERMISSIONS_ENABLED", "true");
      try {
        const hooks = await import("./usePermissions");
        const { renderHookWithProviders: renderFresh } = await import(
          "../../test/utils/renderHookWithProviders"
        );
        const { PERMISSIONS: P } = await import("@/core/permissions/constants");
        const noUser = { preloadedState: { user: { userDetails: null } } };

        // MOCK_PERMISSIONS: DEVICE.DEPLOY=true, DEVICE.UPDATE=true, SITE.CREATE=false.
        expect(
          renderFresh(
            () => hooks.useHasAnyPermission([P.DEVICE.DEPLOY, P.SITE.CREATE]),
            noUser
          ).result.current
        ).toBe(true);
        expect(
          renderFresh(() => hooks.useHasAnyPermission([P.SITE.CREATE]), noUser)
            .result.current
        ).toBe(false);
        expect(
          renderFresh(
            () => hooks.useHasAllPermissions([P.DEVICE.DEPLOY, P.SITE.CREATE]),
            noUser
          ).result.current
        ).toBe(false);
        expect(
          renderFresh(
            () => hooks.useHasAllPermissions([P.DEVICE.DEPLOY, P.DEVICE.UPDATE]),
            noUser
          ).result.current
        ).toBe(true);
      } finally {
        vi.unstubAllEnvs();
        vi.resetModules();
      }
    });
  });

  describe("useHasAnyPermission", () => {
    it("returns true if at least one permission matches", () => {
      (permissionService.hasPermission as any).mockImplementation((user: any, perm: string) => {
        return perm === PERMISSIONS.SITE.VIEW;
      });

      const { result } = renderHookWithProviders(() => 
        useHasAnyPermission([PERMISSIONS.DEVICE.VIEW, PERMISSIONS.SITE.VIEW]), 
      { preloadedState: { user: { userDetails: createMockUser() } } });

      expect(result.current).toBe(true);
    });

    it("returns false if none match", () => {
      (permissionService.hasPermission as any).mockReturnValue(false);

      const { result } = renderHookWithProviders(() => 
        useHasAnyPermission([PERMISSIONS.DEVICE.VIEW, PERMISSIONS.SITE.VIEW]), 
      { preloadedState: { user: { userDetails: createMockUser() } } });

      expect(result.current).toBe(false);
    });
  });
});
