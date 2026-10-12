"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, Stethoscope } from "lucide-react";
import { useSyncedDevice } from "@/hooks/use-synced-device";
import { useCategoryStatusCodeSet } from "@/hooks/use-status-code-set";
import { getStatusIssues } from "@/lib/status-codes";
import {
  LifecycleBadge,
  SeverityBadge,
  StreakBadge,
  formatDiagnosisDate,
  getScoreToneClass,
} from "@/components/diagnostics/DiagnosticBadges";
import { StatusCodeChip } from "@/components/diagnostics/StatusCodeChips";

const timeAgo = (value: string | null | undefined) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : formatDistanceToNow(date, { addSuffix: true });
};

/**
 * Compact health for a side panel: the device's latest daily diagnosis with its issues, and for
 * device types whose profile links a status code set, any codes in the latest reported status.
 */
export function DeviceIssuesSummary({ deviceId }: { deviceId: string }) {
  const { device, loading } = useSyncedDevice(deviceId, { includeDiagnostics: true });
  const { codeSet, statusField, loading: codesLoading } = useCategoryStatusCodeSet(device ? device.category : null);

  const header = (
    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
      <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
      Health &amp; Issues
    </span>
  );

  if (loading || (device && codesLoading)) {
    return (
      <div className="space-y-2">
        {header}
        <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      </div>
    );
  }

  if (!device) {
    return (
      <div className="space-y-2">
        {header}
        <p className="text-[11px] text-gray-400">No health data for this device.</p>
      </div>
    );
  }

  const diagnosis = device.diagnostics;
  const statusRaw = statusField ? device.latest?.values?.[statusField.slot] : undefined;
  const statusIssues = codeSet && statusRaw !== undefined && statusRaw !== null ? getStatusIssues(codeSet, statusRaw) : [];
  const allClear = diagnosis?.issue_count === 0 && statusIssues.length === 0;
  // NO_DATA carries a placeholder score of 0; showing it would read as a failed device
  const score = diagnosis && diagnosis.lifecycle_state !== "NO_DATA" ? diagnosis.overall_health_score : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        {header}
        {diagnosis && (
          <div className="flex items-center gap-1.5">
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${getScoreToneClass(score)}`}>{score ?? "—"}</span>
            <LifecycleBadge state={diagnosis.lifecycle_state} />
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-2.5 space-y-2 text-[11px]">
        {diagnosis ? (
          <>
            <div className="text-[10px] text-gray-400">Daily diagnosis as of {formatDiagnosisDate(diagnosis.diagnosis_date)}</div>
            {diagnosis.headline && <div className="font-semibold text-gray-800 dark:text-gray-200">{diagnosis.headline}</div>}
            {diagnosis.issues.length > 0 && (
              <ul className="space-y-1.5">
                {diagnosis.issues.map((issue) => (
                  <li key={issue.issue_code} className="flex items-start justify-between gap-2">
                    <span className="text-gray-700 dark:text-gray-300">{issue.title}</span>
                    <span className="flex items-center gap-1 shrink-0">
                      <SeverityBadge severity={issue.severity} />
                      <StreakBadge streakDays={issue.streak_days} isNew={issue.is_new} />
                    </span>
                  </li>
                ))}
                {diagnosis.issue_count > diagnosis.issues.length && (
                  <li className="text-[10px] text-gray-400">+{diagnosis.issue_count - diagnosis.issues.length} more in full diagnostics</li>
                )}
              </ul>
            )}
          </>
        ) : (
          <p className="text-gray-500">Not diagnosed in the last 7 days (offline, or no diagnosable device profile).</p>
        )}

        {statusIssues.length > 0 && (
          <div className="space-y-1 border-t border-gray-200 dark:border-gray-700 pt-2">
            <div className="text-[10px] text-gray-400">
              Reported status {String(statusRaw)}
              {timeAgo(device.latest?.timestamp) ? ` · ${timeAgo(device.latest?.timestamp)}` : ""}
            </div>
            <div className="flex flex-wrap gap-1">
              {statusIssues.map((issue) => (
                <StatusCodeChip key={`${issue.kind}-${issue.code}`} issue={issue} />
              ))}
            </div>
          </div>
        )}

        {allClear && (
          <p className="flex items-center gap-1 text-emerald-600 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> No issues
          </p>
        )}
      </div>
    </div>
  );
}
