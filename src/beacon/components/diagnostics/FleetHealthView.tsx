"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AqAlertTriangle,
  AqArrowRight,
  AqCalendar,
  AqCheckCircle,
  AqChevronDown,
  AqChevronRight,
  AqChevronUp,
  AqPlayCircle,
  AqRefreshCw01,
  AqSearchSm,
} from "@airqo/icons-react";
import { DailyRunDialog } from "@/components/diagnostics/DailyRunDialog";
import {
  DiagnosisDayPicker,
  DistributionList,
  LIFECYCLE_BAR_CLASSES,
  NewPill,
  NewVsPersistingBar,
  NewVsPersistingLegend,
  ScorePill,
  SeverityPill,
  StackedBar,
  SubsystemIcon,
  deviceDiagnosticsHref,
  lifecycleLabel,
  likelyCauseText,
  plural,
  severitySegments,
  TruncatedNotice,
} from "@/components/diagnostics/FleetHealthParts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useFleetDailySummary, useFleetDayIssues } from "@/hooks/use-fleet-health";
import { groupFleetIssues, issueAgeBuckets, subsystemNoun } from "@/lib/fleet-health";
import type { FleetIssueGroup } from "@/lib/fleet-health";
import { ROUTES } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { LifecycleState } from "@/types/diagnostics";

const LIFECYCLE_STATES: LifecycleState[] = ["HEALTHY", "DEGRADING", "SUSPICIOUS", "LIKELY_FAILURE", "FAILED", "NO_DATA"];
const TYPES_SHOWN = 4;
const DEVICES_SHOWN = 5;

const DIAGNOSTICS_TOOLS = [
  { label: "Bench simulator", href: ROUTES.DIAGNOSTICS_SIMULATOR },
  { label: "Device profiles", href: ROUTES.DEVICE_PROFILES },
  { label: "Status codes", href: ROUTES.STATUS_CODES },
];


interface FleetHealthViewProps {
  /** Group title whose devices are summarised; the AirQo group covers the whole fleet. */
  group: string;
  /** AirQo staff tools: running and backfilling diagnoses, the bench simulator and device profiles. */
  canManage: boolean;
  title: string;
  description: string;
  /** The page's own route; its issue lists live under `${basePath}/issues`. */
  basePath: string;
}

/**
 * Daily device health for a group as a fix queue: the day's issues grouped by the part of the device
 * they concern, most critical first, each with the devices to visit first. The selected day lives in
 * the URL (`?date=`) so it survives a visit to an issue list and back.
 */
