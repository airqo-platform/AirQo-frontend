import { describe, it, expect } from "vitest";
import { isRouteAccessible } from "./useContextAwareRouting";
import { ROUTE_LINKS } from "@/core/routes";
import { SidebarConfig } from "./useUserContext";

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
      { name: "defaults to true for unknown paths", route: "/unknown-path", expected: true },
    ];

    it.each(routingCases)("evaluates accessibility for $name", ({ route, expected }) => {
      expect(isRouteAccessible(route, mockConfig)).toBe(expected);
    });
  });
});
