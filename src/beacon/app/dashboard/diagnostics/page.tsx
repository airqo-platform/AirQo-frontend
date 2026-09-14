"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { diagnosticsService } from "@/services/diagnosticsService";
import {
  CHECK_TYPE_LABELS,
  FleetDailySummary,
  FleetIssue,
  FleetTopIssue,
  IssueSeverity,
  LifecycleState,
  SEVERITY_ORDER,
} from "@/types/diagnostics";
import { getLifecycleConfig } from "@/components/diagnostics/HealthScoreGauge";
import { DailyRunDialog } from "@/components/diagnostics/DailyRunDialog";
import {
  LifecycleBadge,
  SEVERITY_STYLES,
  SeverityBadge,
  StreakBadge,
  checkTypeLabel,
  formatDiagnosisDate,
  getScoreToneClass,
} from "@/components/diagnostics/DiagnosticBadges";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  ListChecks,
  PlayCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  Sliders,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";
import { useGroup } from "@/lib/group-context";

const LIFECYCLE_STATES: LifecycleState[] = ["HEALTHY", "DEGRADING", "SUSPICIOUS", "LIKELY_FAILURE", "FAILED", "NO_DATA"];
const SEVERITY_BAR_COLORS: Record<string, string> = {
  CRITICAL: "bg-red-600",
  HIGH: "bg-rose-400",
  MEDIUM: "bg-amber-400",
  LOW: "bg-slate-300",
  NONE: "bg-emerald-400",
};
const PAGE_SIZE = 50;

interface IssueFilterState {
  issue_code: string;
  severity: IssueSeverity | "all";
  check_type: string;
  subsystem: string;
  component_name: string;
  device_id: string;
  min_streak_days: string;
  only_new: boolean;
}

const EMPTY_FILTERS: IssueFilterState = {
  issue_code: "",
  severity: "all",
  check_type: "all",
  subsystem: "",
  component_name: "",
  device_id: "",
  min_streak_days: "",
  only_new: false,
};

const yesterdayUtc = () => new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

const truncate = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

const deviceDiagnosticsHref = (deviceId: string) => `/dashboard/devices/${encodeURIComponent(deviceId)}/diagnostics`;

