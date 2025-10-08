'use client';

import { withSessionAuth, PROTECTION_LEVELS } from '@/core/HOC';
import AuthenticatedSideBar from '@/common/layouts/SideBar/AuthenticatedSidebar';
import {
  UnifiedSidebarContent,
  UnifiedSideBarDrawer,
} from '@/common/layouts/SideBar';
import Footer from '@/common/layouts/components/Footer';
import GlobalTopbar from '@/common/layouts/GlobalTopbar';
import MobileBottomNavigation from '@/common/layouts/components/MobileBottomNavigation';
import MaintenanceBanner from '@/common/components/MaintenanceBanner';
import GlobalSideBarDrawer from '@/common/layouts/GlobalTopbar/sidebar';
import useUserPreferences from '@/core/hooks/useUserPreferences';
import useInactivityLogout from '@/core/hooks/useInactivityLogout';
import useMaintenanceStatus from '@/core/hooks/useMaintenanceStatus';
import { useGetActiveGroup } from '@/app/providers/UnifiedGroupProvider';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import { THEME_LAYOUT } from '@/common/features/theme-customizer/constants/themeConstants';
import { useSelector } from 'react-redux';
import Head from 'next/head';
import { ThemeCustomizer } from '@/common/features/theme-customizer/components/ThemeCustomizer';
import { useMemo } from 'react';

/**
 * Admin Layout Component
 * Layout specifically for admin routes with admin-specific sidebar content
 * Optimized to prevent unnecessary re-renders and memory leaks
 */
function AdminLayout({ children }) {
  const { userID } = useGetActiveGroup();
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  const { maintenance } = useMaintenanceStatus();

  // Initialize hooks only once with proper cleanup
  useUserPreferences();
  useInactivityLogout(userID);

  // Get current layout (compact or wide) - memoized to prevent recalculation
  const { layout } = useTheme();

  // Memoize container classes to prevent recalculation on every render
  const containerClasses = useMemo(
    () =>
      layout === THEME_LAYOUT.COMPACT
        ? 'max-w-7xl mx-auto flex flex-col gap-8 px-4 py-4 md:px-6 lg:py-8 lg:px-8'
        : 'w-full flex flex-col gap-8 px-4 py-4 md:px-6 lg:py-8 lg:px-8',
    [layout],
  );

  // Memoize main content class to prevent recalculation
  const mainContentClass = useMemo(
    () =>
      `flex-1 transition-all duration-300 pt-36 lg:pt-16 overflow-y-auto pb-20 md:pb-0
    ${isCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[256px]'}`,
    [isCollapsed],
  );

  return (
    <div
      className="flex overflow-hidden min-h-screen h-screen bg-background"
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
          <UnifiedSidebarContent userType="admin" isCollapsed={isCollapsed} />
        </AuthenticatedSideBar>
      </aside>

      {/* Main Content */}
      <main
        className={`${mainContentClass} bg-background w-full flex flex-col`}
      >
        <div className={`flex-1 w-full bg-background ${containerClasses}`}>
          {/* Maintenance Banner */}
          {maintenance && <MaintenanceBanner maintenance={maintenance} />}

          {/* Content */}
          <div className="text-text transition-all duration-300 h-full">
            {children}
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </main>

      {/* Mobile Bottom Navigation - Show admin navigation for mobile */}
      <MobileBottomNavigation userType="admin" />

      {/* Theme Customizer */}
      <ThemeCustomizer className="theme-customizer-sideButton" />

      {/* Admin SideBar Drawer */}
      <UnifiedSideBarDrawer userType="admin" />
      <GlobalSideBarDrawer />
    </div>
  );
}

export default withSessionAuth(AdminLayout, PROTECTION_LEVELS.PROTECTED);
