"use client";

import Link from "next/link";
import type { BeaconHealthDevice } from "@/app/types/beacon";
import { useHealthScope, useSiteHealth } from "@/core/hooks/useBeaconHealth";
import {
  formatHealthDate,
  formatLifecycleState,
  getBeaconUrl,
  getDailyUptime,
  getDiagnosisAsOf,
  isDiagnosisStale,
  isNotInBeacon,
  sortDevicesByHealth,
} from "@/core/utils/beaconHealth";
import {
  DailyUptimeBars,
  HealthBadge,
  HealthCard,
  HealthCardError,
  HealthCardSkeleton,
  HealthLabel,
  HealthMessage,
  NotInBeaconCard,
  StateBadge,
  SummaryBadge,
  TopIssues,
  UptimeStat,
} from "./health-card";

const TITLE = "Site Health";
const DEVICES_SHOWN = 3;

const DeviceRow = ({ device, href }: { device: BeaconHealthDevice; href: string }) => {
  const diagnosis = device.diagnostics;
  const isOld = isDiagnosisStale(diagnosis?.diagnosis_date);
  const uptime = device.uptime === null || device.uptime === undefined ? null : `${Math.round(device.uptime)}%`;
  const detail = [diagnosis && !isOld && `${Math.round(diagnosis.overall_health_score)}/100`, uptime]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={href}
      className="flex min-h-10 flex-wrap items-center justify-between gap-x-2 gap-y-1 rounded-sm text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="font-medium">{device.device_name}</span>
      <span className="flex items-center gap-2 whitespace-nowrap">
        {!diagnosis && <HealthBadge tone="gray">No diagnosis</HealthBadge>}
        {diagnosis && isOld && (
          <HealthBadge tone="gray">
            {formatLifecycleState(diagnosis.lifecycle_state)} on {formatHealthDate(diagnosis.diagnosis_date)}
          </HealthBadge>
        )}
        {diagnosis && !isOld && <StateBadge state={diagnosis.lifecycle_state} />}
        <span className="text-xs text-muted-foreground">{detail}</span>
      </span>
    </Link>
  );
};

interface SiteHealthCardProps {
  siteId: string;
  /** Where a device row goes: /admin and organisation pages have different device routes. */
  getDeviceHref: (deviceId: string) => string;
}

export default function SiteHealthCard({ siteId, getDeviceHref }: SiteHealthCardProps) {
  const { apiGroup, linkGroup, isAdminRoute } = useHealthScope();
  const { site: query, window } = useSiteHealth(siteId, apiGroup, isAdminRoute);
  const beaconHref = getBeaconUrl(`/dashboard/sites/${encodeURIComponent(siteId)}`, linkGroup);

  // Pending covers the wait for an organisation as well as the request itself
  if (query.isPending) return <HealthCardSkeleton title={TITLE} />;
  if (isNotInBeacon(query.error)) return <NotInBeaconCard title={TITLE} noun="site" />;
  if (!query.data) {
    return <HealthCardError kind="site" title={TITLE} beaconHref={beaconHref} onRetry={() => void query.refetch()} />;
  }

  const site = query.data;
  const devices = sortDevicesByHealth(site.devices ?? []);
  const summary = site.diagnostics_summary;

  // Asking for uptime narrows a site to AirQo network devices, so other manufacturers' sites land here
  if (!summary || devices.length === 0) {
    return (
      <HealthCard kind="site" title={TITLE} badge={<HealthBadge tone="gray">Not diagnosed</HealthBadge>} beaconHref={beaconHref}>
        <HealthMessage title="No devices to summarise">
          Beacon summarises AirQo network devices here, and this site has none.
        </HealthMessage>
      </HealthCard>
    );
  }

  const hidden = devices.length - DEVICES_SHOWN;
  const asOf = getDiagnosisAsOf(summary.latest_diagnosis_date);

  return (
    <HealthCard kind="site"
      title={TITLE}
      badge={<SummaryBadge summary={summary} devices={devices} />}
      diagnosedOn={summary.latest_diagnosis_date}
      beaconHref={beaconHref}
    >
      <div className="flex flex-col gap-2">
        <UptimeStat uptime={site.uptime} />
        {/* The site's readings can't explain its mean uptime across several devices */}
        {devices.length === 1 && <DailyUptimeBars days={getDailyUptime(site.data, window)} />}
      </div>

      <div className="flex flex-col gap-1">
        <HealthLabel>Devices ({devices.length})</HealthLabel>
        <div className="flex flex-col divide-y">
          {devices.slice(0, DEVICES_SHOWN).map((device) => (
            <DeviceRow key={device.device_id} device={device} href={getDeviceHref(device.device_id)} />
          ))}
        </div>
        {hidden > 0 && <span className="text-xs text-muted-foreground">and {hidden} more</span>}
      </div>

      {summary.top_issues.length > 0 && <TopIssues issues={summary.top_issues} label={`Top issues${asOf}`} />}
      {/* "None" is only true of devices that were diagnosed, and recently */}
      {summary.top_issues.length === 0 && summary.devices_diagnosed > 0 && !asOf && (
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <HealthLabel>Open issues</HealthLabel>
          <span className="text-sm font-medium">None</span>
        </div>
      )}
    </HealthCard>
  );
}
