"use client";

import { NetworkMap } from "@/components/network-map/network-map";
import { StatusSummary } from "@/components/network-map/status-summary";

export default function NetworkMapPage() {
  return (
    <div className="h-screen w-full relative">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-7xl px-6">
        <StatusSummary />
      </div>
      <div className="h-full w-full">
        <NetworkMap />
      </div>
    </div>
  );
} 