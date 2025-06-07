'use client';

import React, { useEffect } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import Head from 'next/head';
import PropTypes from 'prop-types';
import { setSidebar } from '@/lib/store/services/sideBar/SideBarSlice';
import AuthenticatedSideBar from '@/common/layouts/SideBar/AuthenticatedSidebar';
import OrganizationSidebarContent from '@/common/layouts/SideBar/OrganizationSidebarContent';
import TopBar from '@/common/layouts/TopBar';
import SideBarDrawer from '@/common/layouts/SideBar/SideBarDrawer';
import MaintenanceBanner from '@/components/MaintenanceBanner';
import { useOrganization } from '@/app/providers/OrganizationProvider';
import useUserPreferences from '@/core/hooks/useUserPreferences';
import useInactivityLogout from '@/core/hooks/useInactivityLogout';
import useMaintenanceStatus from '@/core/hooks/useMaintenanceStatus';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';
import { useWindowSize } from '@/core/hooks/useWindowSize';
import { LAYOUT_CONFIGS, DEFAULT_CONFIGS } from './layoutConfigs';

/**
 * Organization Map Layout Component
 * Provides a specialized layout for the organization map route
 * Similar to MapLayout but specifically for organization context
 * Supports organization-specific sidebar and branding
 */
export default function OrganizationMapLayout({
  children,
  forceMapView = false, // eslint-disable-line no-unused-vars
}) {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const params = useParams();
  const orgSlug = params?.org_slug || '';
  const { userID } = useGetActiveGroup();
  const { maintenance } = useMaintenanceStatus();
  const { width } = useWindowSize();
  const { organization, primaryColor, secondaryColor, logo } =
    useOrganization();

  // Force sidebar collapse on small screens and when map is the main focus
  const isMobile = width < 768;

  // Normalize path for organization routes
  const normalizedPath = pathname.replace(`/org/${orgSlug}`, '/org/[org_slug]');
  // Get route configuration - try organization map config first, then fallback
  const routeConfig =
    LAYOUT_CONFIGS.ORGANIZATION[normalizedPath] ||
    LAYOUT_CONFIGS.MAP[normalizedPath] ||
    DEFAULT_CONFIGS.MAP;

  // Initialize hooks
  useUserPreferences();
  useInactivityLogout(userID);

  // When leaving map page, expand the sidebar for other pages
  useEffect(() => {
    return () => {
      // This runs when component unmounts (user navigates away from map)
      if (!isMobile) {
        dispatch(setSidebar(false)); // Expand the sidebar (false = not collapsed)
      }
    };
  }, [dispatch, isMobile]);

  // Logo component for organization
  const logoComponent = logo ? (
    <img
      src={logo}
      alt={`${organization?.name} logo`}
      className="w-[46.56px] h-8 object-contain"
      onError={(e) => {
        e.target.src = '/icons/airqo_logo.svg';
      }}
    />
  ) : null;
  return (
    <div
      className="flex overflow-hidden min-h-screen"
      data-testid="organization-map-layout"
      style={{
        '--org-primary': primaryColor,
        '--org-secondary': secondaryColor,
      }}
    >
      <Head>
        <title>{routeConfig.pageTitle}</title>
        <meta property="og:title" content={routeConfig.pageTitle} key="title" />
      </Head>
      {/* Organization Sidebar */}
      <aside className="fixed left-0 top-0 z-50 text-sidebar-text transition-all duration-300">
        <AuthenticatedSideBar
          forceCollapse={true}
          showCollapseButton={false}
          logoComponent={logoComponent}
          homeNavPath={`/org/${orgSlug}/dashboard`}
          showOrganizationDropdown={false}
        >
          <OrganizationSidebarContent isCollapsed={true} />
        </AuthenticatedSideBar>
      </aside>
      {/* Main Content */}{' '}
      <main className="flex-1 transition-all duration-300 overflow-hidden lg:ml-[88px]">
        <div className="overflow-hidden">
          {/* Maintenance Banner */}
          {maintenance && <MaintenanceBanner maintenance={maintenance} />}

          {/* TopBar - Only show on mobile */}
          {!routeConfig.noTopNav && isMobile && (
            <TopBar
              topbarTitle={routeConfig.topbarTitle}
              noBorderBottom={routeConfig.noBorderBottom}
              showSearch={routeConfig.showSearch}
              logoComponent={logoComponent}
              homeNavPath={`/org/${orgSlug}/dashboard`}
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
}

OrganizationMapLayout.propTypes = {
  children: PropTypes.node.isRequired,
  forceMapView: PropTypes.bool,
};
