"use client";

import type { ReactNode } from "react";
import { AqLinkExternal01 } from "@airqo/icons-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  BeaconDiagnosticsSummary,
  BeaconIssueSeverity,
  BeaconLifecycleState,
  BeaconSummaryIssue,
} from "@/app/types/beacon";
import {
  type DailyUptime,
  type UptimeBand,
  formatHealthDate,
  formatLifecycleState,
  getUptimeBand,
  isDiagnosisStale,
} from "@/core/utils/beaconHealth";

type HealthTone = "green" | "blue" | "amber" | "orange" | "red" | "gray";

// The same fills as Beacon's diagnosis badges, so a state reads the same in both apps.
const TONE_CLASSES: Record<HealthTone, string> = {
  green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  orange: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300",
  red: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  gray: "bg-muted text-muted-foreground",
};

const STATE_TONES: Record<BeaconLifecycleState, HealthTone> = {
  HEALTHY: "green",
  RECOVERING: "blue",
  DEGRADING: "amber",
  SUSPICIOUS: "orange",
  LIKELY_FAILURE: "red",
  FAILED: "red",
  NO_DATA: "gray",
};

const SEVERITY_TONES: Record<BeaconIssueSeverity, HealthTone> = {
  CRITICAL: "red",
  HIGH: "orange",
  MEDIUM: "amber",
  LOW: "gray",
};

const SEVERITY_DOT_CLASSES: Record<BeaconIssueSeverity, string> = {
  CRITICAL: "bg-red-700 dark:bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-amber-400",
  LOW: "bg-slate-400",
};

const SEVERITY_LABELS: Record<BeaconIssueSeverity, string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export const UPTIME_BANDS: Record<UptimeBand, { label: string; fill: string }> = {
  good: { label: "Good", fill: "bg-green-500" },
  moderate: { label: "Moderate", fill: "bg-orange-500" },
  critical: { label: "Critical", fill: "bg-red-500" },
  "no-data": { label: "No data", fill: "bg-slate-400" },
};

export const LIFECYCLE_FILLS: Record<BeaconLifecycleState, string> = {
  HEALTHY: "bg-emerald-500",
  RECOVERING: "bg-blue-500",
  DEGRADING: "bg-amber-400",
  SUSPICIOUS: "bg-orange-500",
  LIKELY_FAILURE: "bg-red-700 dark:bg-red-500",
  FAILED: "bg-red-950 dark:bg-red-800",
  NO_DATA: "bg-slate-300 dark:bg-slate-600",
};

export const NOT_DIAGNOSED_FILL = "bg-slate-300 dark:bg-slate-600";

export const HealthLabel = ({ children }: { children: ReactNode }) => (
  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
    {children}
  </span>
);

export const HealthBadge = ({ tone, children }: { tone: HealthTone; children: ReactNode }) => (
  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", TONE_CLASSES[tone])}>
    {children}
  </span>
);

export const StateBadge = ({ state }: { state: BeaconLifecycleState }) => (
  <HealthBadge tone={STATE_TONES[state]}>{formatLifecycleState(state)}</HealthBadge>
);

/** The headline state of a site or cohort, from the roll-up of its devices' diagnoses. */
export const SummaryBadge = ({ summary }: { summary: BeaconDiagnosticsSummary }) => {
  const { devices_total, devices_diagnosed, devices_with_issues, devices_not_diagnosed } = summary;

  if (devices_diagnosed === 0) return <HealthBadge tone="gray">Not diagnosed</HealthBadge>;
  if (isDiagnosisStale(summary.latest_diagnosis_date)) {
    return <HealthBadge tone="gray">No recent diagnosis</HealthBadge>;
  }

  if (devices_total === 1) {
    const [state] = Object.keys(summary.lifecycle_state_counts) as BeaconLifecycleState[];
    if (state) return <StateBadge state={state} />;
  }
  if (devices_with_issues > 0) {
    return (
      <HealthBadge tone={summary.max_severity ? SEVERITY_TONES[summary.max_severity] : "gray"}>
        {devices_with_issues} of {devices_total} with issues
      </HealthBadge>
    );
  }
  if (devices_not_diagnosed > 0) {
    return (
      <HealthBadge tone="gray">
        {devices_diagnosed} of {devices_total} diagnosed
      </HealthBadge>
    );
  }
  return <HealthBadge tone="green">Healthy</HealthBadge>;
};

export const UptimeStat = ({ uptime }: { uptime?: number | null }) => {
  const band = UPTIME_BANDS[getUptimeBand(uptime)];

  return (
    <div className="flex flex-col gap-1">
      <HealthLabel>Uptime, 14 days</HealthLabel>
      {uptime === null || uptime === undefined ? (
        <span className="text-sm text-muted-foreground">Not available</span>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight">{Math.round(uptime)}%</span>
          <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", band.fill)} />
          <span className="text-sm text-muted-foreground">{band.label}</span>
        </div>
      )}
    </div>
  );
};

