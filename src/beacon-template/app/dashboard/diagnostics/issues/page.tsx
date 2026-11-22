"use client";

import React, { Suspense } from "react";
import { SystemFleetGate, FleetPageSkeleton } from "@/components/diagnostics/SystemFleetGate";
import { FleetIssuesView } from "@/components/diagnostics/FleetIssuesView";
import { ROUTES } from "@/lib/navigation";

export default function FleetIssuesPage() {
  return (
    <Suspense fallback={<FleetPageSkeleton />}>
      <SystemFleetGate>
        {(group) => <FleetIssuesView group={group} parentTitle="Fleet Health" basePath={ROUTES.DIAGNOSTICS} />}
      </SystemFleetGate>
    </Suspense>
  );
}
