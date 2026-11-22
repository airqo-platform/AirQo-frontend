"use client";

import React from "react";
import { HeartPulse } from "lucide-react";
import type { DeviceDiagnostics, DiagnosticsSummary, LifecycleState } from "@/types/diagnostics";
import { getLifecycleConfig } from "@/components/diagnostics/HealthScoreGauge";
import {
  LifecycleBadge,
  SeverityBadge,
  StreakBadge,
  formatDiagnosisDate,
  getScoreToneClass,
} from "@/components/diagnostics/DiagnosticBadges";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Most urgent first: a site, grid or cohort is labelled with the worst state any of its devices is in.
const LIFECYCLE_URGENCY: LifecycleState[] = [
  "FAILED",
  "LIKELY_FAILURE",
  "SUSPICIOUS",
  "DEGRADING",
  "NO_DATA",
  "RECOVERING",
  "HEALTHY",
];

const getWorstLifecycleState = (counts: DiagnosticsSummary["lifecycle_state_counts"]): LifecycleState | null =>
  LIFECYCLE_URGENCY.find((state) => (counts?.[state] ?? 0) > 0) ?? null;

const getStateEntries = (counts: DiagnosticsSummary["lifecycle_state_counts"]) =>
  LIFECYCLE_URGENCY.map((state) => [state, counts?.[state] ?? 0] as const).filter(([, count]) => count > 0);

const ScorePill: React.FC<{ score?: number | null }> = ({ score }) => (
  <span className={`inline-block min-w-[2.5rem] text-center text-xs font-bold px-1.5 py-0.5 rounded ${getScoreToneClass(score)}`}>
    {score ?? "—"}
  </span>
);

