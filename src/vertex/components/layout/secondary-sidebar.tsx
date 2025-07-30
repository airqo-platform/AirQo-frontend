"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Radio,
  MapPin,
  Building2,
  UserCircle,
  MapIcon,
  ChevronRight,
  ChevronLeft,
  Shield,
  LayoutDashboard,
  ChevronDown,
  Grid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";
import { usePermission } from "@/core/hooks/usePermissions";
import { PERMISSIONS } from "@/core/permissions/constants";
import { useAppSelector } from "@/core/redux/hooks";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useUserContext } from "@/core/hooks/useUserContext";

interface SecondarySidebarProps {
  isCollapsed: boolean;
  activeModule: string;
  toggleSidebar: () => void;
}

const SidebarSectionHeading = ({ children, isCollapsed }: { children: React.ReactNode; isCollapsed: boolean }) => (
  !isCollapsed ? (
    <div className="mt-6 mb-2 px-2 text-xs font-semibold text-muted-foreground capitalize tracking-wider">
      {children}
    </div>
  ) : null
);

const NavItem = ({ href, icon: Icon, label, isCollapsed, disabled = false, tooltip, activeOverride }: { href: string; icon: React.ElementType; label: string; isCollapsed: boolean; disabled?: boolean; tooltip?: string; activeOverride?: boolean }) => {
  const pathname = usePathname();
  const isActive = typeof activeOverride === 'boolean' ? activeOverride : pathname.startsWith(href);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={disabled ? '#' : href}
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
            className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition text-base
                ${isActive ? (isCollapsed ? 'bg-blue-50' : 'bg-blue-50 font-semibold text-blue-700') : 'hover:bg-muted text-foreground'}
                ${isCollapsed ? 'justify-center px-2 py-2' : ''}
                ${disabled ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}`}
            style={{ position: 'relative' }}
          >
            {isActive && !isCollapsed && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-blue-600" />
            )}
            <Icon size={20} className="shrink-0" />
            <span className={isCollapsed ? "hidden" : "block"}>{label}</span>
          </Link>
        </TooltipTrigger>
        {disabled && tooltip && (
          <TooltipContent side="right">{tooltip}</TooltipContent>
        )}
        {!disabled && isCollapsed && (
          <TooltipContent side="right">{label}</TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

const SubMenuItem = ({ href, label, disabled = false, tooltip, activeOverride }: { href: string; label: string; disabled?: boolean; tooltip?: string; activeOverride?: boolean }) => {
  const pathname = usePathname();
  const isActive = typeof activeOverride === 'boolean' ? activeOverride : pathname.startsWith(href);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={disabled ? '#' : href}
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
            className={`relative flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm
                ${isActive ? 'bg-blue-50 font-semibold text-blue-700' : 'hover:bg-muted text-foreground'}
                ${disabled ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}`}
            style={{ position: 'relative' }}
          >
            {isActive && (
              <span className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-blue-600" />
            )}
            <span>{label}</span>
          </Link>
        </TooltipTrigger>
        {disabled && tooltip && (
          <TooltipContent side="right">{tooltip}</TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

const SidebarDropdown = ({
  label,
  icon: Icon,
  isCollapsed,
  children,
  defaultOpen = true,
}: {
  label: string;
  icon: React.ElementType;
  isCollapsed: boolean;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (isCollapsed) {
    // Collapsed: use popover for submenu access
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center justify-center w-full px-2 py-2 rounded-xl transition text-base cursor-pointer select-none hover:bg-muted text-foreground"
            aria-label={label}
          >
            <Icon size={20} className="shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent side="right" align="center" sideOffset={8} className="p-2 w-48">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground px-2 mb-1">{label}</span>
            {children}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Expanded: show inline dropdown
  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition text-base cursor-pointer select-none hover:bg-muted text-foreground w-full`}
      >
        <Icon size={20} className="shrink-0" />
        <span className={isCollapsed ? "hidden" : "block"}>{label}</span>
        {!isCollapsed && (
          <span className="ml-auto">
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        )}
      </button>
      {isOpen && <div className="ml-2 mt-1 space-y-1">{children}</div>}
    </div>
  );
};

