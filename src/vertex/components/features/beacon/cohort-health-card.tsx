"use client";

import type {
  BeaconDiagnosticsSummary,
  BeaconHealthDevice,
  BeaconLifecycleState,
} from "@/app/types/beacon";
import { useCohortHealth, useHealthScope } from "@/core/hooks/useBeaconHealth";
import {
  type UptimeBand,
  formatLifecycleState,
  getBeaconUrl,
  getUptimeBand,
  isNotInBeacon,
} from "@/core/utils/beaconHealth";
import {
  type HealthSegment,
  HealthBadge,
  HealthCard,
  HealthCardError,
  HealthCardSkeleton,
  HealthLabel,
  HealthMessage,
  LIFECYCLE_FILLS,
  NOT_DIAGNOSED_FILL,
  NotInBeaconCard,
  SegmentedBar,
  SummaryBadge,
  TopIssues,
  UPTIME_BANDS,
  UptimeStat,
} from "./health-card";

const TITLE = "Cohort Health";

// Worst first, so the bar reads from what needs attention to what doesn't
const STATE_ORDER: BeaconLifecycleState[] = [
  "FAILED",
  "LIKELY_FAILURE",
  "SUSPICIOUS",
  "DEGRADING",
  "RECOVERING",
  "HEALTHY",
  "NO_DATA",
];

const getStateSegments = (summary: BeaconDiagnosticsSummary): HealthSegment[] => [
  ...STATE_ORDER.map((state) => ({
    key: state,
    label: formatLifecycleState(state).toLowerCase(),
    count: summary.lifecycle_state_counts[state] ?? 0,
    fill: LIFECYCLE_FILLS[state],
  })),
  {
    key: "not-diagnosed",
    label: "not diagnosed",
    count: summary.devices_not_diagnosed,
    fill: NOT_DIAGNOSED_FILL,
  },
];

const getUptimeSegments = (devices: BeaconHealthDevice[]): HealthSegment[] => {
  const bands: UptimeBand[] = ["good", "moderate", "critical", "no-data"];
  return bands.map((band) => ({
    key: band,
    label: UPTIME_BANDS[band].label.toLowerCase(),
    count: devices.filter((device) => getUptimeBand(device.uptime) === band).length,
    fill: UPTIME_BANDS[band].fill,
  }));
};

export default function CohortHealthCard({ cohortId }: { cohortId: string }) {
  const { data: cohort, isLoading, error, refetch } = useCohortHealth(cohortId);
  const { linkGroup } = useHealthScope();
  const beaconHref = getBeaconUrl(`/dashboard/analytics/${encodeURIComponent(cohortId)}`, linkGroup);

  if (isLoading) return <HealthCardSkeleton title={TITLE} />;
  if (isNotInBeacon(error)) return <NotInBeaconCard title={TITLE} noun="cohort" />;
  if (!cohort) {
    return <HealthCardError title={TITLE} beaconHref={beaconHref} onRetry={() => void refetch()} />;
  }

  const summary = cohort.diagnostics_summary;
  if (!summary || summary.devices_total === 0) {
    return (
      <HealthCard title={TITLE} badge={<HealthBadge tone="gray">Not diagnosed</HealthBadge>} beaconHref={beaconHref}>
        <HealthMessage title="No devices to summarise">This cohort has no devices in Beacon yet.</HealthMessage>
      </HealthCard>
    );
  }

  const hasUptime = cohort.uptime !== null && cohort.uptime !== undefined;

  return (
    <HealthCard
      title={TITLE}
      badge={<SummaryBadge summary={summary} />}
      diagnosedOn={summary.latest_diagnosis_date}
      beaconHref={beaconHref}
    >
      {hasUptime && (
        <div className="flex flex-col gap-2">
          <UptimeStat uptime={cohort.uptime} />
          <SegmentedBar label="Devices by uptime" segments={getUptimeSegments(cohort.devices ?? [])} />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <HealthLabel>Device states</HealthLabel>
        <SegmentedBar label="Device states" segments={getStateSegments(summary)} />
      </div>

      {summary.top_issues.length > 0 && <TopIssues issues={summary.top_issues} />}
    </HealthCard>
  );
}
