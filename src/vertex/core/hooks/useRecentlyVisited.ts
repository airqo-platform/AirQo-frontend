import { useState, useEffect } from 'react';
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

  // Device Management (Home)
  // We treat these as discrete because they are top-level views in the breakdown
  if (pathname === ROUTE_LINKS.HOME) return { label: 'Device Management', href: ROUTE_LINKS.HOME };
  
  if (pathname.includes('/devices/my-devices')) return { label: 'My Devices', href: ROUTE_LINKS.MY_DEVICES };
  if (pathname.includes('/devices/overview')) return { label: 'Device Overview', href: ROUTE_LINKS.ORG_ASSETS };
  if (pathname.includes('/devices/claim')) return { label: 'Register Device', href: ROUTE_LINKS.ORG_REGISTER_DEVICE };

  // Fallback: If we can't map it clearly to a sidebar module, we might want to ignore it 
  // or just return a generic one. For now, let's ignore unknowns to keep the list clean.
  return null;
};

export const useRecentlyVisited = () => {
  const pathname = usePathname();
  const [visitedPages, setVisitedPages] = useState<RecentPage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setVisitedPages(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recently visited pages:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Update visited pages on pathname change
  useEffect(() => {
    if (!isLoaded || !pathname) return;

    // Skip certain paths if needed (e.g. login, error pages)
    if (pathname === '/' || pathname.includes('/login')) return;

    const route = getCanonicalRoute(pathname);
    if (!route) return;

    const { label, href } = route;
    const newPage: RecentPage = { label, href };

    setVisitedPages((prev) => {
      // Remove existing occurrence to promote it to the top
      const filtered = prev.filter((p) => p.href !== href);
      // Add new page to the front
      const updated = [newPage, ...filtered].slice(0, MAX_RECENT_PAGES);
      
      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save recently visited pages:', error);
      }

      return updated;
    });
  }, [pathname, isLoaded]);

  return { visitedPages };
};
