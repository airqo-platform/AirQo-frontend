"use client";

import React, { Suspense } from "react";
import { AirqoFleetGate, FleetPageSkeleton } from "@/components/diagnostics/AirqoFleetGate";
import { FleetHealthView } from "@/components/diagnostics/FleetHealthView";
import { ROUTES } from "@/lib/navigation";

export default function FleetDiagnosticsPage() {
  return (
    <Suspense fallback={<FleetPageSkeleton />}>
      <AirqoFleetGate>
        {(group) => (
          <FleetHealthView
            group={group}
            canManage
            basePath={ROUTES.DIAGNOSTICS}
            title="Fleet Health"
            description="What the nightly diagnosis found across the fleet, grouped by the part of the device to fix."
          />
        )}
      </AirqoFleetGate>
    </Suspense>
  );
}
