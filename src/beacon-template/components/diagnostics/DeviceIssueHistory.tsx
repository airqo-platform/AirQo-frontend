"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { DeviceIssueHistoryItem } from "@/types/diagnostics";
import {
  SeverityBadge,
  StreakBadge,
  formatDiagnosisDate,
} from "@/components/diagnostics/DiagnosticBadges";

interface DeviceIssueHistoryProps {
  issues: DeviceIssueHistoryItem[];
  days: number;
  className?: string;
}

/** Issues seen over a period: active ones (with their current streak) first, then resolved ones. */
export const DeviceIssueHistory: React.FC<DeviceIssueHistoryProps> = ({ issues, days, className = "" }) => {
  if (issues.length === 0) {
    return (
      <div className={`p-6 rounded-xl border border-emerald-200 bg-emerald-50/40 text-center ${className}`}>
        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
        <p className="text-sm font-semibold text-emerald-900">No issues in the last {days} days</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-xl border border-gray-200 ${className}`}>
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
          <tr>
            <th className="py-2.5 px-3">Issue</th>
            <th className="py-2.5 px-3">Severity</th>
            <th className="py-2.5 px-3">Status</th>
            <th className="py-2.5 px-3 text-center">Days Seen</th>
            <th className="py-2.5 px-3">First / Last Seen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {issues.map((issue) => (
            <tr key={issue.issue_code} className={issue.is_active ? "" : "text-gray-500"}>
              <td className="py-2.5 px-3 max-w-xs">
                <div className={`font-semibold ${issue.is_active ? "text-gray-900" : "text-gray-600"}`}>{issue.title}</div>
                <div className="font-mono text-[10px] text-gray-400 truncate" title={issue.issue_code}>
                  {issue.subsystem} · {issue.issue_code}
                </div>
              </td>
              <td className="py-2.5 px-3">
                <SeverityBadge severity={issue.severity} />
              </td>
              <td className="py-2.5 px-3">
                {issue.is_active ? (
                  <StreakBadge streakDays={issue.current_streak_days} />
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Resolved
                  </span>
                )}
              </td>
              <td className="py-2.5 px-3 text-center font-semibold">{issue.days_observed}</td>
              <td className="py-2.5 px-3 whitespace-nowrap text-[11px]">
                {formatDiagnosisDate(issue.first_seen, "d MMM")} → {formatDiagnosisDate(issue.last_seen, "d MMM")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
