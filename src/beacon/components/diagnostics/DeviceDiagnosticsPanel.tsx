"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  AqAlertTriangle,
  AqCheckCircle,
  AqChevronDown,
  AqChevronUp,
  AqPlayCircle,
  AqRefreshCw01,
  AqSliders01,
} from "@airqo/icons-react";
import { diagnosticsService, DiagnosticsApiError } from "@/services/diagnosticsService";
import {
  ChargeCycleIndicator,
  CoverageIndicator,
  DeviceDailyDiagnosticSummary,
  DeviceHealthSnapshot,
  DeviceIndicatorSeries,
  DeviceIssueSummary,
  DeviceTrends,
  DiagnosisResult,
  DiagnosticEvaluationResult,
  IndicatorSeriesPoint,
} from "@/types/diagnostics";
import { HealthScoreGauge } from "@/components/diagnostics/HealthScoreGauge";
import { SubsystemScoreCard } from "@/components/diagnostics/SubsystemScoreCard";
import { DiagnosisCard } from "@/components/diagnostics/DiagnosisCard";
import { EvidenceFactBadge } from "@/components/diagnostics/EvidenceFactBadge";
import { TechnicianFeedbackModal } from "@/components/diagnostics/TechnicianFeedbackModal";
import { DeviceIndicatorCharts } from "@/components/diagnostics/DeviceIndicatorCharts";
import { DeviceTrendsList } from "@/components/diagnostics/DeviceTrendsList";
import { DiagnosisNarrative } from "@/components/diagnostics/DiagnosisNarrative";
import { DailyDiagnosisDetailDialog } from "@/components/diagnostics/DailyDiagnosisDetailDialog";
import { DailyRunDialog } from "@/components/diagnostics/DailyRunDialog";
import { DeviceReportedStatus } from "@/components/diagnostics/DeviceReportedStatus";
import { EvaluationQualityNotice } from "@/components/diagnostics/EvaluationQualityNotice";
import { ProfileNotDiagnosableNotice } from "@/components/diagnostics/ProfileNotDiagnosableNotice";
import { formatDiagnosisDate } from "@/components/diagnostics/DiagnosticBadges";
import {
  ChargeCycleCard,
  CoverageCard,
  DayHealthGrid,
  IssueTimeline,
  LifecyclePill,
  LikelyCauseCard,
  OpenDayButton,
  SensorPairsCard,
} from "@/components/diagnostics/DeviceDiagnosisParts";
import type { DayHealth, SensorPair } from "@/components/diagnostics/DeviceDiagnosisParts";
import { yesterdayUtc } from "@/components/diagnostics/FleetHealthParts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { DEVICE_DAY_QUERY_PREFIX, useDeviceDayDiagnosis } from "@/hooks/use-device-diagnosis";
import {
  componentRows,
  dayRange,
  diagnosedDaysInWindow,
  issuePresence,
  latestCausePattern,
} from "@/lib/device-diagnosis";
import { trackEvent } from "@/lib/analytics";

const DAY_RANGES = [7, 13, 30, 90];
const EVALUATION_WINDOWS = [
  { hours: 12, label: "Last 12 hours" },
  { hours: 24, label: "Last 24 hours" },
  { hours: 48, label: "Last 48 hours" },
  { hours: 168, label: "Last 7 days" },
];
// Indicator groups drawn by this panel's own cards; any other group falls back to the generic charts.
const OWN_GROUPS = (group: string) => group === "charge_cycle" || group === "coverage" || group.startsWith("agreement:");

interface DeviceDiagnosticsPanelProps {
  deviceId: string;
  /** Display name; the id is only used for API calls. */
  deviceName?: string;
  /**
   * Show stored diagnoses only, without running evaluations or daily runs and without technician
   * feedback. Used for partner organisations; AirQo staff get the full panel.
   */
  readOnly?: boolean;
}

const isoDateDaysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

/**
 * Device diagnostics: the latest likely cause first, then the daily diagnoses on one day axis
 * (scores per component, issues, charge cycle, coverage, sensor pairs) and the on-demand evaluation.
 */