export function FleetHealthView({ group, canManage, title, description, basePath }: FleetHealthViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDate = searchParams?.get("date") || "";
  const [runDialogOpen, setRunDialogOpen] = useState(false);
  // Every group starts closed; at most one is open at a time
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const summaryQuery = useFleetDailySummary(group, selectedDate || null);
  const summary = summaryQuery.data;
  const diagnosisDate = summary?.diagnosis_date || null;
  const hasDiagnoses = Boolean(summary && summary.devices_diagnosed > 0);
  const issuesQuery = useFleetDayIssues(group, hasDiagnoses ? diagnosisDate : null);
  const issues = issuesQuery.data?.issues;

  const groups = useMemo(() => groupFleetIssues(issues || [], summary?.worst_devices), [issues, summary?.worst_devices]);
  const ages = useMemo(() => issueAgeBuckets(issues || []), [issues]);
  const setDate = (date: string) => {
    setOpenGroup(null);
    router.replace(date ? `${basePath}?date=${date}` : basePath, { scroll: false });
  };

  // Lists carry the day only when the viewer chose one, so "latest" stays latest. An empty value is
  // kept: `subsystem=` is the group of issues without a subsystem.
  const issuesHref = (params: Record<string, string | undefined> = {}) => {
    const query = new URLSearchParams();
    if (selectedDate) query.set("date", selectedDate);
    for (const [key, value] of Object.entries(params)) if (value !== undefined) query.set(key, value);
    const qs = query.toString();
    return `${basePath}/issues${qs ? `?${qs}` : ""}`;
  };

  const refresh = () => {
    void summaryQuery.refetch();
    if (hasDiagnoses) void issuesQuery.refetch();
  };

  const lifecycleStates = [
    ...LIFECYCLE_STATES,
    // Any other state the API reports (e.g. RECOVERING) is shown too, so the list always adds up.
    ...(Object.keys(summary?.lifecycle_state_counts || {}) as LifecycleState[]).filter(
      (state) => !LIFECYCLE_STATES.includes(state)
    ),
  ];

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto pb-16">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>
        </div>
        <div className="flex flex-wrap lg:flex-nowrap lg:shrink-0 items-center gap-2">
          <DiagnosisDayPicker shownDate={diagnosisDate || selectedDate || null} selectedDate={selectedDate} onChange={setDate} />
          {canManage && (
            <Button onClick={() => setRunDialogOpen(true)} className="h-10 gap-2">
              <AqPlayCircle className="h-4 w-4" />
              Run diagnostics
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={refresh}
            disabled={summaryQuery.isFetching || issuesQuery.isFetching}
            aria-label="Refresh"
            title="Refresh"
          >
            <AqRefreshCw01 className={cn("h-4 w-4", (summaryQuery.isFetching || issuesQuery.isFetching) && "animate-spin")} />
          </Button>
        </div>
      </div>

      {summaryQuery.isLoading ? (
        <div className="space-y-5">
          <Skeleton className="h-24 rounded-lg" />
          <div className="flex flex-col xl:flex-row gap-5">
            <div className="flex-1 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-96 xl:w-80 rounded-lg" />
          </div>
        </div>
      ) : summaryQuery.isError ? (
        <Card className="p-10 text-center border-dashed">
          <AqAlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h2 className="text-base font-semibold text-foreground">{title} is unavailable</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            {(summaryQuery.error as Error)?.message || "The daily summary could not be loaded."}
          </p>
          <Button onClick={() => summaryQuery.refetch()} className="mt-4 gap-2">
            <AqRefreshCw01 className="h-4 w-4" />
            Try again
          </Button>
        </Card>
      ) : summary && !hasDiagnoses ? (
        <Card className="p-10 text-center border-dashed">
          <AqCalendar className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <h2 className="text-base font-semibold text-foreground">
            No daily diagnoses{selectedDate ? " for this day" : " yet"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Devices are diagnosed automatically after the nightly data sync.
            {canManage && " You can also run or backfill the last 14 days now."}
          </p>
          {canManage && (
            <Button onClick={() => setRunDialogOpen(true)} className="mt-4 gap-2">
              <AqPlayCircle className="h-4 w-4" />
              Run diagnostics
            </Button>
          )}
        </Card>
      ) : summary ? (
        <>
          <Card className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            <Stat label="Devices diagnosed" value={summary.devices_diagnosed} />
            <Stat
              label="With issues"
              value={summary.devices_with_issues}
              unit={`${Math.round((summary.devices_with_issues / summary.devices_diagnosed) * 100)}%`}
            />
            <Stat label="Average health score" value={summary.average_health_score ?? "—"} unit="/ 100" />
            <Stat label="New issues" value={summary.new_issue_count} note="since the day before" />
            <Stat label="Resolved issues" value={summary.resolved_issue_count} note="since the day before" />
          </Card>

          <div className="flex flex-col xl:flex-row gap-5 items-start">
            <section aria-labelledby="fix-queue-title" className="flex-1 min-w-0 w-full space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="fix-queue-title" className="text-lg font-semibold text-foreground">
                  What to fix
                </h2>
                {issues && groups.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {plural(issues.length, "issue")} in {plural(groups.length, "group")} · most critical and high first
                  </span>
                )}
              </div>
              {issuesQuery.data?.truncated && <TruncatedNotice count={issues?.length ?? 0} />}

              {issuesQuery.isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
              ) : issuesQuery.isError ? (
                <Card className="p-6 text-center">
                  <p className="text-sm text-foreground font-medium">The day&apos;s issues could not be loaded.</p>
                  <p className="text-sm text-muted-foreground mt-1">{(issuesQuery.error as Error)?.message}</p>
                  <Button variant="outline" onClick={() => issuesQuery.refetch()} className="mt-3 gap-2">
                    <AqRefreshCw01 className="h-4 w-4" />
                    Try again
                  </Button>
                </Card>
              ) : groups.length === 0 ? (
                <Card className="p-10 text-center">
                  <AqCheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">No issues were found on this day.</p>
                </Card>
              ) : (
                groups.map((issueGroup) => (
                  <FleetGroupCard
                    key={issueGroup.subsystem}
                    group={issueGroup}
                    open={openGroup === issueGroup.subsystem}
                    onToggle={() => setOpenGroup(openGroup === issueGroup.subsystem ? null : issueGroup.subsystem)}
                    lowestScoringTotal={summary.worst_devices.length}
                    listHref={issuesHref({ subsystem: issueGroup.subsystem })}
                  />
                ))
              )}

              <Card className="p-4 sm:px-5">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    router.push(issuesHref({ q: search.trim() || undefined }));
                  }}
                  className="flex flex-wrap items-center gap-3"
                >
                  <label htmlFor="fleet-search" className="basis-full text-sm font-semibold text-foreground">
                    Find a device or issue
                  </label>
                  <div className="relative flex-1 min-w-[16rem]">
                    <AqSearchSm className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="fleet-search"
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Device name or ID, or an issue code"
                      className="pl-9"
                    />
                  </div>
                  <Button type="submit" variant="outline">
                    Search
                  </Button>
                  {issues && issues.length > 0 && (
                    <Link href={issuesHref()} className="text-sm font-medium text-primary hover:underline">
                      All {issues.length} issues
                    </Link>
                  )}
                </form>
              </Card>
            </section>

            <aside className="w-full xl:w-80 shrink-0 space-y-5">
              {issues && issues.length > 0 && (
                <SidePanel title="How long issues have lasted" note="Days in a row each issue has been found">
                  <DistributionList
                    max={Math.max(...ages.map((age) => age.count))}
                    rows={ages.map((age, index) => ({
                      key: age.label,
                      label: age.label,
                      count: age.count,
                      plain: true,
                      barClassName: index === 0 ? "bg-primary" : "bg-slate-400 dark:bg-slate-500",
                    }))}
                  />
                </SidePanel>
              )}

              <SidePanel title="Device state" note="From each device's health score">
                <DistributionList
                  max={summary.devices_diagnosed}
                  rows={lifecycleStates.map((state) => ({
                    key: state,
                    label: lifecycleLabel(state),
                    count: summary.lifecycle_state_counts?.[state] || 0,
                    barClassName: LIFECYCLE_BAR_CLASSES[state] || "bg-slate-400",
                  }))}
                />
              </SidePanel>

              <SidePanel title="Worst issue per device" note="Each device counted once, by its most severe issue">
                <DistributionList
                  max={summary.devices_diagnosed}
                  rows={severitySegments(summary.max_severity_counts || {}, true).map((segment) => ({
                    key: segment.key,
                    label: segment.label,
                    count: segment.count,
                    barClassName: segment.className,
                  }))}
                />
              </SidePanel>

              {canManage && (
                <Card className="px-5 py-4">
                  <h2 className="text-sm font-semibold text-foreground mb-1">Diagnostics tools</h2>
                  <ul className="divide-y divide-border">
                    {DIAGNOSTICS_TOOLS.map((tool) => (
                      <li key={tool.href}>
                        <Link
                          href={tool.href}
                          className="flex items-center justify-between py-2 text-sm text-foreground hover:text-primary"
                        >
                          {tool.label}
                          <AqChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </aside>
          </div>
        </>
      ) : null}

      {canManage && <DailyRunDialog open={runDialogOpen} onOpenChange={setRunDialogOpen} />}
    </div>
  );
}

const Stat: React.FC<{ label: string; value: React.ReactNode; unit?: string; note?: string }> = ({
  label,
  value,
  unit,
  note,
}) => (
  <div className="px-5 py-4">
    <div className="text-xs font-medium text-muted-foreground">{label}</div>
    <div className="mt-0.5 text-2xl font-bold tracking-tight text-foreground tabular-nums">
      {value}
      {unit && <span className="ml-1.5 text-sm font-medium tracking-normal text-muted-foreground">{unit}</span>}
    </div>
    {note && <div className="text-xs text-muted-foreground">{note}</div>}
  </div>
);

const SidePanel: React.FC<{ title: string; note: string; children: React.ReactNode }> = ({ title, note, children }) => (
  <Card className="p-5 space-y-3">
    <div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="text-xs text-muted-foreground">{note}</p>
    </div>
    {children}
  </Card>
);

interface FleetGroupCardProps {
  group: FleetIssueGroup;
  open: boolean;
  onToggle: () => void;
  /** How many lowest-scoring devices the day's summary lists. */
  lowestScoringTotal: number;
  listHref: string;
}

function FleetGroupCard({ group, open, onToggle, lowestScoringTotal, listHref }: FleetGroupCardProps) {
  const panelId = `fleet-group-${group.subsystem || "other"}`;
  const segments = severitySegments(group.severityCounts);
  const severityText = segments
    .filter((segment) => segment.count > 0)
    .map((segment) => `${segment.count} ${segment.label.toLowerCase()}`)
    .join(" · ");
  const urgent = group.severityCounts.CRITICAL > 0;
  const noun = subsystemNoun(group.subsystem);

  return (
    <Card className={cn("overflow-hidden transition-shadow", open && "border-primary shadow-md")}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4 text-left hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <SubsystemIcon subsystem={group.subsystem} urgent={urgent} />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-base font-semibold text-foreground">{group.label}</span>
            {group.newDeviceCount > 0 && <NewPill>{group.newDeviceCount} with new issues</NewPill>}
          </span>
          <span className="block text-sm text-muted-foreground">
            {plural(group.deviceCount, "device")} · {plural(group.issueCount, "issue")}
          </span>
        </span>
        <span className="order-last w-full space-y-1.5 sm:order-none sm:w-72">
          <StackedBar segments={segments} total={group.issueCount} />
          <span className="block text-xs text-muted-foreground">{severityText}</span>
        </span>
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-foreground",
            open ? "bg-muted" : "bg-background"
          )}
          aria-hidden="true"
        >
          {open ? <AqChevronUp className="h-4 w-4" /> : <AqChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {open && (
        <div id={panelId} className="border-t border-border">
          {group.likelyCauseDeviceCount > 0 && (
            <p className="mx-5 mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
              <strong className="font-semibold">
                {likelyCauseText(group.likelyCauseDeviceCount, lowestScoringTotal, noun)}
              </strong>
            </p>
          )}

          <div className="flex items-baseline justify-between px-5 pt-4">
            <h3 className="text-sm font-semibold text-foreground">Issue types</h3>
            <NewVsPersistingLegend />
          </div>
          <ul className="px-5">
            {group.types.slice(0, TYPES_SHOWN).map((type) => (
              <li
                key={type.title}
                className="grid grid-cols-[minmax(0,1fr)_6rem] items-center gap-x-4 gap-y-2 border-b border-border/60 py-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(4rem,11rem)_6rem]"
              >
                <span className="text-sm font-medium text-foreground">{type.title}</span>
                {/* Under the title on phones, between the title and the counts from sm up */}
                <span className="order-last col-span-2 sm:order-none sm:col-span-1">
                  <NewVsPersistingBar count={type.deviceCount} newCount={type.newDeviceCount} scale={group.deviceCount} />
                </span>
                <span className="text-right">
                  <span className="block text-sm font-semibold text-foreground tabular-nums">
                    {plural(type.deviceCount, "device")}
                  </span>
                  <span className="block text-xs font-medium text-primary">{type.newDeviceCount} new</span>
                </span>
              </li>
            ))}
          </ul>
          {group.types.length > TYPES_SHOWN && (
            <p className="px-5 pt-2 text-sm text-muted-foreground">
              {plural(group.types.length - TYPES_SHOWN, "more issue type")}
            </p>
          )}

          <div className="flex items-baseline justify-between px-5 pt-5">
            <h3 className="text-sm font-semibold text-foreground">Visit first</h3>
            <span className="text-xs text-muted-foreground">Lowest health score, then most severe</span>
          </div>
          <ul className="px-5">
            {group.devices.slice(0, DEVICES_SHOWN).map((device) => {
              const top = device.issues[0];
              const fact = top.description || top.title;
              return (
                <li
                  key={device.deviceId}
                  className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 border-b border-border/60 py-2"
                >
                  <span className="min-w-0">
                    <Link
                      href={deviceDiagnosticsHref(device.deviceId, device.deviceName)}
                      className="text-sm font-semibold text-primary hover:underline"
                      title={device.deviceId}
                    >
                      {device.deviceName}
                    </Link>
                    <span className="block truncate text-xs text-muted-foreground" title={fact}>
                      {plural(device.issues.length, `${noun} issue`)} · {fact}
                    </span>
                  </span>
                  {device.healthScore !== null ? (
                    <ScorePill score={device.healthScore} />
                  ) : (
                    <SeverityPill severity={device.worstSeverity} />
                  )}
                  <Button asChild variant="outline" size="sm" className="h-8 text-primary">
                    <Link href={deviceDiagnosticsHref(device.deviceId, device.deviceName)}>Inspect</Link>
                  </Button>
                </li>
              );
            })}
          </ul>
          <div className="px-5 py-4">
            <Button asChild className="gap-2">
              <Link href={listHref}>
                See all {plural(group.deviceCount, "device")}
                <AqArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
