"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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
  ChevronDown,
  Check,
  PlusCircle,
  MonitorSmartphone,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { setActiveNetwork } from "@/core/redux/slices/userSlice";
import type { Network } from "@/app/types/users";
import { PermissionGuard } from "@/components/permission-guard";

const Sidebar = () => {
  const pathname = usePathname();
  const [userCollapsed, setUserCollapsed] = useState(false);
  const [isDevicesOpen, setIsDevicesOpen] = useState(false);
  const { logout } = useAuth();
  const dispatch = useAppDispatch();

  // Get networks and active network from Redux
  const availableNetworks = useAppSelector(
    (state) => state.user.availableNetworks
  );
  console.log(availableNetworks);
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);

  const isActive = (path: string) => pathname?.startsWith(path);
  const isDevicesActive = isActive("/devices");

  useEffect(() => {
    if (isDevicesActive && !userCollapsed) {
      setIsDevicesOpen(true);
    } else if (!isDevicesActive) {
      setUserCollapsed(false);
    }
  }, [pathname, isDevicesActive, userCollapsed]);

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

  return (
    <div className="w-64 h-screen bg-card border-r flex flex-col">
      {/* Network Switcher */}
      <div className="p-4 border-b">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between text-foreground uppercase"
            >
              {activeNetwork?.net_name || "Select Network"}
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Switch Network</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availableNetworks.map((network) => (
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

      {/* Main Navigation */}
      <div className="flex-1 p-4 overflow-y-auto">
        <nav className="space-y-6">
          {/* Overview */}
          <div>
            <h2 className="text-sm font-semibold text-foreground/60 mb-2">
              Overview
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/analytics"
                  className={`flex items-center gap-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground p-2 rounded-md ${
                    isActive("/analytics")
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }`}
                >
                  <BarChart2 size={18} />
                  <span>Analytics</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/network-map"
                  className={`flex items-center gap-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground p-2 rounded-md ${
                    isActive("/network-map")
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }`}
                >
                  <Map size={18} />
                  <span>Network Map</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/data-export"
                  className={`flex items-center gap-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground p-2 rounded-md ${
                    isActive("/data-export")
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }`}
                >
                  <Download size={18} />
                  <span>Data Export</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Organization */}
          <PermissionGuard permission="CREATE_UPDATE_AND_DELETE_NETWORK_USERS">
            <div>
              <h2 className="text-sm font-semibold text-foreground/60 mb-2">
                Organization
              </h2>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/user-management"
                    className={`flex items-center gap-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground p-2 rounded-md ${
                      isActive("/user-management")
                        ? "bg-accent text-accent-foreground"
                        : ""
                    }`}
                  >
                    <Users size={18} />
                    <span>User Management</span>
                  </Link>
                </li>
                <PermissionGuard permission="CREATE_UPDATE_AND_DELETE_NETWORK_ROLES">
                  <li>
                    <Link
                      href="/access-control"
                      className={`flex items-center gap-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground p-2 rounded-md ${
                        isActive("/access-control")
                          ? "bg-accent text-accent-foreground"
                          : ""
                      }`}
                    >
                      <Shield size={18} />
                      <span>Access Control</span>
                    </Link>
                  </li>
                </PermissionGuard>
                <li>
                  <Link
                    href="/organizations"
                    className={`flex items-center gap-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground p-2 rounded-md ${
                      isActive("/organizations")
                        ? "bg-accent text-accent-foreground"
                        : ""
                    }`}
                  >
                    <Building2 size={18} />
                    <span>Organizations</span>
                  </Link>
                </li>
              </ul>
            </div>
          </PermissionGuard>

          {/* Network */}
          <div>
            <h2 className="text-sm font-semibold text-foreground/60 mb-2">
              Network
            </h2>
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
                          isActive("/devices")
                            ? "bg-accent text-accent-foreground"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Radio size={18} />
                          <span>Devices</span>
                        </div>
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${
                            isDevicesOpen ? "rotate-180" : ""
                          }`}
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="ml-6 space-y-2">
                      <PermissionGuard permission="CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES">
                        <Link
                          href="/devices"
                          className={`flex items-center gap-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground p-2 rounded-md ${
                            pathname === "/devices"
                              ? "bg-accent text-accent-foreground"
                              : ""
                          }`}
                        >
                          <BarChart2 size={18} />
                          <span>Overview</span>
                        </Link>
                      </PermissionGuard>

                      <PermissionGuard permission="DEPLOY_AIRQO_DEVICES">
                        <Link
                          href="/devices/deploy"
                          className={`flex items-center gap-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground p-2 rounded-md ${
                            isActive("/devices/deploy")
                              ? "bg-accent text-accent-foreground"
                              : ""
                          }`}
                        >
                          <PlusCircle size={18} />
                          <span>Deploy Device</span>
                        </Link>
                      </PermissionGuard>

                      <PermissionGuard permission="VIEW_NETWORK_UPTIME">
                        <Link
                          href="/devices/monitoring"
                          className={`flex items-center gap-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground p-2 rounded-md ${
                            isActive("/devices/monitoring")
                              ? "bg-accent text-accent-foreground"
                              : ""
                          }`}
                        >
                          <MonitorSmartphone size={18} />
                          <span>Monitoring</span>
                        </Link>
                      </PermissionGuard>
                    </CollapsibleContent>
                  </Collapsible>
                </li>
              </PermissionGuard>

              <PermissionGuard permission="CREATE_UPDATE_AND_DELETE_NETWORK_SITES">
                <li>
                  <Link
                    href="/sites"
                    className={`flex items-center gap-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground p-2 rounded-md ${
                      isActive("/sites")
                        ? "bg-accent text-accent-foreground"
                        : ""
                    }`}
                  >
                    <MapPin size={18} />
                    <span>Sites</span>
                  </Link>
                </li>
              </PermissionGuard>

              <PermissionGuard permission="CREATE__UPDATE_AND_DELETE_COHORTS">
                <li>
                  <Link
                    href="/cohorts"
                    className={`flex items-center gap-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground p-2 rounded-md ${
                      isActive("/cohorts")
                        ? "bg-accent text-accent-foreground"
                        : ""
                    }`}
                  >
                    <Layers size={18} />
                    <span>Cohorts</span>
                  </Link>
                </li>
              </PermissionGuard>

              <PermissionGuard permission="CREATE_UPDATE_AND_DELETE_GRIDS">
                <li>
                  <Link
                    href="/grids"
                    className={`flex items-center gap-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground p-2 rounded-md ${
                      isActive("/grids")
                        ? "bg-accent text-accent-foreground"
                        : ""
                    }`}
                  >
                    <Grid size={18} />
                    <span>Grids</span>
                  </Link>
                </li>
              </PermissionGuard>

              <li>
                <Link
                  href="/activity-logs"
                  className={`flex items-center gap-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground p-2 rounded-md ${
                    isActive("/activity-logs")
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }`}
                >
                  <Activity size={18} />
                  <span>Activity Logs</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h2 className="text-sm font-semibold text-foreground/60 mb-2">
              Account
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/profile"
                  className={`flex items-center gap-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground p-2 rounded-md ${
                    isActive("/profile")
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }`}
                >
                  <UserCircle size={18} />
                  <span>Profile Settings</span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Logout Section */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => {
            logout();
          }}
        >
          <LogOut size={18} className="mr-2" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
