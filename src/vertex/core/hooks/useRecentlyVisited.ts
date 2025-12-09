import { useState, useEffect } from 'react';
import { useAppSelector } from '@/core/redux/hooks';
import { usePathname } from 'next/navigation';
import { ROUTE_LINKS } from '@/core/routes';

export interface RecentPage {
  label: string;
  href: string;
}

const MAX_RECENT_PAGES = 4;
const STORAGE_KEY = 'vertex_recently_visited';

// Helper to determine the canonical parent route and label
const getCanonicalRoute = (pathname: string): { label: string; href: string } | null => {
  // Admin modules
  if (pathname.includes('/admin/networks')) {
    return { label: 'Networks', href: '/admin/networks' };
  }
  if (pathname.includes('/admin/cohorts')) {
    return { label: 'Cohorts', href: '/admin/cohorts' };
  }
  if (pathname.includes('/admin/sites')) {
    return { label: 'Sites', href: '/admin/sites' };
  }
  if (pathname.includes('/admin/grids')) {
    return { label: 'Grids', href: '/admin/grids' };
  }
  if (pathname.includes('/admin/shipping')) {
    return { label: 'Shipping', href: '/admin/shipping' };
  }

  if (pathname === ROUTE_LINKS.HOME) return { label: 'Device Management', href: ROUTE_LINKS.HOME };
  
  if (pathname.includes('/devices/my-devices')) return { label: 'My Devices', href: ROUTE_LINKS.MY_DEVICES };
  if (pathname.includes('/devices/overview')) return { label: 'Device Overview', href: ROUTE_LINKS.ORG_ASSETS };
  if (pathname.includes('/devices/claim')) return { label: 'Register Device', href: ROUTE_LINKS.ORG_REGISTER_DEVICE };

  return null;
};

export const useRecentlyVisited = () => {
  const pathname = usePathname();
  const [visitedPages, setVisitedPages] = useState<RecentPage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const userDetails = useAppSelector((state) => state.user.userDetails);
  const userId = userDetails?._id;

  const storageKey = userId ? `${STORAGE_KEY}_${userId}` : null;

  useEffect(() => {
    if (!storageKey) {
      setVisitedPages([]);
      setIsLoaded(true);
      return;
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setVisitedPages(JSON.parse(stored));
      } else {
        setVisitedPages([]);
      }
    } catch (error) {
      console.error('Failed to load recently visited pages:', error);
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey]);

  // Update visited pages on pathname change
  useEffect(() => {
    if (!isLoaded || !pathname || !storageKey) return;

    if (pathname === '/' || pathname.includes('/login')) return;

    const route = getCanonicalRoute(pathname);
    if (!route) return;

    const { label, href } = route;
    const newPage: RecentPage = { label, href };

    setVisitedPages((prev) => {
      const filtered = prev.filter((p) => p.href !== href);
      const updated = [newPage, ...filtered].slice(0, MAX_RECENT_PAGES);
      
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save recently visited pages:', error);
      }

      return updated;
    });
  }, [pathname, isLoaded, storageKey]);

  return { visitedPages };
};
