'use client';

import { usePathname, useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import Head from 'next/head';
import AuthenticatedSideBar from '@/common/layouts/SideBar/AuthenticatedSidebar';
import GlobalTopbar from '@/common/layouts/GlobalTopbar';
import GlobalSideBarDrawer from '@/common/layouts/GlobalTopbar/sidebar';
import SideBarDrawer from '../SideBar/SideBarDrawer';
import OrganizationSideBarDrawer from '../SideBar/OrganizationSideBarDrawer';
import MaintenanceBanner from '@/components/MaintenanceBanner';
import UserSidebarContent from '@/common/layouts/SideBar/UserSidebarContent';
import OrganizationSidebarContent from '@/common/layouts/SideBar/OrganizationSidebarContent';
import useUserPreferences from '@/core/hooks/useUserPreferences';
import useInactivityLogout from '@/core/hooks/useInactivityLogout';
import useMaintenanceStatus from '@/core/hooks/useMaintenanceStatus';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import { ThemeCustomizer } from '@/common/features/theme-customizer/components/ThemeCustomizer';
import { THEME_LAYOUT } from '@/common/features/theme-customizer/constants/themeConstants';
import { LAYOUT_CONFIGS, DEFAULT_CONFIGS } from '../layoutConfigs';
import DarkModeToggle from '@/common/components/DarkModeToggle';
import { useOrganization } from '@/app/providers/OrganizationProvider';

/**
 * Unified Layout Component
 * Automatically detects context (individual user vs organization) and renders appropriate layout
 * Provides a shared layout for all dashboard routes with dynamic configuration
 */
export default function UnifiedPagesLayout({ children }) {
  const pathname = usePathname();
  const params = useParams();
  const { userID } = useGetActiveGroup();
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  const { maintenance } = useMaintenanceStatus();
  const isMapPage = pathname === '/user/map' || pathname === '/map';

  // Detect context (individual vs organization)
  const isOrganizationContext = pathname.startsWith('/org/');
  const orgSlug = params?.org_slug || '';

  // Get organization data if in org context - only call hook conditionally
  let organization = null;
  let primaryColor = null;
  let secondaryColor = null;

  if (isOrganizationContext) {
    const orgData = useOrganization();
    organization = orgData.organization;
    primaryColor = orgData.primaryColor;
    secondaryColor = orgData.secondaryColor;
  }

  // Get route configuration based on current pathname
  const getRouteConfig = () => {
    if (isOrganizationContext) {
      const normalizedPath = pathname.replace(
        `/org/${orgSlug}`,
        '/org/[org_slug]',
      );
      return (
        LAYOUT_CONFIGS.ORGANIZATION?.[normalizedPath] ||
        DEFAULT_CONFIGS.ORGANIZATION
      );
    } else {
      // Check dashboard routes
      if (LAYOUT_CONFIGS.DASHBOARD?.[pathname]) {
        return LAYOUT_CONFIGS.DASHBOARD[pathname];
      }
      // Check map routes
      if (LAYOUT_CONFIGS.MAP?.[pathname]) {
        return LAYOUT_CONFIGS.MAP[pathname];
      }
      // Fallback to default dashboard config
      return DEFAULT_CONFIGS.DASHBOARD;
    }
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

  // Determine logo and navigation paths
  const logoComponent =
    isOrganizationContext && organization?.logo ? (
      <img
        src={organization.logo}
        alt={`${organization.name} Logo`}
        className="w-[46.56px] h-8 object-contain"
        onError={(e) => {
          e.target.src = '/icons/airqo_logo.svg';
        }}
      />
    ) : null;

  const homeNavPath = isOrganizationContext
    ? `/org/${orgSlug}/dashboard`
    : '/user/Home';

  const customActions = isOrganizationContext ? (
    <div className="flex items-center gap-2">
      <DarkModeToggle size="md" />
    </div>
  ) : null;
  return (
    <div
      className="flex overflow-hidden min-h-screen h-screen bg-background"
      data-testid={isOrganizationContext ? 'organization-layout' : 'layout'}
      style={
        isOrganizationContext
          ? {
              '--org-primary': primaryColor,
              '--org-secondary': secondaryColor,
            }
          : {}
      }
    >
      <Head>
        <title>{routeConfig.pageTitle}</title>
        <meta property="og:title" content={routeConfig.pageTitle} key="title" />
      </Head>{' '}
      {/* Global Topbar - Full width at top */}
      <GlobalTopbar
        topbarTitle={routeConfig.topbarTitle}
        logoComponent={logoComponent}
        homeNavPath={homeNavPath}
        customActions={customActions}
      />{' '}
      {/* Sidebar - Fixed position below topbar */}
      <aside className="fixed left-0 top-36 lg:top-[63px] z-50 text-sidebar-text transition-all duration-300">
        {isOrganizationContext ? (
          <AuthenticatedSideBar>
            <OrganizationSidebarContent
              isCollapsed={isCollapsed}
              styles={{
                '--org-primary': primaryColor,
                '--org-secondary': secondaryColor,
              }}
            />
          </AuthenticatedSideBar>
        ) : (
          <AuthenticatedSideBar>
            <UserSidebarContent isCollapsed={isCollapsed} styles={{}} />
          </AuthenticatedSideBar>
        )}
      </aside>
      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 pt-36 lg:pt-16 bg-background
          ${isMapPage ? 'overflow-hidden' : 'overflow-y-auto'} 
          ${isCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[256px]'}`}
      >
        <div className={`h-full bg-background ${containerClasses}`}>
          {/* Maintenance Banner */}
          {maintenance && <MaintenanceBanner maintenance={maintenance} />}
          {/* Content */}
          <div className="text-text transition-all duration-300 bg-background h-full">
            {children}
          </div>
        </div>
      </main>
      {/* SideBar Drawer */}
      {isOrganizationContext ? (
        <OrganizationSideBarDrawer />
      ) : (
        <SideBarDrawer />
      )}
      {/* Global SideBar Drawer */}
      <GlobalSideBarDrawer />
      {/* Theme Customizer - Available in both individual and organization contexts */}
      <ThemeCustomizer />
    </div>
  );
}
