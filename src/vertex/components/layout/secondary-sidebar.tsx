"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
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

interface SecondarySidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
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

const NavItem = ({
  href,
  icon: Icon,
  label,
  isCollapsed,
  disabled = false,
  tooltip,
  activeOverride,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
  disabled?: boolean;
  tooltip?: string;
  activeOverride?: boolean;
}) => {
  const pathname = usePathname();
  const isActive =
    typeof activeOverride === "boolean"
      ? activeOverride
      : pathname.startsWith(href);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={disabled ? "#" : href}
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
            className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition text-base
                ${
                  isActive
                    ? isCollapsed
                      ? "bg-blue-50"
                      : "bg-blue-50 font-semibold text-blue-700"
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

const SecondarySidebar: React.FC<SecondarySidebarProps> = ({
  isCollapsed,
  toggleSidebar,
}) => {
  const { getSidebarConfig, getContextPermissions, isPersonalContext } =
    useUserContext();
  const pathname = usePathname();
  const sidebarConfig = getSidebarConfig();
  const contextPermissions = getContextPermissions();
  const isContextLoading = useAppSelector((state) => state.user.isContextLoading);

  const activeModule = pathname.startsWith("/admin") ? "admin" : "network";

  return (
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
                  <NavItem
                      href="/admin/networks"
                      icon={AqHomeSmile}
                      label="Networks"
                      isCollapsed={isCollapsed}
                      disabled={!contextPermissions.canViewNetworks}
                      tooltip="You do not have permission to view networks."
                    />
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
  );
};

export default SecondarySidebar;
