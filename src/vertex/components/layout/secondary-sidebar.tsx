'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import {
  AqHomeSmile,
  AqCpuChip01,
  AqMonitor,
  AqMarkerPin01,
  AqPackagePlus,
  AqCollocation,
  AqBezierCurve02,
  AqFileQuestion02,
  AqUsers01,
  AqShield01,
  AqLinkExternal01,
} from '@airqo/icons-react';
import { Button } from '@/components/ui/button';
import { useUserContext } from '@/core/hooks/useUserContext';
import { usePermission } from '@/core/hooks/usePermissions';
import { PERMISSIONS } from '@/core/permissions/constants';
import { usePathname } from 'next/navigation';
import { ROUTE_LINKS } from '@/core/routes';
import { ANALYTICS_BASE_URL } from '@/core/urls';
import Card from '../shared/card/CardWrapper';
import { NavItem } from './NavItem';
import { useDetectedPlatform } from '@/core/hooks/useDetectedPlatform';

interface SecondarySidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  activeModule: string;
  onNavigate?: () => void;
}

const styles = {
  scrollbar: 'scrollbar-thumb-gray-300 scrollbar-track-gray-100',
};

const SidebarSectionHeading = ({
  children,
  isCollapsed,
}: {
  children: React.ReactNode;
  isCollapsed: boolean;
}) =>
  !isCollapsed ? (
    <div className="mt-6 mb-2 px-2 text-xs font-semibold text-muted-foreground capitalize tracking-wider">
      {children}
    </div>
  ) : null;

