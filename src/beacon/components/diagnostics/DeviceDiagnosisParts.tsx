"use client";

import React from "react";
import { AqArrowRight } from "@airqo/icons-react";
import { formatDiagnosisDate } from "@/components/diagnostics/DiagnosticBadges";
import {
  SEVERITY_BAR_CLASSES,
  SEVERITY_LABELS,
  SubsystemIcon,
  plural,
} from "@/components/diagnostics/FleetHealthParts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import {
  causeTitle,
  humanizeAction,
  humanizeComponent,
  humanizeMetric,
  scoreBand,
  utcClock,
} from "@/lib/device-diagnosis";
import type { CausePattern, ComponentRow, ScoreBand } from "@/lib/device-diagnosis";
import { cn } from "@/lib/utils";
import type {
  AgreementIndicator,
  ChargeCycleIndicator,
  CoverageIndicator,
  DeviceIssueHistoryItem,
  DiagnosisResult,
  IndicatorSeriesPoint,
  IssueSeverity,
  LifecycleState,
} from "@/types/diagnostics";

// Light enough for dark text in light mode, deep enough for white text in dark mode.
const BAND_CLASSES: Record<ScoreBand, string> = {
  good: "bg-emerald-200 text-slate-900 dark:bg-emerald-800 dark:text-white",
  fair: "bg-amber-200 text-slate-900 dark:bg-amber-700 dark:text-white",
  poor: "bg-orange-300 text-slate-900 dark:bg-orange-700 dark:text-white",
  bad: "bg-red-400 text-slate-900 dark:bg-red-700 dark:text-white",
};

const BAND_LEGEND: Array<{ band: ScoreBand; label: string }> = [
  { band: "good", label: "85+" },
  { band: "fair", label: "70–84" },
  { band: "poor", label: "50–69" },
  { band: "bad", label: "Below 50" },
];

const LIFECYCLE_PILL: Record<string, string> = {
  HEALTHY: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  RECOVERING: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  DEGRADING: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  SUSPICIOUS: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300",
  LIKELY_FAILURE: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  FAILED: "bg-red-200 text-red-900 dark:bg-red-500/25 dark:text-red-200",
};

const sentenceCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

export const LifecyclePill: React.FC<{ state: LifecycleState | string; score?: number | null; className?: string }> = ({
  state,
  score,
  className,
}) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold whitespace-nowrap",
      LIFECYCLE_PILL[state] || "bg-muted text-muted-foreground",
      className
    )}
  >
    {sentenceCase(state.replace(/_/g, " "))}
    {typeof score === "number" && <span className="tabular-nums">&nbsp;· {score} / 100</span>}
  </span>
);

/** Columns for a row label followed by one column per day. */
export const dayGridStyle = (dayCount: number): React.CSSProperties => ({
  gridTemplateColumns: `13rem repeat(${dayCount}, minmax(0, 1fr))`,
});

const dayLabel = (date: string, index: number) =>
  index === 0 || date.endsWith("-01") ? formatDiagnosisDate(date, "d MMM") : String(Number(date.slice(8)));

const DayHeader: React.FC<{ days: string[]; highlight?: string | null }> = ({ days, highlight }) => (
  <div className="grid items-end gap-[3px]" style={dayGridStyle(days.length)}>
    <span />
    {days.map((date, index) => (
      <span
        key={date}
        className={cn(
          "text-center text-[11px] leading-[14px] tabular-nums",
          date === highlight ? "font-semibold text-primary" : "text-muted-foreground",
          (index === 0 || date.endsWith("-01")) && "font-semibold whitespace-nowrap"
        )}
      >
        {days.length > 45 && index % 7 !== 0 && !date.endsWith("-01") ? "" : dayLabel(date, index)}
      </span>
    ))}
  </div>
);

