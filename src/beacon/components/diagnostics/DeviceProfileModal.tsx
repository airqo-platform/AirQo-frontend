"use client";

import React, { useState, useEffect } from "react";
import { diagnosticsService } from "@/services/diagnosticsService";
import {
  DeviceProfile,
  DeviceVendor,
  ComponentDefinition,
  MetricDefinition,
  ComponentRelationship,
  TelemetryMapping,
  ConfigMapping,
  MetadataMapping,
  RELATIONSHIP_OPTIONS,
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import {
  Layers,
  Plus,
  Trash2,
  Sliders,
  Zap,
  Activity,
  Database,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const getVendorName = (vendor: string | DeviceVendor | null | undefined): string => {
  if (!vendor) return "";
  if (typeof vendor === "string") return vendor;
  if (typeof vendor === "object" && vendor.name) return vendor.name;
  return "";
};

interface DeviceProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: DeviceProfile | null;
  onSuccess?: (saved: DeviceProfile) => void;
}

export function DeviceProfileModal({
  open,
  onOpenChange,
  profile,
  onSuccess,
}: DeviceProfileModalProps) {
  const isEditing = Boolean(profile && profile.id);
  const [activeModalTab, setActiveModalTab] = useState<string>("metadata");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form State
  const [formName, setFormName] = useState<string>("");
  const [formCategory, setFormCategory] = useState<string>("air_quality");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formVendor, setFormVendor] = useState<string>("");
  const [formMetaDataJson, setFormMetaDataJson] = useState<string>("{}");

  // Ingestion Mappings
  const [telemetryMappings, setTelemetryMappings] = useState<
    Array<{ slot: string; key: string; label: string; unit?: string; source?: string }>
  >([]);
  const [configMappings, setConfigMappings] = useState<
    Array<{ slot: string; key: string; label: string; type: string; unit?: string; default?: string }>
  >([]);
  const [metadataMappings, setMetadataMappings] = useState<
    Array<{ slot: string; key: string; label: string }>
  >([]);

  // Subsystems & Relationships
  const [componentsList, setComponentsList] = useState<ComponentDefinition[]>([]);
  const [relationshipsList, setRelationshipsList] = useState<ComponentRelationship[]>([]);

  // Temporary inputs
  const [newTelSlot, setNewTelSlot] = useState<string>("");
  const [newTelKey, setNewTelKey] = useState<string>("");
  const [newTelLabel, setNewTelLabel] = useState<string>("");
  const [newTelUnit, setNewTelUnit] = useState<string>("");
  const [newTelSource, setNewTelSource] = useState<string>("");

  const [newCfgSlot, setNewCfgSlot] = useState<string>("");
  const [newCfgKey, setNewCfgKey] = useState<string>("");
  const [newCfgLabel, setNewCfgLabel] = useState<string>("");
  const [newCfgType, setNewCfgType] = useState<string>("int");
  const [newCfgUnit, setNewCfgUnit] = useState<string>("");
  const [newCfgDefault, setNewCfgDefault] = useState<string>("");

  const [newMetaSlot, setNewMetaSlot] = useState<string>("");
  const [newMetaKey, setNewMetaKey] = useState<string>("");
  const [newMetaLabel, setNewMetaLabel] = useState<string>("");

  const [compName, setCompName] = useState<string>("");
  const [compType, setCompType] = useState<string>("battery");
  const [compCriticality, setCompCriticality] = useState<number>(0.5);

  const [relSource, setRelSource] = useState<string>("");
  const [relTarget, setRelTarget] = useState<string>("");
  const [relType, setRelType] = useState<string>("POWERS");

  // Initialize or reset form on open/profile change
  useEffect(() => {
    if (!open) return;

    setActiveModalTab("metadata");
    if (profile) {
      setFormName(profile.name || "");
      setFormCategory(profile.category || "air_quality");
      setFormDescription(profile.description || "");
      setFormVendor(getVendorName(profile.vendor));
      setFormMetaDataJson(JSON.stringify(profile.meta_data || {}, null, 2));

      const tm = Object.entries(profile.telemetry_mappings || {}).map(([slot, map]) => ({
        slot,
        key: map.key,
        label: map.label,
        unit: map.unit,
        source: map.source,
      }));
      setTelemetryMappings(tm);

      const cm = Object.entries(profile.config_mappings || {}).map(([slot, map]) => ({
        slot,
        key: map.key,
        label: map.label,
        type: map.type || "str",
        unit: map.unit,
        default: map.default !== undefined ? String(map.default) : "",
      }));
      setConfigMappings(cm);

      const mm = Object.entries(profile.metadata_mappings || {}).map(([slot, map]) => ({
        slot,
        key: map.key,
        label: map.label,
      }));
      setMetadataMappings(mm);

      setComponentsList(JSON.parse(JSON.stringify(profile.components || [])));
      setRelationshipsList(JSON.parse(JSON.stringify(profile.relationships || [])));
    } else {
      setFormName("");
      setFormCategory("air_quality");
      setFormDescription("");
      setFormVendor("AirQo");
      setFormMetaDataJson(
        JSON.stringify({ is_default_lowcost: true, hardware_generation: "v5.2" }, null, 2)
      );

      setTelemetryMappings([
        { slot: "field1", key: "pm2_5", label: "Sensor 1 PM2.5", unit: "ug/m3" },
        { slot: "field2", key: "pm10", label: "Sensor 1 PM10", unit: "ug/m3" },
        { slot: "field3", key: "pm2_5_sensor_2", label: "Sensor 2 PM2.5", unit: "ug/m3" },
        { slot: "field4", key: "pm10_sensor_2", label: "Sensor 2 PM10", unit: "ug/m3" },
        { slot: "field7", key: "battery_voltage", label: "Battery Voltage", unit: "V" },
      ]);

      setConfigMappings([
        {
          slot: "config1",
          key: "reporting_interval",
          label: "Reporting Interval",
          type: "int",
          unit: "s",
          default: "120",
        },
      ]);

      setMetadataMappings([
        { slot: "metadata1", key: "pcb_version", label: "PCB Hardware Version" },
        { slot: "metadata4", key: "sim_iccid", label: "Cellular SIM ICCID" },
      ]);

      setComponentsList([
        {
          name: "power_subsystem",
          component_type: "battery",
          criticality: 0.35,
          metrics: [
            {
              key: "battery_voltage",
              unit: "V",
              data_type: "float",
              expected_min: 11.5,
              expected_max: 14.6,
              max_rate_of_change: 1.5,
              is_telemetry_field: true,
            },
            {
              key: "solar_voltage",
              unit: "V",
              data_type: "float",
              expected_min: 0.0,
              expected_max: 22.0,
              is_telemetry_field: true,
            },
          ],
        },
        {
          name: "pm_sensors",
          component_type: "sensor",
          criticality: 0.5,
          metrics: [
            {
              key: "pm2_5",
              unit: "ug/m3",
              data_type: "float",
              expected_min: 0.0,
              expected_max: 500.0,
              max_rate_of_change: 150.0,
              is_telemetry_field: true,
            },
            {
              key: "pm2_5_sensor_2",
              unit: "ug/m3",
              data_type: "float",
              expected_min: 0.0,
              expected_max: 500.0,
              max_rate_of_change: 150.0,
              is_telemetry_field: true,
            },
          ],
        },
      ]);

      setRelationshipsList([]);
    }
  }, [open, profile]);

  // Telemetry Mappings
  const handleAddTelemetryMapping = () => {
    if (!newTelSlot.trim() || !newTelKey.trim() || !newTelLabel.trim()) {
      toast({
        title: "Validation Error",
        description: "Slot, Key, and Label are required.",
        variant: "destructive",
      });
      return;
    }
    setTelemetryMappings([
      ...telemetryMappings,
      {
        slot: newTelSlot.trim(),
        key: newTelKey.trim(),
        label: newTelLabel.trim(),
        unit: newTelUnit.trim() || undefined,
        source: newTelSource.trim() || undefined,
      },
    ]);
    setNewTelSlot("");
    setNewTelKey("");
    setNewTelLabel("");
    setNewTelUnit("");
    setNewTelSource("");
  };

  const handleRemoveTelemetryMapping = (index: number) => {
    setTelemetryMappings(telemetryMappings.filter((_, i) => i !== index));
  };

  // Config Mappings
  const handleAddConfigMapping = () => {
    if (!newCfgSlot.trim() || !newCfgKey.trim() || !newCfgLabel.trim()) {
      toast({
        title: "Validation Error",
        description: "Slot, Key, and Label are required.",
        variant: "destructive",
      });
      return;
    }
    setConfigMappings([
      ...configMappings,
      {
        slot: newCfgSlot.trim(),
        key: newCfgKey.trim(),
        label: newCfgLabel.trim(),
        type: newCfgType,
        unit: newCfgUnit.trim() || undefined,
        default: newCfgDefault.trim() || undefined,
      },
    ]);
    setNewCfgSlot("");
    setNewCfgKey("");
    setNewCfgLabel("");
    setNewCfgUnit("");
    setNewCfgDefault("");
  };

  const handleRemoveConfigMapping = (index: number) => {
    setConfigMappings(configMappings.filter((_, i) => i !== index));
  };

  // Metadata Mappings
  const handleAddMetadataMapping = () => {
    if (!newMetaSlot.trim() || !newMetaKey.trim() || !newMetaLabel.trim()) {
      toast({
        title: "Validation Error",
        description: "Slot, Key, and Label are required.",
        variant: "destructive",
      });
      return;
    }
    setMetadataMappings([
      ...metadataMappings,
      {
        slot: newMetaSlot.trim(),
        key: newMetaKey.trim(),
        label: newMetaLabel.trim(),
      },
    ]);
    setNewMetaSlot("");
    setNewMetaKey("");
    setNewMetaLabel("");
  };

  const handleRemoveMetadataMapping = (index: number) => {
    setMetadataMappings(metadataMappings.filter((_, i) => i !== index));
  };

  // Component definitions
  const handleAddComponent = () => {
    if (!compName.trim()) {
      toast({ title: "Name Required", description: "Enter component name", variant: "destructive" });
      return;
    }
    const newComp: ComponentDefinition = {
      name: compName.trim(),
      component_type: compType,
      criticality: Number(compCriticality),
      metrics: [],
    };
    setComponentsList([...componentsList, newComp]);
    setCompName("");
  };

  const handleRemoveComponent = (idx: number) => {
    setComponentsList(componentsList.filter((_, i) => i !== idx));
  };

  const handleAddMetricToComp = (compIdx: number, metric: MetricDefinition) => {
    const updated = [...componentsList];
    if (!updated[compIdx].metrics) updated[compIdx].metrics = [];
    updated[compIdx].metrics.push(metric);
    setComponentsList(updated);
  };

  const handleRemoveMetricFromComp = (compIdx: number, metricIdx: number) => {
    const updated = [...componentsList];
    updated[compIdx].metrics.splice(metricIdx, 1);
    setComponentsList(updated);
  };

  // Relationships
  const handleAddRelationship = () => {
    if (!relSource || !relTarget || relSource === relTarget) {
      toast({
        title: "Select Components",
        description: "Select source and target component",
        variant: "destructive",
      });
      return;
    }
    const newRel: ComponentRelationship = {
      source_component: relSource,
      target_component: relTarget,
      relation_type: relType,
    };
    setRelationshipsList([...relationshipsList, newRel]);
  };

  const handleRemoveRelationship = (idx: number) => {
    setRelationshipsList(relationshipsList.filter((_, i) => i !== idx));
  };

  // Save handler
  const handleSave = async () => {
    if (!formName.trim()) {
      toast({ title: "Validation Error", description: "Profile Name is required", variant: "destructive" });
      return;
    }

    let parsedMeta: Record<string, any> = {};
    try {
      if (formMetaDataJson.trim()) {
        parsedMeta = JSON.parse(formMetaDataJson);
      }
    } catch (e: any) {
      toast({ title: "Invalid JSON", description: "Metadata JSON is not valid.", variant: "destructive" });
      return;
    }

    const telemetryObj: Record<string, TelemetryMapping> = {};
    telemetryMappings.forEach((tm) => {
      telemetryObj[tm.slot] = {
        key: tm.key,
        label: tm.label,
        unit: tm.unit || undefined,
        source: tm.source || undefined,
      };
    });

    const configObj: Record<string, ConfigMapping> = {};
    configMappings.forEach((cm) => {
      let defaultVal: any = cm.default;
      if (cm.type === "int" && cm.default !== undefined) defaultVal = parseInt(cm.default, 10);
      else if (cm.type === "float" && cm.default !== undefined) defaultVal = parseFloat(cm.default);
      else if (cm.type === "bool" && cm.default !== undefined)
        defaultVal = cm.default.toLowerCase() === "true";

      configObj[cm.slot] = {
        key: cm.key,
        label: cm.label,
        type: cm.type,
        unit: cm.unit || undefined,
        default: defaultVal,
      };
    });

    const metaObj: Record<string, MetadataMapping> = {};
    metadataMappings.forEach((mm) => {
      metaObj[mm.slot] = {
        key: mm.key,
        label: mm.label,
      };
    });

    const payload: Partial<DeviceProfile> = {
      name: formName,
      category: formCategory,
      description: formDescription || null,
      vendor: formVendor || null,
      meta_data: Object.keys(parsedMeta).length > 0 ? parsedMeta : undefined,
      telemetry_mappings: telemetryObj,
      config_mappings: configObj,
      metadata_mappings: metaObj,
      components: componentsList,
      relationships: relationshipsList,
    };

    try {
      setIsSaving(true);
      let result: DeviceProfile;
      if (isEditing && profile) {
        result = await diagnosticsService.updateProfile(profile.id, payload);
        toast({ title: "Profile Updated", description: `Updated profile ${result.name}` });
      } else {
        result = await diagnosticsService.createProfile(payload);
        toast({ title: "Profile Created", description: `Created profile ${result.name}` });
      }

      onOpenChange(false);
      if (onSuccess) onSuccess(result);
    } catch (err: any) {
      toast({
        title: "Save Error",
        description: err.message || "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            {isEditing ? `Edit Profile: ${formName}` : "Register New IoT Device Profile"}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Configure Header Metadata, Dynamic Ingestion Slots, Subsystem Components, and Dependencies.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeModalTab} onValueChange={setActiveModalTab} className="pt-2">
          <TabsList className="grid grid-cols-4 h-8 text-xs bg-slate-100 p-0.5">
            <TabsTrigger value="metadata" className="text-xs">
              1. Header & Meta
            </TabsTrigger>
            <TabsTrigger value="mappings" className="text-xs">
              2. Ingestion Slots
            </TabsTrigger>
            <TabsTrigger value="components" className="text-xs">
              3. Subsystems & Metrics
            </TabsTrigger>
            <TabsTrigger value="relationships" className="text-xs">
              4. Relationships
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Header Metadata & Meta Data JSON */}
          <TabsContent value="metadata" className="space-y-4 pt-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700">Profile Name *</Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. AirQo-v5-DualPM"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700">Category *</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="air_quality">Air Quality Stations</SelectItem>
                    <SelectItem value="air_quality_gas">Air Quality Gas Monitor</SelectItem>
                    <SelectItem value="reference_monitor">Reference Monitor (BAM-1020 / TEOM)</SelectItem>
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
                  placeholder="e.g. AirQo / Met One Instruments"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-700">Description</Label>
              <Textarea
                rows={2}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe hardware architecture, target deployment scenarios..."
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Custom Metadata JSON (meta_data)
              </Label>
              <Textarea
                rows={3}
                value={formMetaDataJson}
                onChange={(e) => setFormMetaDataJson(e.target.value)}
                placeholder={'{\n  "is_default_lowcost": true,\n  "hardware_generation": "v5.2"\n}'}
                className="font-mono text-xs"
              />
            </div>
          </TabsContent>

          {/* TAB 2: Dynamic Ingestion Slots */}
          <TabsContent value="mappings" className="space-y-4 pt-3 text-xs">
            {/* Section A: Telemetry Mappings */}
            <div className="p-3 border rounded-lg bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-blue-600" />
                  Telemetry Slots ({telemetryMappings.length})
                </span>
                <span className="text-[11px] text-gray-400">Maps field1..field20 to metrics</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                <Input
                  placeholder="Slot (field1)"
                  value={newTelSlot}
                  onChange={(e) => setNewTelSlot(e.target.value)}
                  className="h-7 text-xs sm:col-span-1"
                />
                <Input
                  placeholder="Semantic Key (pm2_5)"
                  value={newTelKey}
                  onChange={(e) => setNewTelKey(e.target.value)}
                  className="h-7 text-xs sm:col-span-1"
                />
                <Input
                  placeholder="Label (PM2.5 Conc)"
                  value={newTelLabel}
                  onChange={(e) => setNewTelLabel(e.target.value)}
                  className="h-7 text-xs sm:col-span-2"
                />
                <Input
                  placeholder="Unit (ug/m3)"
                  value={newTelUnit}
                  onChange={(e) => setNewTelUnit(e.target.value)}
                  className="h-7 text-xs sm:col-span-1"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddTelemetryMapping}
                  className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>

              {telemetryMappings.length > 0 && (
                <div className="divide-y divide-gray-200 border rounded bg-white max-h-36 overflow-y-auto">
                  {telemetryMappings.map((tm, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 text-xs hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-primary">{tm.slot}</span>
                        <ArrowRight className="w-3 h-3 text-gray-300" />
                        <span className="text-gray-900 font-semibold">{tm.key}</span>
                        <span className="text-gray-500 font-sans">({tm.label})</span>
                        {tm.unit && <span className="text-gray-400">[{tm.unit}]</span>}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTelemetryMapping(i)}
                        className="h-6 w-6 p-0 text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section B: Config Mappings */}
            <div className="p-3 border rounded-lg bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-500" />
                  Config Parameter Slots ({configMappings.length})
                </span>
                <span className="text-[11px] text-gray-400">Maps config1..config10 to params</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                <Input
                  placeholder="Slot (config1)"
                  value={newCfgSlot}
                  onChange={(e) => setNewCfgSlot(e.target.value)}
                  className="h-7 text-xs sm:col-span-1"
                />
                <Input
                  placeholder="Param Key"
                  value={newCfgKey}
                  onChange={(e) => setNewCfgKey(e.target.value)}
                  className="h-7 text-xs sm:col-span-1"
                />
                <Input
                  placeholder="Label"
                  value={newCfgLabel}
                  onChange={(e) => setNewCfgLabel(e.target.value)}
                  className="h-7 text-xs sm:col-span-1"
                />
                <Select value={newCfgType} onValueChange={setNewCfgType}>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="int">Integer</SelectItem>
                    <SelectItem value="float">Float</SelectItem>
                    <SelectItem value="bool">Boolean</SelectItem>
                    <SelectItem value="str">String</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Default"
                  value={newCfgDefault}
                  onChange={(e) => setNewCfgDefault(e.target.value)}
                  className="h-7 text-xs sm:col-span-1"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddConfigMapping}
                  className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>

              {configMappings.length > 0 && (
                <div className="divide-y divide-gray-200 border rounded bg-white max-h-36 overflow-y-auto">
                  {configMappings.map((cm, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 text-xs hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-amber-600">{cm.slot}</span>
                        <ArrowRight className="w-3 h-3 text-gray-300" />
                        <span className="text-gray-900 font-semibold">{cm.key}</span>
                        <Badge variant="outline" className="text-[9px] uppercase">
                          {cm.type}
                        </Badge>
                        {cm.default !== undefined && (
                          <span className="text-gray-400">def: {cm.default}</span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveConfigMapping(i)}
                        className="h-6 w-6 p-0 text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section C: Metadata Mappings */}
            <div className="p-3 border rounded-lg bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-purple-600" />
                  Hardware Metadata Slots ({metadataMappings.length})
                </span>
                <span className="text-[11px] text-gray-400">Maps metadata1..metadata15</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                <Input
                  placeholder="Slot (metadata1)"
                  value={newMetaSlot}
                  onChange={(e) => setNewMetaSlot(e.target.value)}
                  className="h-7 text-xs sm:col-span-1"
                />
                <Input
                  placeholder="Key (pcb_version)"
                  value={newMetaKey}
                  onChange={(e) => setNewMetaKey(e.target.value)}
                  className="h-7 text-xs sm:col-span-1"
                />
                <Input
                  placeholder="Label (PCB Hardware Version)"
                  value={newMetaLabel}
                  onChange={(e) => setNewMetaLabel(e.target.value)}
                  className="h-7 text-xs sm:col-span-2"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddMetadataMapping}
                  className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>

              {metadataMappings.length > 0 && (
                <div className="divide-y divide-gray-200 border rounded bg-white max-h-36 overflow-y-auto">
                  {metadataMappings.map((mm, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 text-xs hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-purple-600">{mm.slot}</span>
                        <ArrowRight className="w-3 h-3 text-gray-300" />
                        <span className="text-gray-900 font-semibold">{mm.key}</span>
                        <span className="text-gray-500 font-sans">({mm.label})</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMetadataMapping(i)}
                        className="h-6 w-6 p-0 text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 3: Subsystems & Metrics */}
          <TabsContent value="components" className="space-y-4 pt-3 text-xs">
            <div className="p-3 border rounded-lg bg-slate-50/50 space-y-3">
              <span className="font-bold text-gray-800">Add Subsystem Component</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <Input
                  placeholder="Name (e.g. pm_sensors)"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="h-7 text-xs"
                />
                <Select value={compType} onValueChange={setCompType}>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="battery">Battery / Power</SelectItem>
                    <SelectItem value="sensor">Sensor Subsystem</SelectItem>
                    <SelectItem value="connectivity">Connectivity / Modem</SelectItem>
                    <SelectItem value="cooling">Cooling / HVAC</SelectItem>
                    <SelectItem value="motor">Motor / Pump</SelectItem>
                    <SelectItem value="compute">Compute / MCU</SelectItem>
                    <SelectItem value="storage">Storage</SelectItem>
                    <SelectItem value="actuator">Actuator</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-[11px]">Weight:</span>
                  <Input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={compCriticality}
                    onChange={(e) => setCompCriticality(parseFloat(e.target.value) || 0)}
                    className="h-7 text-xs w-20"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddComponent}
                  className="h-7 text-xs bg-primary hover:bg-primary/90 text-white"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Component
                </Button>
              </div>
            </div>

            {/* List of components */}
            <div className="space-y-3">
              {componentsList.map((comp, compIdx) => (
                <div key={compIdx} className="p-3.5 border rounded-lg bg-white shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">{comp.name}</span>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {comp.component_type}
                      </Badge>
                      <span className="text-xs text-primary font-semibold">
                        Weight: {(comp.criticality * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveComponent(compIdx)}
                      className="h-7 text-rose-500 hover:text-rose-700 gap-1 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove Subsystem
                    </Button>
                  </div>

                  {/* Defined Metrics */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-gray-700">Declared Metric Bounds:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {comp.metrics?.map((m, mIdx) => (
                        <div
                          key={mIdx}
                          className="p-2 rounded bg-slate-50 border flex items-center justify-between font-mono text-[11px]"
                        >
                          <div>
                            <span className="font-bold text-gray-900">{m.key}</span>{" "}
                            {m.unit && <span className="text-gray-500">({m.unit})</span>}
                            <div className="text-[10px] text-gray-500">
                              [{m.expected_min ?? "-∞"} .. {m.expected_max ?? "+∞"}]
                              {m.max_rate_of_change && (
                                <span className="text-amber-600 ml-1.5">
                                  Δmax: {m.max_rate_of_change}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMetricFromComp(compIdx, mIdx)}
                            className="h-5 w-5 p-0 text-rose-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Quick Metric Adder */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Input
                        id={`metric-key-${compIdx}`}
                        placeholder="Metric key (e.g. pm2_5)"
                        className="h-7 text-xs w-36"
                      />
                      <Input
                        id={`metric-unit-${compIdx}`}
                        placeholder="Unit"
                        className="h-7 text-xs w-20"
                      />
                      <Input
                        id={`metric-min-${compIdx}`}
                        type="number"
                        placeholder="Min"
                        className="h-7 text-xs w-20"
                      />
                      <Input
                        id={`metric-max-${compIdx}`}
                        type="number"
                        placeholder="Max"
                        className="h-7 text-xs w-20"
                      />
                      <Input
                        id={`metric-roc-${compIdx}`}
                        type="number"
                        placeholder="Δmax/hr"
                        className="h-7 text-xs w-24"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const k = (document.getElementById(`metric-key-${compIdx}`) as HTMLInputElement)?.value;
                          const u = (document.getElementById(`metric-unit-${compIdx}`) as HTMLInputElement)?.value;
                          const minStr = (document.getElementById(`metric-min-${compIdx}`) as HTMLInputElement)?.value;
                          const maxStr = (document.getElementById(`metric-max-${compIdx}`) as HTMLInputElement)?.value;
                          const rocStr = (document.getElementById(`metric-roc-${compIdx}`) as HTMLInputElement)?.value;

                          if (!k || !k.trim()) {
                            toast({ title: "Metric Key Required", variant: "destructive" });
                            return;
                          }
                          handleAddMetricToComp(compIdx, {
                            key: k.trim(),
                            unit: u.trim() || undefined,
                            data_type: "float",
                            expected_min: minStr ? parseFloat(minStr) : undefined,
                            expected_max: maxStr ? parseFloat(maxStr) : undefined,
                            max_rate_of_change: rocStr ? parseFloat(rocStr) : undefined,
                            is_telemetry_field: true,
                          });

                          (document.getElementById(`metric-key-${compIdx}`) as HTMLInputElement).value = "";
                          (document.getElementById(`metric-unit-${compIdx}`) as HTMLInputElement).value = "";
                          (document.getElementById(`metric-min-${compIdx}`) as HTMLInputElement).value = "";
                          (document.getElementById(`metric-max-${compIdx}`) as HTMLInputElement).value = "";
                          (document.getElementById(`metric-roc-${compIdx}`) as HTMLInputElement).value = "";
                        }}
                        className="h-7 text-xs bg-white text-primary"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add Metric Bound
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TAB 4: Topological Relationships */}
          <TabsContent value="relationships" className="space-y-4 pt-3 text-xs">
            <div className="p-3 border rounded-lg bg-slate-50/50 space-y-3">
              <span className="font-bold text-gray-800">Add Component Relationship</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <Select value={relSource} onValueChange={setRelSource}>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Source Component" />
                  </SelectTrigger>
                  <SelectContent>
                    {componentsList.map((c, i) => (
                      <SelectItem key={i} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={relType} onValueChange={setRelType}>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={relTarget} onValueChange={setRelTarget}>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Target Component" />
                  </SelectTrigger>
                  <SelectContent>
                    {componentsList.map((c, i) => (
                      <SelectItem key={i} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  size="sm"
                  disabled={!relSource || !relTarget || relSource === relTarget}
                  onClick={handleAddRelationship}
                  className="h-7 text-xs bg-primary hover:bg-primary/90 text-white"
                >
                  <Plus className="w-3 h-3 mr-1" /> Link
                </Button>
              </div>
            </div>

            {/* List of relationships */}
            <div className="space-y-2">
              {relationshipsList.map((rel, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg border bg-white text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 font-sans">{rel.source_component}</span>
                    <span className="text-primary font-bold text-[10px] px-1.5 py-0.5 rounded bg-primary/10">
                      {rel.relation_type}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                    <span className="font-bold text-gray-800 font-sans">{rel.target_component}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRelationship(idx)}
                    className="h-6 w-6 p-0 text-rose-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

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
            disabled={isSaving}
            className="text-xs bg-primary hover:bg-primary/90 text-white"
          >
            {isSaving ? "Saving..." : isEditing ? "Update Profile" : "Register Profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
