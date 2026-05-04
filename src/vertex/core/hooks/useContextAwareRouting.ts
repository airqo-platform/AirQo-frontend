import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserContext, SidebarConfig } from './useUserContext';
import { ROUTE_LINKS } from '@/core/routes';

// Map routes to sidebar config properties
const routeToSidebarConfig: Record<string, keyof SidebarConfig> = {
  [ROUTE_LINKS.SITES]: 'showSites',
  [ROUTE_LINKS.ORG_SITES]: 'showSites',
  [ROUTE_LINKS.SITE_DETAILS]: 'showSites',
  '/user-management': 'showUserManagement',
  '/access-control': 'showAccessControl',
  [ROUTE_LINKS.MY_DEVICES]: 'showMyDevices',
  [ROUTE_LINKS.ORG_ASSETS]: 'showDeviceOverview',
  '/devices/claim': 'showClaimDevice',
  [ROUTE_LINKS.GRIDS]: 'showGrids',
  [ROUTE_LINKS.COHORTS]: 'showCohorts',
  [ROUTE_LINKS.ADMIN_NETWORKS]: 'showNetworks',
  [ROUTE_LINKS.ADMIN_SHIPPING]: 'showShipping',
};

export const useContextAwareRouting = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { getSidebarConfig, userContext } = useUserContext();

  const previousContextRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!userContext) {
      return;
    }

    const sidebarConfig = getSidebarConfig();

    const isRouteAccessible = (route: string): boolean => {
      if (route === ROUTE_LINKS.HOME) return true;
      
      const configKey = routeToSidebarConfig[route];
      if (configKey) {
        return sidebarConfig[configKey] === true;
      }
      
      const basePath = route.split('/')[1];
      const baseRoute = `/${basePath}`;
      const baseConfigKey = routeToSidebarConfig[baseRoute];
      if (baseConfigKey) {
        return sidebarConfig[baseConfigKey] === true;
      }
      
      return true;
    };

    const contextChanged =
      initializedRef.current && previousContextRef.current !== userContext;
    initializedRef.current = true;
    previousContextRef.current = userContext;

    // Enforce access on every pathname or context change
    if (!isRouteAccessible(pathname)) {
      router.replace(ROUTE_LINKS.HOME);
      return;
    }
  }, [userContext, pathname, getSidebarConfig, router]);
}; 