'use client';

import Head from 'next/head';
import GlobalTopbar from '@/common/layouts/GlobalTopbar';
import GlobalSideBarDrawer from '@/common/layouts/GlobalTopbar/sidebar';
import { UnifiedSideBarDrawer } from '@/common/layouts/SideBar';
import MobileBottomNavigation from '@/common/layouts/components/MobileBottomNavigation';
import MaintenanceBanner from '@/components/MaintenanceBanner';
import useUserPreferences from '@/core/hooks/useUserPreferences';
import useInactivityLogout from '@/core/hooks/useInactivityLogout';
import useMaintenanceStatus from '@/core/hooks/useMaintenanceStatus';
import { useGetActiveGroup } from '@/app/providers/UnifiedGroupProvider';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import { ThemeCustomizer } from '@/common/features/theme-customizer/components/ThemeCustomizer';
import { THEME_LAYOUT } from '@/common/features/theme-customizer/constants/themeConstants';
import { withSessionAuth, PROTECTION_LEVELS } from '@/core/HOC';
import { useSession } from 'next-auth/react';
import Loading from '../loading';

function CreateOrganizationLayout({ children }) {
  const { status } = useSession();

  // Call all hooks at the top level, before any conditional returns
  const { userID } = useGetActiveGroup();
  const { maintenance } = useMaintenanceStatus();
  const { layout } = useTheme();

  // Initialize hooks exactly like UnifiedPagesLayout
  useUserPreferences();
  useInactivityLogout(userID);

  // Show loading while authentication is being checked
  if (status === 'loading') {
    return <Loading />;
  }

  // Route configuration for create organization page
  const routeConfig = {
    pageTitle: 'Request Organization Access - AirQo Analytics',
    topbarTitle: 'Request Organization Access',
  };

  // Determine container classes based on layout preference (same as UnifiedPagesLayout)
  const containerClasses =
    layout === THEME_LAYOUT.COMPACT
      ? 'max-w-7xl mx-auto flex flex-col gap-8 px-4 py-4 md:px-6 lg:py-8 lg:px-8'
      : 'w-full flex flex-col gap-8 px-4 py-4 md:px-6 lg:py-8 lg:px-8';

  const homeNavPath = '/user/Home';

  return (
    <div
      className="flex overflow-hidden min-h-screen h-screen bg-background"
      data-testid="create-organization-layout"
    >
      <Head>
        <title>{routeConfig.pageTitle}</title>
        <meta property="og:title" content={routeConfig.pageTitle} key="title" />
      </Head>
      {/* Global Topbar - Full width at top */}
      <GlobalTopbar
        topbarTitle={routeConfig.topbarTitle}
        homeNavPath={homeNavPath}
        showBreadcrumb={false}
      />
      {/* Main Content - Full width without sidebar */}
      <main className="flex-1 transition-all duration-300 pt-36 lg:pt-16 bg-background overflow-y-auto pb-20 md:pb-0">
        <div className={`h-full bg-background ${containerClasses}`}>
          {/* Maintenance Banner */}
          {maintenance && <MaintenanceBanner maintenance={maintenance} />}

          {/* Content */}
          <div className="text-text transition-all duration-300 bg-background h-full">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation - Show user navigation for create-organization */}
      <MobileBottomNavigation userType="user" />

      {/* Drawer - Show user navigation items for create-organization */}
      <UnifiedSideBarDrawer userType="user" />
      <GlobalSideBarDrawer />
      <ThemeCustomizer className="theme-customizer-sideButton" />
    </div>
  );
}

export default withSessionAuth(PROTECTION_LEVELS.PROTECTED)(
  CreateOrganizationLayout,
);
