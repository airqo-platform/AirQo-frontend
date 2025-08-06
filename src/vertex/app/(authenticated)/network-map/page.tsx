"use client";

import { NetworkMap } from "@/components/features/network-map/network-map";
import { StatusSummary } from "@/components/features/network-map/status-summary";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import useWindowSize from "@/core/hooks/useWindow";
import { PERMISSIONS } from "@/core/permissions/constants";

export const isDesktop = (width: number) => width >= 1024;

export default function NetworkMapPage() {
  const { width } = useWindowSize();
  const isMobile = !isDesktop(width);
  const containerClassName = isMobile
    ? "flex flex-col w-full h-full overflow-hidden"
    : "flex flex-row w-full h-full pt-2 pr-2 pb-[0.4rem] pl-0 overflow-hidden";
  const sidebarClassName = isMobile
    ? "transition-all duration-500 ease-in-out h-[60%] w-full sidebar-scroll-bar order-2"
    : "transition-all duration-300 h-full min-w-[280px] lg:w-[280px]";
  const mapClassName = isMobile
    ? "transition-all duration-500 ease-in-out h-[40%] w-full order-1"
    : "transition-all duration-300 h-full w-full";

  return (
    <RouteGuard
      permission={PERMISSIONS.DEVICE.VIEW}
      allowedContexts={["airqo-internal"]}
    >
      <div className="h-[calc(100vh-5rem)] md:h-[calc(100vh-140px)] lg:h-[calc(100vh-64px)] overflow-hidden">
        <div className="h-full text-text transition-all duration-300 overflow-hidden">
          <div className={containerClassName}>
            <div
              className={`overflow-y-auto md:overflow-hidden md:rounded-l-xl ${sidebarClassName}`}
            >
              <StatusSummary />
            </div>
            <div className={mapClassName}>
              <div className="relative w-full h-full md:overflow-hidden md:rounded-r-xl">
                <NetworkMap />
              </div>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
