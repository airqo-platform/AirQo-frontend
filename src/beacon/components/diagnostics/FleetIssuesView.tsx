"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AqAlertTriangle, AqArrowRight, AqChevronRight, AqRefreshCw01, AqSearchSm } from "@airqo/icons-react";
import { checkTypeLabel, formatDiagnosisDate } from "@/components/diagnostics/DiagnosticBadges";
import {
  BackButton,
  BarLegend,
  NewPill,
  OngoingCell,
  ScorePill,
  SeverityPill,
  StackedBar,
  SubsystemIcon,
  TruncatedNotice,
  deviceDiagnosticsHref,
  likelyCauseText,
  plural,
  severitySegments,
} from "@/components/diagnostics/FleetHealthParts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useFleetDailySummary, useFleetDayIssues } from "@/hooks/use-fleet-health";
import {
  DEVICE_SORT_LABELS,
  checkTypeCounts,
  countLikelyCauses,
  countSeverities,
  filterDevices,
  longestStreak as streakOf,
  matchingIssues,
  scoresFromWorstDevices,
  sortDevices,
  subsystemLabel,
  subsystemNoun,
  summariseDevices,
} from "@/lib/fleet-health";
import type { DeviceSortOrder } from "@/lib/fleet-health";
import { cn } from "@/lib/utils";
import { IssueSeverity, SEVERITY_ORDER } from "@/types/diagnostics";
import { trackEvent } from "@/lib/analytics";

const PAGE_SIZE = 25;
const ISSUES_SHOWN = 3;

interface FleetIssuesViewProps {
  group: string;
  /** Title of the fleet page this list belongs to, for the breadcrumb. */
  parentTitle: string;
  /** The fleet page's route. */
  basePath: string;
}

/**
 * One day's issues as one row per device, optionally limited to a subsystem (`?subsystem=battery`;
 * `?subsystem=` with no value is the issues without one). `?date=` picks the day (the latest
 * diagnosed day without it) and `?q=` is the search.
 */
