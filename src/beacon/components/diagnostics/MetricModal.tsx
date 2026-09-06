"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { diagnosticsService } from "@/services/diagnosticsService";
import { DeviceProfile, MetricDefinition } from "@/types/diagnostics";
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
import { Activity, Zap, Sparkles, Sliders } from "lucide-react";

interface MetricModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: DeviceProfile;
  subsystemIndex: number;
  metric?: MetricDefinition | null;
  metricIndex?: number | null;
  onSuccess: (updated: DeviceProfile) => void;
}

export function MetricModal({
  open,
  onOpenChange,
  profile,
  subsystemIndex,
  metric,
  metricIndex,
  onSuccess,
}: MetricModalProps) {
  const isEditing = metricIndex !== null && metricIndex !== undefined && metricIndex >= 0;
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Telemetry Slot Mappings from profile
  const telemetryEntries = React.useMemo(() => {
    return Object.entries(profile.telemetry_mappings || {}).map(([slot, map]) => ({
      slot,
      key: map.key,
      label: map.label || map.key,
      unit: map.unit || "",
    }));
  }, [profile.telemetry_mappings]);

  const [selectedTelemetryKey, setSelectedTelemetryKey] = useState<string>("");
  const [isCustomKey, setIsCustomKey] = useState<boolean>(false);

  const [key, setKey] = useState<string>("");
  const [unit, setUnit] = useState<string>("");
  const [dataType, setDataType] = useState<string>("float");
  const [minVal, setMinVal] = useState<string>("");
  const [maxVal, setMaxVal] = useState<string>("");
  const [maxRoc, setMaxRoc] = useState<string>("");

  const targetSubsystem = profile.components?.[subsystemIndex];

  useEffect(() => {
    if (open) {
      if (isEditing && metric) {
        setKey(metric.key || "");
        setUnit(metric.unit || "");
        setDataType(metric.data_type || "float");
        setMinVal(metric.expected_min !== undefined && metric.expected_min !== null ? String(metric.expected_min) : "");
        setMaxVal(metric.expected_max !== undefined && metric.expected_max !== null ? String(metric.expected_max) : "");
        setMaxRoc(metric.max_rate_of_change !== undefined && metric.max_rate_of_change !== null ? String(metric.max_rate_of_change) : "");

        const matchingTel = telemetryEntries.find((t) => t.key === metric.key);
        if (matchingTel) {
          setSelectedTelemetryKey(matchingTel.key);
          setIsCustomKey(false);
        } else {
          setSelectedTelemetryKey("__custom__");
          setIsCustomKey(true);
        }
      } else {
        // Adding new metric
        if (telemetryEntries.length > 0) {
          const first = telemetryEntries[0];
          setSelectedTelemetryKey(first.key);
          setKey(first.key);
          setUnit(first.unit || "");
          setIsCustomKey(false);
        } else {
          setSelectedTelemetryKey("__custom__");
          setKey("");
          setUnit("");
          setIsCustomKey(true);
        }
        setDataType("float");
        setMinVal("");
        setMaxVal("");
        setMaxRoc("");
      }
    }
  }, [open, isEditing, metric, telemetryEntries]);

  const handleTelemetrySelect = (val: string) => {
    setSelectedTelemetryKey(val);
    if (val === "__custom__") {
      setIsCustomKey(true);
      setKey("");
      setUnit("");
    } else {
      setIsCustomKey(false);
      const match = telemetryEntries.find((t) => t.key === val);
      if (match) {
        setKey(match.key);
        setUnit(match.unit || "");
      }
    }
  };

  const handleSave = async () => {
    const finalKey = key.trim();
    if (!finalKey) {
      toast({
        title: "Key Required",
        description: "Please select or specify the metric semantic key (e.g. pm2_5, voltage).",
        variant: "destructive",
      });
      return;
    }

    const currentComponents = JSON.parse(JSON.stringify(profile.components || []));
    if (!currentComponents[subsystemIndex]) return;

    if (!currentComponents[subsystemIndex].metrics) {
      currentComponents[subsystemIndex].metrics = [];
    }

    const metricObj: MetricDefinition = {
      key: finalKey,
      unit: unit.trim() || undefined,
      data_type: dataType as any,
      expected_min: minVal.trim() !== "" ? parseFloat(minVal) : undefined,
      expected_max: maxVal.trim() !== "" ? parseFloat(maxVal) : undefined,
      max_rate_of_change: maxRoc.trim() !== "" ? parseFloat(maxRoc) : undefined,
      is_telemetry_field: true,
    };

    if (isEditing && metricIndex !== null && metricIndex >= 0) {
      currentComponents[subsystemIndex].metrics[metricIndex] = metricObj;
    } else {
      currentComponents[subsystemIndex].metrics.push(metricObj);
    }

    const payload: Partial<DeviceProfile> = {
      ...profile,
      components: currentComponents,
    };

    try {
      setIsSubmitting(true);
      const updated = await diagnosticsService.updateProfile(profile.id, payload);
      toast({
        title: isEditing ? "Metric Bound Updated" : "Metric Bound Added",
        description: `Bound ${finalKey} saved to subsystem ${targetSubsystem?.name}.`,
      });
      onOpenChange(false);
      onSuccess(updated);
    } catch (err: any) {
      toast({
        title: "Save Failed",
        description: err?.message || "Could not save metric bound.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            {isEditing ? `Edit Metric Bound: ${metric?.key}` : `Add Metric to ${targetSubsystem?.name}`}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Define nominal thresholds, expected ranges, and rate-of-change limits for this subsystem.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* Telemetry Mapping Source Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                Select from Telemetry Slots
              </span>
              {telemetryEntries.length > 0 && (
                <span className="text-[10px] text-gray-400">
                  {telemetryEntries.length} slot{telemetryEntries.length > 1 ? "s" : ""} available
                </span>
              )}
            </Label>

            {telemetryEntries.length > 0 ? (
              <Select value={selectedTelemetryKey} onValueChange={handleTelemetrySelect}>
                <SelectTrigger className="h-8 text-xs bg-slate-50 border-gray-200">
                  <SelectValue placeholder="Choose a mapped telemetry slot..." />
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
              <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200 text-blue-800 text-[11px] flex items-center justify-between">
                <span>No telemetry stream slots defined in this profile yet.</span>
              </div>
            )}
          </div>

          {/* Metric Key (Manual input if Custom or no slots) */}
          {(isCustomKey || telemetryEntries.length === 0) && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Custom Semantic Key *</Label>
              <Input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="e.g. pm2_5, battery_voltage, temperature"
                className="h-8 text-xs font-mono font-bold text-primary"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                <span>Unit of Measurement</span>
                {!isCustomKey && unit && (
                  <span className="text-[10px] text-emerald-600 font-medium">Auto-filled</span>
                )}
              </Label>
              <Input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. ug/m3, V, %, C"
                className="h-8 text-xs font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Data Type *</Label>
              <Select value={dataType} onValueChange={setDataType}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="float">Float (Decimal Number)</SelectItem>
                  <SelectItem value="int">Integer (Whole Number)</SelectItem>
                  <SelectItem value="bool">Boolean (True / False)</SelectItem>
                  <SelectItem value="string">String / Categorical Code</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Expected Min</Label>
              <Input
                type="number"
                step="any"
                value={minVal}
                onChange={(e) => setMinVal(e.target.value)}
                placeholder="-∞"
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Expected Max</Label>
              <Input
                type="number"
                step="any"
                value={maxVal}
                onChange={(e) => setMaxVal(e.target.value)}
                placeholder="+∞"
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">
              Max Rate of Change (Δmax / hr)
            </Label>
            <Input
              type="number"
              step="any"
              value={maxRoc}
              onChange={(e) => setMaxRoc(e.target.value)}
              placeholder="Optional maximum rate limit per hour"
              className="h-8 text-xs font-mono"
            />
            <p className="text-[11px] text-gray-400">
              Flags sensor drift, spikes, or flatline freeze conditions if delta exceeds this limit.
            </p>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t">
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
            {isSubmitting ? "Saving..." : isEditing ? "Update Metric" : "Add Metric"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
