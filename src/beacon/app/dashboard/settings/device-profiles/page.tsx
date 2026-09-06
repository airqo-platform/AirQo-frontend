"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { diagnosticsService } from "@/services/diagnosticsService";
import {
  DeviceProfile,
  getVendorName,
  getProfileCompleteness,
} from "@/types/diagnostics";
import { RegisterProfileModal } from "@/components/diagnostics/RegisterProfileModal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  Layers,
  Plus,
  Trash2,
  Sliders,
  ArrowRight,
  Download,
  RotateCcw,
  ChevronLeft,
  Search,
  Building2,
  Cpu,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Zap,
  ShieldAlert,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGroup } from "@/lib/group-context";

export default function DeviceProfilesCatalogPage() {
  const router = useRouter();
  const { activeGroup, loading: groupLoading } = useGroup();
  const isAirqoGroup = activeGroup?.toLowerCase() === "airqo";

  const [profiles, setProfiles] = useState<DeviceProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Register Modal (Header & Metadata only)
  const [registerModalOpen, setRegisterModalOpen] = useState<boolean>(false);

  // Load profiles from backend API
  const loadProfiles = useCallback(async () => {
    if (!isAirqoGroup) return;
    try {
      setLoading(true);
      const data = await diagnosticsService.getProfiles({
        category: categoryFilter !== "all" ? categoryFilter : undefined,
      });
      setProfiles(data);
    } catch (err: any) {
      console.error("Error loading device profiles:", err);
      setProfiles([]);
      toast({
        title: "Error Loading Profiles",
        description: err?.message || "Failed to load device profiles from server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, isAirqoGroup]);

  useEffect(() => {
    if (isAirqoGroup) {
      loadProfiles();
    }
  }, [loadProfiles, isAirqoGroup]);

  const handleDeleteProfile = async (e: React.MouseEvent, prof: DeviceProfile) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm(`Are you sure you want to delete profile "${prof.name}"?`)) return;
    try {
      await diagnosticsService.deleteProfile(prof.id);
      toast({ title: "Profile Deleted", description: `Removed profile ${prof.name}` });
      loadProfiles();
    } catch (err: any) {
      toast({ title: "Delete Error", description: err.message, variant: "destructive" });
    }
  };

  const handleSeedDefaults = async () => {
    try {
      const res = await diagnosticsService.seedDefaults();
      toast({ title: "Defaults Seeded", description: res.message });
      loadProfiles();
    } catch (err: any) {
      toast({ title: "Seed Error", description: err.message, variant: "destructive" });
    }
  };

  const handleExportJSON = (e: React.MouseEvent, prof: DeviceProfile) => {
    e.stopPropagation();
    e.preventDefault();
    const jsonStr = JSON.stringify(prof, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prof.name.toLowerCase()}_profile_schema.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredProfiles = profiles.filter((p) => {
    const completeness = getProfileCompleteness(p);
    if (statusFilter === "complete" && !completeness.isComplete) return false;
    if (statusFilter === "incomplete" && completeness.isComplete) return false;

    if (categoryFilter !== "all" && p.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const vendorName = getVendorName(p.vendor).toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        vendorName.includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Calculate aggregates
  const completeCount = profiles.filter((p) => getProfileCompleteness(p).isComplete).length;
  const incompleteCount = profiles.length - completeCount;

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
              Device Profiles & Hardware Topologies are exclusively available when the active organization is set to{" "}
              <span className="font-semibold text-primary">AirQo</span>.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/settings" className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" /> Settings
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-primary" />
            Device Profiles & Hardware Topologies
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Declarative hardware specifications. A complete profile requires Ingestion Slot Mappings, Subsystems, and Topological Relationships.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedDefaults}
            className="h-9 text-xs bg-white gap-1.5 text-gray-700 shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-primary" />
            Seed Default Profiles
          </Button>
          <Button
            onClick={() => setRegisterModalOpen(true)}
            size="sm"
            className="h-9 text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs font-medium"
          >
            <Plus className="w-4 h-4" />
            Register Device Profile
          </Button>
        </div>
      </div>

      {/* Aggregate Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="p-4 border-gray-200 bg-white shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Profiles</p>
              <h3 className="text-xl font-bold text-gray-900 mt-0.5">{profiles.length}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-emerald-100 bg-emerald-50/30 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Complete Profiles</p>
              <h3 className="text-xl font-bold text-emerald-900 mt-0.5">{completeCount}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-amber-100 bg-amber-50/30 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Incomplete</p>
              <h3 className="text-xl font-bold text-amber-900 mt-0.5">{incompleteCount}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-gray-200 bg-white shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Categories</p>
              <h3 className="text-xl font-bold text-gray-900 mt-0.5">
                {new Set(profiles.map((p) => p.category)).size}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          <Input
            placeholder="Search by profile name, vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs bg-slate-50/70 border-gray-200 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 text-xs bg-slate-50/70 border-gray-200 w-36">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status ({profiles.length})</SelectItem>
                <SelectItem value="complete">Complete ({completeCount})</SelectItem>
                <SelectItem value="incomplete">Incomplete ({incompleteCount})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Category:</span>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-8 text-xs bg-slate-50/70 border-gray-200 w-44">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="air_quality">Air Quality Stations</SelectItem>
                <SelectItem value="air_quality_gas">Air Quality Gas Monitor</SelectItem>
                <SelectItem value="reference_monitor">Reference Monitors (BAM/FEM)</SelectItem>
                <SelectItem value="cold_chain">Cold Chain Freezers</SelectItem>
                <SelectItem value="solar">Solar Microgrids</SelectItem>
                <SelectItem value="water_pump">Smart Water Pumps</SelectItem>
                <SelectItem value="weather_station">Weather Stations</SelectItem>
                <SelectItem value="generic_iot">Generic IoT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Profiles Catalog Grid */}
      {loading ? (
        <div className="p-16 text-center text-gray-400 bg-white rounded-xl border border-dashed">
          <Layers className="w-8 h-8 text-primary animate-pulse mx-auto mb-3" />
          <p className="text-sm font-medium">Loading registered hardware profiles...</p>
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-xl border border-dashed border-gray-200 space-y-3">
          <Layers className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-sm font-bold text-gray-800">No Device Profiles Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
              ? "No profiles match your current search and filter settings."
              : "No hardware profiles are registered yet. Seed default templates or register a new profile."}
          </p>
          <div className="pt-2">
            <Button size="sm" onClick={() => setRegisterModalOpen(true)} className="text-xs bg-primary text-white gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Register First Profile
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProfiles.map((prof) => {
            const completeness = getProfileCompleteness(prof);
            const telemetryCount = Object.keys(prof.telemetry_mappings || {}).length;
            const configCount = Object.keys(prof.config_mappings || {}).length;
            const metadataCount = Object.keys(prof.metadata_mappings || {}).length;
            const slotCount = telemetryCount + configCount + metadataCount;
            const subsystemCount = prof.components?.length || 0;
            const relCount = prof.relationships?.length || 0;
            const vendorName = getVendorName(prof.vendor);

            return (
              <Card
                key={prof.id}
                className={`border bg-white hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group ${
                  completeness.isComplete ? "border-gray-200 hover:border-primary/50" : "border-amber-200/80 hover:border-amber-400"
                }`}
              >
                <div>
                  {/* Card Top Banner */}
                  <CardHeader className="pb-3 border-b border-gray-100 bg-slate-50/40">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/dashboard/settings/device-profiles/${prof.id}`}
                          className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors flex items-center gap-1.5"
                        >
                          {prof.name}
                        </Link>
                        {vendorName && (
                          <p className="text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-gray-400" />
                            {vendorName}
                          </p>
                        )}
                      </div>

                      {/* Completeness Badge */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {completeness.isComplete ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Complete
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Incomplete
                          </span>
                        )}
                        <Badge
                          variant="secondary"
                          className="text-[9px] uppercase font-semibold text-gray-600 bg-slate-100 border-slate-200"
                        >
                          {prof.category.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-3.5 pb-2 space-y-3.5">
                    {/* Description */}
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed min-h-[32px]">
                      {prof.description || "No description provided for this profile."}
                    </p>

                    {/* Incomplete Missing Items Warning */}
                    {!completeness.isComplete && (
                      <div className="p-2 rounded-md bg-amber-50/80 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">Missing configuration:</span>{" "}
                          <span className="text-amber-900 font-medium">
                            {completeness.missingItems.join(", ")}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Stats Ribbon (Slots -> Subsystems -> Relations) */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                      <div className="p-1 rounded bg-white border border-slate-100">
                        <span className="text-[10px] text-gray-400 font-semibold uppercase block">Slots</span>
                        <span
                          className={`text-xs font-bold block mt-0.5 ${
                            slotCount > 0 ? "text-blue-600" : "text-amber-600"
                          }`}
                        >
                          {slotCount}
                        </span>
                      </div>
                      <div className="p-1 rounded bg-white border border-slate-100">
                        <span className="text-[10px] text-gray-400 font-semibold uppercase block">Subsystems</span>
                        <span
                          className={`text-xs font-bold block mt-0.5 ${
                            subsystemCount > 0 ? "text-gray-900" : "text-amber-600"
                          }`}
                        >
                          {subsystemCount}
                        </span>
                      </div>
                      <div className="p-1 rounded bg-white border border-slate-100">
                        <span className="text-[10px] text-gray-400 font-semibold uppercase block">Relations</span>
                        <span
                          className={`text-xs font-bold block mt-0.5 ${
                            relCount > 0 ? "text-purple-600" : "text-amber-600"
                          }`}
                        >
                          {relCount}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 border-t border-gray-100 bg-slate-50/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleExportJSON(e, prof)}
                      className="h-7 text-xs text-gray-600 hover:text-gray-900 p-1.5"
                      title="Export JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteProfile(e, prof)}
                      className="h-7 text-xs text-rose-500 hover:text-rose-700 p-1.5"
                      title="Delete Profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    asChild
                    className={`h-7 text-xs text-white gap-1 shadow-2xs font-semibold ${
                      completeness.isComplete
                        ? "bg-primary hover:bg-primary/90"
                        : "bg-amber-600 hover:bg-amber-700"
                    }`}
                  >
                    <Link href={`/dashboard/settings/device-profiles/${prof.id}`}>
                      {completeness.isComplete ? "View Specs" : "Complete Setup"}{" "}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Streamlined Register Modal (Header & Metadata Only) */}
      <RegisterProfileModal
        open={registerModalOpen}
        onOpenChange={setRegisterModalOpen}
        onSuccess={(created) => {
          router.push(`/dashboard/settings/device-profiles/${created.id}`);
        }}
      />
    </div>
  );
}
