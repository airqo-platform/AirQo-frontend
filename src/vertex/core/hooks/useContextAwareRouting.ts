import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserContext, SidebarConfig } from './useUserContext';
import { useAppSelector } from '../redux/hooks';
import { ROUTE_LINKS } from '@/core/routes';

// Map routes to sidebar config properties
// Map routes to sidebar config properties
const routeToSidebarConfig: Record<string, keyof SidebarConfig> = {
  [ROUTE_LINKS.SITES]: 'showSites',
  '/user-management': 'showUserManagement',
  '/access-control': 'showAccessControl',
  [ROUTE_LINKS.MY_DEVICES]: 'showMyDevices',
  [ROUTE_LINKS.ORG_ASSETS]: 'showDeviceOverview', // Assuming this maps to /devices/overview
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
    // Don't run routing logic until the user context is fully initialized.
    if (!userContext) {
      return;
    }

    if(!initializedRef.current) {
      initializedRef.current = true;
      previousContextRef.current = userContext;
      return;
    }

    // Check if context actually changed
    if (previousContextRef.current === userContext) {
      return;
    }

    // Update previous context
    previousContextRef.current = userContext;

    const sidebarConfig = getSidebarConfig();
    
    // Check if current route is accessible in new context
    const isRouteAccessible = (route: string): boolean => {
      // Dashboard is always accessible
      if (route === ROUTE_LINKS.HOME) return true;
      
      // Check if route maps to a sidebar config property
      const configKey = routeToSidebarConfig[route];
      if (configKey) {
        return sidebarConfig[configKey] === true;
      }
      
      // For dynamic routes, check the base path
      const basePath = route.split('/')[1];
      const baseRoute = `/${basePath}`;
      const baseConfigKey = routeToSidebarConfig[baseRoute];
      if (baseConfigKey) {
        return sidebarConfig[baseConfigKey] === true;
      }
      
      // Default to accessible if not explicitly mapped
      return true;
    };

    // If current route is not accessible, redirect to dashboard
    if (!isRouteAccessible(pathname)) {
      // logger.debug('Context-aware redirect', { from: pathname, to: '/home', userContext, sidebarConfig })
      router.push(ROUTE_LINKS.HOME);
    }
  }, [userContext, pathname, getSidebarConfig, router]);
}; 