export const DailyUptimeBars = ({ days }: { days: DailyUptime[] }) => (
  <div
    role="img"
    aria-label={`Daily uptime from ${formatHealthDate(days[0].date)} to ${formatHealthDate(days[days.length - 1].date)}`}
    className="flex h-7 items-end gap-0.5"
  >
    {days.map(({ date, percent }) => (
      <div
        key={date.toISOString()}
        title={`${formatHealthDate(date)}: ${Math.round(percent)}%`}
        style={{ height: `${Math.max(percent, 7)}%` }}
        className={cn("flex-1 rounded-[1px]", UPTIME_BANDS[getUptimeBand(percent)].fill)}
      />
    ))}
  </div>
);

export interface HealthSegment {
  key: string;
  label: string;
  count: number;
  fill: string;
}

export const SegmentedBar = ({ label, segments }: { label: string; segments: HealthSegment[] }) => {
  const visible = segments.filter((segment) => segment.count > 0);

  return (
    <div className="flex flex-col gap-2">
      <div
        role="img"
        aria-label={`${label}: ${visible.map((s) => `${s.count} ${s.label}`).join(", ")}`}
        className="flex h-2.5 gap-0.5"
      >
        {visible.map((segment) => (
          <div
            key={segment.key}
            style={{ flex: `${segment.count} 1 0` }}
            className={cn("rounded-[3px]", segment.fill)}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {visible.map((segment) => (
          <span key={segment.key} className="flex items-center gap-1">
            <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", segment.fill)} />
            {segment.count} {segment.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export const IssueRow = ({
  title,
  severity,
  detail,
}: {
  title: string;
  severity: BeaconIssueSeverity;
  detail: string;
}) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-sm">{title}</span>
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", SEVERITY_DOT_CLASSES[severity])} />
      {SEVERITY_LABELS[severity]}, {detail}
    </span>
  </div>
);

const formatDeviceCount = (count: number) => `${count} ${count === 1 ? "device" : "devices"}`;

export const TopIssues = ({ issues, limit = 2 }: { issues: BeaconSummaryIssue[]; limit?: number }) => (
  <div className="flex flex-col gap-2">
    <HealthLabel>Top issues</HealthLabel>
    {issues.slice(0, limit).map((issue) => (
      <IssueRow
        key={issue.issue_code}
        title={issue.title}
        severity={issue.severity}
        detail={formatDeviceCount(issue.device_count)}
      />
    ))}
  </div>
);

export const HealthMessage = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="flex flex-col gap-1">
    <span className="text-sm font-semibold">{title}</span>
    <span className="text-sm text-muted-foreground">{children}</span>
  </div>
);

interface HealthCardProps {
  title: string;
  badge?: ReactNode;
  diagnosedOn?: string | null;
  beaconHref?: string;
  onRetry?: () => void;
  children: ReactNode;
}

const FOOTER_ACTION_CLASSES =
  "inline-flex min-h-11 items-center gap-1.5 rounded-sm text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const HealthCard = ({
  title,
  badge,
  diagnosedOn,
  beaconHref,
  onRetry,
  children,
}: HealthCardProps) => (
  <Card className="w-full rounded-lg overflow-hidden">
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b">
      <h2 className="text-lg font-semibold">{title}</h2>
      {badge}
    </div>
    <div className="flex flex-col gap-4 p-4">{children}</div>
    {(diagnosedOn || beaconHref || onRetry) && (
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 border-t">
        {onRetry ? (
          <button type="button" onClick={onRetry} className={FOOTER_ACTION_CLASSES}>
            Try again
          </button>
        ) : (
          <span className="text-xs text-muted-foreground">
            {diagnosedOn && `Diagnosed ${formatHealthDate(diagnosedOn)}`}
          </span>
        )}
        {beaconHref && (
          <a href={beaconHref} target="_blank" rel="noopener noreferrer" className={FOOTER_ACTION_CLASSES}>
            Open in Beacon
            <AqLinkExternal01 aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
      </div>
    )}
  </Card>
);

export const HealthCardSkeleton = ({ title }: { title: string }) => (
  <HealthCard title={title}>
    <div data-testid="health-card-skeleton" className="flex animate-pulse flex-col gap-3">
      <div className="h-3 w-2/5 rounded bg-muted" />
      <div className="h-8 w-1/3 rounded bg-muted" />
      <div className="h-7 rounded bg-muted" />
      <div className="h-3 w-3/4 rounded bg-muted" />
      <div className="h-3 w-1/2 rounded bg-muted" />
    </div>
  </HealthCard>
);

export const HealthCardError = ({
  title,
  beaconHref,
  onRetry,
}: {
  title: string;
  beaconHref: string;
  onRetry: () => void;
}) => (
  <HealthCard title={title} beaconHref={beaconHref} onRetry={onRetry}>
    <HealthMessage title="Couldn't load health from Beacon">
      The rest of this page isn&apos;t affected.
    </HealthMessage>
  </HealthCard>
);

export const NotInBeaconCard = ({ title, noun }: { title: string; noun: "cohort" | "site" }) => (
  <HealthCard title={title} badge={<HealthBadge tone="gray">Not in Beacon yet</HealthBadge>}>
    <HealthMessage title={`Beacon hasn't synced this ${noun} yet`}>
      Health shows here after its next sync.
    </HealthMessage>
  </HealthCard>
);
