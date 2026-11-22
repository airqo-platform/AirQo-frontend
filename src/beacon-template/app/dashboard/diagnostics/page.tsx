"use client";

import React, { Suspense } from "react";
import { SystemFleetGate, FleetPageSkeleton } from "@/components/diagnostics/SystemFleetGate";
import { FleetHealthView } from "@/components/diagnostics/FleetHealthView";
import { ROUTES } from "@/lib/navigation";

export default function FleetDiagnosticsPage() {
  return (
    <Suspense fallback={<FleetPageSkeleton />}>
      <SystemFleetGate>
        {(group) => (
          <FleetHealthView
            group={group}
            canManage
            basePath={ROUTES.DIAGNOSTICS}
            title="Fleet Health"
            description="What the nightly diagnosis found across the fleet, grouped by the part of the device to fix."
          />
        )}
      </SystemFleetGate>
    </Suspense>
  );
}
