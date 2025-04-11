import React from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Head from 'next/head';

import AuthenticatedSideBar from '@/components/SideBar/AuthenticatedSidebar';
import TopBar from '../TopBar';
import SideBarDrawer from '../SideBar/SideBarDrawer';
import MaintenanceBanner from '../MaintenanceBanner';

import useUserPreferences from '@/core/hooks/useUserPreferences';
import useUserChecklists from '@/core/hooks/useUserChecklists';
import useInactivityLogout from '@/core/hooks/useInactivityLogout';
import useMaintenanceStatus from '@/core/hooks/useMaintenanceStatus';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';

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
  useUserChecklists();
  useInactivityLogout(userID);

  return (
    <div className="flex min-h-screen bg-background" data-testid="layout">
      <Head>
        <title>{pageTitle}</title>
        <meta property="og:title" content={pageTitle} key="title" />
      </Head>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 text-sidebar-text transition-all duration-300">
        <AuthenticatedSideBar />
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 
        ${isMapPage ? 'overflow-hidden' : 'overflow-y-auto'} 
        ${isCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[256px]'}`}
      >
        <div
          className={`overflow-hidden ${
            !isMapPage &&
            'max-w-[1200px] mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8'
          }`}
        >
          {/* Maintenance Banner */}
          {maintenance && <MaintenanceBanner maintenance={maintenance} />}

          {/* TopBar */}
          {noTopNav && (
            <TopBar
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
    </div>
  );
};

export default React.memo(Layout);
