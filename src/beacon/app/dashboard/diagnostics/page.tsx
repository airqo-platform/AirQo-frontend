"use client";

import React from "react";
import { FleetHealthView } from "@/components/diagnostics/FleetHealthView";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert } from "lucide-react";
import { useGroup } from "@/lib/group-context";

export default function FleetDiagnosticsPage() {
  const { activeGroup, loading: groupLoading } = useGroup();
  const isAirqoGroup = activeGroup?.toLowerCase() === "airqo";

  if (groupLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-10 w-72 mb-6" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!isAirqoGroup || !activeGroup) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              Restricted Organization Section
            </CardTitle>
            <CardDescription className="text-xs text-gray-600 leading-relaxed mt-1">
              IoT Diagnostics and Automated Triage are exclusively available when the active organization is set to <span className="font-semibold text-primary">AirQo</span>.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <FleetHealthView
      group={activeGroup}
      canManage
      title="Fleet Diagnostics"
      description="Daily device health across the fleet: lifecycle states, most common issues, persistent faults and the devices that need attention"
    />
  );
}
