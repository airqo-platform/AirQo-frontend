'use client';

import React from 'react';
import { usePathname, useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import Head from 'next/head';
import { useOrganization } from '@/app/providers/OrganizationProvider';
import AuthenticatedSideBar from '@/common/layouts/SideBar/AuthenticatedSidebar';
import TopBar from '@/common/layouts/TopBar';
import UserProfileDropdown from '@/common/layouts/TopBar/UserProfileDropdown';
import OrganizationSideBarDrawer from '@/common/layouts/SideBar/OrganizationSideBarDrawer';
import MaintenanceBanner from '@/components/MaintenanceBanner';
import OrganizationSidebarContent from '@/common/layouts/SideBar/OrganizationSidebarContent';
import useMaintenanceStatus from '@/core/hooks/useMaintenanceStatus';
import useUserPreferences from '@/core/hooks/useUserPreferences';
import useInactivityLogout from '@/core/hooks/useInactivityLogout';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import { THEME_LAYOUT } from '@/common/features/theme-customizer/constants/themeConstants';
import { LAYOUT_CONFIGS, DEFAULT_CONFIGS } from '../layoutConfigs';
import DarkModeToggle from '@/common/components/DarkModeToggle';

function OrganizationPagesLayout({ children }) {
  const pathname = usePathname();
  const params = useParams();
  const orgSlug = params?.org_slug || '';
  const { organization, primaryColor, secondaryColor } = useOrganization();
  const { userID } = useGetActiveGroup();
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  const { maintenance } = useMaintenanceStatus();

  const normalizedPath = pathname.replace(`/org/${orgSlug}`, '/org/[org_slug]');
  const routeConfig =
    LAYOUT_CONFIGS.ORGANIZATION[normalizedPath] || DEFAULT_CONFIGS.ORGANIZATION;

  // Initialize hooks like in user layout
  useUserPreferences();
  useInactivityLogout(userID);

  // Get current layout (compact or wide)
  const { layout } = useTheme();

  // Determine container classes based on layout preference (matching user layout pattern)
  const containerClasses =
    layout === THEME_LAYOUT.COMPACT
      ? 'max-w-7xl mx-auto flex flex-col gap-8 px-4 py-4 md:px-6 lg:py-8 lg:px-8'
      : 'w-full flex flex-col gap-8 px-4 py-4 md:px-6 lg:py-8 lg:px-8';

  return (
    <div
      className="flex overflow-hidden min-h-screen"
      data-testid="organization-layout"
      style={{
        '--org-primary': primaryColor,
        '--org-secondary': secondaryColor,
      }}
    >
      <Head>
        <title>{routeConfig.pageTitle}</title>
        <meta property="og:title" content={routeConfig.pageTitle} key="title" />
      </Head>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 text-sidebar-text transition-all duration-300">
        <AuthenticatedSideBar
          logoComponent={
            organization?.logo ? (
              <img
                src={organization.logo}
                alt={`${organization.name} Logo`}
                className="h-8 w-auto"
              />
            ) : null
          }
          onLogoClick={() =>
            (window.location.href = `/org/${orgSlug}/dashboard`)
          }
          homeNavPath={`/org/${orgSlug}/dashboard`}
          showOrganizationDropdown={true}
        >
          <OrganizationSidebarContent
            isCollapsed={isCollapsed}
            styles={{
              '--org-primary': primaryColor,
              '--org-secondary': secondaryColor,
            }}
          />
        </AuthenticatedSideBar>
      </aside>
      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 overflow-y-auto ${
          isCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[256px]'
        }`}
      >
        <div className={`overflow-hidden ${containerClasses}`}>
          {/* Maintenance Banner */}
          {maintenance && <MaintenanceBanner maintenance={maintenance} />}
          {/* TopBar */}{' '}
          <TopBar
            topbarTitle={routeConfig.topbarTitle}
            noBorderBottom={routeConfig.noBorderBottom}
            showSearch={routeConfig.showSearch}
            logoComponent={
              organization?.logo ? (
                <img
                  src={organization.logo}
                  alt={`${organization.name} Logo`}
                  className="h-8 w-auto"
                />
              ) : null
            }
            onLogoClick={() =>
              (window.location.href = `/org/${orgSlug}/dashboard`)
            }
            showUserProfile={true}
            customActions={
              <div className="flex items-center gap-2">
                <DarkModeToggle size="md" />
                <UserProfileDropdown
                  dropdownAlign="right"
                  showUserInfo={true}
                />
              </div>
            }
          />
          {/* Content */}
          <div className="text-text transition-all duration-300 overflow-hidden">
            {children}
          </div>
        </div>
      </main>{' '}
      {/* SideBar Drawer */}
      <OrganizationSideBarDrawer />
    </div>
  );
}

export default OrganizationPagesLayout;
