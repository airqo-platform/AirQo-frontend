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
