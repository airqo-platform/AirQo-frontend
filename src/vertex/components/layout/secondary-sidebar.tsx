"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  Radio,
  MapPin,
  Layers,
  Grid,
  Building2,
  UserCircle,
  MapIcon,
  ChevronRight,
  ChevronLeft,
  Shield,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/components/layout/accessConfig/permission-guard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";
import SubMenu from "./sub-menu";
import { PERMISSIONS } from "@/core/permissions/constants";

interface SecondarySidebarProps {
  isCollapsed: boolean;
  activeModule: string;
  toggleSidebar: () => void;
}

const NavItem = ({ href, icon: Icon, label, isCollapsed }: { href: string; icon: React.ElementType; label:string; isCollapsed: boolean; }) => {
    const pathname = usePathname();
    const isActive = pathname.startsWith(href);
    
    return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={`flex items-center gap-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground p-2 rounded-md transition-all duration-200 ${
              isActive ? "bg-accent text-accent-foreground" : ""
            } ${isCollapsed ? "justify-center" : ""}`}
          >
            <Icon size={18} className="shrink-0" />
            <span className={isCollapsed ? "hidden" : "block"}>{label}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className={isCollapsed ? "block" : "hidden"}>
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    )
};

const SubMenuItem = ({ href, label }: { href: string; label: string }) => {
    const pathname = usePathname();
    const isActive = pathname.startsWith(href);
    return (
        <Link
            href={href}
            className={`flex items-center gap-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground p-2 rounded-md transition-all duration-200 ${
                isActive ? "bg-accent text-accent-foreground" : ""
            }`}
        >
            <span>{label}</span>
        </Link>
    );
};

const SecondarySidebar: React.FC<SecondarySidebarProps> = ({ isCollapsed, activeModule, toggleSidebar }) => {
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
                            />
                            <NavItem 
                                href="/network-map" 
                                icon={MapIcon} 
                                label="Network Map"
                                isCollapsed={isCollapsed}
                            />
                            <PermissionGuard permission={PERMISSIONS.DEVICE.VIEW}>
                                <SubMenu
                                    label="Devices"
                                    icon={Radio}
                                    isCollapsed={isCollapsed}
                                    href="/devices/overview"
                                >
                                    <PermissionGuard permission={PERMISSIONS.DEVICE.VIEW}>
                                        <SubMenuItem href="/devices/overview" label="Overview" />
                                    </PermissionGuard>
                                    <PermissionGuard permission={PERMISSIONS.DEVICE.VIEW}>
                                        <SubMenuItem href="/devices/my-devices" label="My Devices" />
                                    </PermissionGuard>
                                </SubMenu>
                            </PermissionGuard>
                            <PermissionGuard permission={PERMISSIONS.SITE.VIEW}>
                                <SubMenu
                                    label="Sites"
                                    icon={MapPin}
                                    href="/sites"
                                    isCollapsed={isCollapsed}
                                >
                                    <PermissionGuard permission={PERMISSIONS.SITE.VIEW}>
                                        <SubMenuItem href="/sites" label="Overview" />
                                    </PermissionGuard>
                                    <PermissionGuard permission={PERMISSIONS.SITE.CREATE}>
                                        <SubMenuItem href="/sites/create" label="Create Site" />
                                    </PermissionGuard>
                                </SubMenu>
                            </PermissionGuard>
                            <PermissionGuard permission={PERMISSIONS.DEVICE.VIEW}>
                                <SubMenu
                                    label="Cohorts"
                                    icon={Layers}
                                    href="/cohorts"
                                    isCollapsed={isCollapsed}
                                >
                                    <PermissionGuard permission={PERMISSIONS.DEVICE.VIEW}>
                                        <SubMenuItem href="/cohorts" label="Overview" />
                                    </PermissionGuard>
                                    <PermissionGuard permission={PERMISSIONS.DEVICE.UPDATE}>
                                        <SubMenuItem href="/cohorts/create" label="Create Cohort" />
                                    </PermissionGuard>
                                </SubMenu>
                            </PermissionGuard>
                            <PermissionGuard permission={PERMISSIONS.SITE.VIEW}>
                                <SubMenu
                                    label="Grids"
                                    icon={Grid}
                                    href="/grids"
                                    isCollapsed={isCollapsed}
                                >
                                    <PermissionGuard permission={PERMISSIONS.SITE.VIEW}>
                                        <SubMenuItem href="/grids" label="Overview" />
                                    </PermissionGuard>
                                    <PermissionGuard permission={PERMISSIONS.SITE.CREATE}>
                                        <SubMenuItem href="/grids/create" label="Create Grid" />
                                    </PermissionGuard>
                                </SubMenu>
                            </PermissionGuard>
                        </>
                    )}
                    {activeModule === 'admin' && (
                        <>
                            <PermissionGuard permission={PERMISSIONS.USER.VIEW}>
                                <NavItem href="/user-management" icon={Users} label="User Management" isCollapsed={isCollapsed} />
                            </PermissionGuard>
                            <PermissionGuard permission={PERMISSIONS.ROLE.VIEW}>
                                <NavItem href="/access-control" icon={Shield} label="Access Control" isCollapsed={isCollapsed} />
                            </PermissionGuard>
                            <PermissionGuard permission={PERMISSIONS.ORGANIZATION.VIEW}>
                                <NavItem href="/organizations" icon={Building2} label="Organizations" isCollapsed={isCollapsed} />
                            </PermissionGuard>
                        </>
                    )}
                    <PermissionGuard permission={PERMISSIONS.USER.VIEW}>
                        <SubMenu
                            label="Team"
                            icon={Users}
                            href="/team"
                            isCollapsed={isCollapsed}
                        >
                            <PermissionGuard permission={PERMISSIONS.USER.VIEW}>
                                <SubMenuItem href="/team" label="Overview" />
                            </PermissionGuard>
                            <PermissionGuard permission={PERMISSIONS.USER.CREATE}>
                                <SubMenuItem href="/team/invite" label="Invite User" />
                            </PermissionGuard>
                            <PermissionGuard permission={PERMISSIONS.ROLE.VIEW}>
                                <SubMenuItem href="/team/roles" label="Roles" />
                            </PermissionGuard>
                            <PermissionGuard permission={PERMISSIONS.USER.VIEW}>
                                <SubMenuItem href="/team/permissions" label="Permissions" />
                            </PermissionGuard>
                        </SubMenu>
                    </PermissionGuard>
                </nav>
            </div>
            
            <div className="p-2 border-t">
                 <NavItem href="/profile" icon={UserCircle} label="Profile Settings" isCollapsed={isCollapsed} />
            </div>
        </div>
    );
};

export default SecondarySidebar; 