const NotDiagnosed: React.FC<{ detail: string }> = ({ detail }) => (
  <TooltipProvider>
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <span className="text-xs text-muted-foreground italic">Not diagnosed</span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs">{detail}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

/** One device's latest daily diagnosis: score and lifecycle state, with its issues on hover. */
export const DeviceHealthCell: React.FC<{ diagnosis?: DeviceDiagnostics | null }> = ({ diagnosis }) => {
  if (!diagnosis) {
    return <NotDiagnosed detail="No daily diagnosis in the last 7 days (offline, or no diagnosable device profile)." />;
  }

  // NO_DATA carries a placeholder score of 0; showing it would read as a failed device.
  const score = diagnosis.lifecycle_state === "NO_DATA" ? null : diagnosis.overall_health_score;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 w-fit">
            <ScorePill score={score} />
            <LifecycleBadge state={diagnosis.lifecycle_state} />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm space-y-2 p-3">
          <div className="text-[11px] text-muted-foreground">Diagnosed {formatDiagnosisDate(diagnosis.diagnosis_date)}</div>
          {diagnosis.headline && <div className="text-xs font-semibold">{diagnosis.headline}</div>}
          {diagnosis.issues.length > 0 ? (
            <ul className="space-y-1">
              {diagnosis.issues.map((issue) => (
                <li key={issue.issue_code} className="flex items-center justify-between gap-3 text-xs">
                  <span className="truncate">{issue.title}</span>
                  <span className="flex items-center gap-1 shrink-0">
                    <SeverityBadge severity={issue.severity} />
                    <StreakBadge streakDays={issue.streak_days} isNew={issue.is_new} />
                  </span>
                </li>
              ))}
              {diagnosis.issue_count > diagnosis.issues.length && (
                <li className="text-[11px] text-muted-foreground">
                  +{diagnosis.issue_count - diagnosis.issues.length} more
                </li>
              )}
            </ul>
          ) : (
            <div className="text-xs text-emerald-600">No issues</div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const SummaryTooltipBody: React.FC<{ summary: DiagnosticsSummary }> = ({ summary }) => (
  <div className="space-y-2">
    <div className="text-[11px] text-muted-foreground">
      Latest diagnosis {formatDiagnosisDate(summary.latest_diagnosis_date)} · {summary.devices_diagnosed} of{" "}
      {summary.devices_total} devices diagnosed
    </div>
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
      {getStateEntries(summary.lifecycle_state_counts).map(([state, count]) => (
        <span key={state} className={`font-semibold ${getLifecycleConfig(state).textColor}`}>
          {getLifecycleConfig(state).label} {count}
        </span>
      ))}
    </div>
    {summary.top_issues.length > 0 && (
      <ul className="space-y-1 border-t pt-2">
        {summary.top_issues.map((issue) => (
          <li key={issue.issue_code} className="flex items-center justify-between gap-3 text-xs">
            <span className="truncate">{issue.title}</span>
            <span className="flex items-center gap-1.5 shrink-0">
              <SeverityBadge severity={issue.severity} />
              <span className="font-semibold">
                {issue.device_count} device{issue.device_count === 1 ? "" : "s"}
              </span>
            </span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

/**
 * Health of a site, grid or cohort: the devices' average score and the worst state any of them is in,
 * with the state breakdown and most common issues on hover.
 */
export const GroupHealthCell: React.FC<{ summary?: DiagnosticsSummary | null }> = ({ summary }) => {
  if (!summary || summary.devices_diagnosed === 0) {
    const total = summary?.devices_total ?? 0;
    return (
      <NotDiagnosed
        detail={
          total > 0
            ? `None of its ${total} device${total === 1 ? " has" : "s have"} a daily diagnosis in the last 7 days.`
            : "No devices to diagnose."
        }
      />
    );
  }

  const worst = getWorstLifecycleState(summary.lifecycle_state_counts);
  const worstCount = worst ? summary.lifecycle_state_counts[worst] ?? 0 : 0;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 w-fit">
            <ScorePill score={summary.average_health_score} />
            <div className="space-y-0.5">
              {worst && <LifecycleBadge state={worst} />}
              <div className="text-[11px] text-muted-foreground whitespace-nowrap">
                {worstCount} of {summary.devices_total} device{summary.devices_total === 1 ? "" : "s"}
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-3">
          <SummaryTooltipBody summary={summary} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/** Device health card for a site, grid or cohort page. */
export const HealthSummaryCard: React.FC<{ summary?: DiagnosticsSummary | null; entityLabel: string }> = ({
  summary,
  entityLabel,
}) => {
  const hasDiagnoses = Boolean(summary && summary.devices_diagnosed > 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <HeartPulse className="h-5 w-5" />
          Device Health
        </CardTitle>
        <CardDescription>
          {hasDiagnoses && summary
            ? `Each device's latest daily diagnosis, most recently ${formatDiagnosisDate(summary.latest_diagnosis_date)}`
            : `No device in this ${entityLabel.toLowerCase()} has a daily diagnosis from the last 7 days.`}
        </CardDescription>
      </CardHeader>
      {hasDiagnoses && summary && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Average score</div>
              <div className="mt-1">
                <span className={`text-xl font-bold px-2 rounded-lg ${getScoreToneClass(summary.average_health_score)}`}>
                  {summary.average_health_score ?? "—"}
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Lowest score</div>
              <div className="mt-1">
                <span className={`text-xl font-bold px-2 rounded-lg ${getScoreToneClass(summary.min_health_score)}`}>
                  {summary.min_health_score ?? "—"}
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Diagnosed</div>
              <div className="text-xl font-bold mt-1">
                {summary.devices_diagnosed}
                <span className="text-sm text-muted-foreground font-medium"> of {summary.devices_total}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">With issues</div>
              <div className={`text-xl font-bold mt-1 ${summary.devices_with_issues > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                {summary.devices_with_issues}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {getStateEntries(summary.lifecycle_state_counts).map(([state, count]) => (
              <span key={state} className="inline-flex items-center gap-1.5">
                <LifecycleBadge state={state} />
                <span className="text-sm font-semibold">{count}</span>
              </span>
            ))}
          </div>

          {summary.top_issues.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Most common issues</div>
              <ul className="divide-y rounded-md border">
                {summary.top_issues.map((issue) => (
                  <li key={issue.issue_code} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{issue.title}</div>
                      <div className="text-xs text-muted-foreground">{issue.subsystem}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <SeverityBadge severity={issue.severity} />
                      <span className="font-semibold w-20 text-right">
                        {issue.device_count} device{issue.device_count === 1 ? "" : "s"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
