"use client";

import React from "react";
import Link from "next/link";
import { DeviceDiagnosticsPanel } from "@/components/diagnostics/DeviceDiagnosticsPanel";
import { Button } from "@/components/ui/button";
import { ExternalLink, Sliders, Stethoscope } from "lucide-react";

interface DiagnosticsTabProps {
  deviceId: string;
  deviceName?: string;
}

export default function DiagnosticsTab({ deviceId, deviceName }: DiagnosticsTabProps) {
  const nameQuery = deviceName ? `?name=${encodeURIComponent(deviceName)}` : "";
  return (
    <div className="space-y-6">
      {/* Top Banner with Full Screen Inspector Link */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-gray-900">Device Diagnostics</h3>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/devices/${encodeURIComponent(deviceId)}/diagnostics${nameQuery}`}>
            <Button variant="outline" size="sm" className="h-8 text-xs bg-white gap-1.5 text-blue-700 border-blue-200 hover:bg-blue-50">
              <ExternalLink className="w-3.5 h-3.5" />
              Full-Screen Inspector
            </Button>
          </Link>
          <Link href={`/dashboard/diagnostics/simulator?device_id=${encodeURIComponent(deviceId)}`}>
            <Button variant="outline" size="sm" className="h-8 text-xs bg-white gap-1.5 text-gray-700">
              <Sliders className="w-3.5 h-3.5" />
              Bench Simulator
            </Button>
          </Link>
        </div>
      </div>

      <DeviceDiagnosticsPanel deviceId={deviceId} deviceName={deviceName} />
    </div>
  );
}
