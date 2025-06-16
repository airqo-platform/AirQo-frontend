'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';
import Head from 'next/head';
import PropTypes from 'prop-types';
import { setSidebar } from '@/lib/store/services/sideBar/SideBarSlice';
import AuthenticatedSideBar from '../SideBar/AuthenticatedSidebar';
import UserSidebarContent from '../SideBar/UserSidebarContent';
import GlobalTopbar from '@/common/layouts/GlobalTopbar';
import SideBarDrawer from '../SideBar/SideBarDrawer';
import GlobalSideBarDrawer from '@/common/layouts/GlobalTopbar/sidebar';
import MaintenanceBanner from '@/components/MaintenanceBanner';
import useUserPreferences from '@/core/hooks/useUserPreferences';
import useInactivityLogout from '@/core/hooks/useInactivityLogout';
import useMaintenanceStatus from '@/core/hooks/useMaintenanceStatus';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';
import { useWindowSize } from '@/core/hooks/useWindowSize';
import { LAYOUT_CONFIGS, DEFAULT_CONFIGS } from '../layoutConfigs';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';

/**
 * Map Layout Component
 * Provides a specialized layout for the map route
 * Map page has different layout requirements
 */
export default function MapLayout({ children }) {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const { userID } = useGetActiveGroup();
  const { maintenance } = useMaintenanceStatus();
  const { width } = useWindowSize();
  const { theme, systemTheme } = useTheme();

  // Force sidebar collapse on small screens and when map is the main focus
  const isMobile = width < 768;

  // Get route configuration based on current pathname
  const routeConfig = LAYOUT_CONFIGS.MAP[pathname] || DEFAULT_CONFIGS.MAP;

  // Generate styles for sidebar content
  const isDarkMode =
    theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  const styles = {
    divider: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    mutedText: isDarkMode ? 'text-gray-400' : 'text-gray-500',
  };

  // Initialize hooks
  useUserPreferences();
  useInactivityLogout(userID);

  // When leaving map page, expand the sidebar for other pages
  useEffect(() => {
    return () => {
      // This runs when component unmounts (user navigates away from map)
      if (!isMobile) {
        dispatch(setSidebar(false)); // Expand the sidebar (false = not collapsed)
      }
    };
  }, [dispatch, isMobile]);
  return (
    <div className="flex overflow-hidden min-h-screen" data-testid="layout">
      <Head>
        <title>{routeConfig.pageTitle}</title>
        <meta property="og:title" content={routeConfig.pageTitle} key="title" />
      </Head>{' '}
      {/* Global TopBar - Full width at top */}
      <GlobalTopbar
        topbarTitle={routeConfig.topbarTitle}
        showSearch={routeConfig.showSearch}
      />{' '}
      {/* Sidebar - Fixed position below topbar */}
      <aside className="fixed left-0 top-36 lg:top-[63px] z-40 text-sidebar-text transition-all duration-300">
        <AuthenticatedSideBar forceCollapse={true}>
          <UserSidebarContent isCollapsed={true} styles={styles} />
        </AuthenticatedSideBar>
      </aside>
      {/* Main Content - Account for both topbar and sidebar */}
      <main className="flex-1 transition-all duration-300 overflow-hidden pt-36 lg:pt-[60px] lg:ml-[86px]">
        <div className="h-[calc(100vh-9rem)] lg:h-[calc(100vh-4rem)] overflow-hidden">
          {/* Maintenance Banner */}
          {maintenance && <MaintenanceBanner maintenance={maintenance} />}
          {/* Content - Full remaining height */}
          <div className="h-full text-text transition-all duration-300 overflow-hidden">
            {children}
          </div>{' '}
        </div>
      </main>
      {/* SideBar Drawer */}
      <SideBarDrawer />
      {/* Global SideBar Drawer */}
      <GlobalSideBarDrawer />
    </div>
  );
}

MapLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