export function DeviceDiagnosticsPanel({ deviceId, deviceName, readOnly = false }: DeviceDiagnosticsPanelProps) {
  const displayName = deviceName || deviceId;
  // Daily diagnostics; the grid and the issue timeline open on the last 13 days
  const [days, setDays] = useState<number>(13);
  const [dailyLoading, setDailyLoading] = useState<boolean>(true);
  const [dailyError, setDailyError] = useState<string | null>(null);
  const [issueSummary, setIssueSummary] = useState<DeviceIssueSummary | null>(null);
  const [dailyDiagnoses, setDailyDiagnoses] = useState<DeviceDailyDiagnosticSummary[]>([]);
  const [indicatorSeries, setIndicatorSeries] = useState<DeviceIndicatorSeries | null>(null);
  const [trends, setTrends] = useState<DeviceTrends | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [runDialogOpen, setRunDialogOpen] = useState<boolean>(false);
  const [issuesOpen, setIssuesOpen] = useState<boolean>(false);

  // Latest evaluation
  const [windowHours, setWindowHours] = useState<number>(24);
  const [snapshotLoading, setSnapshotLoading] = useState<boolean>(true);
  const [snapshot, setSnapshot] = useState<DeviceHealthSnapshot | null>(null);
  const [lastEvaluation, setLastEvaluation] = useState<DiagnosticEvaluationResult | null>(null);
  const [profileError, setProfileError] = useState<DiagnosticsApiError | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<DiagnosisResult | null>(null);
  const evaluationRef = useRef<HTMLElement>(null);

  // Each load takes a token; a response is applied only if no newer load started for
  // another device or day range in the meantime.
  const dailyRequestRef = useRef<number>(0);
  const snapshotRequestRef = useRef<number>(0);
  const queryClient = useQueryClient();

  const fetchDaily = useCallback(async () => {
    const token = ++dailyRequestRef.current;
    const isCurrent = () => token === dailyRequestRef.current;
    try {
      setDailyLoading(true);
      setDailyError(null);
      // Indicators and trends are additive: an API without them must not break the rest of the panel.
      const [summary, list, indicators, trendData] = await Promise.all([
        diagnosticsService.getDeviceIssueSummary(deviceId, days),
        diagnosticsService.getDeviceDailyDiagnostics(deviceId, {
          start_date: isoDateDaysAgo(days),
          limit: Math.min(days + 1, 180),
        }),
        diagnosticsService.getDeviceIndicators(deviceId, { days }).catch(() => null),
        diagnosticsService.getDeviceTrends(deviceId).catch(() => null),
      ]);
      if (!isCurrent()) return;
      // A daily run may have replaced days that are cached in full; refetch those alongside the summaries
      void queryClient.invalidateQueries({ queryKey: [...DEVICE_DAY_QUERY_PREFIX, { deviceId }] });
      setIssueSummary(summary);
      setDailyDiagnoses(list);
      setIndicatorSeries(indicators);
      setTrends(trendData);
    } catch (err: any) {
      if (!isCurrent()) return;
      console.error("Error fetching daily diagnostics:", err);
      setDailyError(err?.message || "Daily diagnostics are currently unavailable.");
      setIssueSummary(null);
      setDailyDiagnoses([]);
      setIndicatorSeries(null);
      setTrends(null);
    } finally {
      if (isCurrent()) setDailyLoading(false);
    }
  }, [deviceId, days, queryClient]);

  const fetchSnapshot = useCallback(async () => {
    const token = ++snapshotRequestRef.current;
    const isCurrent = () => token === snapshotRequestRef.current;
    try {
      setSnapshotLoading(true);
      const data = await diagnosticsService.getDeviceHealth(deviceId);
      if (isCurrent()) setSnapshot(data);
    } catch (err: any) {
      if (!isCurrent()) return;
      console.error("Error fetching latest device health:", err);
      setSnapshot(null);
    } finally {
      if (isCurrent()) setSnapshotLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    if (deviceId) fetchDaily();
  }, [deviceId, fetchDaily]);

  useEffect(() => {
    // Evaluation output belongs to the previous device
    setLastEvaluation(null);
    setProfileError(null);
    if (deviceId) fetchSnapshot();
  }, [deviceId, fetchSnapshot]);

  const handleEvaluate = async (hours: number = windowHours) => {
    setWindowHours(hours);
    evaluationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const token = ++snapshotRequestRef.current;
    const isCurrent = () => token === snapshotRequestRef.current;
    try {
      setIsEvaluating(true);
      setProfileError(null);
      const result = await diagnosticsService.evaluateDevice(deviceId, { window_hours: hours });
      if (!isCurrent()) return;
      setLastEvaluation(result);
      trackEvent("device_diagnosis_run", {
        window_hours: hours,
        lifecycle_state: result.lifecycle_state,
        health_score: result.overall_health_score,
        diagnosis_count: result.top_diagnoses?.length ?? 0,
      });

      // The evaluation saved a snapshot; reload it so feedback references its real id.
      const saved = await diagnosticsService.getDeviceHealth(deviceId).catch(() => null);
      if (!isCurrent()) return;
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
      if (!isCurrent()) return;
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

  // ── Derived from the daily diagnoses ──
  const latestDay = useMemo(
    () => [...dailyDiagnoses].sort((a, b) => b.diagnosis_date.localeCompare(a.diagnosis_date))[0] ?? null,
    [dailyDiagnoses]
  );
  const latestDetail = useDeviceDayDiagnosis(deviceId, latestDay?.diagnosis_date ?? null);
  const latestCause = latestDetail.data?.top_diagnoses?.[0] ?? null;
  const pattern = useMemo(() => latestCausePattern(dailyDiagnoses), [dailyDiagnoses]);
  const diagnosedDates = useMemo(() => dailyDiagnoses.map((day) => day.diagnosis_date).sort().reverse(), [dailyDiagnoses]);
  const gridDays = useMemo(() => dayRange(isoDateDaysAgo(days), yesterdayUtc()), [days]);
  const diagnosed = useMemo(() => new Set(diagnosedDates), [diagnosedDates]);
  const overall = useMemo(
    () =>
      Object.fromEntries(
        dailyDiagnoses.map((day): [string, DayHealth] => [day.diagnosis_date, { score: day.overall_health_score, state: day.lifecycle_state }])
      ),
    [dailyDiagnoses]
  );
  const rows = useMemo(() => componentRows(dailyDiagnoses), [dailyDiagnoses]);
  const presence = useMemo(() => issuePresence(dailyDiagnoses), [dailyDiagnoses]);

  const components = indicatorSeries?.components || {};
  const chargeCycles = Object.entries(components)
    .filter(([, groups]) => groups.charge_cycle?.length)
    .map(([component, groups]) => ({ component, points: groups.charge_cycle as IndicatorSeriesPoint<ChargeCycleIndicator>[] }));
  const coverages = Object.entries(components)
    .filter(([, groups]) => groups.coverage?.length)
    .map(([component, groups]) => ({ component, points: groups.coverage as IndicatorSeriesPoint<CoverageIndicator>[] }));
  const pairs: SensorPair[] = Object.entries(components).flatMap(([component, groups]) =>
    Object.entries(groups)
      .filter(([group, points]) => group.startsWith("agreement:") && points.length > 0)
      .map(([group, points]) => ({
        component,
        other: group.split(":", 2)[1],
        latest: [...points].sort((a, b) => b.diagnosis_date.localeCompare(a.diagnosis_date))[0] as SensorPair["latest"],
      }))
  );
  const otherSeries: DeviceIndicatorSeries | null = indicatorSeries
    ? {
        ...indicatorSeries,
        components: Object.fromEntries(
          Object.entries(components)
            .map(([component, groups]) => [component, Object.fromEntries(Object.entries(groups).filter(([group]) => !OWN_GROUPS(group)))])
            .filter(([, groups]) => Object.keys(groups as object).length > 0)
        ),
      }
    : null;

  const movingTrends = trends?.trends.filter((trend) => trend.status !== "stable") ?? [];
  const trendNote =
    trends && movingTrends.length === 0 && trends.as_of
      ? (() => {
          const inWindow = diagnosedDaysInWindow(diagnosedDates, trends.as_of, trends.window_days);
          return inWindow < trends.min_days
            ? `Multi-day trends need ${trends.min_days} diagnosed days in a ${trends.window_days}-day window; this device has ${inWindow}.`
            : `No indicator is trending up or down over the last ${trends.window_days} days.`;
        })()
      : null;

  const evaluationMatchesSnapshot = lastEvaluation && snapshot && lastEvaluation.timestamp === snapshot.timestamp;

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground" title={deviceId}>
              {displayName}
            </h1>
            {latestDay && <LifecyclePill state={latestDay.lifecycle_state} score={latestDay.overall_health_score} />}
          </div>
          <p className="text-sm text-muted-foreground">
            Diagnosed every night
            {issueSummary?.latest_diagnosis_date &&
              ` · latest ${formatDiagnosisDate(issueSummary.latest_diagnosis_date, "EEE d MMM yyyy")}`}
            {issueSummary && ` · ${issueSummary.days_diagnosed} of the last ${days} days diagnosed`}
            {typeof issueSummary?.average_health_score === "number" && ` · average score ${issueSummary.average_health_score}`}
          </p>
        </div>
        {!readOnly && (
          <div className="flex flex-wrap lg:flex-nowrap lg:shrink-0 items-center gap-2">
            <Button asChild variant="outline" className="gap-2 text-foreground">
              <Link href={`/dashboard/diagnostics/simulator?device_id=${encodeURIComponent(deviceId)}`}>
                <AqSliders01 className="h-4 w-4" />
                Bench simulator
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isEvaluating} className="gap-2 text-foreground">
                  {isEvaluating ? "Evaluating…" : "Evaluate now"}
                  <AqChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Telemetry to evaluate</DropdownMenuLabel>
                {EVALUATION_WINDOWS.map((option) => (
                  <DropdownMenuItem key={option.hours} onSelect={() => handleEvaluate(option.hours)}>
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setRunDialogOpen(true)} className="gap-2">
              <AqPlayCircle className="h-4 w-4" />
              Run diagnosis
            </Button>
          </div>
        )}
      </div>

      {/* Device-reported status codes, for device types whose profile links a status code set */}
      <DeviceReportedStatus deviceId={deviceId} showSetLink={!readOnly} />

      {dailyLoading && !issueSummary ? (
        <div className="space-y-5">
          <Skeleton className="h-56 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      ) : dailyError ? (
        <Card className="p-8 text-center border-dashed">
          <AqAlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{dailyError}</p>
          <Button variant="outline" onClick={fetchDaily} className="mt-3 gap-2">
            <AqRefreshCw01 className="h-4 w-4" />
            Try again
          </Button>
        </Card>
      ) : issueSummary ? (
        <>
          {latestDay && latestCause ? (
            <LikelyCauseCard
              diagnosis={latestCause}
              date={latestDay.diagnosis_date}
              pattern={pattern?.causeCode === latestCause.cause_code ? pattern : null}
              actions={<OpenDayButton date={latestDay.diagnosis_date} onClick={() => setSelectedDate(latestDay.diagnosis_date)} />}
            />
          ) : latestDay && latestDetail.isLoading ? (
            <Skeleton className="h-56 w-full rounded-lg" />
          ) : latestDay && latestDay.issue_count === 0 ? (
            <Card className="flex items-center gap-3 p-5">
              <AqCheckCircle className="h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm text-foreground">
                No issues on {formatDiagnosisDate(latestDay.diagnosis_date, "d MMM")}, the latest diagnosed day.
              </p>
            </Card>
          ) : null}

          <Card className="space-y-3.5 p-5 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-0.5">
                <h2 className="text-base font-semibold text-foreground">Health, last {days} days</h2>
                <p className="text-sm text-muted-foreground">
                  Score out of 100 per day and component. Select a day to see its full diagnosis.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="diagnosis-days" className="sr-only">
                  Period
                </label>
                <select
                  id="diagnosis-days"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="h-9 rounded-md border border-input bg-background px-2.5 text-sm text-foreground"
                >
                  {DAY_RANGES.map((d) => (
                    <option key={d} value={d}>
                      Last {d} days
                    </option>
                  ))}
                </select>
                <Button variant="outline" size="icon" onClick={fetchDaily} disabled={dailyLoading} aria-label="Refresh" title="Refresh" className="h-9 w-9">
                  <AqRefreshCw01 className={`h-4 w-4 ${dailyLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
            {dailyDiagnoses.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No diagnosed days in this period.{!readOnly && " Run diagnosis can backfill up to 14 days."}
              </p>
            ) : (
              <DayHealthGrid
                days={gridDays}
                overall={overall}
                rows={rows}
                highlight={latestDay?.diagnosis_date}
                onSelectDay={setSelectedDate}
              />
            )}
          </Card>

          {trends && movingTrends.length > 0 && (
            <Card className="space-y-2 p-5 sm:px-6">
              <div className="space-y-0.5">
                <h2 className="text-base font-semibold text-foreground">Multi-day trends</h2>
                <p className="text-sm text-muted-foreground">
                  Line fitted through the last {trends.window_days} days of each indicator
                  {trends.as_of ? `, up to ${formatDiagnosisDate(trends.as_of)}` : ""}. A device can pass every daily
                  check while sliding towards failure.
                </p>
              </div>
              <DeviceTrendsList trends={trends.trends} hideStable />
            </Card>
          )}

          {chargeCycles.map(({ component, points }) => (
            <ChargeCycleCard key={component} component={component} days={gridDays} points={points} />
          ))}

          {(coverages.length > 0 || pairs.length > 0) && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
              {coverages.map(({ component, points }) => (
                <CoverageCard key={component} component={component} points={points} />
              ))}
              <SensorPairsCard pairs={pairs} trendNote={trendNote} />
            </div>
          )}
          {pairs.length === 0 && trendNote && <p className="text-sm text-muted-foreground">{trendNote}</p>}

          {otherSeries && Object.keys(otherSeries.components).length > 0 && (
            <DeviceIndicatorCharts series={otherSeries} onSelectDate={setSelectedDate} />
          )}

          <Card className="overflow-hidden">
            <h2>
              <button
                type="button"
                onClick={() => setIssuesOpen(!issuesOpen)}
                aria-expanded={issuesOpen}
                aria-controls="device-issue-timeline"
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-6"
              >
                <span className="space-y-0.5">
                  <span className="block text-base font-semibold text-foreground">Issues, last {days} days</span>
                  <span className="block text-sm font-normal text-muted-foreground">
                    {issueSummary.issues.filter((issue) => issue.is_active).length} still active,{" "}
                    {issueSummary.issues.filter((issue) => !issue.is_active).length} resolved
                  </span>
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-foreground" aria-hidden="true">
                  {issuesOpen ? <AqChevronUp className="h-4 w-4" /> : <AqChevronDown className="h-4 w-4" />}
                </span>
              </button>
            </h2>
            {issuesOpen && (
              <div id="device-issue-timeline" className="space-y-3 border-t border-border px-5 pb-5 pt-4 sm:px-6">
                <p className="text-sm text-muted-foreground">
                  A gap of up to 3 days (e.g. the device was offline) does not reset a streak.
                </p>
                <IssueTimeline days={gridDays} diagnosed={diagnosed} issues={issueSummary.issues} presence={presence} />
              </div>
            )}
          </Card>
        </>
      ) : null}

      {/* ── On-demand evaluation ─────────────────────────────────────────── */}
      <section ref={evaluationRef} className="space-y-4 scroll-mt-6 pt-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Latest on-demand evaluation</h2>
          <p className="text-sm text-muted-foreground">
            {readOnly
              ? "Most recent on-demand evaluation of the device's telemetry against its device profile."
              : "Evaluates recent telemetry against the device profile right now, outside the nightly diagnosis."}
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
              onReevaluate={readOnly ? undefined : () => handleEvaluate()}
              isEvaluating={isEvaluating}
              isSimulated={snapshot.is_simulated}
            />

            {lastEvaluation && (evaluationMatchesSnapshot || !snapshot.id) && (
              <DiagnosisNarrative headline={lastEvaluation.headline} summary={lastEvaluation.summary} />
            )}

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
                <Card className="h-full p-5 space-y-3">
                  <h3 className="text-base font-semibold text-foreground">Evidence</h3>
                  <EvidenceFactBadge facts={snapshot.active_evidences || []} symptoms={snapshot.detected_symptoms || []} />
                </Card>
              </div>
            </div>

            <DiagnosisCard
              diagnoses={snapshot.top_diagnoses || []}
              deviceId={deviceId}
              onOpenFeedback={readOnly ? undefined : handleOpenFeedback}
            />
          </div>
        ) : (
          <Card className="border-dashed p-8 text-center">
            <h3 className="text-base font-semibold text-foreground">No on-demand evaluation yet</h3>
            {readOnly ? (
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                The daily diagnoses above are the device&apos;s regular health record.
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  Evaluate the last {windowHours}h of telemetry for {displayName} against its device profile.
                </p>
                <Button onClick={() => handleEvaluate()} disabled={isEvaluating} className="mt-4">
                  {isEvaluating ? "Evaluating…" : `Evaluate last ${windowHours}h`}
                </Button>
              </>
            )}
          </Card>
        )}
      </section>

      <DailyDiagnosisDetailDialog
        deviceId={deviceId}
        deviceName={displayName}
        diagnosisDate={selectedDate}
        availableDates={diagnosedDates}
        onSelectDate={setSelectedDate}
        onOpenChange={(open) => !open && setSelectedDate(null)}
      />

      {!readOnly && (
        <>
          <DailyRunDialog open={runDialogOpen} onOpenChange={setRunDialogOpen} deviceIds={[deviceId]} />

          <TechnicianFeedbackModal
            open={feedbackOpen}
            onOpenChange={setFeedbackOpen}
            deviceId={deviceId}
            snapshotId={snapshot?.id || undefined}
            diagnosis={selectedDiagnosis}
            onFeedbackSubmitted={fetchSnapshot}
          />
        </>
      )}
    </div>
  );
}
