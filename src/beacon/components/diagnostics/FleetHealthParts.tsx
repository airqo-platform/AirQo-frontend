"use client";

import React, { useRef, useState } from "react";
import type { ComponentType } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AqBatteryLow,
  AqCalendar,
  AqChevronLeft,
  AqChevronRight,
  AqCpuChip01,
  AqSignal01,
  AqWifiOff,
} from "@airqo/icons-react";
import { getLifecycleConfig } from "@/components/diagnostics/HealthScoreGauge";
import { formatDiagnosisDate } from "@/components/diagnostics/DiagnosticBadges";
import { Button } from "@/components/ui/button";
import { shiftDiagnosisDate } from "@/lib/fleet-health";
import { cn } from "@/lib/utils";
import { SEVERITY_ORDER } from "@/types/diagnostics";
import type { IssueSeverity, LifecycleState } from "@/types/diagnostics";

// The route and the diagnostics API use the device id; the name is only carried along for display.
export const deviceDiagnosticsHref = (deviceId: string, deviceName?: string | null) =>
  `/dashboard/devices/${encodeURIComponent(deviceId)}/diagnostics${deviceName ? `?name=${encodeURIComponent(deviceName)}` : ""}`;

export const yesterdayUtc = () => new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

/** Shown when the day had more issues than the page fetches, so counts and lists are incomplete. */
export const TruncatedNotice: React.FC<{ count: number }> = ({ count }) => (
  <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
    <strong className="font-semibold">Showing the first {count.toLocaleString()} issues of this day.</strong> The day has
    more, so counts and lists here are incomplete.
  </p>
);

/**
 * With `href`, goes to that parent page. Otherwise goes back in the tab's history, or to
 * `fallbackHref` when the tab has none (a page opened in a new tab).
 */
export const BackButton: React.FC<{ href?: string; fallbackHref?: string; label?: string }> = ({
  href,
  fallbackHref,
  label = "Back",
}) => {
  const router = useRouter();
  const content = (
    <>
      <AqChevronLeft className="h-4 w-4" />
      {label}
    </>
  );
  if (href) {
    return (
      <Button asChild variant="outline" size="sm" className="h-8 gap-1 pl-2 text-foreground">
        <Link href={href}>{content}</Link>
      </Button>
    );
  }
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => (window.history.length > 1 || !fallbackHref ? router.back() : router.push(fallbackHref))}
      className="h-8 gap-1 pl-2 text-foreground"
    >
      {content}
    </Button>
  );
};

export const SEVERITY_LABELS: Record<IssueSeverity, string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

const SEVERITY_PILL_CLASSES: Record<IssueSeverity, string> = {
  CRITICAL: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300",
  MEDIUM: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  LOW: "bg-muted text-muted-foreground",
};

// Darker for more severe, so the scale reads without telling hues apart.
export const SEVERITY_BAR_CLASSES: Record<IssueSeverity | "NONE", string> = {
  CRITICAL: "bg-red-700 dark:bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-amber-400",
  LOW: "bg-slate-300 dark:bg-slate-500",
  NONE: "bg-emerald-200 dark:bg-emerald-700",
};

export const LIFECYCLE_BAR_CLASSES: Record<string, string> = {
  HEALTHY: "bg-emerald-500",
  DEGRADING: "bg-amber-400",
  SUSPICIOUS: "bg-orange-500",
  LIKELY_FAILURE: "bg-red-700 dark:bg-red-500",
  FAILED: "bg-red-950 dark:bg-red-800",
  RECOVERING: "bg-blue-500",
  NO_DATA: "bg-slate-300 dark:bg-slate-600",
};

/** "LIKELY_FAILURE" → "Likely failure". */
export const lifecycleLabel = (state: LifecycleState | string): string => {
  const label = getLifecycleConfig(state as LifecycleState).label.toLowerCase();
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const SeverityPill: React.FC<{ severity: IssueSeverity; className?: string }> = ({ severity, className }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
      SEVERITY_PILL_CLASSES[severity] || SEVERITY_PILL_CLASSES.LOW,
      className
    )}
  >
    {SEVERITY_LABELS[severity] || severity}
  </span>
);

/** A health score as a pill, toned like the severity it amounts to. */
export const ScorePill: React.FC<{ score: number }> = ({ score }) => {
  const severity: IssueSeverity = score < 50 ? "CRITICAL" : score < 70 ? "HIGH" : score < 85 ? "MEDIUM" : "LOW";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap tabular-nums",
        SEVERITY_PILL_CLASSES[severity]
      )}
    >
      Score {score.toFixed(1)}
    </span>
  );
};

