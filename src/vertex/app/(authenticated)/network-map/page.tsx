"use client";

import { NetworkMap } from "@/components/features/network-map/network-map";
import { StatusSummary } from "@/components/features/network-map/status-summary";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { PERMISSIONS } from "@/core/permissions/constants";

export default function NetworkMapPage() {
  return (
    <RouteGuard 
      permission={PERMISSIONS.DEVICE.VIEW}
      allowedContexts={['airqo-internal']}
    >
      <div className="h-screen w-full relative">
        <div 
          className="absolute z-10 h-screen overflow-y-auto m-2"
          style={{
            width: '280px',
            msOverflowStyle: 'none',  /* Hide scrollbar for IE and Edge */
            scrollbarWidth: 'none',   /* Hide scrollbar for Firefox */
            WebkitOverflowScrolling: 'touch', /* Smooth scrolling for iOS */
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;  /* Hide scrollbar for Chrome, Safari and Opera */
            }
          `}</style>
          <StatusSummary />
        </div>
        <div className="h-screen w-full">
          <NetworkMap />
        </div>
      </div>
    </RouteGuard>
  );
} 