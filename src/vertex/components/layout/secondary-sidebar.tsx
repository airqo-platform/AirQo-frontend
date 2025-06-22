"use client";

import React from "react";
import Link from "next/link";
import {
  BarChart2,
  Users,
  Radio,
  MapPin,
  Layers,
  Grid,
  Building2,
  UserCircle,
  MapIcon,
  ChevronRight,
  PlusCircle,
  ChevronLeft,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PermissionGuard } from "@/components/layout/accessConfig/permission-guard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";

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


const SecondarySidebar: React.FC<SecondarySidebarProps> = ({ isCollapsed, activeModule, toggleSidebar }) => {
    const [isDevicesOpen, setIsDevicesOpen] = React.useState(true); 

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
                                <Collapsible open={isDevicesOpen} onOpenChange={setIsDevicesOpen}>
                                    {isCollapsed ? (
                                    <TooltipProvider>
                                        <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center justify-center w-full cursor-pointer text-sm text-foreground hover:bg-accent hover:text-accent-foreground p-2 rounded-md transition-all duration-200">
                                            <Radio size={18} className="shrink-0" />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">Devices</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    ) : (
                                    <CollapsibleTrigger asChild>
                                        <div className="flex items-center w-full cursor-pointer text-sm text-foreground hover:bg-accent hover:text-accent-foreground p-2 rounded-md transition-all duration-200">
                                        <div className="flex items-center gap-2 flex-1">
                                            <Radio size={18} className="shrink-0" />
                                            <span>Devices</span>
                                        </div>
                                        <ChevronRight size={16} className={`transition-transform shrink-0 ${isDevicesOpen ? "rotate-90" : ""}`} />
                                        </div>
                                    </CollapsibleTrigger>
                                    )}
                                    <CollapsibleContent className={`ml-6 space-y-1 py-1 ${isCollapsed ? "hidden" : "block"}`}>
                                    <PermissionGuard permission="CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES">
                                        <NavItem href="/devices/overview" icon={BarChart2} label="Overview" isCollapsed={isCollapsed} />
                                    </PermissionGuard>
                                    <PermissionGuard permission="DEPLOY_AIRQO_DEVICES">
                                        <NavItem href="/devices/deploy" icon={PlusCircle} label="Deploy Device" isCollapsed={isCollapsed} />
                                    </PermissionGuard>
                                    </CollapsibleContent>
                                </Collapsible>
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