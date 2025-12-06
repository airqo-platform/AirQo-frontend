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
  const { getSidebarConfig, getContextPermissions, isPersonalContext, isLoading } =
    useUserContext();
  const sidebarConfig = getSidebarConfig();
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
              {activeModule === 'network' && (
                <>
                  <NavItem
                    item={{
                      href: '/home',
                      icon: AqHomeSmile,
                      label: 'Home',
                      disabled: false,
                    }}
                    isCollapsed={isCollapsed}
                  />

                  {/* Network Section Heading */}
                  <SidebarSectionHeading isCollapsed={isCollapsed}>
                    {isPersonalContext ? 'My Network' : 'Network'}
                  </SidebarSectionHeading>

                  {/* Devices Section */}
                  {contextPermissions.canViewDevices &&
                    (isPersonalContext
                      ? sidebarConfig.showMyDevices && (
                        <NavItem
                          item={{
                            href: '/devices/my-devices',
                            icon: AqMonitor,
                            label: 'My Devices',
                            disabled: !contextPermissions.canViewDevices,
                          }}
                          isCollapsed={isCollapsed}
                        />
                      )
                      : sidebarConfig.showDeviceOverview && (
                        <NavItem
                          item={{
                            href: '/devices/overview',
                            icon: AqMonitor,
                            label: 'Devices',
                            disabled: !contextPermissions.canViewDevices,
                          }}
                          isCollapsed={isCollapsed}
                        />
                      ))}

                  {sidebarConfig.showClaimDevice && (
                    <NavItem
                      item={{
                        href: '/devices/claim',
                        icon: AqPackagePlus,
                        label: 'Claim Device',
                      }}
                      isCollapsed={isCollapsed}
                    />
                  )}

                  {/* Sites - only for non-personal contexts */}
                  {sidebarConfig.showSites &&
                    contextPermissions.canViewSites && (
                      <NavItem
                        item={{
                          href: '/sites',
                          icon: AqMarkerPin01,
                          label: 'Sites',
                          disabled: false,
                        }}
                        isCollapsed={isCollapsed}
                      />
                    )}

                  {sidebarConfig.showGrids &&
                    contextPermissions.canViewSites && (
                      <NavItem
                        item={{
                          href: '/grids',
                          icon: AqAirQlouds,
                          label: 'Grids',
                          disabled: false,
                        }}
                        isCollapsed={isCollapsed}
                      />
                    )}

                  {sidebarConfig.showCohorts &&
                    contextPermissions.canViewDevices && (
                      <NavItem
                        item={{
                          href: '/cohorts',
                          icon: AqCollocation,
                          label: 'Cohorts',
                          disabled: false,
                        }}
                        isCollapsed={isCollapsed}
                      />
                    )}
                </>
              )}

              {activeModule === 'admin' && (
                <>
                  <NavItem
                    item={{
                      href: '/admin/shipping',
                      icon: AqPackagePlus,
                      label: 'Shipping',
                    }}
                    isCollapsed={isCollapsed}
                  />
                  <NavItem
                    item={{
                      href: '/admin/networks',
                      icon: AqHomeSmile,
                      label: 'Networks',
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
                href: '#',
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
