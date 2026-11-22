"use client";

import React from "react";
import Link from "next/link";
import { AqArrowUpRight } from "@airqo/icons-react";
import { DeviceDiagnosticsPanel } from "@/components/diagnostics/DeviceDiagnosticsPanel";

interface DiagnosticsTabProps {
  deviceId: string;
  deviceName?: string;
  /** Stored diagnoses only, without the bench simulator or evaluation tools (partner organisations). */
  readOnly?: boolean;
}

export default function DiagnosticsTab({ deviceId, deviceName, readOnly = false }: DiagnosticsTabProps) {
  const nameQuery = deviceName ? `?name=${encodeURIComponent(deviceName)}` : "";
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link
          href={`/dashboard/devices/${encodeURIComponent(deviceId)}/diagnostics${nameQuery}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          Open as a full page
          <AqArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <DeviceDiagnosticsPanel deviceId={deviceId} deviceName={deviceName} readOnly={readOnly} />
    </div>
  );
}
