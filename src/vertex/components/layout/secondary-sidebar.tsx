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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/components/layout/accessConfig/permission-guard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";
import SubMenu from "./sub-menu";

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
                                href="/network-map" 
                                icon={MapIcon} 
                                label="Network Map"
                                isCollapsed={isCollapsed}
                            />
                            <PermissionGuard permission={["CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES", "DEPLOY_AIRQO_DEVICES"]} requireAll={false}>
                                <SubMenu
                                    label="Devices"
                                    icon={Radio}
                                    isCollapsed={isCollapsed}
                                    href="/devices/overview"
                                >
                                    <PermissionGuard permission="CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES">
                                        <SubMenuItem href="/devices/overview" label="Overview" />
                                    </PermissionGuard>
                                    <PermissionGuard permission="DEPLOY_AIRQO_DEVICES">
                                        <SubMenuItem href="/devices/deploy" label="Deploy Device" />
                                    </PermissionGuard>
                                </SubMenu>
                            </PermissionGuard>
                            <PermissionGuard permission="CREATE_UPDATE_AND_DELETE_NETWORK_SITES">
                                <NavItem href="/sites" icon={MapPin} label="Sites" isCollapsed={isCollapsed} />
                            </PermissionGuard>
                            <PermissionGuard permission="CREATE_UPDATE_AND_DELETE_COHORTS">
                                <NavItem href="/cohorts" icon={Layers} label="Cohorts" isCollapsed={isCollapsed} />
                            </PermissionGuard>
                            <PermissionGuard permission="CREATE_UPDATE_AND_DELETE_GRIDS">
                                <NavItem href="/grids" icon={Grid} label="Grids" isCollapsed={isCollapsed} />
                            </PermissionGuard>
                        </>
                    )}
                    {activeModule === 'admin' && (
                        <>
                            <PermissionGuard permission="CREATE_UPDATE_AND_DELETE_NETWORK_USERS">
                                <NavItem href="/user-management" icon={Users} label="User Management" isCollapsed={isCollapsed} />
                            </PermissionGuard>
                            <PermissionGuard permission="CREATE_UPDATE_AND_DELETE_NETWORK_ROLES">
                                <NavItem href="/access-control" icon={Shield} label="Access Control" isCollapsed={isCollapsed} />
                            </PermissionGuard>
                            <PermissionGuard permission="CREATE_UPDATE_AND_DELETE_NETWORK_USERS">
                                <NavItem href="/organizations" icon={Building2} label="Organizations" isCollapsed={isCollapsed} />
                            </PermissionGuard>
                        </>
                    )}
                </nav>
            </div>
            
            <div className="p-2 border-t">
                 <NavItem href="/profile" icon={UserCircle} label="Profile Settings" isCollapsed={isCollapsed} />
            </div>
        </div>
    );
};

export default SecondarySidebar; 