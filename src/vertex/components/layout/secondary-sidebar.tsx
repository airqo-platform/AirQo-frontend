"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  ChevronRight,
  ChevronLeft,
  Shield,
  X,
  LogOut
} from "lucide-react";

import {
  AqHomeSmile,
  AqMonitor,
  AqUser03,
  AqAirQlouds,
  AqMarkerPin01,
  AqPackagePlus,
  AqCollocation,
} from "@airqo/icons-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";
import { useUserContext } from "@/core/hooks/useUserContext";
import Card from "../shared/card/CardWrapper";
import { useAppSelector } from "@/core/redux/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useAuth } from '@/core/hooks/users';

interface SecondarySidebarProps {
  isCollapsed: boolean;
  activeModule: string;
  toggleSidebar: () => void;
  isTabletOpen?: boolean;
  handleMobileClose?: () => void;
}

const styles = {
  scrollbar: "scrollbar-thumb-gray-300 scrollbar-track-gray-100",
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

  const AirqoLogoRaw = "/images/airqo_logo.svg";
const NavItem = ({
  href,
  icon: Icon,
  label,
  isCollapsed,
  disabled = false,
  tooltip,
  activeOverride,
  onClick,
}: {
  href?: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
  disabled?: boolean;
  tooltip?: string;
  activeOverride?: boolean;
  onClick?: () => void;
}) => {
  const pathname = usePathname();
  const isActive =
    typeof activeOverride === "boolean"
      ? activeOverride
      : href !== undefined && pathname.startsWith(href);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
          onClick={onClick}
            href={disabled || !href ? "#" : href}
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
            className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition text-base
                ${
                  isActive
                    ? isCollapsed
                      ? "bg-blue-50"
                      : "bg-blue-50 font-normal text-blue-700"
                    : "hover:bg-muted text-foreground"
                }
                ${isCollapsed ? "justify-center px-2 py-2" : ""}
                ${
                  disabled
                    ? "opacity-50 pointer-events-none cursor-not-allowed"
                    : ""
                }`}
            style={{ position: "relative" }}
          >
            {isActive && !isCollapsed && (
              <span className="absolute -left-2 top-[17px] bottom-2 w-1 rounded-full bg-blue-600 h-3" />
            )}
            <Icon size={20} className="shrink-0" />
            <span className={isCollapsed ? "hidden" : "block font-light "}>{label}</span>
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

const SecondarySidebar: React.FC<SecondarySidebarProps> = ({
  isCollapsed,
  activeModule,
  toggleSidebar,
  isTabletOpen = false,
  handleMobileClose,
}) => {
  const { getSidebarConfig, getContextPermissions, isPersonalContext } =
    useUserContext();
  const sidebarConfig = getSidebarConfig();
  const contextPermissions = getContextPermissions();
  const isContextLoading = useAppSelector((state) => state.user.isContextLoading);
  const { logout } = useAuth();

  return (
    <>
    
    <aside className="hidden lg:block fixed left-0 top-[60px] z-50 text-sidebar-text transition-all duration-300 ease-in-out p-1">
      <div
        className={`transition-all duration-300 ease-in-out relative z-50 p-1
          ${isCollapsed ? "w-[75px]" : "w-[256px]"} h-[calc(100vh-4rem)]`}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={`absolute flex rounded-full top-4 -right-[6px] z-50 shadow-lg justify-center items-center border w-6 h-6 bg-white border-gray-200 text-gray-800 hover:shadow-xl transition-all duration-200`}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-700" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-700" />
          )}
        </Button>
        <Card
          className="h-full relative overflow-hidden"
          padding={isCollapsed ? "p-2" : "p-3"}
          overflow
          overflowType="auto"
          contentClassName={`flex flex-col h-full overflow-x-hidden scrollbar-thin ${styles.scrollbar}`}
        >
          {isContextLoading ? (
            <div className="flex flex-col gap-4 p-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ) : (
            <>
              {activeModule === "network" && (
                <>
                  <NavItem
                    href="/home"
                    icon={AqHomeSmile}
                    label="Home"
                    isCollapsed={isCollapsed}
                    disabled={false}
                  />

                  {/* Network Section Heading */}
                  <SidebarSectionHeading isCollapsed={isCollapsed}>
                    {isPersonalContext ? "My Network" : "Network"}
                  </SidebarSectionHeading>

                  {/* Devices Section */}
                  {contextPermissions.canViewDevices &&
                    (isPersonalContext ? (
                      sidebarConfig.showMyDevices && (
                        <NavItem
                          href="/devices/my-devices"
                          icon={AqMonitor}
                          label="My Devices"
                          isCollapsed={isCollapsed}
                          disabled={!contextPermissions.canViewDevices}
                          tooltip="You do not have permission to view devices."
                        />
                      )
                    ) : (
                      sidebarConfig.showDeviceOverview && (
                        <NavItem
                          href="/devices/overview"
                          icon={AqMonitor}
                          label="Devices"
                          isCollapsed={isCollapsed}
                          disabled={!contextPermissions.canViewDevices}
                          tooltip="You do not have permission to view devices."
                        />
                      )
                    ))}

                  {sidebarConfig.showClaimDevice && (
                    <NavItem
                      href="/devices/claim"
                      icon={AqPackagePlus}
                      label="Claim Device"
                      isCollapsed={isCollapsed}
                    />
                  )}

                  {/* Sites - only for non-personal contexts */}
                  {sidebarConfig.showSites && contextPermissions.canViewSites && (
                    <NavItem
                      href="/sites"
                      icon={AqMarkerPin01}
                      label="Sites"
                      isCollapsed={isCollapsed}
                      disabled={false}
                    />
                  )}

                  {sidebarConfig.showGrids && contextPermissions.canViewSites && (
                  <NavItem
                    href="/grids"
                    icon={AqAirQlouds}
                    label="Grids"
                    isCollapsed={isCollapsed}
                    disabled={false}
                  />
                )}

                {sidebarConfig.showCohorts && contextPermissions.canViewDevices && (
                  <NavItem
                    href="/cohorts"
                    icon={AqCollocation}
                    label="Cohorts"
                    isCollapsed={isCollapsed}
                    disabled={false}
                  />
                )}
                </>
              )}

              {activeModule === "admin" && (
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
                </>
              )}
            </>
          )}
        </Card>

        {/* Account Section at the bottom */}
        <div className="mt-auto">
          <SidebarSectionHeading isCollapsed={isCollapsed}>
            Account
          </SidebarSectionHeading>
          {isContextLoading ? (
            <div className="p-2">
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
                <NavItem
                  href="/profile"
                  icon={AqUser03}
                  label="Profile"
                  isCollapsed={isCollapsed}
                />
          )}
        </div>
      </div>
    </aside>

    {/* Tablet Overlay */}
      {isTabletOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
          onClick={handleMobileClose}
        />
      )}
      
     {/* Tablet Sidebar - slides in from right  */}
      <aside
        className={`lg:hidden fixed top-0 right-0 z-[99999] h-full w-[290px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isTabletOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full   px-2 pt-0">
                <div className="flex w-full mt-3 items-center gap-8 space-x-4 p-1">
                        <Image
                          src={AirqoLogoRaw}
                          alt="AirQo logo"
                          width={48}
                          height={48}
                          priority
                          className="flex ml-24 object-cover transition-opacity duration-500"
                        />

                        <button type="button" aria-label="Close sidebar" onClick={handleMobileClose} className="flex absolute right-5 z-50 transition-all duration-200">
                          <X className="h-5 w-5" />
                        </button>
                </div>
         

          <Card
            className="h-full border-none relative overflow-hidden"
            padding="p-3"
            overflow
            overflowType="auto"
            contentClassName={`flex flex-col h-full overflow-x-hidden scrollbar-thin ${styles.scrollbar} pt-7`}
          >
            {isContextLoading ? (
              <div className="flex flex-col gap-4 p-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ) : (
              <>
                {activeModule === "network" && (
                  <>
                    <NavItem href="/home" icon={AqHomeSmile} label="Home" isCollapsed={false} disabled={false} />

                    {/* Network Section Heading */}
                    <SidebarSectionHeading isCollapsed={false}>
                      {isPersonalContext ? "My Network" : "Network"}
                    </SidebarSectionHeading>

                    {/* Devices Section */}
                    {contextPermissions.canViewDevices &&
                      (isPersonalContext
                        ? sidebarConfig.showMyDevices && (
                            <NavItem
                              href="/devices/my-devices"
                              icon={AqMonitor}
                              label="My Devices"
                              isCollapsed={false}
                              disabled={!contextPermissions.canViewDevices}
                              tooltip="You do not have permission to view devices."
                            />
                          )
                        : sidebarConfig.showDeviceOverview && (
                            <NavItem
                              href="/devices/overview"
                              icon={AqMonitor}
                              label="Devices"
                              isCollapsed={false}
                              disabled={!contextPermissions.canViewDevices}
                              tooltip="You do not have permission to view devices."
                            />
                          ))}

                    {sidebarConfig.showClaimDevice && (
                      <NavItem href="/devices/claim" icon={AqPackagePlus} label="Claim Device" isCollapsed={false} />
                    )}

                    {/* Sites - only for non-personal contexts */}
                    {sidebarConfig.showSites && contextPermissions.canViewSites && (
                      <NavItem href="/sites" icon={AqMarkerPin01} label="Sites" isCollapsed={false} disabled={false} />
                    )}

                    {sidebarConfig.showGrids && contextPermissions.canViewSites && (
                      <NavItem href="/grids" icon={AqAirQlouds} label="Grids" isCollapsed={false} disabled={false} />
                    )}

                    {sidebarConfig.showCohorts && contextPermissions.canViewDevices && (
                      <NavItem href="/cohorts" icon={AqCollocation} label="Cohorts" isCollapsed={false} disabled={false} />
                    )}
                  </>
                )}

                {activeModule === "admin" && (
                  <>
                    {sidebarConfig.showUserManagement && (
                      <NavItem
                        href="/user-management"
                        icon={Users}
                        label="User Management"
                        isCollapsed={false}
                        disabled={!contextPermissions.canViewUserManagement}
                        tooltip="You do not have permission to view user management."
                      />
                    )}
                    {sidebarConfig.showAccessControl && (
                      <NavItem
                        href="/access-control"
                        icon={Shield}
                        label="Access Control"
                        isCollapsed={false}
                        disabled={!contextPermissions.canViewAccessControl}
                        tooltip="You do not have permission to view access control."
                      />
                    )}
                  </>
                )}
              </>
            )}
          </Card>

          {/* Account Section at the bottom */}
          <div className="absolute bottom-4 left-4 right-4">
            <SidebarSectionHeading isCollapsed={false}>Account</SidebarSectionHeading>
            {isContextLoading ? (
              <div className="p-2">
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <NavItem onClick={logout}  icon={LogOut} label="Sign out" isCollapsed={false} />
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default SecondarySidebar;