export const NewPill: React.FC<{ className?: string; children?: React.ReactNode }> = ({ className, children = "New" }) => (
  <span className={cn("inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary", className)}>
    {children}
  </span>
);

export interface BarSegment {
  key: string;
  label: string;
  count: number;
  className: string;
}

/** Segments side by side on one track, each as wide as its share of `total`. */
export const StackedBar: React.FC<{ segments: BarSegment[]; total: number; className?: string }> = ({
  segments,
  total,
  className,
}) => (
  <div className={cn("flex h-2 w-full gap-0.5 overflow-hidden rounded-full bg-muted", className)} aria-hidden="true">
    {total > 0 &&
      segments
        .filter((segment) => segment.count > 0)
        .map((segment) => (
          <div
            key={segment.key}
            className={segment.className}
            style={{ width: `${(segment.count / total) * 100}%` }}
            title={`${segment.label}: ${segment.count}`}
          />
        ))}
  </div>
);

export const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;

/** "A battery fault is the likely cause on all 10 of the day's lowest-scoring devices." */
export const likelyCauseText = (count: number, lowestScoringTotal: number, noun: string): string =>
  `A ${noun} fault is the likely cause on ${
    count === lowestScoringTotal ? `all ${count}` : `${count} of the ${lowestScoringTotal}`
  } of the day's lowest-scoring devices.`;

/** Severity counts as bar segments, most severe first; `withNone` adds devices without issues. */
export const severitySegments = (counts: Partial<Record<string, number>>, withNone = false): BarSegment[] =>
  [...SEVERITY_ORDER, ...(withNone ? (["NONE"] as const) : [])].map((severity) => ({
    key: severity,
    label: severity === "NONE" ? "No issues" : SEVERITY_LABELS[severity],
    count: counts[severity] || 0,
    className: SEVERITY_BAR_CLASSES[severity],
  }));

export const BarLegend: React.FC<{ segments: BarSegment[]; className?: string }> = ({ segments, className }) => (
  <ul className={cn("flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground", className)}>
    {segments.map((segment) => (
      <li key={segment.key} className="flex items-center gap-1.5">
        <span className={cn("h-2.5 w-2.5 rounded-full", segment.className)} aria-hidden="true" />
        {segment.label} <span className="font-semibold text-foreground tabular-nums">{segment.count}</span>
      </li>
    ))}
  </ul>
);

export interface DistributionRow {
  key: string;
  label: string;
  count: number;
  barClassName: string;
  /** Shown without its colour dot, e.g. for buckets of time rather than states. */
  plain?: boolean;
}

/** One labelled bar per row, all on the scale of `max`. */
export const DistributionList: React.FC<{ rows: DistributionRow[]; max: number }> = ({ rows, max }) => (
  <ul className="space-y-2.5">
    {rows.map((row) => (
      <li key={row.key} className="grid grid-cols-[7.5rem_minmax(0,1fr)_2.5rem] items-center gap-2.5 text-sm">
        <span className="flex items-center gap-2 text-foreground">
          {!row.plain && <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", row.barClassName)} aria-hidden="true" />}
          {row.label}
        </span>
        <span className="flex h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
          <span className={row.barClassName} style={{ width: max > 0 ? `${(row.count / max) * 100}%` : 0 }} />
        </span>
        <span className={cn("text-right font-semibold tabular-nums", row.count === 0 ? "text-muted-foreground" : "text-foreground")}>
          {row.count}
        </span>
      </li>
    ))}
  </ul>
);

/** Devices with a finding split into those where it persists and those where it is new today. */
export const NewVsPersistingBar: React.FC<{ count: number; newCount: number; scale: number }> = ({
  count,
  newCount,
  scale,
}) => (
  <span className="flex h-2 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
    <span className="bg-slate-400 dark:bg-slate-500" style={{ width: `${((count - newCount) / scale) * 100}%` }} />
    <span className="bg-primary" style={{ width: `${(newCount / scale) * 100}%` }} />
  </span>
);

export const NewVsPersistingLegend: React.FC = () => (
  <span className="flex items-center gap-3.5 text-xs text-muted-foreground">
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm bg-primary" aria-hidden="true" />
      New
    </span>
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm bg-slate-400 dark:bg-slate-500" aria-hidden="true" />
      Persisting
    </span>
  </span>
);

type IconComponent = ComponentType<{ className?: string; size?: number | string }>;

const SUBSYSTEM_ICONS: Record<string, IconComponent> = {
  battery: AqBatteryLow,
  sensor: AqSignal01,
  connectivity: AqWifiOff,
};

export const SubsystemIcon: React.FC<{ subsystem: string; urgent?: boolean; className?: string }> = ({
  subsystem,
  urgent = false,
  className,
}) => {
  const Icon = SUBSYSTEM_ICONS[subsystem] || AqCpuChip01;
  return (
    <span
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
        urgent ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300" : "bg-muted text-foreground",
        className
      )}
      aria-hidden="true"
    >
      <Icon className="h-5 w-5" />
    </span>
  );
};

