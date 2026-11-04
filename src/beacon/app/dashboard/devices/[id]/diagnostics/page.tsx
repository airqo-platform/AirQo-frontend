"use client";

import React from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { AqChevronRight } from "@airqo/icons-react";
import { DeviceDiagnosticsPanel } from "@/components/diagnostics/DeviceDiagnosticsPanel";
import { BackButton } from "@/components/diagnostics/FleetHealthParts";
import { Skeleton } from "@/components/ui/skeleton";
import { useGroup } from "@/lib/group-context";

export default function DeviceDiagnosticInspectorPage() {
  const params = useParams();
  const { activeGroup, loading: groupLoading } = useGroup();
  // Partner organisations get the stored diagnoses only; evaluations and the simulator are AirQo tools.
  const readOnly = activeGroup?.toLowerCase() !== "airqo";

  const rawId = params?.id || params?.deviceId || "";
  const deviceId = Array.isArray(rawId) ? rawId[0] : rawId;

  const deviceName = useSearchParams()?.get("name") || deviceId;

  if (groupLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-10 w-72 mb-6" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto pb-16">
      <div className="flex flex-wrap items-center gap-3">
        <BackButton fallbackHref={`/dashboard/devices/${deviceId}`} />
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/dashboard/devices" className="font-medium text-primary hover:underline">
            Devices
          </Link>
          <AqChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <Link href={`/dashboard/devices/${deviceId}`} className="font-medium text-primary hover:underline">
            {deviceName}
          </Link>
          <AqChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span aria-current="page">Diagnostics</span>
        </nav>
      </div>

      {deviceId ? (
        <DeviceDiagnosticsPanel deviceId={deviceId} deviceName={deviceName} readOnly={readOnly} />
      ) : (
        <p className="text-sm text-muted-foreground">No device selected.</p>
      )}
    </div>
  );
}
