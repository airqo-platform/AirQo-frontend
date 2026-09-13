"use client";

import React, { useCallback, useEffect, useState } from "react";
import { diagnosticsService, DiagnosticsApiError } from "@/services/diagnosticsService";
import {
  DeviceDailyDiagnosticSummary,
  DeviceHealthSnapshot,
  DeviceIssueSummary,
  DiagnosisResult,
  DiagnosticEvaluationResult,
} from "@/types/diagnostics";
import { HealthScoreGauge } from "@/components/diagnostics/HealthScoreGauge";
import { SubsystemScoreCard } from "@/components/diagnostics/SubsystemScoreCard";
import { DiagnosisCard } from "@/components/diagnostics/DiagnosisCard";
import { EvidenceFactBadge } from "@/components/diagnostics/EvidenceFactBadge";
import { TechnicianFeedbackModal } from "@/components/diagnostics/TechnicianFeedbackModal";
import { DailyHealthTrendChart } from "@/components/diagnostics/DailyHealthTrendChart";
import { DeviceIssueHistory } from "@/components/diagnostics/DeviceIssueHistory";
import { DailyDiagnosisDetailDialog } from "@/components/diagnostics/DailyDiagnosisDetailDialog";
import { DailyRunDialog } from "@/components/diagnostics/DailyRunDialog";
import { EvaluationQualityNotice } from "@/components/diagnostics/EvaluationQualityNotice";
import { ProfileNotDiagnosableNotice } from "@/components/diagnostics/ProfileNotDiagnosableNotice";
import {
  LifecycleBadge,
  SeverityBadge,
  formatDiagnosisDate,
  getScoreToneClass,
} from "@/components/diagnostics/DiagnosticBadges";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { AlertTriangle, CalendarDays, ChevronRight, History, ListChecks, PlayCircle, RefreshCw, Sparkles, Stethoscope } from "lucide-react";

const DAY_RANGES = [7, 14, 30, 90];
const RECENT_DAYS_SHOWN = 14;

interface DeviceDiagnosticsPanelProps {
  deviceId: string;
  /** Telemetry window used for on-demand evaluations. */
  windowHours?: number;
}

const isoDateDaysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

/**
 * Device diagnostics: the automatic daily diagnoses (trend, recurring issues, per-day detail)
 * and the latest on-demand evaluation against the device profile.
 */