export function FleetIssuesView({ group, parentTitle, basePath }: FleetIssuesViewProps) {
  const searchParams = useSearchParams();
  const selectedDate = searchParams?.get("date") || "";
  const subsystemParam = searchParams?.get("subsystem") ?? null;
  const scoped = subsystemParam !== null;
  const subsystem = subsystemParam?.trim().toLowerCase() || "";

  const queryParam = searchParams?.get("q") || "";
  const [query, setQuery] = useState(queryParam);
  const [checkType, setCheckType] = useState<string | null>(null);
  const [severity, setSeverity] = useState<IssueSeverity | null>(null);
  const [newOnly, setNewOnly] = useState(false);
  const [sort, setSort] = useState<DeviceSortOrder>("severity");
  const [page, setPage] = useState(0);
  // The URL can change under this view (back/forward, a link to another search); follow it
  useEffect(() => {
    setQuery(queryParam);
    setPage(0);
  }, [queryParam]);

  const summaryQuery = useFleetDailySummary(group, selectedDate || null);
  const summary = summaryQuery.data;
  const diagnosisDate = summary?.diagnosis_date || null;
  const issuesQuery = useFleetDayIssues(group, summary && summary.devices_diagnosed > 0 ? diagnosisDate : null);

  const issues = useMemo(
    () =>
      (issuesQuery.data?.issues || []).filter(
        (issue) => !scoped || (issue.subsystem?.trim().toLowerCase() || "") === subsystem
      ),
    [issuesQuery.data?.issues, scoped, subsystem]
  );
  const devices = useMemo(
    () => summariseDevices(issues, scoresFromWorstDevices(summary?.worst_devices)),
    [issues, summary?.worst_devices]
  );
  const checks = useMemo(() => checkTypeCounts(devices), [devices]);
  const filters = useMemo(() => ({ checkType, severity, newOnly, query }), [checkType, severity, newOnly, query]);
  const filtered = useMemo(() => sortDevices(filterDevices(devices, filters), sort), [devices, filters, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const shown = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const segments = severitySegments(countSeverities(issues));
  const newDeviceCount = devices.filter((device) => device.hasNewIssue).length;
  const likelyCauses = countLikelyCauses(devices, summary?.worst_devices);
  const longestStreak = devices.reduce((max, device) => Math.max(max, device.longestStreakDays), 0);
  const label = scoped ? subsystemLabel(subsystem) : null;
  const truncated = Boolean(issuesQuery.data?.truncated);
  const filtersSet = Boolean(checkType || severity || newOnly || query.trim());

  // Any filter change starts again from the first page.
  const update = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(0);
  };
  // The search box isn't tracked: it changes on every keystroke and holds typed text
  const updateTracked = <T,>(setter: (value: T) => void, filter: string) => (value: T) => {
    update(setter)(value);
    trackEvent("fleet_issues_filtered", { filter, value: value as unknown });
  };
  const clearFilters = () => {
    trackEvent("fleet_issues_filtered", { filter: "clear_all" });
    setCheckType(null);
    setSeverity(null);
    setNewOnly(false);
    setQuery("");
    setPage(0);
  };

  const backHref = selectedDate ? `${basePath}?date=${selectedDate}` : basePath;
  const loading = summaryQuery.isLoading || issuesQuery.isLoading;
  const error = summaryQuery.error || issuesQuery.error;

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto pb-16">
      <div className="flex flex-wrap items-center gap-3">
        <BackButton href={backHref} />
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href={backHref} className="font-medium text-primary hover:underline">
            {parentTitle}
          </Link>
          <AqChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span aria-current="page">{label ?? "All issues"}</span>
        </nav>
      </div>

      <div className="flex flex-wrap items-center gap-3.5">
        {scoped && <SubsystemIcon subsystem={subsystem} urgent={segments[0].count > 0} className="h-12 w-12" />}
        <div className="min-w-0 flex-1 space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{label ? `${label} issues` : "All issues"}</h1>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading the day's diagnosis…"
              : error
              ? "The day's diagnosis could not be loaded."
              : !diagnosisDate
              ? "No day has been diagnosed yet."
              : `${plural(devices.length, "device")} · ${plural(issues.length, "issue")} on ${formatDiagnosisDate(diagnosisDate, "EEE d MMM yyyy")}`}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-5">
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-96 rounded-lg" />
        </div>
      ) : error ? (
        <Card className="p-10 text-center border-dashed">
          <AqAlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h2 className="text-base font-semibold text-foreground">The issues could not be loaded</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">{(error as Error).message}</p>
          <Button
            onClick={() => {
              void summaryQuery.refetch();
              // Without a diagnosis day the issues query has nothing to ask for; it runs once the summary arrives
              if (diagnosisDate) void issuesQuery.refetch();
            }}
            className="mt-4 gap-2"
          >
            <AqRefreshCw01 className="h-4 w-4" />
            Try again
          </Button>
        </Card>
      ) : (
        <>
          {truncated && <TruncatedNotice count={issuesQuery.data?.issues.length ?? 0} />}
          {issues.length > 0 && (
            <Card className="grid gap-x-8 gap-y-5 p-5 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto]">
              <div className="space-y-2.5">
                <h2 className="text-sm font-semibold text-foreground">Severity of the {plural(issues.length, "issue")}</h2>
                <StackedBar segments={segments} total={issues.length} className="h-3" />
                <BarLegend segments={segments.filter((segment) => segment.count > 0)} />
              </div>
              <div className="flex flex-wrap items-start gap-8">
                <OverviewStat label="Devices with new issues" value={newDeviceCount} />
                <OverviewStat label="Longest-running" value={longestStreak <= 1 ? "New" : `${longestStreak} days`} />
                {scoped && likelyCauses > 0 && summary && (
                  <p className="max-w-[18rem] rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
                    {likelyCauseText(likelyCauses, summary.worst_devices.length, subsystemNoun(subsystem))}
                  </p>
                )}
              </div>
            </Card>
          )}

          <Card className="overflow-hidden">
            <div className="space-y-3.5 border-b border-border px-5 py-4 sm:px-6">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="mr-auto text-base font-semibold text-foreground">Devices</h2>
                <div className="relative w-full sm:w-72">
                  <label htmlFor="issues-search" className="sr-only">
                    Search devices and issues
                  </label>
                  <AqSearchSm className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="issues-search"
                    type="search"
                    value={query}
                    onChange={(e) => update(setQuery)(e.target.value)}
                    placeholder="Device, issue code or component"
                    className="h-9 pl-9 text-sm"
                  />
                </div>
                <label htmlFor="issues-severity" className="sr-only">
                  Severity
                </label>
                <select
                  id="issues-severity"
                  value={severity || ""}
                  onChange={(e) => updateTracked(setSeverity, "severity")((e.target.value || null) as IssueSeverity | null)}
                  className="h-9 rounded-md border border-input bg-background px-2.5 text-sm text-foreground"
                >
                  <option value="">All severities</option>
                  {SEVERITY_ORDER.map((value) => (
                    <option key={value} value={value}>
                      {value.charAt(0) + value.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
                <label
                  htmlFor="issues-new-only"
                  className="flex h-9 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                >
                  <input
                    id="issues-new-only"
                    type="checkbox"
                    checked={newOnly}
                    onChange={(e) => updateTracked(setNewOnly, "new_only")(e.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  New issues only
                </label>
                <label htmlFor="issues-sort" className="sr-only">
                  Sort devices
                </label>
                <select
                  id="issues-sort"
                  value={sort}
                  onChange={(e) => updateTracked(setSort, "sort")(e.target.value as DeviceSortOrder)}
                  className="h-9 rounded-md border border-input bg-background px-2.5 text-sm text-foreground"
                >
                  {(Object.keys(DEVICE_SORT_LABELS) as DeviceSortOrder[]).map((value) => (
                    <option key={value} value={value}>
                      {DEVICE_SORT_LABELS[value]}
                    </option>
                  ))}
                </select>
              </div>
              {checks.length > 1 && (
                <div role="group" aria-label="Check" className="flex flex-wrap gap-2">
                  {[{ checkType: null as string | null, deviceCount: devices.length }, ...checks].map((check) => {
                    const active = checkType === check.checkType;
                    return (
                      <button
                        key={check.checkType ?? "all"}
                        type="button"
                        aria-pressed={active}
                        onClick={() => updateTracked(setCheckType, "check_type")(check.checkType)}
                        className={cn(
                          "flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-foreground hover:bg-accent"
                        )}
                      >
                        {check.checkType ? checkTypeLabel(check.checkType) : "All checks"}
                        <span className={cn("tabular-nums", active ? "text-primary" : "text-muted-foreground")}>
                          {check.deviceCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {shown.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                <p className="text-sm font-medium text-foreground">
                  {devices.length === 0 ? "No issues were found on this day." : "No devices match these filters."}
                </p>
                {filtersSet && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[52rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium text-muted-foreground">
                      <th scope="col" className="py-2.5 pl-6 pr-3 font-medium">Device</th>
                      <th scope="col" className="px-3 py-2.5 font-medium">What the diagnosis found</th>
                      <th scope="col" className="px-3 py-2.5 font-medium">Ongoing</th>
                      <th scope="col" className="py-2.5 pl-3 pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((device) => {
                      const href = deviceDiagnosticsHref(device.deviceId, device.deviceName);
                      // With filters on, the row shows the issues that matched them, and Ongoing describes those
                      const visible = filtersSet ? matchingIssues(device, filters) : device.issues;
                      const more = visible.length - ISSUES_SHOWN;
                      const streak = streakOf(visible);
                      return (
                        <tr key={device.deviceId} className="border-b border-border/60 align-top last:border-0 hover:bg-muted/40">
                          <td className="whitespace-nowrap py-3.5 pl-6 pr-3">
                            <Link href={href} className="font-semibold text-primary hover:underline" title={device.deviceId}>
                              {device.deviceName}
                            </Link>
                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                              {filtersSet
                                ? `${visible.length} of ${plural(device.issues.length, "issue")} match`
                                : plural(device.issues.length, "issue")}
                              {device.healthScore !== null && <ScorePill score={device.healthScore} />}
                            </div>
                          </td>
                          <td className="w-3/5 px-3 py-3">
                            <ul className="space-y-2">
                              {visible.slice(0, ISSUES_SHOWN).map((issue) => (
                                <li key={issue.issue_code} className="flex items-start gap-2.5">
                                  <SeverityPill severity={issue.severity} className="mt-px w-16 justify-center" />
                                  <span className="min-w-0">
                                    <span className="font-medium text-foreground">{issue.title}</span>
                                    {issue.is_new && <NewPill className="ml-2 align-middle" />}
                                    {issue.description && (
                                      <span className="block text-xs text-muted-foreground">{issue.description}</span>
                                    )}
                                  </span>
                                </li>
                              ))}
                            </ul>
                            {more > 0 && (
                              <Link href={href} className="mt-2 inline-block text-xs font-medium text-primary hover:underline">
                                {plural(more, filtersSet ? "more matching issue" : "more issue")}
                              </Link>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3.5">
                            <OngoingCell days={streak.days} since={streak.since} />
                          </td>
                          <td className="py-3 pl-3 pr-6 text-right">
                            <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-primary">
                              <Link href={href}>
                                Inspect
                                <AqArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {filtered.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-3 text-sm text-muted-foreground">
                <span>
                  Showing {currentPage * PAGE_SIZE + 1}–{currentPage * PAGE_SIZE + shown.length} of{" "}
                  {plural(filtered.length, "device")}
                </span>
                {pageCount > 1 && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= pageCount - 1}
                      onClick={() => setPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

const OverviewStat: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <div className="text-xs font-medium text-muted-foreground">{label}</div>
    <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{value}</div>
  </div>
);
