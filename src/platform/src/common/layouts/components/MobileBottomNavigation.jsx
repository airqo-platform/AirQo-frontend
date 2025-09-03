'use client';

import React, { useMemo, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import CardWrapper from '@/common/components/CardWrapper';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import { getNavigationItems } from '../SideBar/sidebarConfig';

/**
 * Mobile Bottom Navigation Component
 * Displays a fixed bottom navigation for mobile devices
 * Only shows for UnifiedPagesLayout, not MapLayout
 * Takes top 4 navigation items from sidebar config
 */
const MobileBottomNavigation = ({ userType, className = '' }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, systemTheme } = useTheme();

  const isDarkMode = useMemo(
    () => theme === 'dark' || (theme === 'system' && systemTheme === 'dark'),
    [theme, systemTheme],
  );

  // Extract orgSlug from current pathname if it's an organization route
  const orgSlug = useMemo(() => {
    const match = pathname?.match?.(/\/org\/([^/]+)/);
    return match ? match[1] : null;
  }, [pathname]);

  // Get navigation items based on user type
  const allNavigationItems = useMemo(() => {
    const options = userType === 'organization' && orgSlug ? { orgSlug } : {};
    return getNavigationItems(userType, options);
  }, [userType, orgSlug]);

  // Filter only navigation items (not dividers) and take first 4
  const bottomNavItems = useMemo(() => {
    const navItems = allNavigationItems
      .filter((item) => item.type === 'item' && item.path)
      .slice(0, 4);

    return navItems;
  }, [allNavigationItems]);

  // Check if current path matches any nav item
  const isActiveItem = useCallback(
    (itemPath) => {
      if (!itemPath || !pathname) return false;

      // Exact match or starts with path (for nested routes)
      if (pathname === itemPath) return true;

      // Handle organization routes with dynamic slugs
      if (itemPath.includes('[org_slug]') && orgSlug) {
        const resolvedPath = itemPath.replace('[org_slug]', orgSlug);
        return (
          pathname === resolvedPath || pathname.startsWith(resolvedPath + '/')
        );
      }

      return pathname.startsWith(itemPath + '/');
    },
    [pathname, orgSlug],
  );

  const handleNavigation = useCallback(
    (path) => {
      if (!path) return;

      // Resolve dynamic paths
      let resolvedPath = path;
      if (path.includes('[org_slug]') && orgSlug) {
        resolvedPath = path.replace('[org_slug]', orgSlug);
      }

      router.push(resolvedPath);
    },
    [router, orgSlug],
  );

  const styles = useMemo(
    () => ({
      background: isDarkMode ? 'bg-[#1d1f20]' : 'bg-white',
      border: isDarkMode ? 'border-t-gray-700' : 'border-t-gray-200',
      text: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      activeText: isDarkMode ? 'text-primary' : 'text-primary',
      activeBg: isDarkMode ? 'bg-primary/20' : 'bg-primary/10',
    }),
    [isDarkMode],
  );

  if (bottomNavItems.length === 0) {
    return null;
  }

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-50 ${className}`}
    >
      <CardWrapper
        className={`w-full ${styles.background} ${styles.border} border-t shadow-lg`}
        padding="py-2 px-1"
        radius="rounded-none"
      >
        <nav className="flex justify-around items-center h-16">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveItem(item.path);

            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`
                  flex flex-col items-center justify-center px-2 py-1 rounded-lg
                  transition-all duration-200 min-w-0 flex-1 max-w-[80px]
                  ${isActive ? styles.activeBg : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
                `}
                aria-label={item.label}
              >
                <div
                  className={`flex items-center justify-center mb-1 transition-colors duration-200`}
                >
                  {Icon && (
                    <Icon
                      className={`w-5 h-5 ${
                        isActive ? styles.activeText : styles.text
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`
                    text-xs font-medium transition-colors duration-200 text-center leading-tight
                    ${isActive ? styles.activeText : styles.text}
                    truncate w-full
                  `}
                >
                  {item.shortLabel || item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </CardWrapper>
    </div>
  );
};

MobileBottomNavigation.propTypes = {
  userType: PropTypes.oneOf(['user', 'admin', 'organization']).isRequired,
  className: PropTypes.string,
};

export default MobileBottomNavigation;
