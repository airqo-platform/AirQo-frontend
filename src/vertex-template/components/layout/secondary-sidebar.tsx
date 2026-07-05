'use client';

import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import {
  AqHomeSmile,
  AqCpuChip01,
  AqMonitor,
  AqMarkerPin01,
  AqCollocation,
  AqFileQuestion02,
} from '@airqo/icons-react';
import { Button } from '@/components/ui/button';
import { useUserContext } from '@/core/hooks/useUserContext';
import { usePathname } from 'next/navigation';
import { ROUTE_LINKS } from '@/core/routes';
import Card from '../shared/card/CardWrapper';
import { NavItem } from './NavItem';

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
  const { getContextPermissions, isExternalOrg } =
    useUserContext();
  const contextPermissions = getContextPermissions();
  const pathname = usePathname();


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
            </>
          )}
        </Card>
      </div>
    </aside >
  );
};

export default SecondarySidebar;
