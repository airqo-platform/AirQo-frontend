"use client";

import React from "react";
import { FleetHealthView } from "@/components/diagnostics/FleetHealthView";
import { Skeleton } from "@/components/ui/skeleton";
import { useGroup } from "@/lib/group-context";

/** The organisation's own fleet health, read-only. AirQo staff use Fleet Diagnostics in the admin panel. */
export default function NetworkHealthPage() {
  const { activeGroup, loading: groupLoading } = useGroup();

  if (groupLoading || !activeGroup) {
    return (
      <div className="p-6">
        <Skeleton className="h-10 w-72 mb-6" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <FleetHealthView
      group={activeGroup}
      canManage={false}
      title="Network Health"
      description="Daily health of your organisation's devices: lifecycle states, most common issues, persistent faults and the devices that need attention"
    />
  );
}
