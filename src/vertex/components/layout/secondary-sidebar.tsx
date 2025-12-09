'use client';

import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import {
  AqHomeSmile,
  AqMonitor,
  AqUser03,
  AqAirQlouds,
  AqMarkerPin01,
  AqPackagePlus,
  AqCollocation,
} from '@airqo/icons-react';
import { Button } from '@/components/ui/button';
import { useUserContext } from '@/core/hooks/useUserContext';
import { ROUTE_LINKS } from '@/core/routes';
import Card from '../shared/card/CardWrapper';
import { Skeleton } from '@/components/ui/skeleton';
import { NavItem } from './NavItem';

interface SecondarySidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  activeModule: string;
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
}) => {
  const { getContextPermissions, isPersonalContext, isExternalOrg, isLoading } =
    useUserContext();
  const contextPermissions = getContextPermissions();

  return (
    <aside className="hidden lg:block fixed left-0 top-[55px] z-50 text-sidebar-text transition-all duration-300 ease-in-out p-1">
      <div
        className={`transition-all duration-300 ease-in-out relative z-50 p-1
          ${isCollapsed ? 'w-[75px]' : 'w-[256px]'} h-[calc(100vh-4rem)]`}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={`absolute flex rounded-full top-4 -right-[6px] z-50 shadow-lg justify-center items-center border w-6 h-6 bg-white border-gray-200 text-gray-800 hover:shadow-xl transition-all duration-200`}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-700" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-700" />
          )}
        </Button>
        <Card
          className="h-full relative overflow-hidden"
          padding={isCollapsed ? 'p-2' : 'p-3'}
          overflow
          overflowType="auto"
          contentClassName={`flex flex-col h-full overflow-x-hidden scrollbar-thin ${styles.scrollbar}`}
        >
          {isLoading ? (
            <div className="flex flex-col gap-4 p-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ) : (
            <>
              {/* Device Management Module - Personal devices for all users */}
              {activeModule === 'devices' && (
                <>
                  {isPersonalContext ? (
                    /* Personal Scope View */
                    <>
                      <NavItem
                        item={{
                          href: ROUTE_LINKS.HOME,
                          icon: AqHomeSmile,
                          label: 'Home',
                          disabled: false,
                        }}
                        isCollapsed={isCollapsed}
                      />
                      <SidebarSectionHeading isCollapsed={isCollapsed}>
                        My Network
                      </SidebarSectionHeading>
                      <NavItem
                        item={{
                          href: ROUTE_LINKS.MY_NETWORKS,
                          icon: AqMonitor,
                          label: 'My Network',
                          disabled: false, // My Network is public
                        }}
                        isCollapsed={isCollapsed}
                      />
                      <NavItem
                        item={{
                          href: ROUTE_LINKS.MY_DEVICES,
                          icon: AqMonitor,
                          label: 'My Devices',
                          disabled: !contextPermissions.canViewDevices,
                        }}
                        isCollapsed={isCollapsed}
                      />
                      <NavItem
                        item={{
                          href: '/devices/claim', // Keep as is for now or add to routes if needed
                          icon: AqPackagePlus,
                          label: 'Claim Device',
                        }}
                        isCollapsed={isCollapsed}
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
                      />
                      <SidebarSectionHeading isCollapsed={isCollapsed}>
                        Organization Assets
                      </SidebarSectionHeading>
                      <NavItem
                        item={{
                          href: ROUTE_LINKS.ORG_ASSETS,
                          icon: AqMonitor,
                          label: 'Assets',
                          disabled: !contextPermissions.canViewDevices,
                        }}
                        isCollapsed={isCollapsed}
                      />
                      <NavItem
                        item={{
                          href: ROUTE_LINKS.ORG_REGISTER_DEVICE,
                          icon: AqPackagePlus,
                          label: 'Register Device',
                        }}
                        isCollapsed={isCollapsed}
                      />
                    </>
                  )}
                </>
              )}

              {/* Organisation Devices Module - AirQo organizational assets */}
              {activeModule === 'org-devices' && (
                <>
                  {isExternalOrg ? (
                    /* External Org View (Consistent with 'devices' module) */
                    <>
                      <NavItem
                        item={{
                          href: ROUTE_LINKS.HOME, // Keep Overview accessible
                          icon: AqHomeSmile,
                          label: 'Overview',
                          disabled: false,
                        }}
                        isCollapsed={isCollapsed}
                      />
                      <SidebarSectionHeading isCollapsed={isCollapsed}>
                        Organization Assets
                      </SidebarSectionHeading>
                      <NavItem
                        item={{
                          href: ROUTE_LINKS.ORG_ASSETS,
                          icon: AqMonitor,
                          label: 'Assets',
                          disabled: !contextPermissions.canViewDevices,
                        }}
                        isCollapsed={isCollapsed}
                      />
                      <NavItem
                        item={{
                          href: ROUTE_LINKS.ORG_REGISTER_DEVICE,
                          icon: AqPackagePlus,
                          label: 'Register Device',
                        }}
                        isCollapsed={isCollapsed}
                      />
                    </>
                  ) : (
                    /* Internal/Advanced Org View */
                    <>
                      <SidebarSectionHeading isCollapsed={isCollapsed}>
                        Organisation
                      </SidebarSectionHeading>

                      <NavItem
                        item={{
                          href: ROUTE_LINKS.ORG_ASSETS,
                          icon: AqMonitor,
                          label: 'Devices',
                          disabled: !contextPermissions.canViewDevices,
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
                          icon: AqAirQlouds,
                          label: 'Grids',
                          disabled: !contextPermissions.canViewSites,
                        }}
                        isCollapsed={isCollapsed}
                      />
                    </>
                  )}
                </>
              )}

              {/* Network Management Module - Network configuration */}
              {activeModule === 'network-mgmt' && (
                <>
                  <SidebarSectionHeading isCollapsed={isCollapsed}>
                    Network Configuration
                  </SidebarSectionHeading>

                  <NavItem
                    item={{
                      href: ROUTE_LINKS.ADMIN_NETWORKS,
                      icon: AqHomeSmile,
                      label: 'Networks',
                      disabled: !contextPermissions.canViewNetworks,
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
                      icon: AqAirQlouds,
                      label: 'Grids',
                      disabled: !contextPermissions.canViewSites,
                    }}
                    isCollapsed={isCollapsed}
                  />
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
                      icon: AqHomeSmile,
                      label: 'Networks',
                      disabled: !contextPermissions.canViewNetworks,
                    }}
                    isCollapsed={isCollapsed}
                  />

                  <NavItem
                    item={{
                      href: ROUTE_LINKS.COHORTS, // TODO: Update to /admin/cohorts after manual move
                      icon: AqCollocation,
                      label: 'Cohorts',
                      disabled: !contextPermissions.canViewDevices,
                    }}
                    isCollapsed={isCollapsed}
                  />

                  <NavItem
                    item={{
                      href: ROUTE_LINKS.SITES, // TODO: Update to /admin/sites after manual move
                      icon: AqMarkerPin01,
                      label: 'Sites',
                      disabled: !contextPermissions.canViewSites,
                    }}
                    isCollapsed={isCollapsed}
                  />

                  <NavItem
                    item={{
                      href: ROUTE_LINKS.GRIDS, // TODO: Update to /admin/grids after manual move
                      icon: AqAirQlouds,
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
            </>
          )}
        </Card>

        {/* Account Section at the bottom */}
        <div className="mt-auto">
          <SidebarSectionHeading isCollapsed={isCollapsed}>
            Account
          </SidebarSectionHeading>
          {isLoading ? (
            <div className="p-2">
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <NavItem
              item={{
                href: '#', // Path doesnt existsSync, temporal placeholder
                icon: AqUser03,
                label: 'Profile',
              }}
              isCollapsed={isCollapsed}
            />
          )}
        </div>
      </div>
    </aside>
  );
};

export default SecondarySidebar;
