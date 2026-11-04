"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGroup } from "@/lib/group-context";

export const FleetPageSkeleton: React.FC = () => (
  <div className="p-6">
    <Skeleton className="h-10 w-72 mb-6" />
    <Skeleton className="h-40 w-full" />
  </div>
);

/** Renders its children with the active group only while that group is AirQo. */
export function AirqoFleetGate({ children }: { children: (group: string) => React.ReactNode }) {
  const { activeGroup, loading: groupLoading } = useGroup();
  const isAirqoGroup = activeGroup?.toLowerCase() === "airqo";

  if (groupLoading) return <FleetPageSkeleton />;

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

  return <>{children(activeGroup)}</>;
}
