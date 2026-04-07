'use client';

import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import {
  AqHomeSmile,
  AqMonitor,
  AqMarkerPin01,
  AqPackagePlus,
  AqCollocation,
  AqBezierCurve02,
} from '@airqo/icons-react';
import { Button } from '@/components/ui/button';
import { useUserContext } from '@/core/hooks/useUserContext';
import { ROUTE_LINKS } from '@/core/routes';
import Card from '../shared/card/CardWrapper';
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
  const { getContextPermissions, isExternalOrg } =
    useUserContext();
  const contextPermissions = getContextPermissions();

  const [platform, setPlatform] = React.useState<'mac' | 'win' | 'linux' | 'other' | null>(null);
  const [downloadUrl, setDownloadUrl] = React.useState("");
  const [isElectron, setIsElectron] = React.useState(false);

  React.useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsElectron(userAgent.includes('electron'));
    if (userAgent.includes('mac')) {
      setPlatform('mac');
      setDownloadUrl("https://github.com/airqo-platform/AirQo-frontend/releases/download/v0.1.0/vertex-desktop-v0.1.0-arm64.dmg");
    } else if (userAgent.includes('win')) {
      setPlatform('win');
      setDownloadUrl("https://github.com/airqo-platform/AirQo-frontend/releases/download/v0.1.0/vertex-desktop-v0.1.0.exe");
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
          footer={!isCollapsed && !isElectron && (platform === 'mac' || platform === 'win') && (
            <div className="px-1 pb-2">
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full rounded-md border border-border bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary/80 hover:border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                {platform === 'mac' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.1 2.48-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .76-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.36 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M0 3.449L9.75 2.1V11.7H0V3.449zm0 9.151h9.75v9.6L0 20.551V12.6zm10.55-10.701L24 0v11.7h-13.45V1.899zm0 10.701H24V24l-13.45-1.899V12.6z" />
                  </svg>
                )}
                <span className="truncate">Download for {platform === 'mac' ? 'macOS' : 'Windows'}</span>
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
                  />
                  <NavItem
                    item={{
                      href: ROUTE_LINKS.ORG_REGISTER_DEVICE,
                      icon: AqPackagePlus,
                      label: 'Claim Device',
                    }}
                    isCollapsed={isCollapsed}
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
                      label: 'Claim Device',
                    }}
                    isCollapsed={isCollapsed}
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
                  icon: AqHomeSmile,
                  label: 'Sensor Manufacturers',
                  disabled: !contextPermissions.canViewNetworks,
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