const SecondarySidebar: React.FC<SecondarySidebarProps> = ({
  isCollapsed,
  toggleSidebar,
  activeModule,
  onNavigate,
}) => {
  const { getContextPermissions, isExternalOrg, activeGroup } =
    useUserContext();
  const contextPermissions = getContextPermissions();
  const canViewMembers = usePermission(PERMISSIONS.MEMBER.VIEW);
  const canViewRoles = usePermission(PERMISSIONS.ROLE.VIEW);
  const pathname = usePathname();

  // Organization slug used by the analytics platform: lowercase, spaces/underscores as dashes
  const orgSlug = activeGroup?.grp_title
    ?.toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-');

  const { isElectron } = useDetectedPlatform();

  return (
    <aside
      data-vertex-secondary-sidebar
      className="hidden lg:block fixed left-0 top-[calc(55px+var(--vertex-ui-top-offset))] z-50 text-sidebar-text transition-all duration-300 ease-in-out p-1"
    >
      <div
        data-vertex-secondary-sidebar-container
        className={`transition-all duration-300 ease-in-out relative z-50 p-1
          ${isCollapsed ? 'w-[75px]' : 'w-[256px]'} h-[calc(100vh-55px-var(--vertex-ui-top-offset))]`}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={`absolute flex rounded-full top-4 -right-[6px] z-50 shadow-lg justify-center items-center border w-6 h-6 bg-white dark:bg-zinc-950 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:shadow-xl transition-all duration-200`}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-700 dark:text-gray-200" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-700 dark:text-gray-200" />
          )}
        </Button>
        <Card
          className="h-full relative overflow-hidden"
          padding={isCollapsed ? 'p-2' : 'p-3'}
          overflow
          overflowType="auto"
          contentClassName={`flex flex-col h-full overflow-x-hidden scrollbar-thin ${styles.scrollbar}`}
        >
          {/* Device Management Module - Personal devices for all users */}
          {activeModule === 'devices' && (
            <>
              {!isExternalOrg ? (
                /* Personal Scope View (Default) */
                <>
                  <NavItem
                    item={{
                      href: ROUTE_LINKS.HOME,
                      icon: AqHomeSmile,
                      label: 'Home',
                      disabled: false,
                    }}
                    isCollapsed={isCollapsed}
                    onClick={onNavigate}
                  />
                  <SidebarSectionHeading isCollapsed={isCollapsed}>
                    Personal assets
                  </SidebarSectionHeading>
                  <NavItem
                    item={{
                      href: ROUTE_LINKS.MY_DEVICES,
                      icon: AqMonitor,
                      label: 'My Devices',
                      disabled: false,
                    }}
                    isCollapsed={isCollapsed}
                    onClick={onNavigate}
                  />
                  <NavItem
                    item={{
                      href: ROUTE_LINKS.MY_SITES,
                      icon: AqMarkerPin01,
                      label: 'My Sites',
                      disabled: false,
                    }}
                    isCollapsed={isCollapsed}
                    onClick={onNavigate}
                  />
                  <SidebarSectionHeading isCollapsed={isCollapsed}>
                    Data Access & Visibility
                  </SidebarSectionHeading>
                  <NavItem
                    item={{
                      href: ROUTE_LINKS.DEVICE_COHORTS,
                      icon: AqCollocation,
                      label: 'Cohorts',
                      disabled: !contextPermissions.canViewDevices,
                    }}
                    isCollapsed={isCollapsed}
                    onClick={onNavigate}
                  />
                </>
              ) : (
                /* Organization Scope View (External & Internal) */
                <>
                  <NavItem
                    item={{
                      href: ROUTE_LINKS.HOME,
                      icon: AqHomeSmile,
                      label: 'Overview',
                      disabled: false,
                    }}
                    isCollapsed={isCollapsed}
                    onClick={onNavigate}
                  />
                  <SidebarSectionHeading isCollapsed={isCollapsed}>
                    Organization Assets
                  </SidebarSectionHeading>
                  <NavItem
                    item={{
                      href: ROUTE_LINKS.ORG_ASSETS,
                      icon: AqMonitor,
                      label: 'Devices',
                      disabled: !contextPermissions.canViewDevices,
                    }}
                    isCollapsed={isCollapsed}
                    onClick={onNavigate}
                  />
                  <NavItem
                    item={{
                      href: ROUTE_LINKS.ORG_SITES,
                      icon: AqMarkerPin01,
                      label: 'Sites',
                      disabled: !contextPermissions.canViewSites,
                    }}
                    isCollapsed={isCollapsed}
                    onClick={onNavigate}
                  />

                  <SidebarSectionHeading isCollapsed={isCollapsed}>
                    Data Access & Visibility
                  </SidebarSectionHeading>
                  <NavItem
                    item={{
                      href: ROUTE_LINKS.DEVICE_COHORTS,
                      icon: AqCollocation,
                      label: 'Cohorts',
                      disabled: !contextPermissions.canViewDevices,
                    }}
                    isCollapsed={isCollapsed}
                    onClick={onNavigate}
                  />

                  {orgSlug && (canViewMembers || canViewRoles) && (
                    <>
                      <SidebarSectionHeading isCollapsed={isCollapsed}>
                        Organization
                      </SidebarSectionHeading>
                      {canViewMembers && (
                        <NavItem
                          item={{
                            href: `${ANALYTICS_BASE_URL}/org/${orgSlug}/members`,
                            icon: AqUsers01,
                            label: 'Members',
                            endIcon: AqLinkExternal01,
                            external: true,
                          }}
                          isCollapsed={isCollapsed}
                          onClick={onNavigate}
                        />
                      )}
                      {canViewRoles && (
                        <NavItem
                          item={{
                            href: `${ANALYTICS_BASE_URL}/org/${orgSlug}/roles`,
                            icon: AqShield01,
                            label: 'Roles & Permissions',
                            endIcon: AqLinkExternal01,
                            external: true,
                          }}
                          isCollapsed={isCollapsed}
                          onClick={onNavigate}
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}

          {/* Platform Admin Module - Consolidated Administrative Panel */}
          {activeModule === 'admin' && (
            <>
              <SidebarSectionHeading isCollapsed={isCollapsed}>
                Administrative Panel
              </SidebarSectionHeading>

              {/* Network Management Dropdown */}
              {/* Network Management - Flat Item */}
              <NavItem
                item={{
                  href: ROUTE_LINKS.ADMIN_NETWORKS,
                  icon: AqCpuChip01,
                  label: 'Sensor Manufacturers',
                  disabled: !contextPermissions.canViewNetworks,
                  activeOverride: pathname === ROUTE_LINKS.ADMIN_NETWORKS,
                }}
                isCollapsed={isCollapsed}
              />

              <NavItem
                item={{
                  href: ROUTE_LINKS.ADMIN_NETWORK_REQUESTS,
                  icon: AqFileQuestion02,
                  label: 'Manufacturer Requests',
                  disabled: !contextPermissions.canViewNetworks,
                  activeOverride: pathname === ROUTE_LINKS.ADMIN_NETWORK_REQUESTS,
                }}
                isCollapsed={isCollapsed}
              />

              <NavItem
                item={{
                  href: ROUTE_LINKS.COHORTS,
                  icon: AqCollocation,
                  label: 'Cohorts',
                  disabled: !contextPermissions.canViewDevices,
                }}
                isCollapsed={isCollapsed}
              />

              <NavItem
                item={{
                  href: ROUTE_LINKS.SITES,
                  icon: AqMarkerPin01,
                  label: 'Sites',
                  disabled: !contextPermissions.canViewSites,
                }}
                isCollapsed={isCollapsed}
              />

              <NavItem
                item={{
                  href: ROUTE_LINKS.GRIDS,
                  icon: AqBezierCurve02,
                  label: 'Grids',
                  disabled: !contextPermissions.canViewSites,
                }}
                isCollapsed={isCollapsed}
              />

              <NavItem
                item={{
                  href: ROUTE_LINKS.ADMIN_SHIPPING,
                  icon: AqPackagePlus,
                  label: 'Shipping',
                }}
                isCollapsed={isCollapsed}
              />
            </>
          )}

          {!isCollapsed && activeModule !== 'admin' && !isElectron && (
            <div className="mt-auto px-1 pb-2 pt-4">
              <Link
                href={ROUTE_LINKS.DOWNLOAD}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full rounded-md border border-border bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary/80 hover:border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <span className="truncate">Get Desktop app</span>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </aside >
  );
};

export default SecondarySidebar;
