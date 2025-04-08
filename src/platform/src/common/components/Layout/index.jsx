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

  // Custom Hooks
  useUserPreferences();
  useUserChecklists();
  useInactivityLogout(userID);

  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);

  const { maintenance } = useMaintenanceStatus();

  return (
    <div className="flex min-h-screen bg-[#f6f6f7]" data-testid="layout">
      <Head>
        <title>{pageTitle}</title>
        <meta property="og:title" content={pageTitle} key="title" />
      </Head>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 text-[#1C1D20] transition-all duration-300 ease-in-out">
        <AuthenticatedSideBar />
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${
          router.pathname === '/map' ? 'overflow-hidden' : 'overflow-y-auto'
        } ${isCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[256px]'}`}
      >
        <div
          className={`${
            router.pathname === '/map'
              ? ''
              : 'max-w-[1200px] mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8'
          } overflow-hidden`}
        >
          {/* Maintenance Banner */}
          <MaintenanceBanner maintenance={maintenance} />

          {/* TopBar */}
          {noTopNav && (
            <TopBar
              topbarTitle={topbarTitle}
              noBorderBottom={noBorderBottom}
              showSearch={showSearch}
            />
          )}

          {/* Children */}
          <div className="text-[#1C1D20] transition-all duration-300 ease-in-out overflow-hidden">
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
