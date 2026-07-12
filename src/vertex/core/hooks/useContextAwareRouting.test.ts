import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { isRouteAccessible, useContextAwareRouting } from "./useContextAwareRouting";
import { ROUTE_LINKS } from "@/core/routes";
import { SidebarConfig } from "./useUserContext";

const replaceMock = vi.fn();
const useUserContextMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => "/devices/overview",
}));

vi.mock("./useUserContext", () => ({
  useUserContext: () => useUserContextMock(),
}));

describe("useContextAwareRouting helpers", () => {
  describe("isRouteAccessible", () => {
    const mockConfig: SidebarConfig = {
      title: 'Mock Title',
      showNetworkMap: true,
      showMyDevices: false,
      showDeviceOverview: true,
      showSites: false,
      showGrids: true,
      showCohorts: false,
      showUserManagement: true,
      showAccessControl: false,
      showClaimDevice: true,
      showDeployDevice: true,
      showNetworks: false,
      showShipping: false,
    };

    const routingCases = [
      { name: "home is always accessible", route: ROUTE_LINKS.HOME, expected: true },
      { name: "accessible explicitly (device overview)", route: ROUTE_LINKS.ORG_ASSETS, expected: true },
      { name: "inaccessible explicitly (sites)", route: ROUTE_LINKS.SITES, expected: false },
      { name: "accessible explicitly via user management string", route: "/user-management", expected: true },
      { name: "inaccessible explicitly via access control string", route: "/access-control", expected: false },
      { name: "accessible base path match", route: "/user-management/123/edit", expected: true },
      { name: "inaccessible base path match", route: "/access-control/roles/1", expected: false },
      { name: "inaccessible nested base path match", route: ROUTE_LINKS.ADMIN_NETWORKS + "/requests/42", expected: false },
      { name: "defaults to true for unknown paths", route: "/unknown-path", expected: true },
    ];

    it.each(routingCases)("evaluates accessibility for $name", ({ route, expected }) => {
      expect(isRouteAccessible(route, mockConfig)).toBe(expected);
    });
  });

  describe("useContextAwareRouting (switch-only enforcement)", () => {
    // Direct navigation into an inaccessible route is RouteGuard's job; this
    // hook must only redirect when the active context CHANGES underneath a
    // route the new context doesn't offer. (Enforcing on initial load raced
    // RouteGuard's forbidden UI, with the winner depending on build mode.)
    const contextValue = (
      userContext: string | null,
      showDeviceOverview: boolean
    ) => ({
      userContext,
      getSidebarConfig: () => ({ showDeviceOverview }) as SidebarConfig,
    });

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("does not redirect on initial load, even when the route is inaccessible", () => {
      useUserContextMock.mockReturnValue(contextValue("personal", false));
      renderHook(() => useContextAwareRouting());
      expect(replaceMock).not.toHaveBeenCalled();
    });

    it("redirects home when a context switch makes the current route inaccessible", () => {
      useUserContextMock.mockReturnValue(contextValue("personal", true));
      const { rerender } = renderHook(() => useContextAwareRouting());
      expect(replaceMock).not.toHaveBeenCalled();

      useUserContextMock.mockReturnValue(contextValue("external-org", false));
      rerender();
      expect(replaceMock).toHaveBeenCalledWith(ROUTE_LINKS.HOME);
    });

    it("does not redirect when a context switch keeps the route accessible", () => {
      useUserContextMock.mockReturnValue(contextValue("personal", true));
      const { rerender } = renderHook(() => useContextAwareRouting());

      useUserContextMock.mockReturnValue(contextValue("external-org", true));
      rerender();
      expect(replaceMock).not.toHaveBeenCalled();
    });

    it("does not redirect while the context is still resolving", () => {
      useUserContextMock.mockReturnValue(contextValue(null, false));
      renderHook(() => useContextAwareRouting());
      expect(replaceMock).not.toHaveBeenCalled();
    });
  });
});
