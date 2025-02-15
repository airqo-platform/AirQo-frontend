import type React from "react"
import Link from "next/link"
import {
  X,
  BarChart2,
  Users,
  Shield,
  Radio,
  MapPin,
  Layers,
  Grid,
  Building2,
  Activity,
  UserCircle,
  Download,
  Map,
  ChevronRight,
  Check,
  PlusCircle,
  MonitorSmartphone,
  LogOut,
  NetworkIcon,
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

interface MobileSidebarProps {
  isMobileMenuOpen: boolean
  toggleMobileMenu: () => void
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

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isMobileMenuOpen,
  toggleMobileMenu,
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
  className,
}) => {
  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => (
    <Link
      href={href}
      className={`flex items-center gap-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground p-2 rounded-md transition-all duration-200 ${
        isActive(href) ? "bg-accent text-accent-foreground" : ""
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  )

  return (
    <>
      {/* Sidebar Overlay (Backdrop) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={toggleMobileMenu} />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: isMobileMenuOpen ? "0%" : "-100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50 md:hidden flex flex-col ${className || ''}`}
      >
        {/* Close Button */}
        <div className="flex justify-between items-center border-b">
          <h2 className="text-lg font-semibold">AirQo</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="transition-transform duration-200 hover:bg-gray-200"
          >
            <X size={24} />
          </Button>
        </div>

        {/* Sidebar Content */}
        <div className="h-[calc(100vh-64px)] overflow-y-auto">
          {/* Organization Switcher */}
          <Card className="m-4 bg-primary text-primary-foreground">
            <CardContent className="p-3">
              <h2 className="text-sm font-semibold mb-2">Organization</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="w-full justify-between uppercase">
                    {activeGroup?.grp_title || "Select Organization"}
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
                      {group.grp_title}
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
              <h2 className="text-sm font-semibold text-foreground/60 mb-2">Overview</h2>
              <ul className="space-y-2">
                <li>
                  <NavItem href="/analytics" icon={BarChart2} label="Analytics" />
                </li>
                <li>
                  <NavItem href="/network-map" icon={Map} label="Network Map" />
                </li>
                <li>
                  <NavItem href="/data-export" icon={Download} label="Data Export" />
                </li>
              </ul>
            </div>

            {/* Organization */}
            <PermissionGuard permission="CREATE_UPDATE_AND_DELETE_NETWORK_USERS">
              <div>
                <h2 className="text-sm font-semibold text-foreground/60 mb-2">Organization</h2>
                <ul className="space-y-2">
                  <li>
                    <NavItem href="/user-management" icon={Users} label="User Management" />
                  </li>
                  <PermissionGuard permission="CREATE_UPDATE_AND_DELETE_NETWORK_ROLES">
                    <li>
                      <NavItem href="/access-control" icon={Shield} label="Access Control" />
                    </li>
                  </PermissionGuard>
                  <li>
                    <NavItem href="/organizations" icon={Building2} label="Organizations" />
                  </li>
                </ul>
              </div>
            </PermissionGuard>

            {/* Network */}
            <div>
              <h2 className="text-sm font-semibold text-foreground/60 mb-2">Network</h2>

              {/* Network Switcher */}
              <div className="mb-4">
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
                      .filter((network) => network._id === activeNetwork?._id)
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
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className={`w-full justify-between ${
                            isActive("/devices/overview") && !isDevicesOpen ? "bg-accent text-accent-foreground" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Radio size={18} />
                            <span>Devices</span>
                          </div>
                          <ChevronRight
                            size={16}
                            className={`transition-transform ${isDevicesOpen ? "rotate-90" : ""}`}
                          />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="ml-6 space-y-2">
                        <PermissionGuard permission="CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES">
                          <NavItem href="/devices/overview" icon={BarChart2} label="Overview" />
                        </PermissionGuard>
                        <PermissionGuard permission="DEPLOY_AIRQO_DEVICES">
                          <NavItem href="/devices/deploy" icon={PlusCircle} label="Deploy Device" />
                        </PermissionGuard>
                        <PermissionGuard permission="VIEW_NETWORK_UPTIME">
                          <NavItem href="/devices/monitoring" icon={MonitorSmartphone} label="Monitoring" />
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

                <PermissionGuard permission="CREATE__UPDATE_AND_DELETE_COHORTS">
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
              <h2 className="text-sm font-semibold text-foreground/60 mb-2">Account</h2>
              <ul className="space-y-2">
                <li>
                  <NavItem href="/profile" icon={UserCircle} label="Profile Settings" />
                </li>
              </ul>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t mt-0 md:mt-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={logout}
          >
            <LogOut size={18} className="mr-2" />
            <span>Logout</span>
          </Button>
        </div>
      </motion.aside>
    </>
  )
}

export default MobileSidebar

