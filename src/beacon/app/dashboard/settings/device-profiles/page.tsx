"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { diagnosticsService } from "@/services/diagnosticsService";
import { DeviceProfile, ComponentDefinition, MetricDefinition, ComponentRelationship } from "@/types/diagnostics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  Sliders,
  Zap,
  Activity,
  Wifi,
  Snowflake,
  Cog,
  Cpu,
  Database,
  ArrowRight,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  ChevronLeft,
} from "lucide-react";

export default function DeviceProfilesPage() {
  const [profiles, setProfiles] = useState<DeviceProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProfile, setSelectedProfile] = useState<DeviceProfile | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // Form State for Profile Editor
  const [formName, setFormName] = useState<string>("");
  const [formCategory, setFormCategory] = useState<string>("air_quality");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formVendor, setFormVendor] = useState<string>("");
  const [formFirmware, setFormFirmware] = useState<string>(">=v1.0.0");
  const [componentsList, setComponentsList] = useState<ComponentDefinition[]>([]);
  const [relationshipsList, setRelationshipsList] = useState<ComponentRelationship[]>([]);

  // Subsystem Component sub-form
  const [compName, setCompName] = useState<string>("");
  const [compType, setCompType] = useState<ComponentDefinition["component_type"]>("power");
  const [compCriticality, setCompCriticality] = useState<number>(0.9);

  // Metric field sub-form
  const [metricKey, setMetricKey] = useState<string>("");
  const [metricName, setMetricName] = useState<string>("");
  const [metricUnit, setMetricUnit] = useState<string>("");
  const [metricMin, setMetricMin] = useState<string>("");
  const [metricMax, setMetricMax] = useState<string>("");

  // Relationship sub-form
  const [relSource, setRelSource] = useState<string>("");
  const [relTarget, setRelTarget] = useState<string>("");
  const [relType, setRelType] = useState<ComponentRelationship["relation_type"]>("POWERS");

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await diagnosticsService.getProfiles();
      setProfiles(data);
      if (data.length > 0 && !selectedProfile) {
        setSelectedProfile(data[0]);
      }
    } catch (err) {
      console.error("Error loading device profiles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormName("");
    setFormCategory("air_quality");
    setFormDescription("");
    setFormVendor("AirQo Custom");
    setFormFirmware(">=v1.0.0");
    setComponentsList([
      {
        id: `comp_${Date.now()}`,
        name: "Power System",
        component_type: "power",
        criticality: 0.95,
        metrics: [
          { key: "battery_voltage", name: "Battery Voltage", unit: "V", expected_min: 11.2, expected_max: 14.6, is_telemetry_field: true },
        ],
      },
    ]);
    setRelationshipsList([]);
    setModalOpen(true);
  };

  const handleOpenEdit = (prof: DeviceProfile) => {
    setIsEditing(true);
    setFormName(prof.name);
    setFormCategory(prof.category);
    setFormDescription(prof.description || "");
    setFormVendor(prof.vendor || "");
    setFormFirmware(prof.firmware_compatibility || ">=v1.0.0");
    setComponentsList(JSON.parse(JSON.stringify(prof.components || [])));
    setRelationshipsList(JSON.parse(JSON.stringify(prof.relationships || [])));
    setModalOpen(true);
  };

  const handleAddComponent = () => {
    if (!compName.trim()) {
      toast({ title: "Name Required", description: "Enter component name", variant: "destructive" });
      return;
    }
    const newComp: ComponentDefinition = {
      id: `comp_${Date.now()}`,
      name: compName.trim(),
      component_type: compType,
      criticality: Number(compCriticality),
      metrics: [],
    };
    setComponentsList([...componentsList, newComp]);
    setCompName("");
  };

  const handleRemoveComponent = (idx: number) => {
    const updated = [...componentsList];
    updated.splice(idx, 1);
    setComponentsList(updated);
  };

  const handleAddMetricToComp = (compIdx: number) => {
    if (!metricKey.trim()) {
      toast({ title: "Metric Key Required", description: "e.g. battery_voltage", variant: "destructive" });
      return;
    }
    const newMetric: MetricDefinition = {
      id: `m_${Date.now()}`,
      key: metricKey.trim(),
      name: metricName.trim() || metricKey.trim(),
      unit: metricUnit.trim() || undefined,
      expected_min: metricMin ? Number(metricMin) : undefined,
      expected_max: metricMax ? Number(metricMax) : undefined,
      is_telemetry_field: true,
    };
    const updated = [...componentsList];
    if (!updated[compIdx].metrics) updated[compIdx].metrics = [];
    updated[compIdx].metrics!.push(newMetric);
    setComponentsList(updated);
    setMetricKey("");
    setMetricName("");
    setMetricUnit("");
    setMetricMin("");
    setMetricMax("");
  };

  const handleAddRelationship = () => {
    if (!relSource || !relTarget) {
      toast({ title: "Select Components", description: "Select source and target component", variant: "destructive" });
      return;
    }
    const newRel: ComponentRelationship = {
      id: `rel_${Date.now()}`,
      source_component: relSource,
      target_component: relTarget,
      relation_type: relType,
    };
    setRelationshipsList([...relationshipsList, newRel]);
  };

  const handleRemoveRelationship = (idx: number) => {
    const updated = [...relationshipsList];
    updated.splice(idx, 1);
    setRelationshipsList(updated);
  };

  const handleSaveProfile = async () => {
    if (!formName.trim()) {
      toast({ title: "Validation Error", description: "Profile Name is required", variant: "destructive" });
      return;
    }

    try {
      const payload: Partial<DeviceProfile> = {
        name: formName,
        category: formCategory,
        description: formDescription,
        vendor: formVendor,
        firmware_compatibility: formFirmware,
        components: componentsList,
        relationships: relationshipsList,
      };

      if (isEditing && selectedProfile) {
        const updated = await diagnosticsService.updateProfile(selectedProfile.id, payload);
        setSelectedProfile(updated);
        toast({ title: "Profile Updated", description: `Updated profile ${updated.name}` });
      } else {
        const created = await diagnosticsService.createProfile(payload);
        setSelectedProfile(created);
        toast({ title: "Profile Created", description: `Created profile ${created.name}` });
      }

      setModalOpen(false);
      loadProfiles();
    } catch (err: any) {
      toast({ title: "Save Error", description: err.message || "Failed to save profile", variant: "destructive" });
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm("Are you sure you want to delete this device profile?")) return;
    try {
      const res = await diagnosticsService.deleteProfile(id);
      if (res && !res.success) {
        toast({ title: "Delete Error", description: "Failed to delete profile from server", variant: "destructive" });
        return;
      }
      toast({ title: "Profile Deleted", description: "Device profile removed successfully." });
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

  const handleExportJSON = (prof: DeviceProfile) => {
    const jsonStr = JSON.stringify(prof, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prof.id}_profile_schema.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
            Device Profile & Schema Manager
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Declarative hardware topology builder: define subsystems, criticality weights, operational limits, and component dependencies
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedDefaults}
            className="h-9 text-xs bg-white gap-1.5 text-gray-700"
          >
            <RotateCcw className="w-3.5 h-3.5 text-primary" />
            Seed Default Profiles
          </Button>
          <Button
            onClick={handleOpenCreate}
            size="sm"
            className="h-9 text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Create Hardware Profile
          </Button>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Registered Profiles List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Registered Profiles ({profiles.length})
            </span>
          </div>

          <div className="space-y-2.5">
            {profiles.map((prof) => {
              const isSelected = selectedProfile?.id === prof.id;
              return (
                <div
                  key={prof.id}
                  onClick={() => setSelectedProfile(prof)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 leading-tight">
                        {prof.name}
                      </h4>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{prof.id}</p>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                      {prof.category.replace(/_/g, " ")}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                    {prof.description || "No description provided."}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-100">
                    <span>{prof.components?.length || 0} Subsystems</span>
                    <span>{prof.relationships?.length || 0} Relations</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Profile Topology Details */}
        <div className="lg:col-span-8">
          {selectedProfile ? (
            <Card className="border border-gray-200 shadow-xs">
              <CardHeader className="pb-3 border-b border-gray-100 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-bold text-gray-900">
                        {selectedProfile.name}
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        v{(selectedProfile as any).version || "1.0.0"}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs font-mono mt-0.5">
                      Hardware ID: {selectedProfile.id} · Category: {selectedProfile.category}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportJSON(selectedProfile)}
                      className="h-8 text-xs bg-white gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export Schema
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(selectedProfile)}
                      className="h-8 text-xs bg-white text-primary border-primary/20 hover:bg-primary/10 gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProfile(selectedProfile.id)}
                      className="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 p-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-6">
                {/* Description Box */}
                {selectedProfile.description && (
                  <p className="text-xs text-gray-600 bg-slate-50 p-3 rounded-lg border border-slate-200/80 leading-relaxed">
                    {selectedProfile.description}
                  </p>
                )}

                {/* Subsystem Components Breakdown */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    Subsystems & Metric Limits ({selectedProfile.components?.length || 0})
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedProfile.components?.map((comp, idx) => (
                      <div
                        key={comp.id || idx}
                        className="p-3.5 rounded-xl border border-gray-200 bg-white shadow-2xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-sm text-gray-900">{comp.name}</div>
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                              Type: {comp.component_type}
                            </span>
                          </div>
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                            Criticality: {(comp.criticality * 100).toFixed(0)}%
                          </span>
                        </div>

                        {/* Metric Fields List */}
                        {comp.metrics && comp.metrics.length > 0 ? (
                          <div className="space-y-1 text-xs">
                            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                              Defined Metrics:
                            </div>
                            <div className="space-y-1">
                              {comp.metrics.map((m, mIdx) => (
                                <div
                                  key={mIdx}
                                  className="flex items-center justify-between p-1.5 rounded-md bg-slate-50 border border-slate-100 text-[11px]"
                                >
                                  <span className="font-mono text-gray-800">
                                    {m.key} {m.unit && <span className="text-gray-400">({m.unit})</span>}
                                  </span>
                                  <span className="text-gray-500 font-mono">
                                    [{m.expected_min ?? "-∞"} ... {m.expected_max ?? "+∞"}]
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] text-gray-400 italic">No specific metric limits defined.</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subsystem Relationships / Topology */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-primary" />
                    Component Topological Relationships ({selectedProfile.relationships?.length || 0})
                  </h3>

                  {selectedProfile.relationships && selectedProfile.relationships.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedProfile.relationships.map((rel, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg border border-gray-200 bg-slate-50/70 flex items-center justify-between text-xs"
                        >
                          <span className="font-semibold text-gray-800">{rel.source_component}</span>
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                            <ArrowRight className="w-3 h-3" />
                            {rel.relation_type}
                          </span>
                          <span className="font-semibold text-gray-800">{rel.target_component}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No component topology links declared.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-20 text-gray-400 border border-dashed rounded-xl">
              Select or create a hardware profile to view its schema details.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create / Edit Profile */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              {isEditing ? "Edit Device Profile & Schema" : "Create New IoT Device Profile"}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Declare physical subsystems, metrics, and relationships for automated diagnostic reasoning.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2 text-xs">
            {/* General Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700">Profile Name</Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. AirQo-v5-DualPM"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700">Hardware Category</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="air_quality">Air Quality Stations</SelectItem>
                    <SelectItem value="cold_chain">Cold Chain Vaccine Monitors</SelectItem>
                    <SelectItem value="solar">Solar Microgrids</SelectItem>
                    <SelectItem value="water_pump">Smart Water Pumps</SelectItem>
                    <SelectItem value="weather_station">Weather Stations</SelectItem>
                    <SelectItem value="generic_iot">Generic IoT Node</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700">Vendor / Manufacturer</Label>
                <Input
                  value={formVendor}
                  onChange={(e) => setFormVendor(e.target.value)}
                  placeholder="e.g. AirQo / Makerere"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700">Firmware Compatibility</Label>
                <Input
                  value={formFirmware}
                  onChange={(e) => setFormFirmware(e.target.value)}
                  placeholder=">=v4.0.0"
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-700">Profile Description</Label>
              <Textarea
                rows={2}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Operational purpose, hardware setup..."
                className="text-xs"
              />
            </div>

            {/* Subsystems Builder */}
            <div className="p-3.5 rounded-xl border border-gray-200 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Subsystems & Criticality ({componentsList.length})
                </span>
              </div>

              {/* Add subsystem input row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-white p-2.5 rounded-lg border border-gray-200">
                <div className="sm:col-span-5">
                  <Input
                    placeholder="Subsystem name (e.g. Battery Bank)"
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="sm:col-span-3">
                  <Select value={compType} onValueChange={(val: any) => setCompType(val)}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="power">Power</SelectItem>
                      <SelectItem value="sensor">Sensor</SelectItem>
                      <SelectItem value="connectivity">Connectivity</SelectItem>
                      <SelectItem value="cooling">Cooling</SelectItem>
                      <SelectItem value="motor">Motor</SelectItem>
                      <SelectItem value="compute">Compute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    placeholder="Crit (0-1)"
                    value={compCriticality}
                    onChange={(e) => setCompCriticality(Number(e.target.value))}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button
                    type="button"
                    onClick={handleAddComponent}
                    size="sm"
                    className="h-7 w-full text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Subsystems List with Metric Inputs */}
              <div className="space-y-3">
                {componentsList.map((comp, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-white border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-xs">{comp.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                          {comp.component_type}
                        </span>
                        <span className="text-[10px] text-primary font-bold">
                          Weight: {(comp.criticality * 100).toFixed(0)}%
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveComponent(idx)}
                        className="text-rose-600 hover:text-rose-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Metric fields inside component */}
                    <div className="pl-2 border-l-2 border-primary/30 space-y-1.5">
                      <div className="flex flex-wrap gap-1.5">
                        {comp.metrics?.map((m, mIdx) => (
                          <span
                            key={mIdx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-gray-700 border"
                          >
                            {m.key} [{m.expected_min ?? "-∞"}..{m.expected_max ?? "+∞"}]
                          </span>
                        ))}
                      </div>

                      {/* Add Metric input inline */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <Input
                          placeholder="metric_key (e.g. battery_voltage)"
                          value={metricKey}
                          onChange={(e) => setMetricKey(e.target.value)}
                          className="h-6 text-[11px] font-mono w-40"
                        />
                        <Input
                          placeholder="Unit (V)"
                          value={metricUnit}
                          onChange={(e) => setMetricUnit(e.target.value)}
                          className="h-6 text-[11px] w-16"
                        />
                        <Input
                          placeholder="Min"
                          value={metricMin}
                          onChange={(e) => setMetricMin(e.target.value)}
                          className="h-6 text-[11px] font-mono w-16"
                        />
                        <Input
                          placeholder="Max"
                          value={metricMax}
                          onChange={(e) => setMetricMax(e.target.value)}
                          className="h-6 text-[11px] font-mono w-16"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddMetricToComp(idx)}
                          className="h-6 text-[10px] px-2 bg-slate-100"
                        >
                          + Metric
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="text-xs h-8">
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8">
              Save Device Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
