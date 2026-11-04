"use client";

import React, { Suspense } from "react";
import { FleetPageSkeleton } from "@/components/diagnostics/AirqoFleetGate";
import { FleetIssuesView } from "@/components/diagnostics/FleetIssuesView";
import { useGroup } from "@/lib/group-context";
import { ROUTES } from "@/lib/navigation";

export default function NetworkHealthIssuesPage() {
  const { activeGroup, loading: groupLoading } = useGroup();

  if (groupLoading || !activeGroup) return <FleetPageSkeleton />;

  return (
    <Suspense fallback={<FleetPageSkeleton />}>
      <FleetIssuesView group={activeGroup} parentTitle="Network Health" basePath={ROUTES.NETWORK_HEALTH} />
    </Suspense>
  );
}