export function DeviceDiagnosticsPanel({ deviceId, windowHours = 24 }: DeviceDiagnosticsPanelProps) {
  // Daily diagnostics
  const [days, setDays] = useState<number>(30);
  const [dailyLoading, setDailyLoading] = useState<boolean>(true);
  const [dailyError, setDailyError] = useState<string | null>(null);
  const [issueSummary, setIssueSummary] = useState<DeviceIssueSummary | null>(null);
  const [dailyDiagnoses, setDailyDiagnoses] = useState<DeviceDailyDiagnosticSummary[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [runDialogOpen, setRunDialogOpen] = useState<boolean>(false);

  // Latest evaluation
  const [snapshotLoading, setSnapshotLoading] = useState<boolean>(true);
  const [snapshot, setSnapshot] = useState<DeviceHealthSnapshot | null>(null);
  const [lastEvaluation, setLastEvaluation] = useState<DiagnosticEvaluationResult | null>(null);
  const [profileError, setProfileError] = useState<DiagnosticsApiError | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<DiagnosisResult | null>(null);

  const fetchDaily = useCallback(async () => {
    try {
      setDailyLoading(true);
      setDailyError(null);
      const [summary, list] = await Promise.all([
        diagnosticsService.getDeviceIssueSummary(deviceId, days),
        diagnosticsService.getDeviceDailyDiagnostics(deviceId, {
          start_date: isoDateDaysAgo(days),
          limit: Math.min(days + 1, 180),
        }),
      ]);
      setIssueSummary(summary);
      setDailyDiagnoses(list);
    } catch (err: any) {
      console.error("Error fetching daily diagnostics:", err);
      setDailyError(err?.message || "Daily diagnostics are currently unavailable.");
      setIssueSummary(null);
      setDailyDiagnoses([]);
    } finally {
      setDailyLoading(false);
    }
  }, [deviceId, days]);

  const fetchSnapshot = useCallback(async () => {
    try {
      setSnapshotLoading(true);
      setSnapshot(await diagnosticsService.getDeviceHealth(deviceId));
    } catch (err: any) {
      console.error("Error fetching latest device health:", err);
      setSnapshot(null);
    } finally {
      setSnapshotLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    if (deviceId) fetchDaily();
  }, [deviceId, fetchDaily]);

  useEffect(() => {
    if (deviceId) fetchSnapshot();
  }, [deviceId, fetchSnapshot]);

  const handleReevaluate = async () => {
    try {
      setIsEvaluating(true);
      setProfileError(null);
      const result = await diagnosticsService.evaluateDevice(deviceId, { window_hours: windowHours });
      setLastEvaluation(result);

      // The evaluation saved a snapshot; reload it so feedback references its real id.
      const saved = await diagnosticsService.getDeviceHealth(deviceId).catch(() => null);
      setSnapshot(
        saved || {
          id: "",
          device_id: deviceId,
          timestamp: result.timestamp,
          overall_health_score: result.overall_health_score,
          lifecycle_state: result.lifecycle_state,
          subsystem_scores: result.subsystem_scores,
          active_evidences: result.active_evidences,
          detected_symptoms: result.detected_symptoms,
          top_diagnoses: result.top_diagnoses,
          evaluated_window_hours: result.evaluated_window_hours,
        }
      );

      toast({
        title: "Evaluation Complete",
        description:
          result.lifecycle_state === "NO_DATA"
            ? `No telemetry found in the last ${result.evaluated_window_hours}h.`
            : `Evaluated ${result.evaluated_window_hours}h of telemetry. Health score: ${result.overall_health_score}/100.`,
      });
    } catch (err: any) {
      if (err instanceof DiagnosticsApiError && err.isProfileNotDiagnosable) {
        setProfileError(err);
      } else {
        toast({
          title: "Evaluation Failed",
          description: err?.message || "Failed to trigger on-demand evaluation.",
          variant: "destructive",
        });
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleOpenFeedback = (diag: DiagnosisResult) => {
    setSelectedDiagnosis(diag);
    setFeedbackOpen(true);
  };

  const activeIssueCount = issueSummary?.issues.filter((i) => i.is_active).length ?? 0;
  const evaluationMatchesSnapshot = lastEvaluation && snapshot && lastEvaluation.timestamp === snapshot.timestamp;

  return (
    <div className="space-y-8">
      {/* ── Daily diagnostics ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              Daily Diagnostics
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Each completed UTC day is diagnosed automatically after the nightly data sync.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="h-8 text-xs px-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium"
            >
              {DAY_RANGES.map((d) => (
                <option key={d} value={d}>
                  Last {d} days
                </option>
              ))}
            </select>
            <Button variant="outline" size="sm" onClick={fetchDaily} disabled={dailyLoading} className="h-8 text-xs bg-white px-2" title="Refresh">
              <RefreshCw className={`w-3.5 h-3.5 ${dailyLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setRunDialogOpen(true)} className="h-8 text-xs bg-white gap-1.5">
              <PlayCircle className="w-3.5 h-3.5 text-primary" />
              Run / Backfill
            </Button>
          </div>
        </div>

        {dailyLoading && !issueSummary ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-72 w-full rounded-xl" />
          </div>
        ) : dailyError ? (
          <Card className="p-6 text-center border-dashed">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-xs text-gray-600">{dailyError}</p>
            <Button variant="outline" size="sm" onClick={fetchDaily} className="mt-3 text-xs">
              Retry
            </Button>
          </Card>
        ) : issueSummary ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border border-gray-200 bg-white">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Days Diagnosed</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {issueSummary.days_diagnosed}
                  <span className="text-sm text-gray-400 font-medium"> / {days}</span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-gray-200 bg-white">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Average Score</div>
                <div className="mt-1">
                  <span className={`text-2xl font-bold px-2 rounded-lg ${getScoreToneClass(issueSummary.average_health_score)}`}>
                    {issueSummary.average_health_score ?? "—"}
                  </span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-gray-200 bg-white">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Latest Day</div>
                <div className="mt-1.5 space-y-1">
                  {issueSummary.latest_lifecycle_state ? (
                    <LifecycleBadge state={issueSummary.latest_lifecycle_state} />
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                  <div className="text-[11px] text-gray-500">{formatDiagnosisDate(issueSummary.latest_diagnosis_date)}</div>
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-gray-200 bg-white">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Active Issues</div>
                <div className={`text-2xl font-bold mt-1 ${activeIssueCount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  {activeIssueCount}
                  <span className="text-sm text-gray-400 font-medium"> of {issueSummary.issues.length} seen</span>
                </div>
              </div>
            </div>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-2 border-b border-gray-100">
                <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-600" />
                  Health Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <DailyHealthTrendChart
                  trend={issueSummary.health_trend}
                  dailyDiagnostics={dailyDiagnoses}
                  onSelectDate={setSelectedDate}
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <Card className="xl:col-span-7 border border-gray-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-gray-100">
                  <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-rose-500" />
                    Issues in the Last {days} Days
                  </CardTitle>
                  <CardDescription className="text-xs">
                    A gap of up to 3 days (e.g. the device was offline) does not reset a streak.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <DeviceIssueHistory issues={issueSummary.issues} days={days} />
                </CardContent>
              </Card>

              <Card className="xl:col-span-5 border border-gray-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-gray-100">
                  <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    Recent Days
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {dailyDiagnoses.length === 0 ? (
                    <p className="text-xs text-gray-400 italic p-4">No diagnosed days in this period.</p>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {dailyDiagnoses.slice(0, RECENT_DAYS_SHOWN).map((day) => (
                        <li key={day.id}>
                          <button
                            onClick={() => setSelectedDate(day.diagnosis_date)}
                            className="w-full px-4 py-2.5 flex items-center justify-between gap-3 text-left text-xs hover:bg-slate-50"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="font-semibold text-gray-900 w-20 shrink-0">
                                {formatDiagnosisDate(day.diagnosis_date, "EEE d MMM")}
                              </span>
                              <span className={`font-bold px-1.5 rounded ${getScoreToneClass(day.overall_health_score)}`}>
                                {day.overall_health_score}
                              </span>
                              <LifecycleBadge state={day.lifecycle_state} className="hidden sm:inline-flex" />
                            </div>
                            <div className="flex items-center gap-2 shrink-0 text-gray-500">
                              {day.issue_count > 0 ? (
                                <>
                                  <span>{day.issue_count} issue{day.issue_count === 1 ? "" : "s"}</span>
                                  <SeverityBadge severity={day.max_severity} />
                                </>
                              ) : (
                                <span className="text-emerald-600">No issues</span>
                              )}
                              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </section>

      {/* ── Latest evaluation ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-blue-600" />
            Latest Evaluation
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            On-demand evaluation of the last {windowHours}h of telemetry against the device profile.
          </p>
        </div>

        {profileError && <ProfileNotDiagnosableNotice error={profileError} />}

        {snapshotLoading ? (
          <Skeleton className="h-44 w-full rounded-2xl" />
        ) : snapshot ? (
          <div className="space-y-6">
            <HealthScoreGauge
              score={snapshot.overall_health_score}
              state={snapshot.lifecycle_state}
              evaluatedWindowHours={snapshot.evaluated_window_hours || windowHours}
              lastEvaluated={new Date(snapshot.timestamp).toLocaleString()}
              onReevaluate={handleReevaluate}
              isEvaluating={isEvaluating}
              isSimulated={snapshot.is_simulated}
            />

            {lastEvaluation && (evaluationMatchesSnapshot || !snapshot.id) && (
              <EvaluationQualityNotice
                profileId={lastEvaluation.profile_id}
                profileName={lastEvaluation.profile_name}
                dataCompleteness={lastEvaluation.data_completeness}
                profileWarnings={lastEvaluation.profile_warnings}
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <SubsystemScoreCard subsystemScores={snapshot.subsystem_scores || {}} className="h-full" />
              </div>
              <div className="lg:col-span-6">
                <Card className="border border-gray-200 shadow-sm h-full flex flex-col">
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Evidence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 flex-1">
                    <EvidenceFactBadge
                      facts={snapshot.active_evidences || []}
                      symptoms={snapshot.detected_symptoms || []}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            <DiagnosisCard
              diagnoses={snapshot.top_diagnoses || []}
              deviceId={deviceId}
              onOpenFeedback={handleOpenFeedback}
            />
          </div>
        ) : (
          <Card className="border border-dashed border-gray-300 p-8 text-center bg-gray-50/50">
            <Stethoscope className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-gray-800">No On-Demand Evaluation Yet</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              Evaluate the last {windowHours}h of telemetry for {deviceId} against its device profile.
            </p>
            <Button onClick={handleReevaluate} size="sm" disabled={isEvaluating} className="mt-4 gap-2">
              <Sparkles className={`w-3.5 h-3.5 ${isEvaluating ? "animate-spin" : ""}`} />
              {isEvaluating ? "Evaluating..." : "Run Evaluation"}
            </Button>
          </Card>
        )}
      </section>

      <DailyDiagnosisDetailDialog
        deviceId={deviceId}
        diagnosisDate={selectedDate}
        onOpenChange={(open) => !open && setSelectedDate(null)}
      />

      <DailyRunDialog open={runDialogOpen} onOpenChange={setRunDialogOpen} deviceIds={[deviceId]} />

      <TechnicianFeedbackModal
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        deviceId={deviceId}
        snapshotId={snapshot?.id || undefined}
        diagnosis={selectedDiagnosis}
        onFeedbackSubmitted={fetchSnapshot}
      />
    </div>
  );
}