export default function FleetDiagnosticsPage() {
  const { activeGroup, loading: groupLoading } = useGroup();
  const isAirqoGroup = activeGroup?.toLowerCase() === "airqo";

  // Empty string = latest diagnosed day
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [summary, setSummary] = useState<FleetDailySummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [runDialogOpen, setRunDialogOpen] = useState<boolean>(false);

  const [draftFilters, setDraftFilters] = useState<IssueFilterState>(EMPTY_FILTERS);
  const [filters, setFilters] = useState<IssueFilterState>(EMPTY_FILTERS);
  const [page, setPage] = useState<number>(0);
  const [issues, setIssues] = useState<FleetIssue[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [issuesLoading, setIssuesLoading] = useState<boolean>(false);
  const issuesRef = useRef<HTMLDivElement>(null);

  const fetchSummary = useCallback(async () => {
    if (!isAirqoGroup) return;
    try {
      setLoading(true);
      setError(null);
      const data = await diagnosticsService.getFleetDailySummary({
        diagnosis_date: selectedDate || undefined,
        top_n: 10,
      });
      setSummary(data);
    } catch (err: any) {
      console.error("Error fetching fleet daily summary:", err);
      setSummary(null);
      setError(err?.message || "Failed to load fleet diagnostics.");
    } finally {
      setLoading(false);
    }
  }, [selectedDate, isAirqoGroup]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const diagnosisDate = summary?.diagnosis_date || null;

  const fetchIssues = useCallback(async () => {
    if (!diagnosisDate) {
      setIssues([]);
      setHasMore(false);
      return;
    }
    try {
      setIssuesLoading(true);
      const minStreak = Number(filters.min_streak_days);
      const result = await diagnosticsService.getFleetIssues({
        diagnosis_date: diagnosisDate,
        issue_code: filters.issue_code.trim() || undefined,
        severity: filters.severity !== "all" ? filters.severity : undefined,
        check_type: filters.check_type !== "all" ? filters.check_type : undefined,
        subsystem: filters.subsystem.trim() || undefined,
        component_name: filters.component_name.trim() || undefined,
        device_id: filters.device_id.trim() || undefined,
        min_streak_days: Number.isFinite(minStreak) && minStreak >= 1 ? minStreak : undefined,
        only_new: filters.only_new || undefined,
        skip: page * PAGE_SIZE,
        // One extra row tells us whether there is a next page.
        limit: PAGE_SIZE + 1,
      });
      setHasMore(result.length > PAGE_SIZE);
      setIssues(result.slice(0, PAGE_SIZE));
    } catch (err: any) {
      console.error("Error fetching fleet issues:", err);
      setIssues([]);
      setHasMore(false);
      toast({
        title: "Issue Search Failed",
        description: err?.message || "Failed to search fleet issues.",
        variant: "destructive",
      });
    } finally {
      setIssuesLoading(false);
    }
  }, [diagnosisDate, filters, page]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const applyFilters = (next: IssueFilterState) => {
    setDraftFilters(next);
    setFilters(next);
    setPage(0);
  };

  const showIssueDevices = (issue: FleetTopIssue) => {
    applyFilters({ ...EMPTY_FILTERS, issue_code: issue.issue_code });
    issuesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDateChange = (value: string) => {
    setSelectedDate(value);
    setPage(0);
  };

  if (groupLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-10 w-72 mb-6" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!isAirqoGroup) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              Restricted Organization Section
            </CardTitle>
            <CardDescription className="text-xs text-gray-600 leading-relaxed mt-1">
              IoT Diagnostics and Automated Triage are exclusively available when the active organization is set to <span className="font-semibold text-primary">AirQo</span>.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const topIssueChartData = (summary?.top_issues || []).map((issue) => ({
    name: truncate(issue.title, 34),
    persisting: issue.device_count - issue.new_device_count,
    new: issue.new_device_count,
    issue,
  }));

  const severityEntries = [...SEVERITY_ORDER, "NONE"]
    .map((severity) => [severity, summary?.max_severity_counts?.[severity] || 0] as const)
    .filter(([, count]) => count > 0);
  const severityTotal = severityEntries.reduce((sum, [, count]) => sum + count, 0);

  // Any other state the API reports (e.g. RECOVERING) is shown too, so the grid always adds up.
  const lifecycleStates = [
    ...LIFECYCLE_STATES,
    ...(Object.keys(summary?.lifecycle_state_counts || {}) as LifecycleState[]).filter(
      (state) => !LIFECYCLE_STATES.includes(state)
    ),
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Stethoscope className="w-7 h-7 text-primary" />
            Fleet Diagnostics
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Daily device health across the fleet: lifecycle states, most common issues, persistent faults and the devices that need attention
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <CalendarDays className="w-4 h-4 text-gray-400" />
            <Input
              type="date"
              value={selectedDate}
              max={yesterdayUtc()}
              onChange={(e) => handleDateChange(e.target.value)}
              className="h-9 text-xs w-36 bg-white"
              title="Diagnosis day (UTC); empty shows the latest diagnosed day"
            />
            {selectedDate && (
              <Button variant="ghost" size="sm" onClick={() => handleDateChange("")} className="h-9 text-xs px-2">
                Latest
              </Button>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => setRunDialogOpen(true)} className="h-9 text-xs bg-white gap-1.5 text-gray-700">
            <PlayCircle className="w-3.5 h-3.5 text-primary" />
            Run Daily Diagnostics
          </Button>
          <Link href="/dashboard/diagnostics/simulator">
            <Button variant="outline" size="sm" className="h-9 text-xs bg-white gap-1.5 text-gray-700">
              <Sliders className="w-3.5 h-3.5 text-primary" />
              Bench Simulator
            </Button>
          </Link>
          <Link href="/dashboard/settings/device-profiles">
            <Button variant="outline" size="sm" className="h-9 text-xs bg-white gap-1.5 text-gray-700">
              <Layers className="w-3.5 h-3.5 text-primary" />
              Device Profiles
            </Button>
          </Link>
          <Button
            onClick={() => {
              fetchSummary();
              fetchIssues();
            }}
            disabled={loading}
            className="h-9 text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading && !summary ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Skeleton className="h-80 lg:col-span-7 rounded-xl" />
            <Skeleton className="h-80 lg:col-span-5 rounded-xl" />
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      ) : error ? (
        <Card className="p-10 text-center border-dashed border-gray-200">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-gray-900">Fleet Diagnostics Unavailable</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">{error}</p>
          <Button onClick={fetchSummary} className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </Button>
        </Card>
      ) : summary && summary.devices_diagnosed === 0 ? (
        <Card className="p-10 text-center border-dashed border-gray-200">
          <CalendarDays className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-gray-900">
            No Daily Diagnoses{selectedDate ? ` for ${formatDiagnosisDate(selectedDate)}` : " Yet"}
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            Devices are diagnosed automatically after the nightly data sync. You can also run or backfill the last 14 days now.
          </p>
          <Button onClick={() => setRunDialogOpen(true)} className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5">
            <PlayCircle className="w-3.5 h-3.5" />
            Run Daily Diagnostics
          </Button>
        </Card>
      ) : summary ? (
        <>
          <p className="text-xs text-gray-500 -mt-2">
            Showing <strong className="text-gray-800">{formatDiagnosisDate(summary.diagnosis_date, "EEEE d MMMM yyyy")}</strong> (UTC day)
            {!selectedDate && " · latest diagnosed day"}
          </p>

          {/* 1. Headline numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl border border-gray-200 bg-white shadow-2xs">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Devices Diagnosed</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{summary.devices_diagnosed}</div>
            </div>
            <div className="p-3.5 rounded-xl border border-gray-200 bg-white shadow-2xs">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">With Issues</div>
              <div className="text-2xl font-bold text-rose-600 mt-1">
                {summary.devices_with_issues}
                <span className="text-sm text-gray-400 font-medium">
                  {" "}
                  ({Math.round((summary.devices_with_issues / summary.devices_diagnosed) * 100)}%)
                </span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-gray-200 bg-white shadow-2xs">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Average Score</div>
              <div className="mt-1">
                <span className={`text-2xl font-bold px-2 rounded-lg ${getScoreToneClass(summary.average_health_score)}`}>
                  {summary.average_health_score ?? "—"}
                </span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 shadow-2xs">
              <div className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> New Issues
              </div>
              <div className="text-2xl font-bold text-blue-900 mt-1">{summary.new_issue_count}</div>
            </div>
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-2xs">
              <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Resolved Issues
              </div>
              <div className="text-2xl font-bold text-emerald-900 mt-1">{summary.resolved_issue_count}</div>
            </div>
          </div>

          {/* 2. Lifecycle states & severity */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {lifecycleStates.map((state) => {
                  const cfg = getLifecycleConfig(state);
                  const Icon = cfg.icon;
                  const count = summary.lifecycle_state_counts?.[state] || 0;
                  return (
                    <div key={state} className={`p-3 rounded-xl border ${count > 0 ? cfg.bgLight : "bg-white opacity-60"}`}>
                      <div className={`text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1 ${cfg.textColor}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {cfg.label}
                      </div>
                      <div className="text-xl font-bold text-gray-900 mt-1">{count}</div>
                    </div>
                  );
                })}
              </div>

              {severityTotal > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Devices by highest issue severity
                  </div>
                  <div className="flex h-3 w-full rounded-full overflow-hidden bg-gray-100">
                    {severityEntries.map(([severity, count]) => (
                      <div
                        key={severity}
                        className={SEVERITY_BAR_COLORS[severity]}
                        style={{ width: `${(count / severityTotal) * 100}%` }}
                        title={`${severity === "NONE" ? "No issues" : severity}: ${count}`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3 text-[11px] text-gray-600">
                    {severityEntries.map(([severity, count]) => (
                      <span key={severity} className="flex items-center gap-1">
                        <span className={`w-2.5 h-2.5 rounded-full inline-block ${SEVERITY_BAR_COLORS[severity]}`} />
                        {severity === "NONE" ? "No issues" : severity} ({count})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. Top issues & worst devices */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-7 border border-gray-200 shadow-sm">
              <CardHeader className="pb-2 border-b border-gray-100">
                <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  Most Common Issues
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  Devices affected per issue, split into newly appeared and persisting. Click an issue to list its devices.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {topIssueChartData.length === 0 ? (
                  <div className="py-10 text-center text-xs text-gray-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                    No issues detected on this day.
                  </div>
                ) : (
                  <>
                    <div className="w-full" style={{ height: Math.max(160, topIssueChartData.length * 30 + 40) }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topIssueChartData} layout="vertical" margin={{ top: 0, right: 16, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                          <YAxis dataKey="name" type="category" width={190} tick={{ fontSize: 11, fill: "#334155" }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(15, 23, 42, 0.95)",
                              borderRadius: "8px",
                              border: "none",
                              color: "#fff",
                              fontSize: "12px",
                            }}
                            formatter={(val: any, name: any) => [`${val} devices`, name === "new" ? "New" : "Persisting"]}
                          />
                          <Legend wrapperStyle={{ fontSize: "11px" }} formatter={(v: any) => (v === "new" ? "New" : "Persisting")} />
                          <Bar
                            dataKey="persisting"
                            stackId="devices"
                            fill="#f97316"
                            cursor="pointer"
                            onClick={(entry: any) => entry?.payload?.issue && showIssueDevices(entry.payload.issue)}
                          />
                          <Bar
                            dataKey="new"
                            stackId="devices"
                            fill="#3b82f6"
                            radius={[0, 4, 4, 0]}
                            cursor="pointer"
                            onClick={(entry: any) => entry?.payload?.issue && showIssueDevices(entry.payload.issue)}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <ul className="divide-y divide-gray-100 border-t border-gray-100">
                      {summary.top_issues.map((issue) => (
                        <li key={issue.issue_code}>
                          <button
                            onClick={() => showIssueDevices(issue)}
                            className="w-full py-2 flex items-center justify-between gap-3 text-left text-xs hover:bg-slate-50 px-1"
                          >
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 truncate">{issue.title}</div>
                              <div className="text-[10px] text-gray-400 font-mono truncate">
                                {checkTypeLabel(issue.check_type)} · {issue.component_name || issue.subsystem}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <SeverityBadge severity={issue.severity} />
                              <span className="font-bold text-gray-900 w-16 text-right">
                                {issue.device_count} dev
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-5 border border-gray-200 shadow-sm">
              <CardHeader className="pb-2 border-b border-gray-100">
                <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  Devices Needing Attention
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">Lowest health scores on this day</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Device</th>
                      <th className="py-2.5 px-2 text-center">Score</th>
                      <th className="py-2.5 px-2">State</th>
                      <th className="py-2.5 px-3 text-right">Issues</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {summary.worst_devices.map((device) => (
                      <tr key={device.device_id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 max-w-[10rem]">
                          <Link
                            href={deviceDiagnosticsHref(device.device_id)}
                            className="font-mono font-semibold text-primary hover:underline truncate block"
                          >
                            {device.device_id}
                          </Link>
                          {device.top_cause_code && (
                            <div className="font-mono text-[10px] text-gray-400 truncate" title={device.top_cause_code}>
                              {device.top_cause_code}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span className={`inline-block font-bold px-1.5 rounded ${getScoreToneClass(device.overall_health_score)}`}>
                            {device.overall_health_score}
                          </span>
                        </td>
                        <td className="py-2.5 px-2">
                          <LifecycleBadge state={device.lifecycle_state} />
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <span className="font-semibold mr-1.5">{device.issue_count}</span>
                          <SeverityBadge severity={device.max_severity} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* 4. Issue search */}
          <div ref={issuesRef} className="scroll-mt-6">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-gray-100 space-y-3">
                <div>
                  <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-primary" />
                    Issue Search
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    Every issue detected on {formatDiagnosisDate(summary.diagnosis_date)}, most severe and longest-running first
                  </CardDescription>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    applyFilters(draftFilters);
                  }}
                  className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 text-xs"
                >
                  <Input
                    placeholder="Device ID"
                    value={draftFilters.device_id}
                    onChange={(e) => setDraftFilters({ ...draftFilters, device_id: e.target.value })}
                    className="h-8 text-xs font-mono"
                  />
                  <Input
                    placeholder="Issue code"
                    value={draftFilters.issue_code}
                    onChange={(e) => setDraftFilters({ ...draftFilters, issue_code: e.target.value })}
                    className="h-8 text-xs font-mono"
                  />
                  <select
                    value={draftFilters.severity}
                    onChange={(e) => setDraftFilters({ ...draftFilters, severity: e.target.value as IssueFilterState["severity"] })}
                    className="h-8 text-xs px-2 rounded-md border border-input bg-white text-gray-700"
                  >
                    <option value="all">All severities</option>
                    {SEVERITY_ORDER.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <select
                    value={draftFilters.check_type}
                    onChange={(e) => setDraftFilters({ ...draftFilters, check_type: e.target.value })}
                    className="h-8 text-xs px-2 rounded-md border border-input bg-white text-gray-700"
                  >
                    <option value="all">All checks</option>
                    {Object.entries(CHECK_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <Input
                    placeholder="Component type, e.g. battery"
                    value={draftFilters.subsystem}
                    onChange={(e) => setDraftFilters({ ...draftFilters, subsystem: e.target.value })}
                    className="h-8 text-xs"
                  />
                  <Input
                    placeholder="Component name"
                    value={draftFilters.component_name}
                    onChange={(e) => setDraftFilters({ ...draftFilters, component_name: e.target.value })}
                    className="h-8 text-xs font-mono"
                  />
                  <Input
                    type="number"
                    min={1}
                    placeholder="Min. streak days"
                    value={draftFilters.min_streak_days}
                    onChange={(e) => setDraftFilters({ ...draftFilters, min_streak_days: e.target.value })}
                    className="h-8 text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={draftFilters.only_new}
                        onChange={(e) => setDraftFilters({ ...draftFilters, only_new: e.target.checked })}
                        className="accent-primary"
                      />
                      New only
                    </label>
                    <Button type="submit" size="sm" className="h-8 text-xs px-2.5 gap-1 ml-auto">
                      <Search className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => applyFilters(EMPTY_FILTERS)}
                      className="h-8 text-xs px-2"
                      title="Clear filters"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </form>
              </CardHeader>

              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Device</th>
                      <th className="py-3 px-3">Issue</th>
                      <th className="py-3 px-3">Check / Location</th>
                      <th className="py-3 px-3">Severity</th>
                      <th className="py-3 px-3">Streak</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {issuesLoading ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-gray-400">
                          <RefreshCw className="w-4 h-4 animate-spin inline mr-1.5" />
                          Searching issues...
                        </td>
                      </tr>
                    ) : issues.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-gray-400">
                          No issues match the current filters.
                        </td>
                      </tr>
                    ) : (
                      issues.map((issue) => (
                        <tr key={`${issue.device_id}-${issue.issue_code}`} className="hover:bg-slate-50/70 align-top">
                          <td className="py-3 px-4 font-mono font-semibold text-gray-900 whitespace-nowrap">{issue.device_id}</td>
                          <td className="py-3 px-3 max-w-sm">
                            <div className="font-semibold text-gray-900">{issue.title}</div>
                            {issue.description && <div className="text-[11px] text-gray-500 line-clamp-2">{issue.description}</div>}
                          </td>
                          <td className="py-3 px-3">
                            <div>{checkTypeLabel(issue.check_type)}</div>
                            <div className="font-mono text-[10px] text-gray-400">
                              {[issue.component_name, issue.metric_key].filter(Boolean).join(".") || issue.subsystem}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <SeverityBadge severity={issue.severity} />
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <StreakBadge streakDays={issue.streak_days} isNew={issue.is_new} />
                            {!issue.is_new && (
                              <div className="text-[10px] text-gray-400 mt-0.5">
                                since {formatDiagnosisDate(issue.streak_start_date, "d MMM")}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <Link href={deviceDiagnosticsHref(issue.device_id)}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs bg-white text-primary border-primary/20 hover:bg-primary/10 gap-1"
                              >
                                <Stethoscope className="w-3 h-3" />
                                Inspect
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardContent>

              {(page > 0 || hasMore) && (
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 text-xs text-gray-500">
                  <span>
                    Showing {page * PAGE_SIZE + 1}–{page * PAGE_SIZE + issues.length}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 0 || issuesLoading}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      className="h-7 text-xs bg-white gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!hasMore || issuesLoading}
                      onClick={() => setPage((p) => p + 1)}
                      className="h-7 text-xs bg-white gap-1"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </>
      ) : null}

      <DailyRunDialog open={runDialogOpen} onOpenChange={setRunDialogOpen} />
    </div>
  );
}
