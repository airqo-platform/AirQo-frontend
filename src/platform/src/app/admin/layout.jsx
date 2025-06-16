'use client';

import { withAdminAccess } from '@/core/HOC';
import AuthenticatedSideBar from '@/common/layouts/SideBar/AuthenticatedSidebar';
import AdminSidebarContent from '@/common/layouts/SideBar/AdminSidebarContent';
import GlobalTopbar from '@/common/layouts/GlobalTopbar';
import AdminSideBarDrawer from '@/common/layouts/SideBar/AdminSideBarDrawer';
import MaintenanceBanner from '@/components/MaintenanceBanner';
import GlobalSideBarDrawer from '@/common/layouts/GlobalTopbar/sidebar';
import useUserPreferences from '@/core/hooks/useUserPreferences';
import useInactivityLogout from '@/core/hooks/useInactivityLogout';
import useMaintenanceStatus from '@/core/hooks/useMaintenanceStatus';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import { THEME_LAYOUT } from '@/common/features/theme-customizer/constants/themeConstants';
import { useSelector } from 'react-redux';
import Head from 'next/head';
import { ThemeCustomizer } from '@/common/features/theme-customizer/components/ThemeCustomizer';

/**
 * Admin Layout Component
 * Layout specifically for admin routes with admin-specific sidebar content
 */
function AdminLayout({ children }) {
  const { userID } = useGetActiveGroup();
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  const { maintenance } = useMaintenanceStatus();

  // Initialize hooks
  useUserPreferences();
  useInactivityLogout(userID);

  // Get current layout (compact or wide)
  const { layout } = useTheme();

  // Determine container classes based on layout preference
  const containerClasses =
    layout === THEME_LAYOUT.COMPACT
      ? 'max-w-7xl mx-auto flex flex-col gap-8 px-4 py-4 md:px-6 lg:py-8 lg:px-8'
      : 'w-full flex flex-col gap-8 px-4 py-4 md:px-6 lg:py-8 lg:px-8';

  return (
    <div
      className="flex overflow-hidden min-h-screen"
      data-testid="admin-layout"
    >
      <Head>
        <title>Admin Panel - AirQo Analytics</title>
        <meta
          property="og:title"
          content="Admin Panel - AirQo Analytics"
          key="title"
        />
      </Head>

      {/* Global TopBar - Full width at top */}
      <GlobalTopbar
        topbarTitle="Admin Panel"
        noBorderBottom={false}
        showSearch={false}
      />

      {/* Sidebar - Fixed position below topbar with admin content */}
      <aside className="fixed left-0 top-36 lg:top-[60px] z-50 text-sidebar-text transition-all duration-300">
        <AuthenticatedSideBar>
          <AdminSidebarContent isCollapsed={isCollapsed} />
        </AuthenticatedSideBar>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 pt-36 lg:pt-16 overflow-y-auto 
          ${isCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[256px]'}`}
      >
        <div className={`overflow-hidden ${containerClasses}`}>
          {/* Maintenance Banner */}
          {maintenance && <MaintenanceBanner maintenance={maintenance} />}

          {/* Content */}
          <div className="text-text transition-all duration-300 overflow-hidden">
            {children}
          </div>
        </div>
      </main>

      {/* Theme Customizer */}
      <ThemeCustomizer />

      {/* Admin SideBar Drawer */}
      <AdminSideBarDrawer />
      <GlobalSideBarDrawer />
    </div>
  );
}

export default withAdminAccess(AdminLayout);
