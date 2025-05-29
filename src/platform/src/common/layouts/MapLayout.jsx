'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import Head from 'next/head';
import PropTypes from 'prop-types';
import AuthenticatedSideBar from '@/components/SideBar/AuthenticatedSidebar';
import TopBar from '@/components/TopBar';
import SideBarDrawer from '@/components/SideBar/SideBarDrawer';
import MaintenanceBanner from '@/components/MaintenanceBanner';
import useUserPreferences from '@/core/hooks/useUserPreferences';
import useInactivityLogout from '@/core/hooks/useInactivityLogout';
import useMaintenanceStatus from '@/core/hooks/useMaintenanceStatus';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';
import { useWindowSize } from '@/lib/windowSize';
import { LAYOUT_CONFIGS, DEFAULT_CONFIGS } from './layoutConfigs';

/**
 * Map Layout Component
 * Provides a specialized layout for the map route
 * Map page has different layout requirements
 */
export default function MapLayout({ children, forceMapView = false }) {
  const pathname = usePathname();
  const { userID } = useGetActiveGroup();
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  const { maintenance } = useMaintenanceStatus();
  const { width } = useWindowSize();

  // Force sidebar collapse on small screens and when map is the main focus
  const isMobile = width < 768;

  // Get route configuration based on current pathname
  const routeConfig = LAYOUT_CONFIGS.MAP[pathname] || DEFAULT_CONFIGS.MAP;

  // Initialize hooks
  useUserPreferences();
  useInactivityLogout(userID);

  return (
    <div className="flex overflow-hidden min-h-screen" data-testid="layout">
      <Head>
        <title>{routeConfig.pageTitle}</title>
        <meta property="og:title" content={routeConfig.pageTitle} key="title" />
      </Head>{' '}
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 text-sidebar-text transition-all duration-300">
        <AuthenticatedSideBar forceCollapse={isMobile || forceMapView} />
      </aside>
      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 
          overflow-hidden
          ${isCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[256px]'}`}
      >
        <div className="overflow-hidden">
          {/* Maintenance Banner */}
          {maintenance && <MaintenanceBanner maintenance={maintenance} />}
          {/* TopBar - Only show on mobile */}
          {!routeConfig.noTopNav && isMobile && (
            <TopBar
              topbarTitle={routeConfig.topbarTitle}
              noBorderBottom={routeConfig.noBorderBottom}
              showSearch={routeConfig.showSearch}
            />
          )}

          {/* Content */}
          <div className="text-text transition-all duration-300 overflow-hidden">
            {children}
          </div>
        </div>
      </main>
      {/* SideBar Drawer */}
      <SideBarDrawer />{' '}
    </div>
  );
}

MapLayout.propTypes = {
  children: PropTypes.node.isRequired,
  forceMapView: PropTypes.bool,
};
