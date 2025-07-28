'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';
import Head from 'next/head';
import PropTypes from 'prop-types';
import { setSidebar } from '@/lib/store/services/sideBar/SideBarSlice';
import AuthenticatedSideBar from '../SideBar/AuthenticatedSidebar';
import { UnifiedSidebarContent, UnifiedSideBarDrawer } from '../SideBar';
import GlobalTopbar from '@/common/layouts/GlobalTopbar';
import GlobalSideBarDrawer from '@/common/layouts/GlobalTopbar/sidebar';
import MaintenanceBanner from '@/components/MaintenanceBanner';
import useUserPreferences from '@/core/hooks/useUserPreferences';
import useInactivityLogout from '@/core/hooks/useInactivityLogout';
import useMaintenanceStatus from '@/core/hooks/useMaintenanceStatus';
import { useGetActiveGroup } from '@/app/providers/UnifiedGroupProvider';
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
  // Generate dark mode flag for sidebar content
  const isDarkMode =
    theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, user-scalable=no"
        />
      </Head>

      {/* Global TopBar - Full width at top */}
      <GlobalTopbar
        topbarTitle={routeConfig.topbarTitle}
        showSearch={routeConfig.showSearch}
      />

      {/* Sidebar - Hidden on mobile, collapsed on desktop for map */}
      <AuthenticatedSideBar forceCollapse={true}>
        <UnifiedSidebarContent
          userType="user"
          isCollapsed={true}
          isDarkMode={isDarkMode}
        />
      </AuthenticatedSideBar>

      {/* Main Content - Account for both topbar and sidebar */}
      <main
        className="flex-1 transition-all duration-300 overflow-hidden 
        pt-[120px] sm:pt-[130px] md:pt-[125px] lg:pt-[60px] 
        lg:ml-[86px]"
      >
        <div className="h-[calc(100vh-120px)] sm:h-[calc(100vh-130px)] md:h-[calc(100vh-140px)] lg:h-[calc(100vh-60px)] overflow-hidden">
          {/* Maintenance Banner */}
          {maintenance && <MaintenanceBanner maintenance={maintenance} />}

          {/* Content - Full remaining height */}
          <div className="h-full text-text transition-all duration-300 overflow-hidden">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Drawer - Only show on mobile */}
      <UnifiedSideBarDrawer userType="user" />

      {/* Global SideBar Drawer */}
      <GlobalSideBarDrawer />
    </div>
  );
}

MapLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
