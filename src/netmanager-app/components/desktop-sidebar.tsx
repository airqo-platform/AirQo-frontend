"use client"

import type React from "react"
import Link from "next/link"
import {
  BarChart2,
  Users,
  Radio,
  MapPin,
  Layers,
  Grid,
  Building2,
  Activity,
  UserCircle,
  Download,
  MapIcon,
  ChevronRight,
  Check,
  PlusCircle,
  MonitorSmartphone,
  LogOut,
  NetworkIcon,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Group, Network } from "@/app/types/users"
import { PermissionGuard } from "@/components/permission-guard"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"

const formatTitle = (title: string) => {
  return title.replace(/[_-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

interface DesktopSidebarProps {
  isSidebarCollapsed: boolean
  toggleSidebar: () => void
  isDevicesOpen: boolean
  handleDevicesToggle: (open: boolean) => void
  activeGroup: Group | null
  userGroups: Group[]
  handleOrganizationChange: (group: Group) => void
  activeNetwork: Network | null
  availableNetworks: Network[]
  handleNetworkChange: (network: Network) => void
  isActive: (path: string) => boolean
  logout: () => void
  className?: string
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  isSidebarCollapsed,
  toggleSidebar,
  isDevicesOpen,
  handleDevicesToggle,
  activeGroup,
  userGroups,
  handleOrganizationChange,
  activeNetwork,
  availableNetworks,
  handleNetworkChange,
  isActive,
  logout,
}) => {

  const NavItem = ({
    href,
    icon: Icon,
    label,
  }: {
    href: string
    icon: React.ElementType
    label: string
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={`flex items-center gap-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground p-2 rounded-md transition-all duration-200 ${
              isActive(href) ? "bg-accent text-accent-foreground" : ""
            } ${isSidebarCollapsed ? "justify-center" : ""}`}
          >
            <Icon size={18} className="shrink-0" />
            <span className={isSidebarCollapsed ? "hidden" : "block"}>{label}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className={isSidebarCollapsed ? "block" : "hidden"}>
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-card transition-all duration-300 ease-in-out z-40 shadow-lg flex flex-col desktop-sidebar
                ${isSidebarCollapsed ? "w-16" : "w-64"}
            `}
    >
      {/* Sidebar Header */}
      <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-900 p-2 relative">
        {/* Logo */}
        <motion.div
          className="flex items-center justify-center text-xl font-bold text-gray-900 dark:text-white"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Image
            src="/images/airqo_logo.svg"
            alt="Logo"
            width={112}
            height={48}
            className="w-12 h-8 sm:w-12 sm:h-10 md:w-12 md:h-12"
          />
        </motion.div>

        
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className={`absolute top-1/2 -translate-y-1/2 h-6 w-6 rounded-md bg-white shadow-sm border transition-all duration-300 
                    ${isSidebarCollapsed ? "left-12" : "left-60"}`}
                >
                  {isSidebarCollapsed ? (
                    <ChevronRight className="h-4 w-4 text-gray-700" />
                  ) : (
                    <ChevronLeft className="h-4 w-4 text-gray-700" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{isSidebarCollapsed ? "Open Sidebar" : "Close Sidebar"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        
      </div>

      {/* Sidebar Content */}
      <div className="flex-grow overflow-y-auto">
        {/* Organization Switcher */}
        <Card className={`m-4 bg-primary text-primary-foreground ${isSidebarCollapsed ? "hidden" : "block"}`}>
          <CardContent className="p-3">
            <h2 className="text-sm font-semibold mb-2">Organization</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="w-full justify-between uppercase">
                  {activeGroup?.grp_title
                    ? `${formatTitle(activeGroup.grp_title).slice(0, 16)}${
                        activeGroup.grp_title.length > 16 ? "..." : ""
                      }`
                    : "Select Organization"}
                  <ChevronRight size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Switch Organization</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userGroups.map((group) => (
                  <DropdownMenuItem
                    key={group._id}
                    onClick={() => handleOrganizationChange(group)}
                    className="flex items-center justify-between uppercase"
                  >
                    {formatTitle(group.grp_title || "")}
                    {activeGroup?._id === group._id && <Check size={16} />}
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
            <h2 className={`text-sm font-semibold text-foreground/60 mb-2 ${isSidebarCollapsed ? "hidden" : "block"}`}>
              Overview
            </h2>
            <ul className="space-y-2">
              <li>
                <NavItem 
                  href="/analytics" 
                  icon={BarChart2} 
                  label="Analytics" 
                />
              </li>
              <li>
                <NavItem 
                  href="/network-map" 
                  icon={MapIcon} 
                  label="Network Map" 
                />
              </li>
              <li>
                <NavItem 
                  href="/data-export" 
                  icon={Download} 
                  label="Data Export" 
                />
              </li>
            </ul>
          </div>

          {/* Network */}
          <div>
            <h2 className={`text-sm font-semibold text-foreground/60 mb-2 ${isSidebarCollapsed ? "hidden" : "block"}`}>
              Network
            </h2>

            {/* Network Switcher */}
            <div className={`mb-4 ${isSidebarCollapsed ? "hidden" : "block"}`}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between text-foreground">
                    <div className="flex items-center gap-2">
                      <NetworkIcon size={18} />
                      <span className="uppercase">{activeNetwork?.net_name || "Select Network"}</span>
                    </div>
                    <ChevronRight size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Select Network</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {availableNetworks
                    // Removed filter to show all networks
                    .map((network) => (
                      <DropdownMenuItem
                        key={network._id}
                        onClick={() => handleNetworkChange(network)}
                        className="flex items-center justify-between uppercase"
                      >
                        {network.net_name}
                        {activeNetwork?._id === network._id && <Check size={16} />}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Network Items */}
            <ul className="space-y-2">
              <PermissionGuard
                permission={["CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES", "DEPLOY_AIRQO_DEVICES"]}
                requireAll={false}
              >
                <li>
                  <Collapsible open={isDevicesOpen} onOpenChange={handleDevicesToggle}>
                    {isSidebarCollapsed ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center w-full cursor-pointer text-sm text-foreground hover:bg-accent hover:text-accent-foreground p-2 rounded-md transition-all duration-200">
                              <Radio size={18} className="shrink-0" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right">Devices</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <CollapsibleTrigger asChild>
                        <div
                          className={`flex items-center w-full cursor-pointer text-sm text-foreground hover:bg-accent hover:text-accent-foreground p-2 rounded-md transition-all duration-200 ${
                            isActive("/devices/overview") && !isDevicesOpen
                              ? "bg-accent text-accent-foreground"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <Radio size={18} className="shrink-0" />
                            <span>Devices</span>
                          </div>
                          <ChevronRight
                            size={16}
                            className={`transition-transform shrink-0 ${
                              isDevicesOpen ? "rotate-90" : ""
                            }`}
                          />
                        </div>
                      </CollapsibleTrigger>
                    )}
                    <CollapsibleContent className={`ml-6 space-y-2 ${isSidebarCollapsed ? "hidden" : "block"}`}>
                      <PermissionGuard permission="CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES">
                        <NavItem 
                          href="/devices/overview" 
                          icon={BarChart2} 
                          label="Overview" 
                        />
                      </PermissionGuard>
                      <PermissionGuard permission="DEPLOY_AIRQO_DEVICES">
                        <NavItem 
                          href="/devices/deploy" 
                          icon={PlusCircle} 
                          label="Deploy Device" 
                        />
                      </PermissionGuard>
                      <PermissionGuard permission="VIEW_NETWORK_UPTIME">
                        <NavItem 
                          href="/devices/monitoring" 
                          icon={MonitorSmartphone} 
                          label="Monitoring" 
                        />
                      </PermissionGuard>
                    </CollapsibleContent>
                  </Collapsible>
                </li>
              </PermissionGuard>

              <PermissionGuard permission="CREATE_UPDATE_AND_DELETE_NETWORK_SITES">
                <li>
                  <NavItem href="/sites" icon={MapPin} label="Sites" />
                </li>
              </PermissionGuard>

              <PermissionGuard permission="CREATE_UPDATE_AND_DELETE_COHORTS">
                <li>
                  <NavItem href="/cohorts" icon={Layers} label="Cohorts" />
                </li>
              </PermissionGuard>

              <PermissionGuard permission="CREATE_UPDATE_AND_DELETE_GRIDS">
                <li>
                  <NavItem href="/grids" icon={Grid} label="Grids" />
                </li>
              </PermissionGuard>

              <li>
                <NavItem href="/activity-logs" icon={Activity} label="Activity Logs" />
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h2 className={`text-sm font-semibold text-foreground/60 mb-2 ${isSidebarCollapsed ? "hidden" : "block"}`}>
              Account
            </h2>
            <ul className="space-y-2">
              <li>
                <NavItem href="/profile" icon={UserCircle} label="Profile Settings" />
              </li>
            </ul>
          </div>

          {/* Organization */}
          <PermissionGuard permission="CREATE_UPDATE_AND_DELETE_NETWORK_USERS">
            <div>
              <h2
                className={`text-sm font-semibold text-foreground/60 mb-2 ${isSidebarCollapsed ? "hidden" : "block"}`}
              >
                App Management
              </h2>
              <ul className="space-y-2">
                <li>
                  <NavItem href="/user-management" icon={Users} label="User Management" />
                </li>
                <li>
                  <NavItem href="/organizations" icon={Building2} label="Organizations" />
                </li>
              </ul>
            </div>
          </PermissionGuard>
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 bg-white">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full justify-start text-destructive hover:text-destructive ${
                  isSidebarCollapsed ? "justify-center" : ""
                }`}
                onClick={logout}
              >
                <LogOut size={18} />
                <span className={isSidebarCollapsed ? "hidden" : "block"}>Logout</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className={isSidebarCollapsed ? "block" : "hidden"}>
              Logout
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

export default DesktopSidebar

