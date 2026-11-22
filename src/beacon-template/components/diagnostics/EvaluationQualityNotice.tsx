"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, Database, Layers } from "lucide-react";
import { DataCompleteness } from "@/types/diagnostics";

interface EvaluationQualityNoticeProps {
  profileId?: string | null;
  profileName?: string | null;
  dataCompleteness?: DataCompleteness | null;
  profileWarnings?: string[];
  className?: string;
}

const formatInterval = (seconds?: number | null): string | null => {
  if (!seconds) return null;
  if (seconds < 120) return `${Math.round(seconds)}s`;
  if (seconds < 7200) return `${Math.round(seconds / 60)} min`;
  return `${(seconds / 3600).toFixed(1)} h`;
};

/** Which profile drove an evaluation, how complete the data was, and what the profile is missing. */
export const EvaluationQualityNotice: React.FC<EvaluationQualityNoticeProps> = ({
  profileId,
  profileName,
  dataCompleteness,
  profileWarnings = [],
  className = "",
}) => {
  if (!profileName && !dataCompleteness && profileWarnings.length === 0) return null;

  const missingRate = dataCompleteness?.missing_rate;
  const interval = formatInterval(dataCompleteness?.expected_interval_seconds);

  return (
    <div className={`p-3 rounded-xl border border-gray-200 bg-white shadow-2xs text-xs space-y-2 ${className}`}>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-gray-600">
        {profileName && (
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            Profile:{" "}
            {profileId ? (
              <Link href={`/dashboard/settings/device-profiles/${profileId}`} className="font-semibold text-primary hover:underline">
                {profileName}
              </Link>
            ) : (
              <span className="font-semibold text-gray-900">{profileName}</span>
            )}
          </span>
        )}
        {dataCompleteness && (
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>
              <strong className="text-gray-900">{dataCompleteness.records}</strong>
              {dataCompleteness.expected_records ? ` of ~${dataCompleteness.expected_records}` : ""} records
              {interval ? ` (expected every ${interval})` : ""}
            </span>
            {missingRate !== null && missingRate !== undefined && (
              <span
                className={`px-1.5 py-0.5 rounded border font-semibold ${
                  missingRate > 0.4
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : missingRate > 0.1
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {(missingRate * 100).toFixed(0)}% missing
              </span>
            )}
          </span>
        )}
      </div>

      {profileWarnings.length > 0 && (
        <details>
          <summary className="cursor-pointer text-amber-700 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
            {profileWarnings.length} profile warning{profileWarnings.length === 1 ? "" : "s"}: some checks were skipped
          </summary>
          <ul className="mt-1.5 space-y-1 list-disc pl-5 text-gray-600">
            {profileWarnings.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
};
