"use client";

import type { BeaconDeviceIssue, BeaconDeviceIssueSummary } from "@/app/types/beacon";
import { useDeviceHealth, useHealthScope } from "@/core/hooks/useBeaconHealth";
import {
  type DailyUptime,
  formatHealthDate,
  formatLifecycleState,
  getBeaconUrl,
  getDailyUptime,
  getLastDayWithData,
  getLikelyCause,
  hasRecentData,
  isDiagnosisStale,
} from "@/core/utils/beaconHealth";
import {
  DailyUptimeBars,
  HealthBadge,
  HealthCard,
  HealthCardError,
  HealthCardSkeleton,
  HealthLabel,
  HealthMessage,
  IssueRow,
  StateBadge,
  UptimeStat,
} from "./health-card";

const TITLE = "Device Health";
const ISSUES_SHOWN = 2;

const formatStreak = (days: number) => `${days} ${days === 1 ? "day" : "days"}`;

const getLatestScore = (summary: BeaconDeviceIssueSummary): number | null => {
  const latest = summary.health_trend.find(
    (point) => point.diagnosis_date === summary.latest_diagnosis_date
  );
  return latest ? Math.round(latest.overall_health_score) : null;
};

/** The most recently cleared issue, to show that a device with none open had some lately. */
const getLastCleared = (issues: BeaconDeviceIssue[]) =>
  issues
    .filter((issue) => !issue.is_active)
    .sort((a, b) => b.last_seen.localeCompare(a.last_seen))[0];

const OpenIssues = ({ issues }: { issues: BeaconDeviceIssue[] }) => {
  const open = issues.filter((issue) => issue.is_active);

  if (open.length === 0) {
    const cleared = getLastCleared(issues);
    return (
      <div className="flex flex-col gap-0.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <HealthLabel>Open issues</HealthLabel>
          <span className="text-sm font-medium">None</span>
        </div>
        {cleared && (
          <span className="text-xs text-muted-foreground">
            {cleared.title} cleared after {formatHealthDate(cleared.last_seen)}.
          </span>
        )}
      </div>
    );
  }

  const hidden = open.length - ISSUES_SHOWN;
  return (
    <div className="flex flex-col gap-2">
      <HealthLabel>Open issues ({open.length})</HealthLabel>
      {open.slice(0, ISSUES_SHOWN).map((issue) => (
        <IssueRow
          key={issue.issue_code}
          title={issue.title}
          severity={issue.severity}
          detail={formatStreak(issue.current_streak_days)}
        />
      ))}
      {hidden > 0 && <span className="text-xs text-muted-foreground">and {hidden} more</span>}
    </div>
  );
};

/** A diagnosis this old may no longer describe the device, whatever it said at the time. */
const OutOfDateDiagnosis = ({
  summary,
  days,
  dataKnown,
}: {
  summary: BeaconDeviceIssueSummary;
  days: DailyUptime[];
  dataKnown: boolean;
}) => {
  const diagnosedOn = formatHealthDate(summary.latest_diagnosis_date as string);
  const lastDay = getLastDayWithData(days);
  const stillSending = !dataKnown || hasRecentData(lastDay);
  const state = summary.latest_lifecycle_state;
  const score = getLatestScore(summary);
  const lastResult = state ? `${formatLifecycleState(state)}${score === null ? "" : ` (${score}/100)`}` : null;

  // Says what Beacon has rather than what the device did: a stalled sync looks the same from here
  let title = `No diagnosis since ${diagnosedOn}`;
  if (!stillSending) {
    title = lastDay
      ? `No readings in Beacon since ${formatHealthDate(lastDay)}`
      : "No readings in Beacon in the last 14 days";
  }

  return (
    <HealthMessage title={title}>
      {lastResult ? `Its last diagnosis was ${lastResult}. ` : ""}That may be out of date.
    </HealthMessage>
  );
};

interface DeviceHealthCardProps {
  deviceId: string;
  deviceName: string;
}

export default function DeviceHealthCard({ deviceId, deviceName }: DeviceHealthCardProps) {
  const { issues, performance, window } = useDeviceHealth(deviceId, deviceName);
  const { linkGroup } = useHealthScope();
  const beaconHref = getBeaconUrl(
    `/dashboard/devices/${encodeURIComponent(deviceId)}/diagnostics`,
    linkGroup
  );

  if (issues.isLoading || performance.isLoading) return <HealthCardSkeleton title={TITLE} />;

  if (!issues.data) {
    return (
      <HealthCardError kind="device"
        title={TITLE}
        beaconHref={beaconHref}
        onRetry={() => {
          void issues.refetch();
          void performance.refetch();
        }}
      />
    );
  }

  const summary = issues.data;
  const uptime = performance.data?.uptime;
  const dataKnown = Boolean(performance.data);
  const days = dataKnown ? getDailyUptime(performance.data?.data, window) : [];
  const retryUptime = performance.isError ? () => void performance.refetch() : undefined;
  const uptimeBlock = (
    <div className="flex flex-col gap-2">
      <UptimeStat uptime={uptime} onRetry={retryUptime} />
      {days.length > 0 && <DailyUptimeBars days={days} />}
    </div>
  );

  if (summary.days_diagnosed === 0 || !summary.latest_diagnosis_date) {
    return (
      <HealthCard kind="device" title={TITLE} badge={<HealthBadge tone="gray">Not diagnosed</HealthBadge>} beaconHref={beaconHref}>
        {uptimeBlock}
        <HealthMessage title="No diagnosis in the last 14 days">
          Beacon only diagnoses a device on days it has readings from it.
        </HealthMessage>
      </HealthCard>
    );
  }

  if (isDiagnosisStale(summary.latest_diagnosis_date)) {
    return (
      <HealthCard kind="device"
        title={TITLE}
        badge={<HealthBadge tone="gray">No recent diagnosis</HealthBadge>}
        diagnosedOn={summary.latest_diagnosis_date}
        beaconHref={beaconHref}
      >
        {uptimeBlock}
        <OutOfDateDiagnosis summary={summary} days={days} dataKnown={dataKnown} />
      </HealthCard>
    );
  }

  const score = getLatestScore(summary);
  const cause = getLikelyCause(summary.latest_headline);

  return (
    <HealthCard kind="device"
      title={TITLE}
      badge={summary.latest_lifecycle_state ? <StateBadge state={summary.latest_lifecycle_state} /> : undefined}
      diagnosedOn={summary.latest_diagnosis_date}
      beaconHref={beaconHref}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between gap-3">
          <UptimeStat uptime={uptime} onRetry={retryUptime} />
          {score !== null && (
            <div className="flex flex-col gap-1 text-right">
              <HealthLabel>Health</HealthLabel>
              <span className="text-2xl font-bold tracking-tight">
                {score}
                <span className="text-sm font-normal tracking-normal text-muted-foreground">/100</span>
              </span>
            </div>
          )}
        </div>
        {days.length > 0 && <DailyUptimeBars days={days} />}
      </div>

      {cause && (
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <HealthLabel>Likely cause</HealthLabel>
          <span className="text-sm font-semibold">
            {cause.title} ({cause.confidence}% confidence)
          </span>
        </div>
      )}

      <OpenIssues issues={summary.issues} />
    </HealthCard>
  );
}
