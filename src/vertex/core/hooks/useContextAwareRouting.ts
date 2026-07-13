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
  [ROUTE_LINKS.GRIDS]: 'showGrids',
  [ROUTE_LINKS.COHORTS]: 'showCohorts',
  [ROUTE_LINKS.ADMIN_NETWORKS]: 'showNetworks',
  [ROUTE_LINKS.ADMIN_SHIPPING]: 'showShipping',
};

export const isRouteAccessible = (route: string, sidebarConfig: SidebarConfig): boolean => {
  if (route === ROUTE_LINKS.HOME) return true;

  const matchedRoute = Object.keys(routeToSidebarConfig)
    .sort((a, b) => b.length - a.length)
    .find((candidate) => route === candidate || route.startsWith(`${candidate}/`));

  if (matchedRoute) {
    return sidebarConfig[routeToSidebarConfig[matchedRoute]] === true;
  }

  return true;
};

export const useContextAwareRouting = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { getSidebarConfig, userContext } = useUserContext();

  const previousContextRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userContext) {
      return;
    }

    const previousContext = previousContextRef.current;
    previousContextRef.current = userContext;

    // Only enforce on a context *switch*. Direct navigation into an
    // inaccessible route is RouteGuard's responsibility (forbidden UI, or its
    // configured redirect) — when this hook also enforced on every pathname
    // change, the two denial layers raced and the winner depended on build
    // mode: the dev server usually rendered the forbidden page, a production
    // build silently redirected to /home. This hook now only cleans up when
    // the active context changes underneath a route the new context doesn't
    // offer.
    if (previousContext === null || previousContext === userContext) {
      return;
    }

    if (!isRouteAccessible(pathname, getSidebarConfig())) {
      router.replace(ROUTE_LINKS.HOME);
    }
  }, [userContext, pathname, getSidebarConfig, router]);
}; 