'use client';

import React from 'react';
import { usePathname, useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useOrganization } from '@/app/providers/OrganizationProvider';
import AuthenticatedSideBar from '@/common/layouts/SideBar/AuthenticatedSidebar';
import TopBar from '@/common/layouts/TopBar';
import SideBarDrawer from '@/common/layouts/SideBar/SideBarDrawer';
import MaintenanceBanner from '@/components/MaintenanceBanner';
import OrganizationSidebarContent from '@/common/layouts/SideBar/OrganizationSidebarContent';
import useMaintenanceStatus from '@/core/hooks/useMaintenanceStatus';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import { THEME_LAYOUT } from '@/common/features/theme-customizer/constants/themeConstants';
import { LAYOUT_CONFIGS, DEFAULT_CONFIGS } from './layoutConfigs';

function OrganizationPagesLayout({ children }) {
  const pathname = usePathname();
  const params = useParams();
  const orgSlug = params?.org_slug || '';
  const { organization, primaryColor, secondaryColor } = useOrganization();
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  const { maintenance } = useMaintenanceStatus();

  const normalizedPath = pathname.replace(`/org/${orgSlug}`, '/org/[org_slug]');
  const routeConfig =
    LAYOUT_CONFIGS.ORGANIZATION[normalizedPath] || DEFAULT_CONFIGS.ORGANIZATION;
  const { layout } = useTheme();

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
          <OrganizationSidebarContent isCollapsed={isCollapsed} />
        </AuthenticatedSideBar>
      </aside>

      <main
        className={`flex-1 transition-all duration-300 overflow-y-auto ${isCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[256px]'}`}
      >
        <div className={`overflow-hidden ${containerClasses}`}>
          {maintenance && <MaintenanceBanner maintenance={maintenance} />}{' '}
          <TopBar
            topbarTitle={routeConfig.topbarTitle}
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
            customActions={null}
          />
          {/* Organization-specific header content */}
          <div className="flex items-center justify-between w-full px-4 -mt-2">
            <div className="flex items-center space-x-4">
              {organization?.name && (
                <span className="text-sm text-gray-500 hidden md:inline">
                  {organization.name}
                </span>
              )}
            </div>
            {routeConfig.showSearch && (
              <div className="flex-1 max-w-md mx-4">
                {/* Search component can be added here */}
              </div>
            )}
          </div>
          <div className="text-text transition-all duration-300 overflow-hidden">
            {children}
          </div>
        </div>
      </main>

      <SideBarDrawer />
    </div>
  );
}

export default OrganizationPagesLayout;