/** "New today", or how many days in a row the longest-running of the shown issues has been found. */
export const OngoingCell: React.FC<{ days: number; since: string | null }> = ({ days, since }) =>
  days <= 1 ? (
    <span className="font-medium text-foreground">New today</span>
  ) : (
    <>
      <span className="block font-medium text-foreground">{days} days</span>
      {since && <span className="block text-xs text-muted-foreground">since {formatDiagnosisDate(since, "d MMM")}</span>}
    </>
  );

interface DiagnosisDayPickerProps {
  /** The day on screen, `YYYY-MM-DD`. */
  shownDate: string | null;
  /** The day the viewer chose; empty means the latest diagnosed day. */
  selectedDate: string;
  onChange: (date: string) => void;
}

/** Steps through diagnosis days; the middle opens the browser's date picker. */
export const DiagnosisDayPicker: React.FC<DiagnosisDayPickerProps> = ({ shownDate, selectedDate, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  // Browsers that can't open the picker from a button get the date field itself instead
  const [showField, setShowField] = useState(false);
  const maxDate = yesterdayUtc();
  const isLatest = !selectedDate;
  const nextDate = shownDate ? shiftDiagnosisDate(shownDate, 1) : null;

  const openPicker = () => {
    const input = inputRef.current;
    try {
      if (!input || typeof input.showPicker !== "function") throw new Error("showPicker unavailable");
      input.showPicker();
    } catch {
      setShowField(true);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex h-10 items-center rounded-md border border-input bg-background">
        <button
          type="button"
          aria-label="Previous day"
          disabled={!shownDate}
          onClick={() => shownDate && onChange(shiftDiagnosisDate(shownDate, -1))}
          className="flex h-full w-10 items-center justify-center rounded-l-md border-r border-input text-foreground hover:bg-accent disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <AqChevronLeft className="h-4 w-4" />
        </button>
        <div className="relative flex h-full">
          {showField ? (
            <input
              type="date"
              aria-label="Diagnosis day (UTC)"
              value={shownDate || ""}
              max={maxDate}
              autoFocus
              onChange={(e) => e.target.value && onChange(e.target.value)}
              onBlur={() => setShowField(false)}
              className="h-full bg-transparent px-3 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          ) : (
            <button
              type="button"
              onClick={openPicker}
              title="Diagnosis day (UTC)"
              className="flex h-full items-center gap-2 px-3 text-sm font-medium text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <AqCalendar className="h-4 w-4" />
              {shownDate ? formatDiagnosisDate(shownDate, "EEE d MMM yyyy") : "Latest day"}
              {isLatest && (
                <span className="rounded-full bg-primary/10 px-2 py-px text-xs font-semibold text-primary">Latest</span>
              )}
            </button>
          )}
          <input
            ref={inputRef}
            type="date"
            value={shownDate || ""}
            max={maxDate}
            onChange={(e) => e.target.value && onChange(e.target.value)}
            tabIndex={-1}
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 h-px w-px opacity-0"
          />
        </div>
        <button
          type="button"
          aria-label="Next day"
          disabled={isLatest || !nextDate || nextDate > maxDate}
          onClick={() => nextDate && onChange(nextDate)}
          className="flex h-full w-10 items-center justify-center rounded-r-md border-l border-input text-foreground hover:bg-accent disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <AqChevronRight className="h-4 w-4" />
        </button>
      </div>
      {!isLatest && (
        <Button variant="ghost" size="sm" onClick={() => onChange("")} className="h-10">
          Latest
        </Button>
      )}
    </div>
  );
};
