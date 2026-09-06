"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { diagnosticsService } from "@/services/diagnosticsService";
import {
  DeviceProfile,
  ComponentDefinition,
  MetricDefinition,
  getVendorName,
  getProfileCompleteness,
  getRelationshipDetails,
} from "@/types/diagnostics";
import { EditHeaderModal } from "@/components/diagnostics/EditHeaderModal";
import { SubsystemModal } from "@/components/diagnostics/SubsystemModal";
import { MetricModal } from "@/components/diagnostics/MetricModal";
import { SlotMappingModal, SlotCategory } from "@/components/diagnostics/SlotMappingModal";
import { RelationshipModal } from "@/components/diagnostics/RelationshipModal";
import { SubsystemTopologyFlow } from "@/components/diagnostics/SubsystemTopologyFlow";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import {
  Layers,
  Trash2,
  Edit2,
  Sliders,
  Zap,
  Activity,
  Database,
  ArrowRight,
  Download,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  Code,
  Copy,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Building2,
  Plus,
  Cpu,
  Network,
  LayoutGrid,
  ShieldAlert,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGroup } from "@/lib/group-context";

export default function DeviceProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const profileId = (params?.id as string) || "";
  const { activeGroup, loading: groupLoading } = useGroup();
  const isAirqoGroup = activeGroup?.toLowerCase() === "airqo";

  const [profile, setProfile] = useState<DeviceProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Default tab order: slot mappings first, then subsystems, then relationships, then json
  const [activeTab, setActiveTab] = useState<string>("mappings");
  const [copied, setCopied] = useState<boolean>(false);

  // Relationship View Mode: "diagram" or "cards"
  const [relationshipViewMode, setRelationshipViewMode] = useState<"diagram" | "cards">("diagram");

  // Modular Modal States
  const [headerModalOpen, setHeaderModalOpen] = useState<boolean>(false);

  const [subsystemModalOpen, setSubsystemModalOpen] = useState<boolean>(false);
  const [editingSubsystem, setEditingSubsystem] = useState<ComponentDefinition | null>(null);
  const [editingSubsystemIndex, setEditingSubsystemIndex] = useState<number | null>(null);

  const [metricModalOpen, setMetricModalOpen] = useState<boolean>(false);
  const [metricSubsystemIndex, setMetricSubsystemIndex] = useState<number>(0);
  const [editingMetric, setEditingMetric] = useState<MetricDefinition | null>(null);
  const [editingMetricIndex, setEditingMetricIndex] = useState<number | null>(null);

  const [slotModalOpen, setSlotModalOpen] = useState<boolean>(false);
  const [slotCategory, setSlotCategory] = useState<SlotCategory>("telemetry");
  const [editingSlotKey, setEditingSlotKey] = useState<string | null>(null);
  const [editingSlotMapping, setEditingSlotMapping] = useState<any>(null);

  const [relModalOpen, setRelModalOpen] = useState<boolean>(false);
  const [editingRelIndex, setEditingRelIndex] = useState<number | null>(null);
  const [relPreselectedSource, setRelPreselectedSource] = useState<string | null>(null);
  const [relPreselectedTarget, setRelPreselectedTarget] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!profileId || !isAirqoGroup) return;
    try {
      setLoading(true);
      setError(null);
      const data = await diagnosticsService.getProfile(profileId);
      setProfile(data);
    } catch (err: any) {
      console.error("Error fetching device profile detail:", err);
      setError(err?.message || "Failed to load device profile.");
    } finally {
      setLoading(false);
    }
  }, [profileId, isAirqoGroup]);

  useEffect(() => {
    if (isAirqoGroup) {
      fetchProfile();
    }
  }, [fetchProfile, isAirqoGroup]);

  const handleExportJSON = () => {
    if (!profile) return;
    const jsonStr = JSON.stringify(profile, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile.name.toLowerCase()}_profile_schema.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJSON = async () => {
    if (!profile) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(profile, null, 2));
      setCopied(true);
      toast({ title: "Copied", description: "Profile JSON schema copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    } catch (err: any) {
      toast({
        title: "Failed to copy",
        description: err?.message || "Could not copy profile schema to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProfile = async () => {
    if (!profile) return;
    if (!confirm(`Are you sure you want to delete profile "${profile.name}"?`)) return;

    try {
      await diagnosticsService.deleteProfile(profile.id);
      toast({ title: "Profile Deleted", description: `Removed profile ${profile.name}` });
      router.push("/dashboard/settings/device-profiles");
    } catch (err: any) {
      toast({
        title: "Delete Error",
        description: err.message || "Failed to delete profile",
        variant: "destructive",
      });
    }
  };

  // Subsystem handlers
  const handleOpenAddSubsystem = () => {
    setEditingSubsystem(null);
    setEditingSubsystemIndex(null);
    setSubsystemModalOpen(true);
  };

  const handleOpenEditSubsystem = (comp: ComponentDefinition, idx: number) => {
    setEditingSubsystem(comp);
    setEditingSubsystemIndex(idx);
    setSubsystemModalOpen(true);
  };

  const handleDeleteSubsystem = async (idx: number) => {
    if (!profile) return;
    const targetComp = profile.components?.[idx];
    const compName = targetComp?.name || "Subsystem";
    if (!confirm(`Are you sure you want to remove subsystem "${compName}" and its declared metrics?`)) return;

    const currentComponents = [...(profile.components || [])];
    currentComponents.splice(idx, 1);

    const compIdentifiers = new Set([targetComp?.name, targetComp?.id].filter(Boolean) as string[]);

    const filteredRelationships = (profile.relationships || []).filter((rel) => {
      if (compIdentifiers.size === 0) return true;
      const details = getRelationshipDetails(rel, profile.components);
      const isSourceMatch =
        compIdentifiers.has(details.sourceName) ||
        (details.sourceId ? compIdentifiers.has(details.sourceId) : false) ||
        (rel.source_component ? compIdentifiers.has(rel.source_component) : false) ||
        (rel.source_component_id ? compIdentifiers.has(rel.source_component_id) : false) ||
        (rel.source_component_name ? compIdentifiers.has(rel.source_component_name) : false);

      const isTargetMatch =
        compIdentifiers.has(details.targetName) ||
        (details.targetId ? compIdentifiers.has(details.targetId) : false) ||
        (rel.target_component ? compIdentifiers.has(rel.target_component) : false) ||
        (rel.target_component_id ? compIdentifiers.has(rel.target_component_id) : false) ||
        (rel.target_component_name ? compIdentifiers.has(rel.target_component_name) : false);

      return !isSourceMatch && !isTargetMatch;
    });

    const payload: Partial<DeviceProfile> = {
      ...profile,
      components: currentComponents,
      relationships: filteredRelationships,
    };

    try {
      const updated = await diagnosticsService.updateProfile(profile.id, payload);
      setProfile(updated);
      toast({ title: "Subsystem Removed", description: `Removed ${compName}` });
    } catch (err: any) {
      toast({ title: "Error Removing Subsystem", description: err.message, variant: "destructive" });
    }
  };

  // Metric handlers
  const handleOpenAddMetric = (compIdx: number) => {
    setMetricSubsystemIndex(compIdx);
    setEditingMetric(null);
    setEditingMetricIndex(null);
    setMetricModalOpen(true);
  };

  const handleOpenEditMetric = (compIdx: number, m: MetricDefinition, mIdx: number) => {
    setMetricSubsystemIndex(compIdx);
    setEditingMetric(m);
    setEditingMetricIndex(mIdx);
    setMetricModalOpen(true);
  };

  const handleDeleteMetric = async (compIdx: number, metricIdx: number) => {
    if (!profile) return;
    const currentComponents = JSON.parse(JSON.stringify(profile.components || []));
    if (!currentComponents[compIdx]?.metrics) return;
    const mKey = currentComponents[compIdx].metrics[metricIdx]?.key;

    currentComponents[compIdx].metrics.splice(metricIdx, 1);
    const payload: Partial<DeviceProfile> = {
      ...profile,
      components: currentComponents,
    };

    try {
      const updated = await diagnosticsService.updateProfile(profile.id, payload);
      setProfile(updated);
      toast({ title: "Metric Removed", description: `Removed metric ${mKey}` });
    } catch (err: any) {
      toast({ title: "Error Removing Metric", description: err.message, variant: "destructive" });
    }
  };

  // Slot mapping handlers
  const handleOpenAddSlot = (category: SlotCategory) => {
    setSlotCategory(category);
    setEditingSlotKey(null);
    setEditingSlotMapping(null);
    setSlotModalOpen(true);
  };

  const handleOpenEditSlot = (category: SlotCategory, slotKey: string, mapping: any) => {
    setSlotCategory(category);
    setEditingSlotKey(slotKey);
    setEditingSlotMapping(mapping);
    setSlotModalOpen(true);
  };

  const handleDeleteSlot = async (category: SlotCategory, slotKey: string) => {
    if (!profile) return;
    if (!confirm(`Delete slot mapping "${slotKey}"?`)) return;

    const payload: Partial<DeviceProfile> = { ...profile };
    if (category === "telemetry") {
      const tm = { ...(profile.telemetry_mappings || {}) };
      delete tm[slotKey];
      payload.telemetry_mappings = tm;
    } else if (category === "config") {
      const cm = { ...(profile.config_mappings || {}) };
      delete cm[slotKey];
      payload.config_mappings = cm;
    } else {
      const mm = { ...(profile.metadata_mappings || {}) };
      delete mm[slotKey];
      payload.metadata_mappings = mm;
    }

    try {
      const updated = await diagnosticsService.updateProfile(profile.id, payload);
      setProfile(updated);
      toast({ title: "Slot Removed", description: `Removed mapping ${slotKey}` });
    } catch (err: any) {
      toast({ title: "Error Removing Slot", description: err.message, variant: "destructive" });
    }
  };

  // Relationship handlers
  const handleOpenAddRelationship = (src?: string, tgt?: string) => {
    setEditingRelIndex(null);
    setRelPreselectedSource(src || null);
    setRelPreselectedTarget(tgt || null);
    setRelModalOpen(true);
  };

  const handleOpenEditRelationship = (idx: number) => {
    setEditingRelIndex(idx);
    setRelModalOpen(true);
  };

  const handleDeleteRelationship = async (idx: number) => {
    if (!profile) return;
    const rel = profile.relationships?.[idx];
    const details = rel ? getRelationshipDetails(rel, profile.components) : null;
    const confirmMessage = details
      ? `Are you sure you want to remove the relationship "${details.sourceName} → ${details.targetName}"?`
      : "Are you sure you want to remove this relationship?";
    if (!confirm(confirmMessage)) return;

    const currentRels = [...(profile.relationships || [])];
    currentRels.splice(idx, 1);
    const payload: Partial<DeviceProfile> = {
      ...profile,
      relationships: currentRels,
    };

    try {
      const updated = await diagnosticsService.updateProfile(profile.id, payload);
      setProfile(updated);
      toast({ title: "Relationship Removed", description: "Subsystem link removed." });
    } catch (err: any) {
      toast({ title: "Error Removing Relationship", description: err.message, variant: "destructive" });
    }
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
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Link href="/dashboard/settings/device-profiles" className="hover:text-gray-600 flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Profiles
          </Link>
        </div>
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

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Link href="/dashboard/settings/device-profiles" className="hover:text-gray-600 flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Profiles
          </Link>
        </div>
        <Card className="p-12 text-center text-gray-400 border border-dashed rounded-xl">
          <Layers className="w-8 h-8 text-primary animate-pulse mx-auto mb-3" />
          <p className="text-sm font-medium">Loading hardware profile specification...</p>
        </Card>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Link href="/dashboard/settings/device-profiles" className="hover:text-gray-600 flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Profiles
          </Link>
        </div>
        <Card className="p-8 text-center border-rose-200 bg-rose-50/50 rounded-xl space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-gray-900">Profile Not Found</h3>
            <p className="text-xs text-gray-600 mt-1 max-w-md mx-auto">
              {error || "The requested IoT hardware profile could not be located or may have been deleted."}
            </p>
          </div>
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchProfile} className="text-xs bg-white gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" /> Retry
            </Button>
            <Button size="sm" asChild className="text-xs bg-primary text-white">
              <Link href="/dashboard/settings/device-profiles">Return to Profiles Catalog</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const completeness = getProfileCompleteness(profile);
  const telemetryCount = Object.keys(profile.telemetry_mappings || {}).length;
  const configCount = Object.keys(profile.config_mappings || {}).length;
  const metaCount = Object.keys(profile.metadata_mappings || {}).length;
  const totalSlots = telemetryCount + configCount + metaCount;
  const subsystemCount = profile.components?.length || 0;
  const relCount = profile.relationships?.length || 0;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link href="/dashboard/settings" className="hover:text-gray-700">
            Settings
          </Link>
          <span>/</span>
          <Link href="/dashboard/settings/device-profiles" className="hover:text-gray-700">
            Device Profiles
          </Link>
          <span>/</span>
          <span className="font-semibold text-gray-900">{profile.name}</span>
        </div>

        <Button variant="ghost" size="sm" asChild className="h-8 text-xs text-gray-600 gap-1 hover:bg-slate-100">
          <Link href="/dashboard/settings/device-profiles">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Catalog
          </Link>
        </Button>
      </div>

      {/* Profile Completeness Alert Banner if Incomplete */}
      {!completeness.isComplete && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-900 shadow-2xs space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Profile Configuration Incomplete
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  A hardware profile must have all 3 core layers before it can be assigned to live stations:{" "}
                  <strong>Slot Mappings</strong>, <strong>Subsystems</strong>, and <strong>Topological Relationships</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => setActiveTab("mappings")}
              className={`p-2 rounded-lg border text-left text-xs flex items-center justify-between transition-colors ${
                completeness.hasSlots
                  ? "bg-white/80 border-emerald-200 text-emerald-800"
                  : "bg-white border-amber-300 text-amber-900 hover:bg-amber-100/50"
              }`}
            >
              <div className="flex items-center gap-1.5 font-medium">
                {completeness.hasSlots ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>1. Ingestion Slots</span>
              </div>
              <span className="font-bold text-[11px] font-mono">
                {completeness.hasSlots ? `${totalSlots} defined` : "Missing"}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("components")}
              className={`p-2 rounded-lg border text-left text-xs flex items-center justify-between transition-colors ${
                completeness.hasSubsystems
                  ? "bg-white/80 border-emerald-200 text-emerald-800"
                  : "bg-white border-amber-300 text-amber-900 hover:bg-amber-100/50"
              }`}
            >
              <div className="flex items-center gap-1.5 font-medium">
                {completeness.hasSubsystems ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>2. Subsystems</span>
              </div>
              <span className="font-bold text-[11px] font-mono">
                {completeness.hasSubsystems ? `${subsystemCount} defined` : "Missing"}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("relationships")}
              className={`p-2 rounded-lg border text-left text-xs flex items-center justify-between transition-colors ${
                completeness.hasRelationships
                  ? "bg-white/80 border-emerald-200 text-emerald-800"
                  : "bg-white border-amber-300 text-amber-900 hover:bg-amber-100/50"
              }`}
            >
              <div className="flex items-center gap-1.5 font-medium">
                {completeness.hasRelationships ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>3. Relationships</span>
              </div>
              <span className="font-bold text-[11px] font-mono">
                {completeness.hasRelationships ? `${relCount} links` : "Missing"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Main Header Card */}
      <Card className="border border-gray-200 shadow-xs overflow-hidden">
        <CardHeader className="bg-slate-50/70 border-b border-gray-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-xl font-bold text-gray-900">{profile.name}</CardTitle>
                    <Badge
                      variant="secondary"
                      className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 border-emerald-200 uppercase tracking-wide"
                    >
                      {profile.category.replace(/_/g, " ")}
                    </Badge>

                    {/* Status Badge */}
                    {completeness.isComplete ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Complete Profile
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Incomplete Profile
                      </span>
                    )}
                  </div>
                  {getVendorName(profile.vendor) && (
                    <CardDescription className="text-xs text-gray-600 mt-1 font-medium flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      Vendor: {getVendorName(profile.vendor)}
                    </CardDescription>
                  )}
                </div>
              </div>
            </div>

            {/* Top Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyJSON}
                className="h-8 text-xs bg-white gap-1.5 shadow-2xs"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                {copied ? "Copied" : "Copy JSON"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJSON}
                className="h-8 text-xs bg-white gap-1.5 shadow-2xs"
                title="Download JSON schema"
              >
                <Download className="w-3.5 h-3.5 text-gray-500" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHeaderModalOpen(true)}
                className="h-8 text-xs bg-white text-primary border-primary/20 hover:bg-primary/10 gap-1.5 shadow-2xs font-semibold"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Header Info
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteProfile}
                className="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 p-2 shadow-2xs"
                title="Delete Profile"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Description */}
          {profile.description && (
            <p className="text-xs text-gray-600 bg-white p-3 rounded-lg border border-slate-200/80 leading-relaxed mt-3">
              {profile.description}
            </p>
          )}

          {/* Custom Meta Data Tags */}
          {profile.meta_data && Object.keys(profile.meta_data).length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Meta Tags:
              </span>
              {Object.entries(profile.meta_data).map(([k, v]) => (
                <span key={k} className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-mono text-gray-700 border">
                  <span className="text-gray-400">{k}:</span> {String(v)}
                </span>
              ))}
            </div>
          )}
        </CardHeader>

        {/* Quick Stat Summary Ribbon (Ordered: Slots -> Subsystems -> Relations) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-100 border-b border-gray-100">
          <div className="bg-white p-3 sm:p-4 text-center">
            <span className="text-[11px] text-blue-500 font-semibold uppercase tracking-wider block">
              Telemetry Slots
            </span>
            <span className="text-xl font-bold text-blue-600 mt-0.5 block">{telemetryCount}</span>
          </div>
          <div className="bg-white p-3 sm:p-4 text-center">
            <span className="text-[11px] text-amber-500 font-semibold uppercase tracking-wider block">
              Config Slots
            </span>
            <span className="text-xl font-bold text-amber-600 mt-0.5 block">{configCount}</span>
          </div>
          <div className="bg-white p-3 sm:p-4 text-center">
            <span className="text-[11px] text-gray-600 font-semibold uppercase tracking-wider block">
              Subsystems
            </span>
            <span className={`text-xl font-bold mt-0.5 block ${subsystemCount > 0 ? "text-gray-900" : "text-amber-600"}`}>
              {subsystemCount}
            </span>
          </div>
          <div className="bg-white p-3 sm:p-4 text-center">
            <span className="text-[11px] text-purple-500 font-semibold uppercase tracking-wider block">
              Relationships
            </span>
            <span className={`text-xl font-bold mt-0.5 block ${relCount > 0 ? "text-purple-600" : "text-amber-600"}`}>
              {relCount}
            </span>
          </div>
        </div>

        {/* 4-Tab Specification Body in Requested Logical Order: Slot Mappings -> Subsystems -> Relationships -> JSON */}
        <CardContent className="pt-4 pb-6 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 h-9 bg-slate-100 p-1 text-xs">
              <TabsTrigger value="mappings" className="text-xs gap-1.5 flex items-center justify-center">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span>1. Slot Mappings ({totalSlots})</span>
                {completeness.hasSlots ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 ml-0.5 shrink-0" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ml-0.5 shrink-0" />
                )}
              </TabsTrigger>
              <TabsTrigger value="components" className="text-xs gap-1.5 flex items-center justify-center">
                <Layers className="w-3.5 h-3.5 text-primary" />
                <span>2. Subsystems ({subsystemCount})</span>
                {completeness.hasSubsystems ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 ml-0.5 shrink-0" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ml-0.5 shrink-0" />
                )}
              </TabsTrigger>
              <TabsTrigger value="relationships" className="text-xs gap-1.5 flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 text-purple-500" />
                <span>3. Relationships ({relCount})</span>
                {completeness.hasRelationships ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 ml-0.5 shrink-0" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ml-0.5 shrink-0" />
                )}
              </TabsTrigger>
              <TabsTrigger value="json" className="text-xs gap-1.5 flex items-center justify-center">
                <Code className="w-3.5 h-3.5 text-slate-600" />
                <span>4. JSON Schema</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Ingestion Slot Mappings */}
            <TabsContent value="mappings" className="space-y-6 pt-4">
              {/* Telemetry Mappings Table */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-blue-600" />
                      Telemetry Stream Slots ({telemetryCount})
                    </span>
                    <p className="text-[11px] text-gray-500">
                      Define raw ingestion slots (e.g. field1–field20), semantic keys, and measurement units first.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleOpenAddSlot("telemetry")}
                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Telemetry Slot
                  </Button>
                </div>
                <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-gray-200 text-[11px] text-gray-500 uppercase font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Slot</th>
                        <th className="py-2.5 px-3">Semantic Key</th>
                        <th className="py-2.5 px-3">Label</th>
                        <th className="py-2.5 px-3">Unit</th>
                        <th className="py-2.5 px-3">Source Channel</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                      {telemetryCount === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-4 px-3 text-center text-gray-400 font-sans">
                            No telemetry mappings defined yet. Click &quot;Add Telemetry Slot&quot; above.
                          </td>
                        </tr>
                      ) : (
                        Object.entries(profile.telemetry_mappings || {}).map(([slot, map]) => (
                          <tr key={slot} className="hover:bg-slate-50/80">
                            <td className="py-2.5 px-3 font-bold text-primary">{slot}</td>
                            <td className="py-2.5 px-3 font-semibold text-gray-900">{map.key}</td>
                            <td className="py-2.5 px-3 font-sans text-gray-600">{map.label}</td>
                            <td className="py-2.5 px-3 text-gray-500">{map.unit || "—"}</td>
                            <td className="py-2.5 px-3 text-gray-400">{map.source || "—"}</td>
                            <td className="py-2.5 px-3 text-right font-sans">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenEditSlot("telemetry", slot, map)}
                                  className="h-6 w-6 p-0 text-gray-500 hover:text-primary"
                                  title="Edit Slot"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteSlot("telemetry", slot)}
                                  className="h-6 w-6 p-0 text-rose-500 hover:text-rose-700"
                                  title="Delete Slot"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Config Mappings Table */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-500" />
                      Config Parameter Slots ({configCount})
                    </span>
                    <p className="text-[11px] text-gray-500">
                      Map configuration slots (e.g. config1–config10) to parameter settings and default values.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleOpenAddSlot("config")}
                    className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Config Slot
                  </Button>
                </div>
                <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-gray-200 text-[11px] text-gray-500 uppercase font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Slot</th>
                        <th className="py-2.5 px-3">Parameter Key</th>
                        <th className="py-2.5 px-3">Label</th>
                        <th className="py-2.5 px-3">Data Type</th>
                        <th className="py-2.5 px-3">Default Value</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                      {configCount === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-4 px-3 text-center text-gray-400 font-sans">
                            No config parameter mappings defined.
                          </td>
                        </tr>
                      ) : (
                        Object.entries(profile.config_mappings || {}).map(([slot, map]) => (
                          <tr key={slot} className="hover:bg-slate-50/80">
                            <td className="py-2.5 px-3 font-bold text-amber-600">{slot}</td>
                            <td className="py-2.5 px-3 font-semibold text-gray-900">{map.key}</td>
                            <td className="py-2.5 px-3 font-sans text-gray-600">{map.label}</td>
                            <td className="py-2.5 px-3 text-gray-500">{map.type || "str"}</td>
                            <td className="py-2.5 px-3 text-gray-800 font-bold">
                              {map.default !== undefined ? String(map.default) : "—"}
                            </td>
                            <td className="py-2.5 px-3 text-right font-sans">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenEditSlot("config", slot, map)}
                                  className="h-6 w-6 p-0 text-gray-500 hover:text-primary"
                                  title="Edit Slot"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteSlot("config", slot)}
                                  className="h-6 w-6 p-0 text-rose-500 hover:text-rose-700"
                                  title="Delete Slot"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Metadata Mappings Table */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-purple-600" />
                      Hardware Metadata Slots ({metaCount})
                    </span>
                    <p className="text-[11px] text-gray-500">
                      Map static hardware tag slots (metadata1–metadata15) to custom attributes.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleOpenAddSlot("metadata")}
                    className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Metadata Slot
                  </Button>
                </div>
                <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-gray-200 text-[11px] text-gray-500 uppercase font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Slot</th>
                        <th className="py-2.5 px-3">Attribute Key</th>
                        <th className="py-2.5 px-3">Label</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                      {metaCount === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-4 px-3 text-center text-gray-400 font-sans">
                            No metadata mappings defined.
                          </td>
                        </tr>
                      ) : (
                        Object.entries(profile.metadata_mappings || {}).map(([slot, map]) => (
                          <tr key={slot} className="hover:bg-slate-50/80">
                            <td className="py-2.5 px-3 font-bold text-purple-600">{slot}</td>
                            <td className="py-2.5 px-3 font-semibold text-gray-900">{map.key}</td>
                            <td className="py-2.5 px-3 font-sans text-gray-600">{map.label}</td>
                            <td className="py-2.5 px-3 text-right font-sans">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenEditSlot("metadata", slot, map)}
                                  className="h-6 w-6 p-0 text-gray-500 hover:text-primary"
                                  title="Edit Slot"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteSlot("metadata", slot)}
                                  className="h-6 w-6 p-0 text-rose-500 hover:text-rose-700"
                                  title="Delete Slot"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: Subsystem Components & Metric Limits */}
            <TabsContent value="components" className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Hardware Subsystems & Metric Limits
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Each subsystem defines an isolated failure domain. Metrics select from mapped telemetry keys with auto-filled units.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleOpenAddSubsystem}
                  className="h-8 text-xs bg-primary hover:bg-primary/90 text-white gap-1 shadow-2xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Subsystem
                </Button>
              </div>

              {profile.components && profile.components.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.components.map((comp, idx) => (
                    <div
                      key={comp.id || idx}
                      className="p-4 rounded-xl border border-gray-200 bg-white shadow-2xs space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        {/* Subsystem Card Header */}
                        <div className="flex items-start justify-between gap-2 border-b pb-2.5">
                          <div>
                            <h4 className="font-bold text-sm text-gray-900">{comp.name}</h4>
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider font-mono">
                              {comp.component_type}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                              Weight: {(comp.criticality * 100).toFixed(0)}%
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditSubsystem(comp, idx)}
                              className="h-6 w-6 p-0 text-gray-500 hover:text-primary"
                              title="Edit Subsystem"
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSubsystem(idx)}
                              className="h-6 w-6 p-0 text-rose-500 hover:text-rose-700"
                              title="Delete Subsystem"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Metric Fields List */}
                        <div className="space-y-1.5 text-xs mt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              Metrics ({comp.metrics?.length || 0})
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenAddMetric(idx)}
                              className="h-6 text-[11px] text-primary hover:text-primary/80 gap-1 px-1.5 font-semibold"
                            >
                              <Plus className="w-3 h-3" /> Add Metric
                            </Button>
                          </div>

                          {comp.metrics && comp.metrics.length > 0 ? (
                            <div className="space-y-1.5">
                              {comp.metrics.map((m, mIdx) => (
                                <div
                                  key={m.id || mIdx}
                                  className="p-2 rounded-md bg-slate-50 border border-slate-100 flex flex-col gap-1 text-[11px] group"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold font-mono text-gray-800">
                                      {m.key} {m.unit && <span className="text-blue-600 font-sans">({m.unit})</span>}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/80 font-mono text-slate-700">
                                        {m.data_type || "float"}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleOpenEditMetric(idx, m, mIdx)}
                                        className="h-5 w-5 p-0 text-gray-400 hover:text-primary"
                                        title="Edit Metric"
                                      >
                                        <Edit2 className="w-2.5 h-2.5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteMetric(idx, mIdx)}
                                        className="h-5 w-5 p-0 text-gray-400 hover:text-rose-600"
                                        title="Delete Metric"
                                      >
                                        <Trash2 className="w-2.5 h-2.5" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                                    <span>
                                      Limits: [
                                      {m.expected_min !== null && m.expected_min !== undefined ? m.expected_min : "-∞"}{" "}
                                      ...{" "}
                                      {m.expected_max !== null && m.expected_max !== undefined ? m.expected_max : "+∞"}
                                      ]
                                    </span>
                                    {m.max_rate_of_change !== null && m.max_rate_of_change !== undefined && (
                                      <span className="text-amber-600 font-semibold">
                                        Δmax: {m.max_rate_of_change}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-gray-400 italic py-2">
                              No specific metric bounds declared. Click &quot;Add Metric&quot; to assign telemetry keys.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-gray-400 border border-dashed rounded-xl bg-slate-50 text-xs space-y-2">
                  <Cpu className="w-8 h-8 text-gray-300 mx-auto" />
                  <p>No subsystems defined yet. Add battery, sensors, or modem components.</p>
                  <Button size="sm" onClick={handleOpenAddSubsystem} className="text-xs bg-primary text-white gap-1 mt-1">
                    <Plus className="w-3.5 h-3.5" /> Add First Subsystem
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* TAB 3: Topological Relationships & Interactive Flow Diagram */}
            <TabsContent value="relationships" className="space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Subsystem Topological Relationships & Flow Diagram
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Defines physical supply paths (power, cooling, data bus) and causal cascades across hardware subsystems.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* View Mode Toggle: Interactive Diagram vs. Card Grid */}
                  <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setRelationshipViewMode("diagram")}
                      className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition-all ${
                        relationshipViewMode === "diagram"
                          ? "bg-white text-primary shadow-2xs font-semibold"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                      title="Interactive Flow Visualizer"
                    >
                      <Network className="w-3.5 h-3.5 text-primary" />
                      <span>Interactive Diagram</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRelationshipViewMode("cards")}
                      className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition-all ${
                        relationshipViewMode === "cards"
                          ? "bg-white text-primary shadow-2xs font-semibold"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                      title="Grid Card View"
                    >
                      <LayoutGrid className="w-3.5 h-3.5 text-gray-500" />
                      <span>Card List</span>
                    </button>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleOpenAddRelationship()}
                    className="h-8 text-xs bg-primary hover:bg-primary/90 text-white gap-1 shadow-2xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Link Subsystems
                  </Button>
                </div>
              </div>

              {/* View 1: Interactive Diagram */}
              {relationshipViewMode === "diagram" && (
                <div className="space-y-3">
                  <SubsystemTopologyFlow
                    profile={profile}
                    onEditSubsystem={handleOpenEditSubsystem}
                    onAddMetric={handleOpenAddMetric}
                    onEditRelationship={handleOpenEditRelationship}
                    onDeleteRelationship={handleDeleteRelationship}
                    onOpenAddRelationship={(src, tgt) => handleOpenAddRelationship(src, tgt)}
                    onOpenAddSubsystem={handleOpenAddSubsystem}
                    onSuccess={(updated) => setProfile(updated)}
                  />
                </div>
              )}

              {/* View 2: Cards Grid */}
              {relationshipViewMode === "cards" && (
                <div>
                  {profile.relationships && profile.relationships.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {profile.relationships.map((rel, idx) => {
                        const relInfo = getRelationshipDetails(rel, profile.components);
                        const relBadgeStyle = (() => {
                          switch (relInfo.relationType) {
                            case "POWERS":
                              return "bg-amber-100 text-amber-800 border-amber-300";
                            case "COOLS":
                              return "bg-sky-100 text-sky-800 border-sky-300";
                            case "COMMUNICATES_VIA":
                              return "bg-emerald-100 text-emerald-800 border-emerald-300";
                            case "MEASURES_SAME_AS":
                              return "bg-purple-100 text-purple-800 border-purple-300";
                            default:
                              return "bg-primary/10 text-primary border-primary/20";
                          }
                        })();

                        return (
                          <div
                            key={rel.id || idx}
                            className="p-3.5 rounded-lg border border-gray-200 bg-white shadow-2xs flex items-center justify-between text-xs group"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">{relInfo.sourceName}</span>
                              <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${relBadgeStyle}`}>
                                <ArrowRight className="w-3 h-3" />
                                {relInfo.relationType}
                              </span>
                              <span className="font-bold text-gray-900">{relInfo.targetName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEditRelationship(idx)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-primary"
                                title="Edit Link"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRelationship(idx)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-rose-600"
                                title="Delete Link"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-gray-400 bg-slate-50 border border-dashed rounded-xl text-xs space-y-2">
                      <Activity className="w-8 h-8 text-gray-300 mx-auto" />
                      <p>No subsystem topology relationships defined yet.</p>
                      <Button size="sm" onClick={() => handleOpenAddRelationship()} className="text-xs bg-primary text-white gap-1 mt-1">
                        <Plus className="w-3.5 h-3.5" /> Establish First Link
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* TAB 4: Raw JSON Schema */}
            <TabsContent value="json" className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-mono">Profile ID: {profile.id}</span>
                <Button size="sm" variant="outline" onClick={handleCopyJSON} className="h-7 text-xs bg-white gap-1">
                  <Copy className="w-3 h-3" /> Copy JSON
                </Button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-[500px] leading-relaxed">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modular Modals */}
      <EditHeaderModal
        open={headerModalOpen}
        onOpenChange={setHeaderModalOpen}
        profile={profile}
        onSuccess={(updated) => setProfile(updated)}
      />

      <SubsystemModal
        open={subsystemModalOpen}
        onOpenChange={setSubsystemModalOpen}
        profile={profile}
        subsystem={editingSubsystem}
        subsystemIndex={editingSubsystemIndex}
        onSuccess={(updated) => setProfile(updated)}
      />

      <MetricModal
        open={metricModalOpen}
        onOpenChange={setMetricModalOpen}
        profile={profile}
        subsystemIndex={metricSubsystemIndex}
        metric={editingMetric}
        metricIndex={editingMetricIndex}
        onSuccess={(updated) => setProfile(updated)}
      />

      <SlotMappingModal
        open={slotModalOpen}
        onOpenChange={setSlotModalOpen}
        profile={profile}
        slotCategory={slotCategory}
        editingSlotKey={editingSlotKey}
        existingMapping={editingSlotMapping}
        onSuccess={(updated) => setProfile(updated)}
      />

      <RelationshipModal
        open={relModalOpen}
        onOpenChange={setRelModalOpen}
        profile={profile}
        relationshipIndex={editingRelIndex}
        preselectedSource={relPreselectedSource}
        preselectedTarget={relPreselectedTarget}
        onSuccess={(updated) => setProfile(updated)}
      />
    </div>
  );
}
