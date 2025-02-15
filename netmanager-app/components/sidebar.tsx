"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, Users, Shield, Radio, MapPin, Layers, Grid, Building2, Activity, UserCircle, Download, Map, ChevronLeft, ChevronRight, Check, PlusCircle, MonitorSmartphone, LogOut, NetworkIcon, Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/core/hooks/users";
import { useAppSelector, useAppDispatch } from "@/core/redux/hooks";
import {
    setActiveNetwork,
    setActiveGroup,
} from "@/core/redux/slices/userSlice";
import type { Group, Network } from "@/app/types/users";
import { PermissionGuard } from "@/components/permission-guard";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AppSidebarProps {
    isSidebarCollapsed: boolean
    toggleSidebar: () => void
}

const Sidebar: React.FC<AppSidebarProps> = ({ isSidebarCollapsed, toggleSidebar }) => {
    const pathname = usePathname();
    const [userCollapsed, setUserCollapsed] = useState(false);
    const [isDevicesOpen, setIsDevicesOpen] = useState(false);
    // const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    // const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { logout } = useAuth();
    const dispatch = useAppDispatch();

    // Get networks and active network from Redux
    const availableNetworks = useAppSelector(
        (state) => state.user.availableNetworks
    );
    const activeNetwork = useAppSelector((state) => state.user.activeNetwork);
    const activeGroup = useAppSelector((state) => state.user.activeGroup);
    const userGroups = useAppSelector((state) => state.user.userGroups);

    const isActive = (path: string) => pathname?.startsWith(path);
    const isDevicesActive = isActive("/devices");

    useEffect(() => {
        if (isDevicesActive && !userCollapsed) {
            setIsDevicesOpen(true);
        } else if (!isDevicesActive) {
            setUserCollapsed(false);
        }
    }, [isDevicesActive, userCollapsed]);

    const handleDevicesToggle = (open: boolean) => {
        setIsDevicesOpen(open);
        if (isDevicesActive) {
            setUserCollapsed(!open);
        }
    };

    const handleNetworkChange = (network: Network) => {
        dispatch(setActiveNetwork(network));
        localStorage.setItem("activeNetwork", JSON.stringify(network));
    };

    const handleOrganizationChange = (group: Group) => {
        dispatch(setActiveGroup(group));
        localStorage.setItem("activeGroup", JSON.stringify(group));
    };

    // const toggleSidebar = () => {
    //     setIsSidebarCollapsed(!isSidebarCollapsed);
    // };

    // const toggleMobileMenu = () => {
    //     setIsMobileMenuOpen(!isMobileMenuOpen);
    // };

    const NavItem = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                        href={href}
                        className={`flex items-center gap-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground p-2 rounded-md transition-all duration-200 ${
                            isActive(href) ? "bg-accent text-accent-foreground" : ""
                        }`}
                    >
                        <Icon size={18} />
                        <span className={isSidebarCollapsed ? 'hidden' : 'block'}>{label}</span>
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className={isSidebarCollapsed ? 'block' : 'hidden'}>
                    {label}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );

    return (
        <>
            {/* Mobile menu toggle button */}
            {/*<Button*/}
            {/*    variant="ghost"*/}
            {/*    size="icon"*/}
            {/*    className="fixed top-4 left-4 z-50 md:hidden"*/}
            {/*    onClick={toggleMobileMenu}*/}
            {/*>*/}
            {/*    <Menu />*/}
            {/*</Button>*/}

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full bg-card border-r transition-all duration-300 ease-in-out z-40 shadow-lg
          ${isSidebarCollapsed ? 'w-16' : 'w-64'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-900">
                    {/* Brand Name with Smooth Transition */}
                    <motion.h1
                        className="text-xl font-bold text-gray-900 dark:text-white"
                        initial={{opacity: 0, x: -20}}
                        animate={{opacity: isSidebarCollapsed ? 0 : 1, x: isSidebarCollapsed ? -20 : 0}}
                        transition={{duration: 0.3}}
                    >
                        {!isSidebarCollapsed && "AirQo"}
                    </motion.h1>

                    {/* Sidebar Toggle Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className="hidden md:flex transition-all duration-300 ease-in-out hover:bg-accent hover:rotate-180"
                    >
                        {isSidebarCollapsed ? <ChevronRight size={24}/> : <ChevronLeft size={24}/>}
                    </Button>

                    {/* Mobile Menu Close Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleMobileMenu}
                        className="md:hidden transition-transform duration-200 hover:bg-accent"
                    >
                        <X size={24}/>
                    </Button>
                </div>

                {/* Sidebar Content */}
                <div className="h-[calc(100vh-64px)] overflow-y-auto">
                    {/* Organization Switcher */}
                    <Card
                        className={`m-4 bg-primary text-primary-foreground ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
                        <CardContent className="p-3">
                            <h2 className="text-sm font-semibold mb-2">Organization</h2>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="secondary"
                                        className="w-full justify-between uppercase"
                                    >
                                        {activeGroup?.grp_title || "Select Organization"}
                                        <ChevronRight size={16}/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuLabel>Switch Organization</DropdownMenuLabel>
                                    <DropdownMenuSeparator/>
                                    {userGroups.map((group) => (
                                        <DropdownMenuItem
                                            key={group._id}
                                            onClick={() => handleOrganizationChange(group)}
                                            className="flex items-center justify-between uppercase"
                                        >
                                            {group.grp_title}
                                            {activeGroup?._id === group._id && <Check size={16}/>}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardContent>
                    </Card>

                    {/* Main Navigation */}
                    <nav className="space-y-6 p-4">
                        {/* Overview */}
                        <div>
                            <h2 className={`text-sm font-semibold text-foreground/60 mb-2 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
                                Overview
                            </h2>
                            <ul className="space-y-2">
                                <li><NavItem href="/analytics" icon={BarChart2} label="Analytics"/></li>
                                <li><NavItem href="/network-map" icon={Map} label="Network Map"/></li>
                                <li><NavItem href="/data-export" icon={Download} label="Data Export"/></li>
                            </ul>
                        </div>

                        {/* Organization */}
                        <PermissionGuard permission="CREATE_UPDATE_AND_DELETE_NETWORK_USERS">
                            <div>
                                <h2 className={`text-sm font-semibold text-foreground/60 mb-2 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
                                    Organization
                                </h2>
                                <ul className="space-y-2">
                                    <li><NavItem href="/user-management" icon={Users} label="User Management"/></li>
                                    <PermissionGuard permission="CREATE_UPDATE_AND_DELETE_NETWORK_ROLES">
                                        <li><NavItem href="/access-control" icon={Shield} label="Access Control"/></li>
                                    </PermissionGuard>
                                    <li><NavItem href="/organizations" icon={Building2} label="Organizations"/></li>
                                </ul>
                            </div>
                        </PermissionGuard>

                        {/* Network */}
                        <div>
                            <h2 className={`text-sm font-semibold text-foreground/60 mb-2 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
                                Network
                            </h2>

                            {/* Network Switcher */}
                            <div className={`mb-4 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between text-foreground"
                                        >
                                            <div className="flex items-center gap-2">
                                                <NetworkIcon size={18}/>
                                                <span className="uppercase">
                          {activeNetwork?.net_name || "Select Network"}
                        </span>
                                            </div>
                                            <ChevronRight size={16}/>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        <DropdownMenuLabel>Select Network</DropdownMenuLabel>
                                        <DropdownMenuSeparator/>
                                        {availableNetworks
                                            .filter((network) => network._id === activeNetwork?._id)
                                            .map((network) => (
                                                <DropdownMenuItem
                                                    key={network._id}
                                                    onClick={() => handleNetworkChange(network)}
                                                    className="flex items-center justify-between uppercase"
                                                >
                                                    {network.net_name}
                                                    {activeNetwork?._id === network._id && (
                                                        <Check size={16}/>
                                                    )}
                                                </DropdownMenuItem>
                                            ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Network Items */}
                            <ul className="space-y-2">
                                <PermissionGuard
                                    permission={[
                                        "CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES",
                                        "DEPLOY_AIRQO_DEVICES",
                                    ]}
                                    requireAll={false}
                                >
                                    <li>
                                        <Collapsible
                                            open={isDevicesOpen}
                                            onOpenChange={handleDevicesToggle}
                                        >
                                            <CollapsibleTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className={`w-full justify-between ${
                                                        isActive("/devices/overview") && !isDevicesOpen
                                                            ? "bg-accent text-accent-foreground"
                                                            : ""
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Radio size={18}/>
                                                        <span
                                                            className={isSidebarCollapsed ? 'hidden' : 'block'}>Devices</span>
                                                    </div>
                                                    <ChevronRight
                                                        size={16}
                                                        className={`transition-transform ${
                                                            isDevicesOpen ? 'rotate-90' : ''
                                                        } ${isSidebarCollapsed ? 'hidden' : 'block'}`}
                                                    />
                                                </Button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent
                                                className={`ml-6 space-y-2 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
                                                <PermissionGuard permission="CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES">
                                                    <NavItem href="/devices/overview" icon={BarChart2}
                                                             label="Overview"/>
                                                </PermissionGuard>
                                                <PermissionGuard permission="DEPLOY_AIRQO_DEVICES">
                                                    <NavItem href="/devices/deploy" icon={PlusCircle}
                                                             label="Deploy Device"/>
                                                </PermissionGuard>
                                                <PermissionGuard permission="VIEW_NETWORK_UPTIME">
                                                    <NavItem href="/devices/monitoring" icon={MonitorSmartphone}
                                                             label="Monitoring"/>
                                                </PermissionGuard>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </li>
                                </PermissionGuard>

                                <PermissionGuard permission="CREATE_UPDATE_AND_DELETE_NETWORK_SITES">
                                    <li><NavItem href="/sites" icon={MapPin} label="Sites"/></li>
                                </PermissionGuard>

                                <PermissionGuard permission="CREATE__UPDATE_AND_DELETE_COHORTS">
                                    <li><NavItem href="/cohorts" icon={Layers} label="Cohorts"/></li>
                                </PermissionGuard>

                                <PermissionGuard permission="CREATE_UPDATE_AND_DELETE_GRIDS">
                                    <li><NavItem href="/grids" icon={Grid} label="Grids"/></li>
                                </PermissionGuard>

                                <li><NavItem href="/activity-logs" icon={Activity} label="Activity Logs"/></li>
                            </ul>
                        </div>

                        {/* Account */}
                        <div>
                            <h2 className={`text-sm font-semibold text-foreground/60 mb-2 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
                                Account
                            </h2>
                            <ul className="space-y-2">
                                <li><NavItem href="/profile" icon={UserCircle} label="Profile Settings"/></li>
                            </ul>
                        </div>
                    </nav>
                </div>

                {/* Sidebar Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t  ">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => {
                                        logout();
                                    }}
                                >
                                    <LogOut size={18} className="mr-2"/>
                                    <span className={isSidebarCollapsed ? 'hidden' : 'block'}>Logout</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className={isSidebarCollapsed ? 'block' : 'hidden'}>
                                Logout
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </>
    );
};

export default Sidebar;