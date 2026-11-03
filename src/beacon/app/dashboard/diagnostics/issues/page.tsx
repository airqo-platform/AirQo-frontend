"use client";

import React, { Suspense } from "react";
import { AirqoFleetGate, FleetPageSkeleton } from "@/components/diagnostics/AirqoFleetGate";
import { FleetIssuesView } from "@/components/diagnostics/FleetIssuesView";
import { ROUTES } from "@/lib/navigation";

export default function FleetIssuesPage() {
  return (
    <Suspense fallback={<FleetPageSkeleton />}>
      <AirqoFleetGate>
        {(group) => <FleetIssuesView group={group} parentTitle="Fleet Health" basePath={ROUTES.DIAGNOSTICS} />}
      </AirqoFleetGate>
    </Suspense>
  );
}
