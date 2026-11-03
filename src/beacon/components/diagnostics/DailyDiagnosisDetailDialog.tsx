"use client";

import React, { useState } from "react";
import { AqChevronDown, AqChevronLeft, AqChevronRight, AqChevronUp } from "@airqo/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getLifecycleConfig } from "@/components/diagnostics/HealthScoreGauge";
import { DiagnosisCard } from "@/components/diagnostics/DiagnosisCard";
import { DayIndicators } from "@/components/diagnostics/DayIndicators";
import { DeviceTrendsList } from "@/components/diagnostics/DeviceTrendsList";
import { checkTypeLabel, formatDiagnosisDate } from "@/components/diagnostics/DiagnosticBadges";
import { LifecyclePill, LikelyCauseCard } from "@/components/diagnostics/DeviceDiagnosisParts";
import { NewPill, SeverityPill, plural } from "@/components/diagnostics/FleetHealthParts";
import { useDeviceDayDiagnosis } from "@/hooks/use-device-diagnosis";
import { dayFraction, daySegments, humanizeComponent, scoreBand, utcClock } from "@/lib/device-diagnosis";
import { cn } from "@/lib/utils";
import type {
  ChargeCycleIndicator,
  CoverageIndicator,
  DeviceDailyDiagnostic,
  DeviceIndicators,
  OutageWindow,
} from "@/types/diagnostics";

interface DailyDiagnosisDetailDialogProps {
  deviceId: string;
  deviceName?: string;
  diagnosisDate: string | null;
  /** Diagnosed days, newest first, for stepping between days without closing. */
  availableDates?: string[];
  onSelectDate?: (date: string) => void;
  onOpenChange: (open: boolean) => void;
}

const formatStat = (value?: number) => (value === undefined || value === null ? "—" : Number(value).toFixed(2));

const SEVERITY_ORDER: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

const firstGroup = <T,>(indicators: DeviceIndicators | null | undefined, group: string): { component: string; values: T } | null => {
  for (const [component, groups] of Object.entries(indicators || {})) {
    if (groups[group]) return { component, values: groups[group] as T };
  }
  return null;
};