const NotDiagnosedCell: React.FC<{ date: string; className?: string }> = ({ date, className }) => (
  <span
    title={`${formatDiagnosisDate(date)}: not diagnosed`}
    className={cn("rounded border border-dashed border-border", className)}
  />
);

// ── Likely cause ─────────────────────────────────────────────────────────────

interface LikelyCauseCardProps {
  diagnosis: DiagnosisResult;
  /** The diagnosis day, `YYYY-MM-DD`. */
  date: string;
  pattern?: CausePattern | null;
  /** Extra buttons after "Copy for technician". */
  actions?: React.ReactNode;
  compact?: boolean;
}

/** The day's top-ranked cause: what to do, the evidence for it and, on the page, how often it recurs. */
export function LikelyCauseCard({ diagnosis, date, pattern, actions, compact = false }: LikelyCauseCardProps) {
  const title = causeTitle(diagnosis);
  const causeType = /\(([^)]+)\)/.exec(diagnosis.title)?.[1] || diagnosis.component_name || "";
  const action = humanizeAction(diagnosis.recommended_action);
  const evidence = [...(diagnosis.supporting_evidence || [])].sort((a, b) => b.contribution - a.contribution);
  const refuting = diagnosis.refuting_evidence || [];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(action);
      toast({ title: "Copied", description: "The recommended action is on your clipboard." });
    } catch {
      toast({ title: "Could not copy", description: "Select the text and copy it instead.", variant: "destructive" });
    }
  };

  return (
    <Card
      className={cn(
        "grid overflow-hidden md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]",
        compact && "border-red-200 bg-red-50/40 shadow-none dark:border-red-500/30 dark:bg-red-500/5"
      )}
    >
      <div className={cn("flex flex-col gap-3.5", compact ? "p-5" : "p-6 md:border-r md:border-border/60")}>
        <div className="flex items-center gap-3">
          <SubsystemIcon subsystem={causeType} urgent className={compact ? "h-10 w-10" : "h-11 w-11"} />
          <div className="min-w-0">
            <div className="text-xs font-semibold tracking-wider text-muted-foreground">
              LIKELY CAUSE ON {formatDiagnosisDate(date, "d MMM").toUpperCase()}
            </div>
            <h2 className={cn("font-bold text-foreground", compact ? "text-lg" : "text-xl")}>
              {title}{" "}
              <span className="text-sm font-medium text-muted-foreground">
                · {Math.round(diagnosis.confidence_percentage)}% confidence
              </span>
            </h2>
          </div>
        </div>
        <div className={cn("flex flex-col gap-1.5 rounded-lg border border-border p-3.5", compact ? "bg-background" : "bg-muted/40")}>
          <span className="text-xs font-semibold text-muted-foreground">What to do</span>
          <p className="text-[15px] leading-[22px] text-foreground">{action}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {actions}
          <Button variant="outline" size="sm" onClick={copy} className="h-9 text-foreground">
            Copy for technician
          </Button>
        </div>
      </div>

      <div className={cn("flex flex-col gap-3.5", compact ? "p-5 pt-0 md:pt-5" : "p-6")}>
        <h3 className="text-sm font-semibold text-foreground">
          Evidence for it
          {evidence.length > 1 && <span className="font-medium text-muted-foreground"> · {evidence.length}</span>}
        </h3>
        {evidence.length === 0 ? (
          <p className="text-sm text-muted-foreground">No supporting evidence was recorded.</p>
        ) : (
          // A long list scrolls inside the card, strongest evidence first, instead of stretching it.
          <div
            role="region"
            aria-label="Evidence for the likely cause"
            tabIndex={0}
            className={cn(
              "-mr-2 overflow-y-auto pr-2 [scrollbar-gutter:stable] rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              compact ? "max-h-56" : "max-h-64"
            )}
          >
            <ul className="space-y-3">
              {evidence.map((item) => {
                const pct = Math.round(item.contribution * 100);
                return (
                  <li key={item.evidence} className="grid grid-cols-[minmax(0,1fr)_6rem_2.75rem] items-center gap-3 text-sm">
                    <span className="text-foreground">{item.description || item.evidence}</span>
                    <span className="flex h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                      <span className="bg-red-700 dark:bg-red-500" style={{ width: `${Math.min(100, pct)}%` }} />
                    </span>
                    <span className="text-right font-semibold tabular-nums text-foreground">+{pct}%</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <div className="mt-auto space-y-1 border-t border-border/60 pt-3 text-sm text-muted-foreground">
          {pattern && pattern.days > 1 && (
            <p>
              <strong className="font-semibold text-foreground">A pattern, not a one-off:</strong> {title.toLowerCase()} was
              the likely cause on {pattern.days} of the {pattern.diagnosedDays} diagnosed days, starting{" "}
              {formatDiagnosisDate(pattern.firstDate, "d MMM")}.
            </p>
          )}
          <p>
            {refuting.length === 0
              ? "No evidence against it."
              : `Against it: ${refuting.map((item) => item.description || item.evidence).join("; ")}.`}
          </p>
        </div>
      </div>
    </Card>
  );
}

// ── Health grid ──────────────────────────────────────────────────────────────

export interface DayHealth {
  score: number;
  state: LifecycleState;
}

interface DayHealthGridProps {
  days: string[];
  overall: Record<string, DayHealth>;
  rows: ComponentRow[];
  highlight?: string | null;
  onSelectDay: (date: string) => void;
}

/** Scores per day: the overall score, then each component. Diagnosed days open their diagnosis. */
export function DayHealthGrid({ days, overall, rows, highlight, onSelectDay }: DayHealthGridProps) {
  const showNumbers = days.length <= 45;
  const latest = days.slice().reverse().find((date) => overall[date]);

  const renderRow = (key: string, label: React.ReactNode, latestScore: number | null, scores: Record<string, number>, tall: boolean) => (
    <div key={key} className="grid items-stretch gap-[3px]" style={dayGridStyle(days.length)}>
      <span className={cn("flex items-center justify-between gap-2 pr-3 text-sm", tall ? "font-semibold" : "font-medium")}>
        <span className="truncate">{label}</span>
        {latestScore !== null && (
          <span
            className={cn(
              "font-semibold tabular-nums",
              scoreBand(latestScore) === "good"
                ? "text-emerald-700 dark:text-emerald-400"
                : scoreBand(latestScore) === "fair"
                ? "text-amber-700 dark:text-amber-400"
                : "text-red-700 dark:text-red-400"
            )}
          >
            {+latestScore.toFixed(1)}
          </span>
        )}
      </span>
      {days.map((date) => {
        const score = scores[date];
        const height = tall ? "h-[34px]" : "h-[26px]";
        if (score === undefined || !overall[date]) return <NotDiagnosedCell key={date} date={date} className={height} />;
        return (
          <button
            key={date}
            type="button"
            onClick={() => onSelectDay(date)}
            title={`${formatDiagnosisDate(date)}: ${score}`}
            aria-label={`${typeof label === "string" ? label : "Score"} on ${formatDiagnosisDate(date)}: ${score}. Open the day's diagnosis`}
            className={cn(
              "flex items-center justify-center rounded text-[11px] font-semibold tabular-nums transition-shadow hover:ring-2 hover:ring-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              height,
              BAND_CLASSES[scoreBand(score)],
              date === highlight && "ring-2 ring-primary"
            )}
          >
            {showNumbers ? Math.round(score) : ""}
          </button>
        );
      })}
    </div>
  );

  const overallScores = Object.fromEntries(Object.entries(overall).map(([date, day]) => [date, day.score]));

  return (
    <div className="space-y-3.5">
      <ul className="flex flex-wrap gap-3.5 text-xs text-muted-foreground">
        {BAND_LEGEND.map((item) => (
          <li key={item.band} className="flex items-center gap-1.5">
            <span className={cn("h-3 w-3 rounded-sm", BAND_CLASSES[item.band])} aria-hidden="true" />
            {item.label}
          </li>
        ))}
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm border border-dashed border-border" aria-hidden="true" />
          Not diagnosed
        </li>
      </ul>
      <div className="overflow-x-auto">
        <div className="min-w-[56rem] space-y-1">
          <DayHeader days={days} highlight={highlight} />
          {renderRow("overall", "Overall", latest ? overall[latest].score : null, overallScores, true)}
          {rows.map((row) =>
            renderRow(
              row.key,
              <span title={row.components.join(", ")}>{row.label}</span>,
              row.latest,
              row.scores,
              false
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ── Issue timeline ───────────────────────────────────────────────────────────

const SEVERITY_RANK: Record<IssueSeverity, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

interface IssueTimelineProps {
  days: string[];
  diagnosed: Set<string>;
  issues: DeviceIssueHistoryItem[];
  presence: Map<string, Map<string, IssueSeverity>>;
}

/** Each issue's days on the same columns as the health grid, active issues first. */
export function IssueTimeline({ days, diagnosed, issues, presence }: IssueTimelineProps) {
  const sorted = [...issues].sort(
    (a, b) =>
      Number(b.is_active) - Number(a.is_active) ||
      SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity] ||
      b.days_observed - a.days_observed
  );

  if (sorted.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No issues in this period.</p>;
  }

  return (
    <div className="space-y-3.5">
      <ul className="flex flex-wrap gap-3.5 text-xs text-muted-foreground">
        {(Object.keys(SEVERITY_LABELS) as IssueSeverity[]).map((severity) => (
          <li key={severity} className="flex items-center gap-1.5">
            <span className={cn("h-3 w-3 rounded-sm", SEVERITY_BAR_CLASSES[severity])} aria-hidden="true" />
            {SEVERITY_LABELS[severity]}
          </li>
        ))}
      </ul>
      <div className="overflow-x-auto">
        <ul className="min-w-[56rem]">
          {sorted.map((issue) => {
            const seen = presence.get(issue.issue_code);
            const status = !issue.is_active
              ? { text: "Resolved", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300" }
              : issue.current_streak_days <= 1
              ? { text: "New", className: "bg-primary/10 text-primary" }
              : {
                  text: `Ongoing · ${issue.current_streak_days} days`,
                  className: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300",
                };
            return (
              <li
                key={issue.issue_code}
                className="grid items-center gap-[3px] border-b border-border/60 py-2.5 last:border-0"
                style={dayGridStyle(days.length)}
              >
                <div className="min-w-0 space-y-1 pr-3">
                  <div className="text-sm font-medium leading-[18px] text-foreground" title={issue.issue_code}>
                    {issue.title}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={cn("rounded-full px-2 py-px font-semibold", status.className)}>{status.text}</span>
                    {SEVERITY_LABELS[issue.severity]} · {plural(issue.days_observed, "day")}
                  </div>
                </div>
                {days.map((date) => {
                  const severity = seen?.get(date);
                  if (!diagnosed.has(date)) return <NotDiagnosedCell key={date} date={date} className="h-[18px] rounded-sm" />;
                  return (
                    <span
                      key={date}
                      title={`${formatDiagnosisDate(date)}: ${severity ? SEVERITY_LABELS[severity].toLowerCase() : "not found"}`}
                      className={cn("h-[18px] rounded-sm", severity ? SEVERITY_BAR_CLASSES[severity] : "bg-muted")}
                    />
                  );
                })}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// ── Charge cycle ─────────────────────────────────────────────────────────────

interface ChargeCycleCardProps {
  component: string;
  days: string[];
  points: IndicatorSeriesPoint<ChargeCycleIndicator>[];
}

/** The daily low-to-high range of the charge metric on the grid's day columns, against the low-charge line. */
export function ChargeCycleCard({ component, days, points }: ChargeCycleCardProps) {
  const byDate = new Map(points.map((point) => [point.diagnosis_date, point]));
  const valid = points.filter((point) => typeof point.min === "number" && typeof point.max === "number");
  if (valid.length === 0) return null;

  const latest = [...valid].sort((a, b) => b.diagnosis_date.localeCompare(a.diagnosis_date))[0];
  const unit = latest.unit ? ` ${latest.unit}` : "";
  // Each day is judged against its own low-charge line; the axis label shows the latest one
  const ownThreshold = (point: IndicatorSeriesPoint<ChargeCycleIndicator>) =>
    typeof point.low_charge_threshold === "number" ? point.low_charge_threshold : null;
  const thresholds = valid.map(ownThreshold).filter((value): value is number => value !== null);
  const threshold =
    [...valid].sort((a, b) => b.diagnosis_date.localeCompare(a.diagnosis_date)).map(ownThreshold).find((value) => value !== null) ?? null;
  const dayThreshold = (point: IndicatorSeriesPoint<ChargeCycleIndicator> | undefined) => (point && ownThreshold(point)) ?? threshold;
  const sameLine = new Set(thresholds).size <= 1;
  const lows = valid.map((point) => point.min as number);
  const highs = valid.map((point) => point.max as number);
  const lo = Math.floor((Math.min(...lows, ...thresholds) - 0.1) * 10) / 10;
  const hi = Math.ceil((Math.max(...highs, ...thresholds) + 0.1) * 10) / 10;
  const toPct = (value: number) => ((value - lo) / (hi - lo)) * 100;

  const below = valid.filter((point) => {
    const line = dayThreshold(point);
    return line !== null && (point.min as number) < line;
  });
  const belowClocks = below.map((point) => utcClock(point.min_at)).filter((clock) => clock !== "—").sort();
  const sameStretch = belowClocks.length > 1 && belowClocks[0] < "12:00" && belowClocks[belowClocks.length - 1] < "12:00";
  const metric = (latest.metric || "charge").replace(/_/g, " ");
  const latestDay = formatDiagnosisDate(latest.diagnosis_date, "d MMM");

  return (
    <Card className="space-y-3.5 p-5 sm:px-6">
      <div className="flex flex-wrap justify-between gap-4">
        <div className="max-w-xl space-y-0.5">
          <h2 className="text-base font-semibold text-foreground">{humanizeComponent(component)} · charge cycle</h2>
          <p className="text-sm text-muted-foreground">
            {threshold === null
              ? `Daily range of ${metric}.`
              : below.length === 0
              ? `The ${metric} stayed above the ${sameLine ? `${threshold}${unit} ` : ""}low-charge line on every diagnosed day.`
              : `On ${below.length} of ${valid.length} days the ${metric} fell below the ${sameLine ? `${threshold}${unit} ` : ""}low-charge line${
                  sameStretch ? `, each time between ${belowClocks[0]} and ${belowClocks[belowClocks.length - 1]} UTC` : ""
                }.`}
          </p>
        </div>
        <dl className="flex flex-wrap gap-7">
          <Metric label={`Lowest on ${latestDay}`} value={`${latest.min}${unit}`} note={latest.min_at ? `${utcClock(latest.min_at)} UTC` : undefined} />
          {typeof latest.swing === "number" && <Metric label={`Swing on ${latestDay}`} value={`${+latest.swing.toFixed(2)}${unit}`} />}
          {typeof latest.hours_low_charge === "number" && threshold !== null && (
            <Metric label={`Below ${threshold}${unit} on ${latestDay}`} value={`${+latest.hours_low_charge.toFixed(1)} h`} />
          )}
        </dl>
      </div>
      <div className="overflow-x-auto">
        <div className="grid min-w-[56rem] gap-[3px] py-2" style={dayGridStyle(days.length)}>
          <div className="relative h-40 pr-3 text-right text-[11px] text-muted-foreground">
            <span className="absolute right-3 -top-1.5">{hi}{unit}</span>
            {threshold !== null && (
              <span className="absolute right-3 font-semibold text-red-700 dark:text-red-400" style={{ bottom: `calc(${toPct(threshold)}% - 7px)` }}>
                {threshold}{unit} low charge
              </span>
            )}
            <span className="absolute right-3 -bottom-1.5">{lo}{unit}</span>
          </div>
          {days.map((date) => {
            const point = byDate.get(date);
            const has = point && typeof point.min === "number" && typeof point.max === "number";
            const line = dayThreshold(point);
            return (
              <div
                key={date}
                className="relative h-40 border-b border-border"
                title={has ? `${formatDiagnosisDate(date)}: ${point!.min}–${point!.max}${unit}, average ${point!.mean}${unit}` : `${formatDiagnosisDate(date)}: no reading`}
              >
                {line !== null && (
                  <span className="absolute inset-x-0 h-px bg-red-300 dark:bg-red-500/60" style={{ bottom: `${toPct(line)}%` }} />
                )}
                {has && (
                  <>
                    <span
                      className={cn(
                        "absolute inset-x-[28%] rounded-full",
                        line !== null && (point!.min as number) < line ? "bg-orange-500" : "bg-slate-400 dark:bg-slate-500"
                      )}
                      style={{ bottom: `${toPct(point!.min as number)}%`, height: `${toPct(point!.max as number) - toPct(point!.min as number)}%` }}
                    />
                    {typeof point!.mean === "number" && (
                      <span className="absolute inset-x-[12%] h-0.5 bg-foreground" style={{ bottom: `${toPct(point!.mean)}%` }} />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <ul className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <li className="flex items-center gap-1.5"><span className="h-3.5 w-2.5 rounded-full bg-slate-400 dark:bg-slate-500" aria-hidden="true" />Daily range, lowest to highest</li>
        {threshold !== null && (
          <li className="flex items-center gap-1.5"><span className="h-3.5 w-2.5 rounded-full bg-orange-500" aria-hidden="true" />Range that dips below {sameLine ? `${threshold}${unit}` : "the day's low-charge line"}</li>
        )}
        <li className="flex items-center gap-1.5"><span className="h-0.5 w-3.5 bg-foreground" aria-hidden="true" />Daily average</li>
      </ul>
    </Card>
  );
}

const Metric: React.FC<{ label: string; value: string; note?: string }> = ({ label, value, note }) => (
  <div>
    <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
    <dd className="text-xl font-bold tabular-nums text-foreground">
      {value}
      {note && <span className="ml-1.5 text-sm font-medium text-muted-foreground">{note}</span>}
    </dd>
  </div>
);

// ── Coverage ─────────────────────────────────────────────────────────────────

/** Offline time over the period, split by what came before each outage, and offline hours per diagnosed day. */
export function CoverageCard({ component, points }: { component: string; points: IndicatorSeriesPoint<CoverageIndicator>[] }) {
  const days = [...points].sort((a, b) => a.diagnosis_date.localeCompare(b.diagnosis_date));
  if (days.length === 0) return null;
  const sum = (key: keyof CoverageIndicator) => days.reduce((total, day) => total + (Number(day[key]) || 0), 0);
  const offline = sum("offline_hours");
  const outages = sum("outage_count");
  const afterLow = sum("outages_after_low_charge");
  const healthy = sum("outages_with_healthy_charge");
  const unattributed = sum("outages_unattributed");
  const maxHours = Math.max(1, ...days.map((day) => Number(day.offline_hours) || 0));
  const withMissingRate = days.filter((day) => typeof day.missing_rate === "number");
  const interval = days[days.length - 1].expected_interval_seconds;
  const expectedEvery =
    typeof interval === "number" && interval > 0
      ? interval % 60 === 0
        ? `${interval / 60} min`
        : `${interval} s`
      : null;
  const parts = [
    { key: "low", label: "After low charge", count: afterLow, className: "bg-orange-500" },
    { key: "healthy", label: "With healthy charge", count: healthy, className: "bg-slate-400 dark:bg-slate-500" },
    { key: "unknown", label: "Unattributed", count: unattributed, className: "bg-slate-200 dark:bg-slate-700" },
  ];

  return (
    <Card className="space-y-3.5 p-5 sm:px-6">
      <div className="space-y-0.5">
        <h2 className="text-base font-semibold text-foreground">
          Data coverage{component !== "communication" && ` · ${humanizeComponent(component)}`}
        </h2>
        <p className="text-sm text-muted-foreground">
          {+offline.toFixed(1)} h offline in {plural(outages, "outage")} over {plural(days.length, "diagnosed day")}.
          {afterLow > 0 && ` ${afterLow} began right after low charge, so they trace back to power.`}
        </p>
      </div>
      {outages > 0 && (
        <>
          <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
            {parts.filter((part) => part.count > 0).map((part) => (
              <span key={part.key} className={part.className} style={{ width: `${(part.count / outages) * 100}%` }} />
            ))}
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
            {parts.map((part) => (
              <li key={part.key} className="flex items-center gap-1.5 text-muted-foreground">
                <span className={cn("h-2.5 w-2.5 rounded-full", part.className)} aria-hidden="true" />
                {part.label} <strong className="font-semibold tabular-nums text-foreground">{part.count}</strong>
              </li>
            ))}
          </ul>
        </>
      )}
      <DayBars
        title="Hours offline per diagnosed day · orange when an outage followed low charge"
        days={days}
        value={(day) => Number(day.offline_hours) || 0}
        max={maxHours}
        format={(hours) => hours.toFixed(1)}
        describe={(day, hours) => `${formatDiagnosisDate(day.diagnosis_date)}: ${hours} h offline`}
        fill={(day) => ((day.outages_after_low_charge || 0) > 0 ? "bg-orange-500" : "bg-slate-400 dark:bg-slate-500")}
      />
      {withMissingRate.length > 0 && (
        <DayBars
          title={`Readings missing per diagnosed day${expectedEvery ? ` · expected one every ${expectedEvery}` : ""}`}
          days={withMissingRate}
          value={(day) => (day.missing_rate as number) * 100}
          max={100}
          format={(pct) => `${Math.round(pct)}%`}
          describe={(day, pct) =>
            `${formatDiagnosisDate(day.diagnosis_date)}: ${Math.round(pct)}% missing (${day.records ?? "?"} of ${day.expected_records ?? "?"} readings)`
          }
          fill={() => "bg-slate-400 dark:bg-slate-500"}
        />
      )}
    </Card>
  );
}

type CoveragePoint = IndicatorSeriesPoint<CoverageIndicator>;

/** One bar per diagnosed day, labelled with its value, with the first and last day named underneath. */
function DayBars({
  title,
  days,
  value,
  max,
  format,
  describe,
  fill,
}: {
  title: string;
  days: CoveragePoint[];
  value: (day: CoveragePoint) => number;
  max: number;
  format: (value: number) => string;
  describe: (day: CoveragePoint, value: number) => string;
  fill: (day: CoveragePoint) => string;
}) {
  const columns = { gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` };
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{title}</span>
      <div className="grid h-28 items-end gap-2 border-b border-border" style={columns}>
        {days.map((day) => {
          const amount = value(day);
          return (
            <div key={day.diagnosis_date} className="flex h-full flex-col items-center justify-end gap-1" title={describe(day, amount)}>
              <span className="text-[11px] font-semibold tabular-nums text-foreground">{format(amount)}</span>
              <span className={cn("w-full max-w-7 rounded-t", fill(day))} style={{ height: `${(amount / Math.max(max, 1e-9)) * 80}%` }} />
            </div>
          );
        })}
      </div>
      <div className="grid gap-2" style={columns}>
        {days.map((day, index) => (
          <span key={day.diagnosis_date} className="text-center text-[11px] text-muted-foreground">
            {index === 0 || index === days.length - 1 ? formatDiagnosisDate(day.diagnosis_date, "d MMM") : Number(day.diagnosis_date.slice(8))}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Sensor pairs ─────────────────────────────────────────────────────────────

export interface SensorPair {
  component: string;
  other: string;
  latest: IndicatorSeriesPoint<AgreementIndicator>;
}

const num = (value: unknown, digits = 2) => (typeof value === "number" && Number.isFinite(value) ? value.toFixed(digits) : "—");

/** How closely each pair of sensors that measure the same thing agreed on its latest diagnosed day. */
export function SensorPairsCard({ pairs, trendNote }: { pairs: SensorPair[]; trendNote?: string | null }) {
  if (pairs.length === 0) return null;
  const withoutTolerance = pairs.filter((pair) => pair.latest.within_tolerance_rate === null || pair.latest.within_tolerance_rate === undefined);

  return (
    <Card className="space-y-3.5 p-5 sm:px-6">
      <div className="space-y-0.5">
        <h2 className="text-base font-semibold text-foreground">Sensor pairs</h2>
        <p className="text-sm text-muted-foreground">How closely paired sensors agreed, each on its latest diagnosed day.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] border-collapse text-sm tabular-nums">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th scope="col" className="py-2 pr-2 font-medium">Pair</th>
              <th scope="col" className="px-2 py-2 text-right font-medium">Correlation</th>
              <th scope="col" className="px-2 py-2 text-right font-medium">Mean / p95 error</th>
              <th scope="col" className="py-2 pl-2 text-right font-medium">Bias</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((pair) => (
              <tr key={`${pair.component}:${pair.other}`} className="border-b border-border/60 last:border-0">
                <td className="py-2.5 pr-2 font-medium text-foreground" title={`${pair.component} vs ${pair.other}`}>
                  {pair.latest.metric ? humanizeMetric(pair.latest.metric) : humanizeComponent(pair.component)}{" "}
                  <span className="text-muted-foreground">vs</span>{" "}
                  {pair.latest.other_metric ? humanizeMetric(pair.latest.other_metric) : humanizeComponent(pair.other)}
                  <span className="block text-xs font-normal text-muted-foreground">{formatDiagnosisDate(pair.latest.diagnosis_date, "d MMM")}</span>
                </td>
                <td className="px-2 py-2.5 text-right">{num(pair.latest.correlation)}</td>
                <td className="px-2 py-2.5 text-right">
                  {num(pair.latest.mean_abs_error)} / {num(pair.latest.p95_abs_error)}
                </td>
                <td className="py-2.5 pl-2 text-right" title="Positive: the first sensor reads higher">
                  {typeof pair.latest.bias === "number" && pair.latest.bias > 0 ? "+" : ""}
                  {num(pair.latest.bias)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {withoutTolerance.length > 0 && (
        <p className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
          <strong className="font-semibold text-foreground">
            {withoutTolerance.length === pairs.length ? "No tolerance set for these pairs," : `${plural(withoutTolerance.length, "pair")} without a tolerance,`}
          </strong>{" "}
          so they can never fail the “outside tolerance” check. Set one on the device profile.
        </p>
      )}
      {trendNote && <p className="text-sm text-muted-foreground">{trendNote}</p>}
    </Card>
  );
}

export const OpenDayButton: React.FC<{ date: string; onClick: () => void }> = ({ date, onClick }) => (
  <Button size="sm" onClick={onClick} className="h-9 gap-1.5">
    Open {formatDiagnosisDate(date, "d MMM")} diagnosis
    <AqArrowRight className="h-3.5 w-3.5" />
  </Button>
);
