"use client";

import React, { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { DeviceDiagnosticsPanel } from "@/components/diagnostics/DeviceDiagnosticsPanel";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Sliders, Stethoscope, ShieldAlert } from "lucide-react";
import { useGroup } from "@/lib/group-context";

export default function DeviceDiagnosticInspectorPage() {
  const params = useParams();
  const router = useRouter();
  const { activeGroup, loading: groupLoading } = useGroup();
  const isAirqoGroup = activeGroup?.toLowerCase() === "airqo";

  const rawId = params?.id || params?.deviceId || "";
  const deviceId = Array.isArray(rawId) ? rawId[0] : rawId;

  const deviceName = useSearchParams()?.get("name") || deviceId;

  const [windowHours, setWindowHours] = useState<number>(24);

  if (groupLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-10 w-72 mb-6" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!isAirqoGroup) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/devices/${deviceId}`)}
            className="h-8 text-xs bg-white gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Device
          </Button>
        </div>
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              Restricted Organization Section
            </CardTitle>
            <CardDescription className="text-xs text-gray-600 leading-relaxed mt-1">
              Device Diagnostics & Root-Cause Intelligence are exclusively available when the active organization is set to{" "}
              <span className="font-semibold text-primary">AirQo</span>.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/devices/${deviceId}`)}
            className="h-8 text-xs bg-white gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            Device Details
          </Button>
          <div className="h-4 w-px bg-gray-300 hidden sm:block" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              Device Diagnostic Inspector
            </h1>
            <p className="text-xs text-gray-500 font-mono">
              Target Device: <strong className="text-gray-900" title={deviceId}>{deviceName}</strong>
            </p>
          </div>
        </div>

        {/* Evaluation Controls */}
        <div className="flex items-center gap-2">
          <select
            value={windowHours}
            onChange={(e) => setWindowHours(Number(e.target.value))}
            className="h-8 text-xs px-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium focus:ring-2 focus:ring-blue-500"
            title="Telemetry window for on-demand evaluations"
          >
            <option value={12}>12 Hours Horizon</option>
            <option value={24}>24 Hours Horizon</option>
            <option value={48}>48 Hours Horizon</option>
            <option value={168}>7 Days Horizon</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/diagnostics/simulator?device_id=${encodeURIComponent(deviceId)}`)}
            className="h-8 text-xs bg-white text-blue-700 border-blue-200 hover:bg-blue-50 gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            Bench Simulator
          </Button>
        </div>
      </div>

      {deviceId ? (
        <DeviceDiagnosticsPanel deviceId={deviceId} deviceName={deviceName} windowHours={windowHours} />
      ) : (
        <p className="text-sm text-gray-500">No device selected.</p>
      )}
    </div>
  );
}
