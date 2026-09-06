"use client";

import React, { useState, useEffect } from "react";
import { diagnosticsService } from "@/services/diagnosticsService";
import {
  DeviceProfile,
  TelemetryMapping,
  ConfigMapping,
  MetadataMapping,
} from "@/types/diagnostics";
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
import { Sliders, Zap, Database } from "lucide-react";

export type SlotCategory = "telemetry" | "config" | "metadata";

interface SlotMappingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: DeviceProfile;
  slotCategory: SlotCategory;
  editingSlotKey?: string | null;
  existingMapping?: any;
  onSuccess: (updated: DeviceProfile) => void;
}

export function SlotMappingModal({
  open,
  onOpenChange,
  profile,
  slotCategory,
  editingSlotKey,
  existingMapping,
  onSuccess,
}: SlotMappingModalProps) {
  const isEditing = Boolean(editingSlotKey);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Common Fields
  const [slot, setSlot] = useState<string>("");
  const [key, setKey] = useState<string>("");
  const [label, setLabel] = useState<string>("");

  // Telemetry specific
  const [unit, setUnit] = useState<string>("");
  const [source, setSource] = useState<string>("");

  // Config specific
  const [type, setType] = useState<string>("int");
  const [defaultValue, setDefaultValue] = useState<string>("");

  useEffect(() => {
    if (open) {
      if (isEditing && editingSlotKey && existingMapping) {
        setSlot(editingSlotKey);
        setKey(existingMapping.key || "");
        setLabel(existingMapping.label || "");
        setUnit(existingMapping.unit || "");
        setSource(existingMapping.source || "");
        setType(existingMapping.type || "int");
        setDefaultValue(existingMapping.default !== undefined ? String(existingMapping.default) : "");
      } else {
        setSlot(slotCategory === "telemetry" ? "field1" : slotCategory === "config" ? "config1" : "metadata1");
        setKey("");
        setLabel("");
        setUnit("");
        setSource("");
        setType("int");
        setDefaultValue("");
      }
    }
  }, [open, isEditing, editingSlotKey, existingMapping, slotCategory]);

  const handleSave = async () => {
    if (!slot.trim() || !key.trim() || !label.trim()) {
      toast({
        title: "Validation Error",
        description: "Slot slot identifier, semantic key, and label are required.",
        variant: "destructive",
      });
      return;
    }

    const payload: Partial<DeviceProfile> = { ...profile };

    if (slotCategory === "telemetry") {
      const tm = { ...(profile.telemetry_mappings || {}) };
      if (isEditing && editingSlotKey && editingSlotKey !== slot.trim()) {
        delete tm[editingSlotKey];
      }
      tm[slot.trim()] = {
        key: key.trim(),
        label: label.trim(),
        unit: unit.trim() || undefined,
        source: source.trim() || undefined,
      };
      payload.telemetry_mappings = tm;
    } else if (slotCategory === "config") {
      const cm = { ...(profile.config_mappings || {}) };
      if (isEditing && editingSlotKey && editingSlotKey !== slot.trim()) {
        delete cm[editingSlotKey];
      }

      let parsedDefault: any = defaultValue;
      if (type === "int" && defaultValue.trim() !== "") parsedDefault = parseInt(defaultValue, 10);
      else if (type === "float" && defaultValue.trim() !== "") parsedDefault = parseFloat(defaultValue);
      else if (type === "bool" && defaultValue.trim() !== "") parsedDefault = defaultValue.toLowerCase() === "true";

      cm[slot.trim()] = {
        key: key.trim(),
        label: label.trim(),
        type: type as any,
        unit: unit.trim() || undefined,
        default: defaultValue.trim() !== "" ? parsedDefault : undefined,
      };
      payload.config_mappings = cm;
    } else {
      const mm = { ...(profile.metadata_mappings || {}) };
      if (isEditing && editingSlotKey && editingSlotKey !== slot.trim()) {
        delete mm[editingSlotKey];
      }
      mm[slot.trim()] = {
        key: key.trim(),
        label: label.trim(),
      };
      payload.metadata_mappings = mm;
    }

    try {
      setIsSubmitting(true);
      const updated = await diagnosticsService.updateProfile(profile.id, payload);
      toast({
        title: isEditing ? "Slot Updated" : "Slot Added",
        description: `Mapping ${slot} -> ${key} saved.`,
      });
      onOpenChange(false);
      onSuccess(updated);
    } catch (err: any) {
      toast({
        title: "Save Failed",
        description: err?.message || "Could not save slot mapping.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    switch (slotCategory) {
      case "telemetry":
        return isEditing ? `Edit Telemetry Slot (${editingSlotKey})` : "Add Telemetry Stream Slot";
      case "config":
        return isEditing ? `Edit Config Parameter (${editingSlotKey})` : "Add Config Parameter Slot";
      case "metadata":
        return isEditing ? `Edit Hardware Tag (${editingSlotKey})` : "Add Hardware Metadata Slot";
    }
  };

  const getIcon = () => {
    switch (slotCategory) {
      case "telemetry":
        return <Zap className="w-5 h-5 text-blue-600" />;
      case "config":
        return <Sliders className="w-5 h-5 text-amber-500" />;
      case "metadata":
        return <Database className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Map raw ingestion channels and device configuration parameters to standard schema fields.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Raw Slot Name *</Label>
              <Input
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                placeholder={slotCategory === "telemetry" ? "field1" : slotCategory === "config" ? "config1" : "metadata1"}
                className="h-8 text-xs font-mono font-bold text-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Semantic Key *</Label>
              <Input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={slotCategory === "telemetry" ? "pm2_5" : slotCategory === "config" ? "sample_rate" : "pcb_version"}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">Human Label *</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Primary PM2.5 Sensor, Reporting Interval"
              className="h-8 text-xs"
            />
          </div>

          {slotCategory === "telemetry" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Unit (optional)</Label>
                <Input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g. ug/m3, V, %, C"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Source Channel (optional)</Label>
                <Input
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. field8_csv_0"
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>
          )}

          {slotCategory === "config" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Type *</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="int">Integer</SelectItem>
                    <SelectItem value="float">Float</SelectItem>
                    <SelectItem value="bool">Boolean</SelectItem>
                    <SelectItem value="str">String</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Unit</Label>
                <Input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g. s, ms, min"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Default Value</Label>
                <Input
                  value={defaultValue}
                  onChange={(e) => setDefaultValue(e.target.value)}
                  placeholder="120"
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>
          )}
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
            {isSubmitting ? "Saving..." : isEditing ? "Update Slot" : "Add Slot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
