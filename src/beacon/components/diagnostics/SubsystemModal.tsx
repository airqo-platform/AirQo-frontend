"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { diagnosticsService } from "@/services/diagnosticsService";
import { DeviceProfile, ComponentDefinition, MetricDefinition } from "@/types/diagnostics";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Cpu, Plus, Trash2, Zap, Activity, Sliders } from "lucide-react";

interface LocalMetricDraft {
  selectedTelemetryKey: string;
  isCustomKey: boolean;
  key: string;
  unit: string;
  data_type: string;
  expected_min: string;
  expected_max: string;
  max_rate_of_change: string;
}

interface SubsystemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: DeviceProfile;
  subsystem?: ComponentDefinition | null;
  subsystemIndex?: number | null;
  onSuccess: (updated: DeviceProfile) => void;
}

export function SubsystemModal({
  open,
  onOpenChange,
  profile,
  subsystem,
  subsystemIndex,
  onSuccess,
}: SubsystemModalProps) {
  const isEditing = subsystemIndex !== null && subsystemIndex !== undefined && subsystemIndex >= 0;
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Subsystem Core Properties
  const [name, setName] = useState<string>("");
  const [componentType, setComponentType] = useState<string>("sensor");
  const [criticality, setCriticality] = useState<number>(0.5);

  // Available Telemetry Mappings for smart selection
  const telemetryEntries = useMemo(() => {
    return Object.entries(profile.telemetry_mappings || {}).map(([slot, map]) => ({
      slot,
      key: map.key,
      label: map.label || map.key,
      unit: map.unit || "",
    }));
  }, [profile.telemetry_mappings]);

  // Subsystem Metrics Array
  const [metricsList, setMetricsList] = useState<LocalMetricDraft[]>([]);

  const createDefaultMetricDraft = useCallback((): LocalMetricDraft => {
    if (telemetryEntries.length > 0) {
      const first = telemetryEntries[0];
      return {
        selectedTelemetryKey: first.key,
        isCustomKey: false,
        key: first.key,
        unit: first.unit || "",
        data_type: "float",
        expected_min: "",
        expected_max: "",
        max_rate_of_change: "",
      };
    }
    return {
      selectedTelemetryKey: "__custom__",
      isCustomKey: true,
      key: "",
      unit: "",
      data_type: "float",
      expected_min: "",
      expected_max: "",
      max_rate_of_change: "",
    };
  }, [telemetryEntries]);

  useEffect(() => {
    if (open) {
      if (isEditing && subsystem) {
        setName(subsystem.name || "");
        setComponentType(subsystem.component_type || "sensor");
        setCriticality(subsystem.criticality ?? 0.5);

        if (subsystem.metrics && subsystem.metrics.length > 0) {
          const drafts: LocalMetricDraft[] = subsystem.metrics.map((m) => {
            const match = telemetryEntries.find((t) => t.key === m.key);
            return {
              selectedTelemetryKey: match ? match.key : "__custom__",
              isCustomKey: !match,
              key: m.key || "",
              unit: m.unit || "",
              data_type: m.data_type || "float",
              expected_min: m.expected_min !== undefined && m.expected_min !== null ? String(m.expected_min) : "",
              expected_max: m.expected_max !== undefined && m.expected_max !== null ? String(m.expected_max) : "",
              max_rate_of_change:
                m.max_rate_of_change !== undefined && m.max_rate_of_change !== null
                  ? String(m.max_rate_of_change)
                  : "",
            };
          });
          setMetricsList(drafts);
        } else {
          setMetricsList([createDefaultMetricDraft()]);
        }
      } else {
        // Creating new Subsystem: starts with 1 default metric
        setName("");
        setComponentType("sensor");
        setCriticality(0.5);
        setMetricsList([createDefaultMetricDraft()]);
      }
    }
  }, [open, isEditing, subsystem, telemetryEntries, createDefaultMetricDraft]);

  // Metric row management
  const handleAddMetricRow = () => {
    // Pick the next unused telemetry entry if possible
    const usedKeys = new Set(metricsList.map((m) => m.key));
    const nextUnused = telemetryEntries.find((t) => !usedKeys.has(t.key));

    if (nextUnused) {
      setMetricsList((prev) => [
        ...prev,
        {
          selectedTelemetryKey: nextUnused.key,
          isCustomKey: false,
          key: nextUnused.key,
          unit: nextUnused.unit || "",
          data_type: "float",
          expected_min: "",
          expected_max: "",
          max_rate_of_change: "",
        },
      ]);
    } else {
      setMetricsList((prev) => [
        ...prev,
        {
          selectedTelemetryKey: "__custom__",
          isCustomKey: true,
          key: "",
          unit: "",
          data_type: "float",
          expected_min: "",
          expected_max: "",
          max_rate_of_change: "",
        },
      ]);
    }
  };

  const handleRemoveMetricRow = (index: number) => {
    setMetricsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateMetricRow = (index: number, updates: Partial<LocalMetricDraft>) => {
    setMetricsList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  const handleTelemetryKeyChange = (index: number, val: string) => {
    if (val === "__custom__") {
      handleUpdateMetricRow(index, {
        selectedTelemetryKey: "__custom__",
        isCustomKey: true,
        key: "",
        unit: "",
      });
    } else {
      const match = telemetryEntries.find((t) => t.key === val);
      handleUpdateMetricRow(index, {
        selectedTelemetryKey: val,
        isCustomKey: false,
        key: val,
        unit: match?.unit || "",
      });
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please specify a name for this subsystem component.",
        variant: "destructive",
      });
      return;
    }

    // Convert local metrics to MetricDefinition
    const formattedMetrics: MetricDefinition[] = [];
    for (let i = 0; i < metricsList.length; i++) {
      const draft = metricsList[i];
      const finalKey = draft.key.trim();
      if (!finalKey) continue; // skip blank metric rows if user left them empty

      formattedMetrics.push({
        key: finalKey,
        unit: draft.unit.trim() || undefined,
        data_type: draft.data_type as any,
        expected_min: draft.expected_min.trim() !== "" ? parseFloat(draft.expected_min) : undefined,
        expected_max: draft.expected_max.trim() !== "" ? parseFloat(draft.expected_max) : undefined,
        max_rate_of_change: draft.max_rate_of_change.trim() !== "" ? parseFloat(draft.max_rate_of_change) : undefined,
        is_telemetry_field: true,
      });
    }

    const currentComponents = [...(profile.components || [])];

    const compObj: ComponentDefinition = {
      ...(isEditing && subsystemIndex !== null && currentComponents[subsystemIndex]
        ? currentComponents[subsystemIndex]
        : { name: "", component_type: "sensor", criticality: 0.5, metrics: [] }),
      name: name.trim(),
      component_type: componentType,
      criticality: Number(criticality),
      metrics: formattedMetrics,
    };

    if (isEditing && subsystemIndex !== null && subsystemIndex >= 0) {
      currentComponents[subsystemIndex] = compObj;
    } else {
      currentComponents.push(compObj);
    }

    const payload: Partial<DeviceProfile> = {
      ...profile,
      components: currentComponents,
    };

    try {
      setIsSubmitting(true);
      const updated = await diagnosticsService.updateProfile(profile.id, payload);
      toast({
        title: isEditing ? "Subsystem Updated" : "Subsystem Added",
        description: `${name} saved with ${formattedMetrics.length} metric limit${
          formattedMetrics.length === 1 ? "" : "s"
        }.`,
      });
      onOpenChange(false);
      onSuccess(updated);
    } catch (err: any) {
      toast({
        title: "Save Failed",
        description: err?.message || "Could not save subsystem component.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[88vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-5 pb-3 border-b bg-slate-50/60">
          <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            {isEditing ? `Edit Subsystem: ${subsystem?.name}` : "Add Subsystem & Metrics"}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Define the physical or logical subsystem and configure its metric thresholds in one step.
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Subsystem Core Properties */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3.5">
            <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-primary" /> Subsystem Identification
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Subsystem Identifier / Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. pm_sensors, power_battery, pump_motor"
                  className="h-8 text-xs font-mono font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Subsystem Type *</Label>
                <Select value={componentType} onValueChange={setComponentType}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sensor">Sensor Subsystem</SelectItem>
                    <SelectItem value="battery">Battery / Power</SelectItem>
                    <SelectItem value="connectivity">Connectivity / Cellular / GPS</SelectItem>
                    <SelectItem value="cooling">Cooling / Compressor</SelectItem>
                    <SelectItem value="motor">Motor / Pump</SelectItem>
                    <SelectItem value="compute">MCU / Compute</SelectItem>
                    <SelectItem value="storage">Storage / SD Card</SelectItem>
                    <SelectItem value="actuator">Actuator / Valve</SelectItem>
                    <SelectItem value="other">Other Subsystem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-gray-700">Criticality Weight (0.0 to 1.0)</Label>
                <span className="text-xs font-bold text-primary font-mono">{(criticality * 100).toFixed(0)}%</span>
              </div>
              <Input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={criticality}
                onChange={(e) => setCriticality(parseFloat(e.target.value) || 0)}
                className="h-8 text-xs"
              />
              <p className="text-[11px] text-gray-400">
                Determines how heavily this subsystem influences the device overall health score.
              </p>
            </div>
          </div>

          {/* Subsystem Metrics Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-primary" /> Subsystem Metrics & Thresholds ({metricsList.length})
                </h4>
                <p className="text-[11px] text-gray-500">
                  Select telemetry keys to auto-fill measurement units and assign expected operating bounds.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddMetricRow}
                className="h-7 text-xs text-primary border-primary/30 hover:bg-primary/10 gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Metric
              </Button>
            </div>

            <div className="space-y-3">
              {metricsList.map((draft, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                      Metric #{idx + 1}
                    </span>
                    {metricsList.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMetricRow(idx)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-rose-600"
                        title="Remove metric"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>

                  {/* Telemetry Key Selector */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-blue-600" />
                        Source Telemetry Key *
                      </span>
                    </Label>

                    {telemetryEntries.length > 0 ? (
                      <Select
                        value={draft.selectedTelemetryKey}
                        onValueChange={(val) => handleTelemetryKeyChange(idx, val)}
                      >
                        <SelectTrigger className="h-8 text-xs bg-white border-gray-200">
                          <SelectValue placeholder="Choose a telemetry slot..." />
                        </SelectTrigger>
                        <SelectContent>
                          {telemetryEntries.map((t) => (
                            <SelectItem key={t.slot + t.key} value={t.key}>
                              <span className="font-mono font-bold text-primary mr-1.5">{t.slot}</span>
                              <span className="font-semibold text-gray-900">{t.key}</span>
                              {t.label && t.label !== t.key && (
                                <span className="text-gray-500 text-[11px] ml-1.5">— {t.label}</span>
                              )}
                              {t.unit && (
                                <span className="text-blue-600 text-[11px] ml-1">({t.unit})</span>
                              )}
                            </SelectItem>
                          ))}
                          <SelectItem value="__custom__" className="text-gray-600 italic">
                            + Custom / Manual Metric Key
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={draft.key}
                        onChange={(e) => handleUpdateMetricRow(idx, { key: e.target.value })}
                        placeholder="e.g. pm2_5, battery_voltage"
                        className="h-8 text-xs font-mono font-bold bg-white"
                      />
                    )}
                  </div>

                  {draft.isCustomKey && telemetryEntries.length > 0 && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-700">Custom Semantic Key *</Label>
                      <Input
                        value={draft.key}
                        onChange={(e) => handleUpdateMetricRow(idx, { key: e.target.value })}
                        placeholder="e.g. custom_metric_key"
                        className="h-8 text-xs font-mono font-bold text-primary bg-white"
                      />
                    </div>
                  )}

                  {/* Unit & Data Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                        <span>Unit</span>
                        {!draft.isCustomKey && draft.unit && (
                          <span className="text-[10px] text-emerald-600 font-medium">Auto-filled</span>
                        )}
                      </Label>
                      <Input
                        value={draft.unit}
                        onChange={(e) => handleUpdateMetricRow(idx, { unit: e.target.value })}
                        placeholder="e.g. ug/m3, V, %, C"
                        className="h-8 text-xs bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-700">Data Type</Label>
                      <Select
                        value={draft.data_type}
                        onValueChange={(val) => handleUpdateMetricRow(idx, { data_type: val })}
                      >
                        <SelectTrigger className="h-8 text-xs bg-white border-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="float">Float (Decimal)</SelectItem>
                          <SelectItem value="int">Integer (Whole)</SelectItem>
                          <SelectItem value="bool">Boolean (True/False)</SelectItem>
                          <SelectItem value="string">String</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Range & ROC */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-700">Expected Min</Label>
                      <Input
                        type="number"
                        step="any"
                        value={draft.expected_min}
                        onChange={(e) => handleUpdateMetricRow(idx, { expected_min: e.target.value })}
                        placeholder="-∞"
                        className="h-8 text-xs font-mono bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-700">Expected Max</Label>
                      <Input
                        type="number"
                        step="any"
                        value={draft.expected_max}
                        onChange={(e) => handleUpdateMetricRow(idx, { expected_max: e.target.value })}
                        placeholder="+∞"
                        className="h-8 text-xs font-mono bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-700">Δmax / hr</Label>
                      <Input
                        type="number"
                        step="any"
                        value={draft.max_rate_of_change}
                        onChange={(e) => handleUpdateMetricRow(idx, { max_rate_of_change: e.target.value })}
                        placeholder="Limit"
                        className="h-8 text-xs font-mono bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t bg-slate-50/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSubmitting}
            className="text-xs bg-primary hover:bg-primary/90 text-white font-semibold"
          >
            {isSubmitting ? "Saving..." : isEditing ? "Update Subsystem & Metrics" : "Add Subsystem & Metrics"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
