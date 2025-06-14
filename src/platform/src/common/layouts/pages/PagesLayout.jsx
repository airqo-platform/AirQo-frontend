'use client';

import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import Head from 'next/head';
import AuthenticatedSideBar from '@/common/layouts/SideBar/AuthenticatedSidebar';
import GlobalTopbar from '@/common/layouts/GlobalTopbar';
import SideBarDrawer from '../SideBar/SideBarDrawer';
import MaintenanceBanner from '@/components/MaintenanceBanner';
import GlobalSideBarDrawer from '@/common/layouts/GlobalTopbar/sidebar';
import useUserPreferences from '@/core/hooks/useUserPreferences';
import useInactivityLogout from '@/core/hooks/useInactivityLogout';
import useMaintenanceStatus from '@/core/hooks/useMaintenanceStatus';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import { THEME_LAYOUT } from '@/common/features/theme-customizer/constants/themeConstants';
import { LAYOUT_CONFIGS, DEFAULT_CONFIGS } from '../layoutConfigs';

/**
 * Unified Layout Component
 * Automatically detects context (individual user vs organization) and renders appropriate layout
 * Provides a shared layout for all dashboard routes with dynamic configuration
 */
export default function PagesLayout({ children }) {
  const pathname = usePathname();
  const { userID } = useGetActiveGroup();
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  const { maintenance } = useMaintenanceStatus();
  const isMapPage = pathname === '/map';

  // Get route configuration based on current pathname
  const getRouteConfig = () => {
    // Check dashboard routes
    if (LAYOUT_CONFIGS.DASHBOARD[pathname]) {
      return LAYOUT_CONFIGS.DASHBOARD[pathname];
    }

    // Check map routes
    if (LAYOUT_CONFIGS.MAP[pathname]) {
      return LAYOUT_CONFIGS.MAP[pathname];
    }

    // Fallback to default dashboard config
    return DEFAULT_CONFIGS.DASHBOARD;
  };

  const routeConfig = getRouteConfig();

  // Initialize hooks
  useUserPreferences();
  useInactivityLogout(userID);

  // Get current layout (compact or wide)
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
        <title>{routeConfig.pageTitle}</title>
        <meta property="og:title" content={routeConfig.pageTitle} key="title" />
      </Head>{' '}
      {/* Global TopBar - Full width at top */}
      <GlobalTopbar
        topbarTitle={routeConfig.topbarTitle}
        noBorderBottom={routeConfig.noBorderBottom}
        showSearch={routeConfig.showSearch}
      />{' '}
      {/* Sidebar - Fixed position below topbar */}
      <aside className="fixed left-0 top-36 lg:top-[60px] z-50 text-sidebar-text transition-all duration-300">
        <AuthenticatedSideBar />
      </aside>
      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 pt-36 lg:pt-16
          ${isMapPage ? 'overflow-hidden' : 'overflow-y-auto'} 
          ${isCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[256px]'}`}
      >
        {' '}
        <div className={`overflow-hidden ${containerClasses}`}>
          {/* Maintenance Banner */}
          {maintenance && <MaintenanceBanner maintenance={maintenance} />}

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
}
