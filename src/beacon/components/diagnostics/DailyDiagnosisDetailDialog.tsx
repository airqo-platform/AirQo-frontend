"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, CalendarDays, CheckCircle2, Clock, Database, Layers, ListChecks, Sparkles, TrendingDown } from "lucide-react";
import { diagnosticsService } from "@/services/diagnosticsService";
import { DeviceDailyDiagnostic } from "@/types/diagnostics";
import { HealthScoreGauge } from "@/components/diagnostics/HealthScoreGauge";
import { SubsystemScoreCard } from "@/components/diagnostics/SubsystemScoreCard";
import { EvidenceFactBadge } from "@/components/diagnostics/EvidenceFactBadge";
import { DiagnosisCard } from "@/components/diagnostics/DiagnosisCard";
import { DiagnosisNarrative } from "@/components/diagnostics/DiagnosisNarrative";
import { DayIndicators } from "@/components/diagnostics/DayIndicators";
import { DeviceTrendsList } from "@/components/diagnostics/DeviceTrendsList";
import {
  SeverityBadge,
  StreakBadge,
  checkTypeLabel,
  formatDiagnosisDate,
} from "@/components/diagnostics/DiagnosticBadges";

interface DailyDiagnosisDetailDialogProps {
  deviceId: string;
  deviceName?: string;
  diagnosisDate: string | null;
  onOpenChange: (open: boolean) => void;
}

const formatStat = (value?: number) => (value === undefined || value === null ? "—" : Number(value).toFixed(2));

const formatTime = (value?: string | null) =>
  value ? new Date(value).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC" : "—";

export const DailyDiagnosisDetailDialog: React.FC<DailyDiagnosisDetailDialogProps> = ({
  deviceId,
  deviceName,
  diagnosisDate,
  onOpenChange,
}) => {
  const [detail, setDetail] = useState<DeviceDailyDiagnostic | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!diagnosisDate) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setDetail(null);
    diagnosticsService
      .getDeviceDailyDiagnostic(deviceId, diagnosisDate)
      .then((data) => !cancelled && setDetail(data))
      .catch((err: any) => !cancelled && setError(err?.message || "Failed to load this day's diagnosis."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [deviceId, diagnosisDate]);

  const metrics = Object.entries(detail?.metrics_summary || {});

  return (
    <Dialog open={!!diagnosisDate} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            Daily Diagnosis · {formatDiagnosisDate(diagnosisDate, "EEEE d MMM yyyy")}
          </DialogTitle>
          <DialogDescription className="text-xs" title={deviceId}>{deviceName || deviceId}</DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-36 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        )}

        {error && !loading && <p className="text-sm text-rose-600 py-6 text-center">{error}</p>}

        {detail && !loading && (
          <div className="space-y-5">
            <HealthScoreGauge
              score={detail.overall_health_score}
              state={detail.lifecycle_state}
              evaluatedWindowHours={24}
              lastEvaluated={detail.evaluated_at ? new Date(detail.evaluated_at).toLocaleString() : undefined}
              size="md"
            />

            <DiagnosisNarrative headline={detail.headline} summary={detail.summary} />

            {/* Data coverage */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg border bg-slate-50">
                <div className="text-gray-500 flex items-center gap-1"><Database className="w-3.5 h-3.5" /> Records</div>
                <div className="text-lg font-bold text-gray-900">{detail.record_count}</div>
              </div>
              <div className="p-3 rounded-lg border bg-slate-50">
                <div className="text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Hours with data</div>
                <div className="text-lg font-bold text-gray-900">{detail.hours_with_data} / 24</div>
              </div>
              <div className="p-3 rounded-lg border bg-slate-50">
                <div className="text-gray-500">First / last reading</div>
                <div className="font-semibold text-gray-900 mt-1">
                  {formatTime(detail.first_record_at)} → {formatTime(detail.last_record_at)}
                </div>
              </div>
              <div className="p-3 rounded-lg border bg-slate-50">
                <div className="text-gray-500">Engine version</div>
                <div className="font-mono font-semibold text-gray-900 mt-1">{detail.engine_version || "—"}</div>
              </div>
            </div>

            {/* Issues */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-rose-500" />
                Issues ({detail.issues.length})
              </h4>
              {detail.issues.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-2 px-3">Issue</th>
                        <th className="py-2 px-3">Check</th>
                        <th className="py-2 px-3">Severity</th>
                        <th className="py-2 px-3">Streak</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {detail.issues.map((issue) => (
                        <tr key={issue.issue_code}>
                          <td className="py-2 px-3 max-w-sm">
                            <div className="font-semibold text-gray-900">{issue.title}</div>
                            {issue.description && <div className="text-[11px] text-gray-500">{issue.description}</div>}
                          </td>
                          <td className="py-2 px-3">
                            <div>{checkTypeLabel(issue.check_type)}</div>
                            <div className="font-mono text-[10px] text-gray-400">
                              {[issue.component_name, issue.metric_key].filter(Boolean).join(".") || issue.subsystem}
                            </div>
                          </td>
                          <td className="py-2 px-3"><SeverityBadge severity={issue.severity} /></td>
                          <td className="py-2 px-3">
                            <StreakBadge streakDays={issue.streak_days} isNew={issue.is_new} />
                            {!issue.is_new && (
                              <div className="text-[10px] text-gray-400 mt-0.5">
                                since {formatDiagnosisDate(issue.streak_start_date, "d MMM")}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No issues detected on this day.</p>
              )}
              {detail.resolved_issue_codes && detail.resolved_issue_codes.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Resolved since the previous day:
                  </span>
                  {detail.resolved_issue_codes.map((code) => (
                    <span key={code} className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 font-mono text-[10px] text-emerald-800">
                      {code}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <SubsystemScoreCard subsystemScores={detail.subsystem_scores || {}} />
              <div className="p-4 rounded-xl border border-gray-200 space-y-2">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Evidence
                </h4>
                <EvidenceFactBadge facts={detail.active_evidences || []} symptoms={detail.detected_symptoms || []} />
              </div>
            </div>

            <DiagnosisCard diagnoses={detail.top_diagnoses || []} deviceId={deviceId} />

            {detail.trends && detail.trends.some((t) => t.status !== "stable") && (
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-rose-500" /> Trends as of This Day
                </h4>
                <DeviceTrendsList trends={detail.trends} hideStable />
              </div>
            )}

            {detail.indicators && Object.keys(detail.indicators).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" /> Indicators
                </h4>
                <DayIndicators indicators={detail.indicators} />
              </div>
            )}

            {/* Metric summary */}
            {metrics.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" /> Metric Summary
                </h4>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-2 px-3">Metric</th>
                        <th className="py-2 px-3 text-right">Min</th>
                        <th className="py-2 px-3 text-right">Mean</th>
                        <th className="py-2 px-3 text-right">Max</th>
                        <th className="py-2 px-3 text-right">Std</th>
                        <th className="py-2 px-3 text-right">Samples</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-mono">
                      {metrics.map(([key, stats]) => (
                        <tr key={key}>
                          <td className="py-1.5 px-3 text-gray-900">{key}</td>
                          <td className="py-1.5 px-3 text-right">{formatStat(stats.min)}</td>
                          <td className="py-1.5 px-3 text-right font-semibold">{formatStat(stats.mean)}</td>
                          <td className="py-1.5 px-3 text-right">{formatStat(stats.max)}</td>
                          <td className="py-1.5 px-3 text-right text-gray-500">{formatStat(stats.std)}</td>
                          <td className="py-1.5 px-3 text-right text-gray-500">{stats.count ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
