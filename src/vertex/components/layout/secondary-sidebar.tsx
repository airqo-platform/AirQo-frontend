"use client";

import React from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";
import SubMenu from "./sub-menu";
import { usePermission } from "@/core/hooks/usePermissions";
import { PERMISSIONS } from "@/core/permissions/constants";

interface SecondarySidebarProps {
  isCollapsed: boolean;
  activeModule: string;
  toggleSidebar: () => void;
}

const NavItem = ({ href, icon: Icon, label, isCollapsed, disabled = false, tooltip }: { href: string; icon: React.ElementType; label:string; isCollapsed: boolean; disabled?: boolean; tooltip?: string; }) => {
    const pathname = usePathname();
    const isActive = pathname.startsWith(href);
    const content = (
      <Link
        href={disabled ? '#' : href}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        className={`flex items-center gap-2 text-sm p-2 rounded-md transition-all duration-200 ${
          isActive ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent hover:text-accent-foreground"
        } ${isCollapsed ? "justify-center" : ""} ${disabled ? "opacity-50 pointer-events-none cursor-not-allowed" : ""}`}
      >
        <Icon size={18} className="shrink-0" />
        <span className={isCollapsed ? "hidden" : "block"}>{label}</span>
      </Link>
    );
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
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

const SubMenuItem = ({ href, label, disabled = false, tooltip }: { href: string; label: string; disabled?: boolean; tooltip?: string }) => {
    const pathname = usePathname();
    const isActive = pathname.startsWith(href);
    const content = (
      <Link
        href={disabled ? '#' : href}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        className={`flex items-center gap-2 text-sm p-2 rounded-md transition-all duration-200 ${
          isActive ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent hover:text-accent-foreground"
        } ${disabled ? "opacity-50 pointer-events-none cursor-not-allowed" : ""}`}
      >
        <span>{label}</span>
      </Link>
    );
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          {disabled && tooltip && (
            <TooltipContent side="right">{tooltip}</TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
};

const SecondarySidebar: React.FC<SecondarySidebarProps> = ({ isCollapsed, activeModule, toggleSidebar }) => {
    // Permission checks using proper hooks
    const canViewDevices = usePermission(PERMISSIONS.DEVICE.VIEW);
    const canViewSites = usePermission(PERMISSIONS.SITE.VIEW);
    const canViewUserManagement = usePermission(PERMISSIONS.USER.VIEW);
    const canViewAccessControl = usePermission(PERMISSIONS.ROLE.VIEW);
    const canViewOrganizations = usePermission(PERMISSIONS.ORGANIZATION.VIEW);

    return (
        <div
            className={`relative h-full bg-card transition-all duration-300 ease-in-out z-30 shadow-md flex flex-col
                ${isCollapsed ? "w-16" : "w-64"}
            `}
        >
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className={`absolute top-1/2 -translate-y-1/2 h-6 w-6 rounded-md bg-white shadow-sm border transition-all duration-300 z-50
                ${isCollapsed ? "left-14" : "left-[248px]"}`}
            >
                {isCollapsed ? (
                    <ChevronRight className="h-4 w-4 text-gray-700" />
                ) : (
                    <ChevronLeft className="h-4 w-4 text-gray-700" />
                )}
            </Button>

            <div className="flex-grow overflow-y-auto overflow-x-hidden p-2">
                <nav className="space-y-1">
                    {activeModule === 'network' && (
                        <>
                            <NavItem 
                                href="/dashboard" 
                                icon={LayoutDashboard} 
                                label="Dashboard"
                                isCollapsed={isCollapsed}
                                disabled={false}
                            />
                            <NavItem 
                                href="/network-map" 
                                icon={MapIcon} 
                                label="Network Map"
                                isCollapsed={isCollapsed}
                                disabled={false}
                            />
                            {canViewDevices ? (
                              <SubMenu
                                  label="Devices"
                                  icon={Radio}
                                  isCollapsed={isCollapsed}
                                  href="/devices/overview"
                              >
                                  <SubMenuItem href="/devices/overview" label="Overview" disabled={!canViewDevices} tooltip="You do not have permission to view devices." />
                                  <SubMenuItem href="/devices/my-devices" label="My Devices" disabled={!canViewDevices} tooltip="You do not have permission to view devices." />
                                  <SubMenuItem href="/devices/claim" label="Claim Device" />
                              </SubMenu>
                            ) : null}
                            {canViewSites ? (
                              <NavItem 
                              href="/sites" 
                              icon={MapPin} 
                              label="Sites"
                              isCollapsed={isCollapsed}
                              disabled={false}
                          />
                            ) : null}
                        </>
                    )}
                    {activeModule === 'admin' && (
                        <>
                            <NavItem href="/user-management" icon={Users} label="User Management" isCollapsed={isCollapsed} disabled={!canViewUserManagement} tooltip="You do not have permission to view user management." />
                            <NavItem href="/access-control" icon={Shield} label="Access Control" isCollapsed={isCollapsed} disabled={!canViewAccessControl} tooltip="You do not have permission to view access control." />
                            <NavItem href="/organizations" icon={Building2} label="Organizations" isCollapsed={isCollapsed} disabled={!canViewOrganizations} tooltip="You do not have permission to view organizations." />
                        </>
                    )}
                    {/* {canViewTeam ? (
                      <SubMenu
                          label="Team"
                          icon={Users}
                          href="/team"
                          isCollapsed={isCollapsed}
                      >
                          <SubMenuItem href="/team" label="Overview" disabled={!canViewTeam} tooltip="You do not have permission to view team." />
                          <SubMenuItem href="/team/invite" label="Invite User" disabled={!canInviteUser} tooltip="You do not have permission to invite users." />
                          <SubMenuItem href="/team/roles" label="Roles" disabled={!canViewRoles} tooltip="You do not have permission to view roles." />
                          <SubMenuItem href="/team/permissions" label="Permissions" disabled={!canViewTeam} tooltip="You do not have permission to view team permissions." />
                      </SubMenu>
                    ) : null} */}
                </nav>
            </div>
            <div className="p-2 border-t">
                 <NavItem href="/profile" icon={UserCircle} label="Profile Settings" isCollapsed={isCollapsed} />
            </div>
        </div>
    );
};

export default SecondarySidebar; 