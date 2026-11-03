"use client";

import React, { Suspense } from "react";
import { FleetPageSkeleton } from "@/components/diagnostics/AirqoFleetGate";
import { FleetHealthView } from "@/components/diagnostics/FleetHealthView";
import { useGroup } from "@/lib/group-context";
import { ROUTES } from "@/lib/navigation";

/** The organisation's own fleet health, read-only. AirQo staff use Fleet Health in the admin panel. */
export default function NetworkHealthPage() {
  const { activeGroup, loading: groupLoading } = useGroup();

  if (groupLoading || !activeGroup) return <FleetPageSkeleton />;

  return (
    <Suspense fallback={<FleetPageSkeleton />}>
      <FleetHealthView
        group={activeGroup}
        canManage={false}
        basePath={ROUTES.NETWORK_HEALTH}
        title="Network Health"
        description="What the nightly diagnosis found on your organisation's devices, grouped by the part of the device to fix."
      />
    </Suspense>
  );
}