/** One day's diagnosis: the likely cause, the day hour by hour, its issues, scores and readings. */
export const DailyDiagnosisDetailDialog: React.FC<DailyDiagnosisDetailDialogProps> = ({
  deviceId,
  deviceName,
  diagnosisDate,
  availableDates = [],
  onSelectDate,
  onOpenChange,
}) => {
  const { data: detail, isLoading, error } = useDeviceDayDiagnosis(deviceId, diagnosisDate);
  const index = diagnosisDate ? availableDates.indexOf(diagnosisDate) : -1;
  const older = index >= 0 ? availableDates[index + 1] : undefined;
  const newer = index > 0 ? availableDates[index - 1] : undefined;

  return (
    <Dialog open={!!diagnosisDate} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="sticky top-0 z-10 space-y-0 border-b border-border bg-background px-6 pb-4 pt-5 text-left">
          <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
            <div className="min-w-0">
              <div className="text-xs font-semibold tracking-wider text-muted-foreground" title={deviceId}>
                DAILY DIAGNOSIS · {(deviceName || deviceId).toUpperCase()}
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                {formatDiagnosisDate(diagnosisDate, "EEEE d MMM yyyy")}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                UTC day
                {detail?.evaluated_at && ` · diagnosed ${formatDiagnosisDate(detail.evaluated_at.slice(0, 10))}`}
                {detail?.engine_version && ` · engine ${detail.engine_version}`}
              </DialogDescription>
            </div>
            {onSelectDate && availableDates.length > 1 && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={!older} onClick={() => older && onSelectDate(older)} className="h-9 gap-1 pl-2">
                  <AqChevronLeft className="h-4 w-4" />
                  {older ? formatDiagnosisDate(older, "EEE d MMM") : "Earlier"}
                </Button>
                <Button variant="outline" size="sm" disabled={!newer} onClick={() => newer && onSelectDate(newer)} className="h-9 gap-1 pr-2">
                  {newer ? formatDiagnosisDate(newer, "EEE d MMM") : "Later"}
                  <AqChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 px-6 py-5">
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          )}

          {error && !isLoading && (
            <p className="py-6 text-center text-sm text-red-700 dark:text-red-400">
              {(error as Error).message || "Failed to load this day's diagnosis."}
            </p>
          )}

          {detail && !isLoading && <DayDiagnosis detail={detail} deviceId={deviceId} />}
        </div>

        <div className="flex justify-end border-t border-border px-6 py-3.5">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

function DayDiagnosis({ detail, deviceId }: { detail: DeviceDailyDiagnostic; deviceId: string }) {
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [causesOpen, setCausesOpen] = useState(false);
  const diagnoses = detail.top_diagnoses || [];
  const issues = [...detail.issues].sort(
    (a, b) => (SEVERITY_ORDER[b.severity] || 0) - (SEVERITY_ORDER[a.severity] || 0) || b.streak_days - a.streak_days
  );
  const scores = Object.entries(detail.subsystem_scores || {}).sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));
  const weak = scores.filter(([, score]) => score < 100);
  const perfect = scores.filter(([, score]) => score >= 100).map(([name]) => name);
  const metrics = Object.entries(detail.metrics_summary || {});
  const movingTrends = (detail.trends || []).filter((trend) => trend.status !== "stable");

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-bold tracking-tight tabular-nums text-foreground">{Math.round(detail.overall_health_score)}</span>
          <span className="text-base font-medium text-muted-foreground">/ 100</span>
        </div>
        <div className="space-y-1">
          <LifecyclePill state={detail.lifecycle_state} />
          <p className="text-sm text-muted-foreground">{getLifecycleConfig(detail.lifecycle_state).description}</p>
        </div>
        <dl className="ml-auto flex gap-6 text-sm text-muted-foreground">
          <div>
            <dd className="text-lg font-semibold tabular-nums text-foreground">{detail.issues.length}</dd>
            <dt>{detail.issues.length === 1 ? "issue" : "issues"}</dt>
          </div>
          <div>
            <dd className="text-lg font-semibold tabular-nums text-foreground">{detail.hours_with_data} / 24</dd>
            <dt>hours with data</dt>
          </div>
          <div>
            <dd className="text-lg font-semibold tabular-nums text-foreground">{detail.record_count}</dd>
            <dt>readings</dt>
          </div>
        </dl>
      </div>

      {diagnoses[0] && <LikelyCauseCard diagnosis={diagnoses[0]} date={detail.diagnosis_date} compact />}

      <DayTimeline detail={detail} />

      <section className="space-y-1">
        <h3 className="mb-1.5 text-base font-semibold text-foreground">
          Issues found <span className="font-medium text-muted-foreground">· {issues.length}</span>
        </h3>
        {issues.length === 0 ? (
          <p className="text-sm text-muted-foreground">No issues on this day.</p>
        ) : (
          <ul>
            {issues.map((issue) => (
              <li key={issue.issue_code} className="grid grid-cols-[5rem_minmax(0,1fr)_auto] items-start gap-3.5 border-t border-border/60 py-3">
                <SeverityPill severity={issue.severity} className="justify-self-start" />
                <div className="min-w-0">
                  <div className="font-semibold text-foreground">{issue.title}</div>
                  {issue.description && <div className="text-sm text-muted-foreground">{issue.description}</div>}
                  <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {checkTypeLabel(issue.check_type)} · {[issue.component_name, issue.metric_key].filter(Boolean).join(".") || issue.subsystem}
                  </div>
                </div>
                <div className="text-right">
                  {issue.is_new ? (
                    <NewPill>New today</NewPill>
                  ) : (
                    <>
                      <span className="inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-800 dark:bg-orange-500/15 dark:text-orange-300">
                        Day {issue.streak_days}
                      </span>
                      <div className="mt-1 text-xs text-muted-foreground">since {formatDiagnosisDate(issue.streak_start_date, "d MMM")}</div>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        {detail.resolved_issue_codes && detail.resolved_issue_codes.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 text-xs">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">Resolved since the day before:</span>
            {detail.resolved_issue_codes.map((code) => (
              <span key={code} className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                {code}
              </span>
            ))}
          </div>
        )}
      </section>

      {scores.length > 0 && (
        <section className="space-y-2.5">
          <h3 className="text-base font-semibold text-foreground">Component scores</h3>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {weak.map(([name, score]) => (
              <ScoreTile key={name} label={humanizeComponent(name)} note={name} score={score} />
            ))}
            {perfect.length > 0 && (
              <ScoreTile
                label={perfect.length === 1 ? humanizeComponent(perfect[0]) : `${perfect.length} components`}
                note={perfect.join(", ")}
                score={100}
              />
            )}
          </div>
        </section>
      )}

      {detail.indicators && Object.keys(detail.indicators).length > 0 && (
        <section className="space-y-2.5">
          <h3 className="text-base font-semibold text-foreground">Readings behind the scores</h3>
          <DayIndicators indicators={detail.indicators} />
        </section>
      )}

      {movingTrends.length > 0 && (
        <section className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">Trends as of this day</h3>
          <DeviceTrendsList trends={detail.trends || []} hideStable />
        </section>
      )}

      {diagnoses.length > 1 && (
        <Disclosure title="All likely causes" count={diagnoses.length} open={causesOpen} onToggle={() => setCausesOpen(!causesOpen)}>
          <div className="p-4">
            <DiagnosisCard diagnoses={diagnoses} deviceId={deviceId} />
          </div>
        </Disclosure>
      )}

      {metrics.length > 0 && (
        <Disclosure title="Raw metric summary" count={metrics.length} unit="metric" open={metricsOpen} onToggle={() => setMetricsOpen(!metricsOpen)}>
          <div className="max-h-80 overflow-auto">
            <table className="w-full border-collapse text-sm tabular-nums">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                  <th scope="col" className="px-4 py-2 text-left font-medium">Metric</th>
                  <th scope="col" className="px-2 py-2 text-right font-medium">Min</th>
                  <th scope="col" className="px-2 py-2 text-right font-medium">Mean</th>
                  <th scope="col" className="px-2 py-2 text-right font-medium">Max</th>
                  <th scope="col" className="px-2 py-2 text-right font-medium">Std</th>
                  <th scope="col" className="py-2 pl-2 pr-4 text-right font-medium">Samples</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map(([key, stats]) => (
                  <tr key={key} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-1.5 font-mono text-xs text-foreground">{key}</td>
                    <td className="px-2 py-1.5 text-right">{formatStat(stats.min)}</td>
                    <td className="px-2 py-1.5 text-right font-semibold">{formatStat(stats.mean)}</td>
                    <td className="px-2 py-1.5 text-right">{formatStat(stats.max)}</td>
                    <td className="px-2 py-1.5 text-right text-muted-foreground">{formatStat(stats.std)}</td>
                    <td className="py-1.5 pl-2 pr-4 text-right text-muted-foreground">{stats.count ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Disclosure>
      )}
    </>
  );
}

const SCORE_FILL: Record<string, string> = {
  good: "bg-emerald-400 dark:bg-emerald-600",
  fair: "bg-amber-400",
  poor: "bg-orange-500",
  bad: "bg-red-500",
};

const ScoreTile: React.FC<{ label: string; note: string; score: number }> = ({ label, note, score }) => (
  <div className="space-y-2 rounded-lg border border-border p-3.5">
    <div className="flex justify-between gap-2">
      <span className="font-medium text-foreground">{label}</span>
      <span
        className={cn(
          "font-bold tabular-nums",
          scoreBand(score) === "good" ? "text-emerald-700 dark:text-emerald-400" : scoreBand(score) === "fair" ? "text-amber-700 dark:text-amber-400" : "text-red-700 dark:text-red-400"
        )}
      >
        {+score.toFixed(1)}
      </span>
    </div>
    <span className="flex h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
      <span className={SCORE_FILL[scoreBand(score)]} style={{ width: `${Math.max(0, Math.min(100, score))}%` }} />
    </span>
    <span className="block truncate font-mono text-xs text-muted-foreground" title={note}>
      {note}
    </span>
  </div>
);

const Disclosure: React.FC<{
  title: string;
  count: number;
  unit?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, count, unit, open, onToggle, children }) => (
  <section className="rounded-lg border border-border">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-semibold text-foreground hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    >
      <span>
        {title} <span className="font-medium text-muted-foreground">· {unit ? plural(count, unit) : count}</span>
      </span>
      {open ? <AqChevronUp className="h-4 w-4" /> : <AqChevronDown className="h-4 w-4" />}
    </button>
    {open && <div className="border-t border-border">{children}</div>}
  </section>
);

// ── The day, hour by hour ────────────────────────────────────────────────────

const pct = (fraction: number) => `${(fraction * 100).toFixed(2)}%`;

function outageNote(outage: OutageWindow, charge: ChargeCycleIndicator | null, day: string): string {
  if (outage.after_low_charge === false) return "The charge was healthy, so this is more likely the network link.";
  if (outage.after_low_charge === null) return "The charge level before it is unknown.";
  const unit = charge?.unit ? ` ${charge.unit}` : "";
  if (charge?.min_at && typeof charge.min === "number" && Math.abs(dayFraction(charge.min_at, day) - dayFraction(outage.start, day)) * 1440 <= 10) {
    return `The ${(charge.metric || "charge").replace(/_/g, " ")} hit its lowest point, ${charge.min}${unit}, as this outage began.`;
  }
  return "The charge was low just before this outage.";
}

function DayTimeline({ detail }: { detail: DeviceDailyDiagnostic }) {
  const day = detail.diagnosis_date;
  const coverage = firstGroup<CoverageIndicator>(detail.indicators, "coverage")?.values ?? null;
  const charge = firstGroup<ChargeCycleIndicator>(detail.indicators, "charge_cycle")?.values ?? null;
  const outages = coverage?.outages || [];
  const segments = daySegments(day, detail.first_record_at, detail.last_record_at, outages);
  if (segments.length === 0 && !charge?.min_at) return null;
  const unit = charge?.unit ? ` ${charge.unit}` : "";

  const markers = [
    charge?.min_at && typeof charge.min === "number"
      ? { key: "min", at: dayFraction(charge.min_at, day), label: `${charge.min}${unit} lowest`, tone: "text-red-700 dark:text-red-400", dot: "bg-red-600" }
      : null,
    charge?.max_at && typeof charge.max === "number"
      ? { key: "max", at: dayFraction(charge.max_at, day), label: `${charge.max}${unit} highest`, tone: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" }
      : null,
  ].filter((marker): marker is NonNullable<typeof marker> => marker !== null);

  const cycle = charge
    ? [
        typeof charge.hours_low_charge === "number" && charge.low_charge_threshold
          ? `Below ${charge.low_charge_threshold}${unit} for ${+charge.hours_low_charge.toFixed(1)} h`
          : null,
        typeof charge.hours_charging === "number" ? `charging ${+charge.hours_charging.toFixed(1)} h` : null,
        typeof charge.hours_discharging === "number" ? `discharging ${+charge.hours_discharging.toFixed(1)} h` : null,
        typeof charge.hours_flat === "number" ? `flat ${+charge.hours_flat.toFixed(1)} h` : null,
      ].filter(Boolean)
    : [];

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-base font-semibold text-foreground">The day, hour by hour</h3>
        <span className="text-xs text-muted-foreground">UTC</span>
      </div>
      <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-x-3.5 gap-y-2.5">
        {segments.length > 0 && (
          <>
            <span className="text-sm font-medium text-foreground">Data</span>
            <div className="relative h-7 overflow-hidden rounded-md bg-muted">
              {segments.map((segment, i) => (
                <span
                  key={i}
                  title={
                    segment.outage
                      ? `Offline ${utcClock(segment.outage.start)} → ${utcClock(segment.outage.end)} (${segment.outage.hours.toFixed(1)} h)`
                      : `Receiving data`
                  }
                  className={cn(
                    "absolute inset-y-0",
                    segment.kind === "data"
                      ? "bg-emerald-300 dark:bg-emerald-700"
                      : segment.outage?.after_low_charge
                      ? "bg-[repeating-linear-gradient(135deg,theme(colors.orange.500)_0_6px,theme(colors.amber.500)_6px_12px)]"
                      : "bg-[repeating-linear-gradient(135deg,theme(colors.slate.400)_0_6px,theme(colors.slate.300)_6px_12px)]"
                  )}
                  style={{ left: pct(segment.start), width: pct(segment.end - segment.start) }}
                />
              ))}
            </div>
          </>
        )}
        {markers.length > 0 && (
          <>
            <span className="text-sm font-medium text-foreground">{humanizeComponent((charge?.metric || "Charge").replace(/_voltage$/, ""))}</span>
            <div className="relative h-11">
              <span className="absolute inset-x-0 top-[21px] h-0.5 bg-border" aria-hidden="true" />
              {markers.map((marker) => (
                <span
                  key={marker.key}
                  className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-0.5"
                  style={{ left: pct(Math.min(0.94, Math.max(0.06, marker.at))) }}
                >
                  <span className={cn("whitespace-nowrap text-xs font-bold", marker.tone)}>{marker.label}</span>
                  <span className={cn("h-3 w-3 rounded-full ring-2 ring-background", marker.dot)} />
                </span>
              ))}
            </div>
          </>
        )}
        <span />
        <div className="relative h-4 text-[11px] text-muted-foreground">
          {["00:00", "06:00", "12:00", "18:00", "24:00"].map((label, i) => (
            <span
              key={label}
              className={cn("absolute", i === 0 ? "left-0" : i === 4 ? "right-0" : "-translate-x-1/2")}
              style={i > 0 && i < 4 ? { left: `${i * 25}%` } : undefined}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {outages.length > 0 && (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {outages.map((outage) => (
            <div
              key={outage.start}
              className={cn(
                "rounded-lg border p-3 text-sm",
                outage.after_low_charge
                  ? "border-orange-200 bg-orange-50 dark:border-orange-500/30 dark:bg-orange-500/10"
                  : "border-border bg-muted/40"
              )}
            >
              <strong className="block font-semibold text-foreground">
                {utcClock(outage.start)} → {utcClock(outage.end)} · offline {outage.hours.toFixed(1)} h
              </strong>
              <span className="text-muted-foreground">{outageNote(outage, charge, day)}</span>
            </div>
          ))}
        </div>
      )}

      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        <li className="flex items-center gap-1.5"><span className="h-2.5 w-3.5 rounded-sm bg-emerald-300 dark:bg-emerald-700" aria-hidden="true" />Receiving data</li>
        {outages.some((outage) => outage.after_low_charge) && (
          <li className="flex items-center gap-1.5"><span className="h-2.5 w-3.5 rounded-sm bg-orange-500" aria-hidden="true" />Offline after low charge</li>
        )}
        {outages.some((outage) => !outage.after_low_charge) && (
          <li className="flex items-center gap-1.5"><span className="h-2.5 w-3.5 rounded-sm bg-slate-400" aria-hidden="true" />Offline, charge healthy or unknown</li>
        )}
        {cycle.length > 0 && <li>{cycle.join(" · ")}</li>}
        {coverage && typeof coverage.expected_records === "number" && (
          <li>
            {coverage.records} of ~{coverage.expected_records} expected readings
          </li>
        )}
      </ul>
    </section>
  );
}
