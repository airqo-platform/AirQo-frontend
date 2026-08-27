"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { diagnosticsService } from "@/services/diagnosticsService";
import {
  FleetTriageDeviceItem,
  FleetTriageSummary,
  LifecycleState,
} from "@/types/diagnostics";
import { getLifecycleConfig } from "@/components/diagnostics/HealthScoreGauge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  XCircle,
  ShieldAlert,
  Sparkles,
  Search,
  Filter,
  Sliders,
  ExternalLink,
  RefreshCw,
  Layers,
  Zap,
  Snowflake,
  Cog,
  Sun,
  Wind,
  Stethoscope,
} from "lucide-react";

const PIE_COLORS = ["#2563eb", "#e11d48", "#f59e0b", "#9333ea", "#059669"];

export default function FleetDiagnosticsTriagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [triageData, setTriageData] = useState<{
    summary: FleetTriageSummary;
    devices: FleetTriageDeviceItem[];
  } | null>(null);

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchTriage = async () => {
    try {
      setLoading(true);
      const data = await diagnosticsService.getFleetTriage({
        category: categoryFilter,
        lifecycle_state: stateFilter,
        search: searchQuery,
      });
      setTriageData(data);
    } catch (err) {
      console.error("Error fetching fleet triage:", err);
      toast({
        title: "Triage Fetch Error",
        description: "Failed to connect to triage API. Using fallback fleet data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTriage();
  }, [categoryFilter, stateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTriage();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTriage();
    setIsRefreshing(false);
    toast({
      title: "Fleet Triage Updated",
      description: "Fetched latest diagnostic status across all monitored nodes.",
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "air_quality":
        return <Wind className="w-3.5 h-3.5 text-blue-600" />;
      case "cold_chain":
        return <Snowflake className="w-3.5 h-3.5 text-cyan-600" />;
      case "solar":
        return <Sun className="w-3.5 h-3.5 text-amber-600" />;
      case "water_pump":
        return <Cog className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Zap className="w-3.5 h-3.5 text-gray-600" />;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Stethoscope className="w-7 h-7 text-primary" />
            Fleet-Wide Diagnostic Triage Board
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time multi-cohort health surveillance, active failure mode triage, and automated evidential reasoning
          </p>
        </div>

        <div className="flex items-center gap-2.5">
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
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh Triage
          </Button>
        </div>
      </div>

      {loading && !triageData ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-72 lg:col-span-2 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      ) : triageData ? (
        <>
          {/* 1. Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Total */}
            <div className="p-3.5 rounded-xl border border-gray-200 bg-white shadow-2xs">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Total Monitored
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {triageData.summary.total_devices}
              </div>
              <span className="text-[11px] text-gray-400 mt-0.5 block">Across all cohorts</span>
            </div>

            {/* Healthy */}
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-2xs">
              <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Healthy
              </div>
              <div className="text-2xl font-bold text-emerald-900 mt-1">
                {triageData.summary.healthy_count}
              </div>
              <span className="text-[11px] text-emerald-700/80 mt-0.5 block">Score ≥ 85</span>
            </div>

            {/* Degrading */}
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 shadow-2xs">
              <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Degrading
              </div>
              <div className="text-2xl font-bold text-amber-900 mt-1">
                {triageData.summary.degrading_count}
              </div>
              <span className="text-[11px] text-amber-700/80 mt-0.5 block">Score 70–84</span>
            </div>

            {/* Suspicious */}
            <div className="p-3.5 rounded-xl border border-orange-200 bg-orange-50/50 shadow-2xs">
              <div className="text-[11px] font-semibold text-orange-800 uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-orange-600" />
                Suspicious
              </div>
              <div className="text-2xl font-bold text-orange-900 mt-1">
                {triageData.summary.suspicious_count}
              </div>
              <span className="text-[11px] text-orange-700/80 mt-0.5 block">Score 50–69</span>
            </div>

            {/* Likely Failure */}
            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 shadow-2xs">
              <div className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                Likely Failure
              </div>
              <div className="text-2xl font-bold text-rose-900 mt-1">
                {triageData.summary.likely_failure_count}
              </div>
              <span className="text-[11px] text-rose-700/80 mt-0.5 block">Confidence ≥ 85%</span>
            </div>

            {/* Failed */}
            <div className="p-3.5 rounded-xl border border-red-300 bg-red-100/60 shadow-2xs">
              <div className="text-[11px] font-semibold text-red-900 uppercase tracking-wider flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-red-700" />
                Failed
              </div>
              <div className="text-2xl font-bold text-red-950 mt-1">
                {triageData.summary.failed_count}
              </div>
              <span className="text-[11px] text-red-800/80 mt-0.5 block">Immediate Action</span>
            </div>
          </div>

          {/* 2. Failure Distribution & Active Triage Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Failure Distribution Chart */}
            <Card className="lg:col-span-7 border border-gray-200 shadow-sm">
              <CardHeader className="pb-2 border-b border-gray-100">
                <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  Fleet-Wide Root Cause Distribution
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  Active diagnostic hypotheses ranked by incidence across the fleet
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={triageData.summary.failure_modes_distribution}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" unit="%" tick={{ fontSize: 11, fill: "#64748b" }} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={160}
                        tick={{ fontSize: 11, fill: "#334155" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(15, 23, 42, 0.95)",
                          borderRadius: "8px",
                          border: "none",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                        formatter={(val: any) => [`${val}% of fleet issues`, "Incidence"]}
                      />
                      <Bar dataKey="percentage" fill="#2563eb" radius={[0, 4, 4, 0]}>
                        {triageData.summary.failure_modes_distribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Quick Cohort Breakdown / Pie Chart */}
            <Card className="lg:col-span-5 border border-gray-200 shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-2 border-b border-gray-100">
                <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Failure Mode Proportions
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  Subsystem failure mode breakdown
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col items-center justify-center">
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={triageData.summary.failure_modes_distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="percentage"
                      >
                        {triageData.summary.failure_modes_distribution.map((entry, index) => (
                          <Cell
                            key={`pie-cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(15, 23, 42, 0.95)",
                          borderRadius: "8px",
                          border: "none",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                        formatter={(val: any) => [`${val}%`, "Share"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-2 text-[11px] text-gray-600 mt-2">
                  {triageData.summary.failure_modes_distribution.slice(0, 3).map((item, idx) => (
                    <span key={idx} className="flex items-center gap-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                      />
                      {item.name.split(" ")[0]} ({item.percentage}%)
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 3. Filterable Triage Table */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-bold text-gray-900">
                    Active Device Triage Queue
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    Filter and inspect real-time diagnostic status of field stations
                  </CardDescription>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Category Filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="h-8 text-xs px-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium"
                  >
                    <option value="all">All Hardware Categories</option>
                    <option value="air_quality">Air Quality Stations</option>
                    <option value="cold_chain">Cold Chain Vaccine Monitors</option>
                    <option value="solar">Solar Microgrids</option>
                    <option value="water_pump">Smart Water Pumps</option>
                  </select>

                  {/* Lifecycle State Filter */}
                  <select
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="h-8 text-xs px-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium"
                  >
                    <option value="all">All Lifecycle States</option>
                    <option value="HEALTHY">HEALTHY</option>
                    <option value="DEGRADING">DEGRADING</option>
                    <option value="SUSPICIOUS">SUSPICIOUS</option>
                    <option value="LIKELY_FAILURE">LIKELY FAILURE</option>
                    <option value="FAILED">FAILED</option>
                    <option value="RECOVERING">RECOVERING</option>
                  </select>

                  {/* Search Input */}
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                    <Input
                      placeholder="Search device, site, cause..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 text-xs pl-8 w-48 sm:w-56"
                    />
                  </form>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Device ID & Name</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Cohort / Site</th>
                    <th className="py-3 px-3 text-center">Health Score</th>
                    <th className="py-3 px-3">Lifecycle State</th>
                    <th className="py-3 px-3">Top Inferred Root Cause</th>
                    <th className="py-3 px-3">Confidence</th>
                    <th className="py-3 px-3">Last Evaluated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {triageData.devices.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-gray-400">
                        No devices matching current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    triageData.devices.map((device) => {
                      const cfg = getLifecycleConfig(device.lifecycle_state);
                      const StateIcon = cfg.icon;

                      return (
                        <tr
                          key={device.device_id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="font-bold text-gray-900">
                              {device.device_name}
                            </div>
                            <div className="font-mono text-[11px] text-gray-400">
                              {device.device_id}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 capitalize border border-slate-200">
                              {getCategoryIcon(device.category)}
                              {device.category.replace(/_/g, " ")}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-gray-600">
                            <div className="font-medium text-gray-800">{device.cohort || "Global"}</div>
                            <div className="text-[11px] text-gray-400">{device.site || "General"}</div>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-block font-bold text-sm px-2 py-0.5 rounded-lg ${
                                device.overall_health_score >= 85
                                  ? "bg-emerald-50 text-emerald-700"
                                  : device.overall_health_score >= 70
                                  ? "bg-amber-50 text-amber-700"
                                  : device.overall_health_score >= 50
                                  ? "bg-orange-50 text-orange-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {device.overall_health_score}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${cfg.badgeClass}`}
                            >
                              <StateIcon className="w-3 h-3" />
                              {cfg.label}
                            </span>
                          </td>

                          <td className="py-3 px-3 max-w-xs">
                            {device.top_diagnosis ? (
                              <div>
                                <div className="font-medium text-gray-900 truncate">
                                  {device.top_diagnosis.title}
                                </div>
                                <div className="font-mono text-[10px] text-gray-400 truncate">
                                  {device.top_diagnosis.cause_code}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">Nominal Operation</span>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            {device.top_diagnosis ? (
                              <span className="font-semibold text-gray-800">
                                {device.top_diagnosis.confidence_percentage.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-gray-400 text-[11px] whitespace-nowrap">
                            {device.last_evaluated}
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <Link href={`/dashboard/devices/${device.device_id}/diagnostics`}>
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
