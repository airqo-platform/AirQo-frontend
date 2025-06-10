// src/components/Layout.jsx
'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

import AuthenticatedSideBar from '@/components/SideBar/AuthenticatedSidebar';
import PageTopBar from '../PageTopBar';
import SideBarDrawer from '../SideBar/SideBarDrawer';
import MaintenanceBanner from '../MaintenanceBanner';
import GlobalTopbar from '../GlobalTopbar';
import GlobalSideBarDrawer from '../GlobalTopbar/sidebar';

import useUserPreferences from '@/core/hooks/useUserPreferences';
import useInactivityLogout from '@/core/hooks/useInactivityLogout';
import useMaintenanceStatus from '@/core/hooks/useMaintenanceStatus';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';

// NEW: import theme hook and layout constants
import { useTheme } from '@/features/theme-customizer/hooks/useTheme';
import { THEME_LAYOUT } from '@/features/theme-customizer/constants/themeConstants';

const Layout = ({
  pageTitle = 'AirQo Analytics',
  children,
  topbarTitle,
  noBorderBottom,
  noTopNav = true,
  showSearch,
}) => {
  const router = useRouter();
  const { userID } = useGetActiveGroup();
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  const { maintenance } = useMaintenanceStatus();
  const isMapPage = router.pathname === '/map';

  // Initialize hooks
  useUserPreferences();
  useInactivityLogout(userID);

  // NEW: get current layout (compact or wide)
  const { layout } = useTheme();

  // Determine container classes based on layout preference
  const containerClasses = !isMapPage
    ? layout === THEME_LAYOUT.COMPACT
      ? 'max-w-7xl mx-auto flex flex-col gap-8 px-4 py-4 md:px-6 lg:py-8 lg:px-8'
      : 'w-full flex flex-col gap-8 px-4 py-4 md:px-6 lg:py-8 lg:px-8'
    : '';

  return (
    <div className="flex overflow-hidden min-h-screen" data-testid="layout">
      <Head>
        <title>{pageTitle}</title>
        <meta property="og:title" content={pageTitle} key="title" />
      </Head>

      <GlobalTopbar topbarTitle={topbarTitle} />

      {/* Sidebar */}
      <aside className="fixed left-0 top-12 z-50 text-sidebar-text transition-all duration-300">
        <AuthenticatedSideBar />
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all mt-20 lg:mt-12 duration-300 
          ${isMapPage ? 'overflow-hidden' : 'overflow-y-auto'} 
          ${isCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[256px]'}`}
      >
        <div className={`overflow-hidden ${containerClasses}`}>
          {/* Maintenance Banner */}
          {maintenance && <MaintenanceBanner maintenance={maintenance} />}

          {/* PageTopBar */}
          {noTopNav && (
            <PageTopBar
              topbarTitle={topbarTitle}
              noBorderBottom={noBorderBottom}
              showSearch={showSearch}
            />
          )}

          {/* Content */}
          <div className="text-text transition-all duration-300 overflow-hidden">
            {children}
          </div>
        </div>
      </main>

      {/* SideBar Drawer */}
      <SideBarDrawer />

      <GlobalSideBarDrawer />
    </div>
  );
};

export default React.memo(Layout);