const SecondarySidebar: React.FC<SecondarySidebarProps> = ({ isCollapsed, activeModule, toggleSidebar }) => {
  const { getSidebarConfig, getContextPermissions, isPersonalContext } = useUserContext();
  const sidebarConfig = getSidebarConfig();
  const contextPermissions = getContextPermissions();

  return (
    <div
      className={`relative h-full bg-white rounded-2xl flex flex-col p-4 transition-all duration-300 ease-in-out z-30 mx-1 my-1 border border-gray-100
                ${isCollapsed ? "w-16" : "w-64"}
            `}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className={`absolute top-4 right-[-18px] h-6 w-6 rounded-full bg-white shadow-sm border z-50`}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-700" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-700" />
        )}
      </Button>

      <nav className="flex-1 space-y-2">
        {activeModule === 'network' && (
          <>
            <NavItem
              href="/dashboard"
              icon={LayoutDashboard}
              label="Dashboard"
              isCollapsed={isCollapsed}
              disabled={false}
            />

            {/* Network Map - only for AirQo Internal */}
            {sidebarConfig.showNetworkMap && (
              <NavItem
                href="/network-map"
                icon={MapIcon}
                label="Network Map"
                isCollapsed={isCollapsed}
                disabled={false}
              />
            )}

            {/* Network Section Heading */}
            <SidebarSectionHeading isCollapsed={isCollapsed}>
              {isPersonalContext ? 'My Network' : 'Network'}
            </SidebarSectionHeading>

            {/* Devices Section */}
            {contextPermissions.canViewDevices && (
              <SidebarDropdown
                label="Devices"
                icon={Radio}
                isCollapsed={isCollapsed}
                defaultOpen={true}
              >
                {sidebarConfig.showDeviceOverview && (
                  <SubMenuItem
                    href="/devices/overview"
                    label="Overview"
                    disabled={!contextPermissions.canViewDevices}
                    tooltip="You do not have permission to view devices."
                  />
                )}
                {sidebarConfig.showMyDevices && (
                  <SubMenuItem
                    href="/devices/my-devices"
                    label="My Devices"
                    disabled={!contextPermissions.canViewDevices}
                    tooltip="You do not have permission to view devices."
                  />
                )}
                {sidebarConfig.showClaimDevice && (
                  <SubMenuItem
                    href="/devices/claim"
                    label="Claim Device"
                  />
                )}
                {sidebarConfig.showDeployDevice && (
                  <SubMenuItem
                    href="/devices/deploy"
                    label="Deploy Device"
                  />
                )}
              </SidebarDropdown>
            )}

            {/* Sites - only for non-personal contexts */}
            {/* {sidebarConfig.showSites && contextPermissions.canViewSites && (
              <NavItem
                href="/sites"
                icon={MapPin}
                label="Sites"
                isCollapsed={isCollapsed}
                disabled={false}
              />
            )} */}

            {/* {sidebarConfig.showGrids && contextPermissions.canViewSites && (
              <NavItem
                href="/grids"
                icon={Grid}
                label="Grids"
                isCollapsed={isCollapsed}
                disabled={false}
              />
            )}

            {sidebarConfig.showCohorts && contextPermissions.canViewDevices && (
              <NavItem
                href="/cohorts"
                icon={Users}
                label="Cohorts"
                isCollapsed={isCollapsed}
                disabled={false}
              />
            )} */}
          </>
        )}

        {activeModule === 'admin' && (
          <>
            {sidebarConfig.showUserManagement && (
              <NavItem
                href="/user-management"
                icon={Users}
                label="User Management"
                isCollapsed={isCollapsed}
                disabled={!contextPermissions.canViewUserManagement}
                tooltip="You do not have permission to view user management."
              />
            )}
            {sidebarConfig.showAccessControl && (
              <NavItem
                href="/access-control"
                icon={Shield}
                label="Access Control"
                isCollapsed={isCollapsed}
                disabled={!contextPermissions.canViewAccessControl}
                tooltip="You do not have permission to view access control."
              />
            )}
            {sidebarConfig.showOrganizations && (
              <NavItem
                href="/organizations"
                icon={Building2}
                label="Organizations"
                isCollapsed={isCollapsed}
                disabled={!contextPermissions.canViewOrganizations}
                tooltip="You do not have permission to view organizations."
              />
            )}
          </>
        )}
      </nav>

      {/* Account Section at the bottom */}
      <div className="mt-auto">
        <SidebarSectionHeading isCollapsed={isCollapsed}>Account</SidebarSectionHeading>
        <NavItem href="/profile" icon={UserCircle} label="Profile" isCollapsed={isCollapsed} />
      </div>
    </div>
  );
};

export default SecondarySidebar; 