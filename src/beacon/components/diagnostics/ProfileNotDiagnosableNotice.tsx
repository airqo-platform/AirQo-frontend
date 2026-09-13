"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, ShieldAlert, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiagnosticsApiError } from "@/services/diagnosticsService";

interface ProfileNotDiagnosableNoticeProps {
  error: DiagnosticsApiError;
  profileId?: string | null;
  className?: string;
}

/**
 * Explains why the engine refused to evaluate a device: diagnostics are driven entirely
 * by the device profile, so a missing or incomplete profile is rejected (422).
 */
export const ProfileNotDiagnosableNotice: React.FC<ProfileNotDiagnosableNoticeProps> = ({
  error,
  profileId,
  className = "",
}) => (
  <div className={`p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-900 space-y-3 ${className}`}>
    <div className="flex items-start gap-2.5">
      <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <h4 className="text-sm font-bold">{error.message}</h4>
        <p className="text-xs text-amber-800 mt-0.5">
          Diagnostics use the device profile&apos;s telemetry mappings, component metric limits and relationships. Fix the
          items below, then evaluate again.
        </p>
      </div>
    </div>

    {error.errors.length > 0 && (
      <ul className="space-y-1 text-xs pl-7 list-disc marker:text-amber-500">
        {error.errors.map((msg, i) => (
          <li key={i} className="font-medium">
            {msg}
          </li>
        ))}
      </ul>
    )}

    {error.warnings.length > 0 && (
      <details className="pl-7 text-xs">
        <summary className="cursor-pointer text-amber-800 font-semibold flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5 inline" /> {error.warnings.length} warning
          {error.warnings.length === 1 ? "" : "s"}
        </summary>
        <ul className="mt-1.5 space-y-1 list-disc pl-4 text-amber-800">
          {error.warnings.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      </details>
    )}

    <div className="pl-7">
      <Button asChild size="sm" variant="outline" className="h-8 text-xs bg-white gap-1.5">
        <Link href={profileId ? `/dashboard/settings/device-profiles/${profileId}` : "/dashboard/settings/device-profiles"}>
          <Layers className="w-3.5 h-3.5" />
          {profileId ? "Open Device Profile" : "Manage Device Profiles"}
        </Link>
      </Button>
    </div>
  </div>
);
