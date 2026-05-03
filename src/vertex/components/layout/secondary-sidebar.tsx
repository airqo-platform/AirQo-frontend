'use client';

import React from 'react';
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
} from '@airqo/icons-react';
import { Button } from '@/components/ui/button';
import { useUserContext } from '@/core/hooks/useUserContext';
import { usePathname } from 'next/navigation';
import { ROUTE_LINKS } from '@/core/routes';
import { VERTEX_DESKTOP_DOWNLOADS } from '@/core/constants/app-downloads';
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

  const [platform, setPlatform] = React.useState<'win' | 'linux' | 'other' | null>(null);
  const [downloadUrl, setDownloadUrl] = React.useState("");
  const [isElectron, setIsElectron] = React.useState(false);

  React.useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsElectron(userAgent.includes('electron'));
    if (userAgent.includes('win')) {
      setPlatform('win');
      setDownloadUrl(VERTEX_DESKTOP_DOWNLOADS.windows);
    } else if (userAgent.includes('linux')) {
      setPlatform('linux');
    } else {
      setPlatform('other');
    }
  }, []);

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
          footer={!isCollapsed && !isElectron && platform === 'win' && (
            <div className="px-1 pb-2">
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full rounded-md border border-border bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary/80 hover:border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M0 3.449L9.75 2.1V11.7H0V3.449zm0 9.151h9.75v9.6L0 20.551V12.6zm10.55-10.701L24 0v11.7h-13.45V1.899zm0 10.701H24V24l-13.45-1.899V12.6z" />
                </svg>
                <span className="truncate">Download for Windows</span>
              </a>
            </div>
          )}
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
                      href: ROUTE_LINKS.ORG_SITES,
                      icon: AqMarkerPin01,
                      label: 'Sites',
                      disabled: !contextPermissions.canViewSites,
                    }}
                    isCollapsed={isCollapsed}
                    onClick={onNavigate}
                  />
                  <NavItem
                    item={{
                      href: ROUTE_LINKS.ORG_REGISTER_DEVICE,
                      icon: AqPackagePlus,
                      label: 'Claim Device',
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
                      label: 'Assets',
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
                  <NavItem
                    item={{
                      href: ROUTE_LINKS.ORG_REGISTER_DEVICE,
                      icon: AqPackagePlus,
                      label: 'Claim Device',
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
        </Card>
      </div>
    </aside >
  );
};

export default SecondarySidebar;
