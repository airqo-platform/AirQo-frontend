import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserContext, SidebarConfig } from './useUserContext';
import logger from '@/lib/logger';

// Map routes to sidebar config properties
const routeToSidebarConfig: Record<string, keyof SidebarConfig> = {
  '/network-map': 'showNetworkMap',
  '/sites': 'showSites',
  '/user-management': 'showUserManagement',
  '/access-control': 'showAccessControl',
  '/organizations': 'showOrganizations',
  '/devices/my-devices': 'showMyDevices',
  '/devices/overview': 'showDeviceOverview',
  '/devices/claim': 'showClaimDevice',
  '/devices/deploy': 'showDeployDevice',
  '/grids': 'showGrids',
  '/cohorts': 'showCohorts',
};

export const useContextAwareRouting = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { getSidebarConfig, userContext, isLoading } = useUserContext();
  const previousContextRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Don't validate during loading
    if (isLoading || !userContext) {
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
      if (route === '/home') return true;
      
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
      router.push('/home');
    }
  }, [userContext, pathname, isLoading, getSidebarConfig, router]);
}; 