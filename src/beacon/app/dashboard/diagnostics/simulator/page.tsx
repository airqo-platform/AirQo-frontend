"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { diagnosticsService, DEFAULT_PROFILES } from "@/services/diagnosticsService";
import { DiagnosticEvaluationResult, DiagnosisResult, DeviceProfile } from "@/types/diagnostics";
import { HealthScoreGauge } from "@/components/diagnostics/HealthScoreGauge";
import { SubsystemScoreCard } from "@/components/diagnostics/SubsystemScoreCard";
import { DiagnosisCard } from "@/components/diagnostics/DiagnosisCard";
import { EvidenceFactBadge } from "@/components/diagnostics/EvidenceFactBadge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  Sliders,
  Play,
  Sparkles,
  Layers,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  FileCode,
  Zap,
  Activity,
  Snowflake,
  Sun,
  Cog,
  Stethoscope,
} from "lucide-react";

// PRE-LOADED PRESETS
const SIMULATOR_PRESETS = [
  {
    id: "preset_battery_collapse",
    name: "Air Quality: Battery Collapse & Rapid Night Discharge",
    category: "air_quality",
    deviceId: "AQ_BENCH_TEST_01",
    profileId: "prof_airqo_v5_dualpm",
    context: { cloud_cover_percentage: 10.0, ambient_temp_c: 24.5 },
    windowHours: 24,
    telemetry: [
      { datetime: "2026-08-23T06:00:00Z", battery_voltage: 12.1, solar_voltage: 0.0, battery_current: -220, pm2_5: 22.4, pm2_5_sensor_2: 22.8 },
      { datetime: "2026-08-23T10:00:00Z", battery_voltage: 13.8, solar_voltage: 18.2, battery_current: 2400, pm2_5: 28.1, pm2_5_sensor_2: 27.9 },
      { datetime: "2026-08-23T14:00:00Z", battery_voltage: 14.1, solar_voltage: 18.8, battery_current: 2800, pm2_5: 31.0, pm2_5_sensor_2: 30.5 },
      { datetime: "2026-08-23T18:00:00Z", battery_voltage: 13.2, solar_voltage: 2.1, battery_current: -260, pm2_5: 35.4, pm2_5_sensor_2: 34.8 },
      { datetime: "2026-08-23T21:00:00Z", battery_voltage: 11.4, solar_voltage: 0.0, battery_current: -280, pm2_5: 42.0, pm2_5_sensor_2: 41.2 },
      { datetime: "2026-08-24T02:00:00Z", battery_voltage: 10.8, solar_voltage: 0.0, battery_current: -210, pm2_5: 38.2, pm2_5_sensor_2: 37.9 },
    ],
  },
  {
    id: "preset_sensor_drift",
    name: "Air Quality: Dual-Sensor Contamination & Drift",
    category: "air_quality",
    deviceId: "AQ_DRIFT_BENCH_02",
    profileId: "prof_airqo_v5_dualpm",
    context: { relative_humidity: 62.0 },
    windowHours: 24,
    telemetry: [
      { datetime: "2026-08-23T06:00:00Z", battery_voltage: 13.2, solar_voltage: 12.0, pm2_5: 18.2, pm2_5_sensor_2: 36.4 },
      { datetime: "2026-08-23T10:00:00Z", battery_voltage: 13.6, solar_voltage: 18.0, pm2_5: 22.0, pm2_5_sensor_2: 48.2 },
      { datetime: "2026-08-23T14:00:00Z", battery_voltage: 13.9, solar_voltage: 18.5, pm2_5: 25.4, pm2_5_sensor_2: 54.0 },
      { datetime: "2026-08-23T18:00:00Z", battery_voltage: 13.4, solar_voltage: 4.0, pm2_5: 30.1, pm2_5_sensor_2: 66.8 },
      { datetime: "2026-08-23T22:00:00Z", battery_voltage: 13.1, solar_voltage: 0.0, pm2_5: 28.0, pm2_5_sensor_2: 62.1 },
    ],
  },
  {
    id: "preset_coldchain_trip",
    name: "Cold Chain: Vaccine Freezer Compressor Relay Stall",
    category: "cold_chain",
    deviceId: "CRYO_DEPOT_SIM_03",
    profileId: "prof_coldchain_ultralow",
    context: { target_setpoint_c: -80.0 },
    windowHours: 12,
    telemetry: [
      { datetime: "2026-08-23T08:00:00Z", chamber_temp_c: -81.2, compressor_current_a: 4.6, door_open_seconds: 0 },
      { datetime: "2026-08-23T09:00:00Z", chamber_temp_c: -79.4, compressor_current_a: 4.8, door_open_seconds: 0 },
      { datetime: "2026-08-23T10:00:00Z", chamber_temp_c: -74.1, compressor_current_a: 0.0, door_open_seconds: 0 },
      { datetime: "2026-08-23T11:00:00Z", chamber_temp_c: -68.5, compressor_current_a: 0.0, door_open_seconds: 0 },
      { datetime: "2026-08-23T12:00:00Z", chamber_temp_c: -64.2, compressor_current_a: 0.0, door_open_seconds: 0 },
    ],
  },
  {
    id: "preset_pump_cavitation",
    name: "Smart Water: Submersible Pump Impeller Cavitation",
    category: "water_pump",
    deviceId: "PUMP_BOREHOLE_SIM_04",
    profileId: "prof_smart_water_pump",
    context: { static_water_head_m: 45.0 },
    windowHours: 24,
    telemetry: [
      { datetime: "2026-08-23T06:00:00Z", motor_current_a: 9.8, vibration_rms: 4.5, flow_rate_lpm: 120 },
      { datetime: "2026-08-23T08:00:00Z", motor_current_a: 9.9, vibration_rms: 4.8, flow_rate_lpm: 110 },
      { datetime: "2026-08-23T10:00:00Z", motor_current_a: 9.7, vibration_rms: 5.1, flow_rate_lpm: 95 },
      { datetime: "2026-08-23T12:00:00Z", motor_current_a: 10.1, vibration_rms: 4.9, flow_rate_lpm: 88 },
    ],
  },
  {
    id: "preset_healthy",
    name: "Nominal / Fully Healthy AirQo Node",
    category: "air_quality",
    deviceId: "AQ_HEALTHY_NODE_05",
    profileId: "prof_airqo_v5_dualpm",
    context: { cloud_cover_percentage: 12.0 },
    windowHours: 24,
    telemetry: [
      { datetime: "2026-08-23T06:00:00Z", battery_voltage: 12.9, solar_voltage: 0.0, pm2_5: 22.0, pm2_5_sensor_2: 22.4 },
      { datetime: "2026-08-23T12:00:00Z", battery_voltage: 14.2, solar_voltage: 19.1, pm2_5: 25.0, pm2_5_sensor_2: 25.3 },
      { datetime: "2026-08-23T18:00:00Z", battery_voltage: 13.8, solar_voltage: 2.0, pm2_5: 28.1, pm2_5_sensor_2: 28.4 },
      { datetime: "2026-08-24T00:00:00Z", battery_voltage: 13.1, solar_voltage: 0.0, pm2_5: 24.0, pm2_5_sensor_2: 24.2 },
    ],
  },
];

export default function DiagnosticSimulatorPage() {
  const searchParams = useSearchParams();
  const initDeviceId = searchParams?.get("device_id") || "AQ_BENCH_TEST_01";

  const [profiles, setProfiles] = useState<DeviceProfile[]>(DEFAULT_PROFILES);
  const [selectedPreset, setSelectedPreset] = useState<string>("preset_battery_collapse");
  const [deviceId, setDeviceId] = useState<string>(initDeviceId);
  const [profileId, setProfileId] = useState<string>("prof_airqo_v5_dualpm");
  const [windowHours, setWindowHours] = useState<number>(24);
  const [jsonTelemetry, setJsonTelemetry] = useState<string>("");
  const [jsonContext, setJsonContext] = useState<string>('{\n  "cloud_cover_percentage": 10.0,\n  "ambient_temp_c": 24.5\n}');
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [result, setResult] = useState<DiagnosticEvaluationResult | null>(null);

  // Initialize with preset 0
  useEffect(() => {
    loadPreset(SIMULATOR_PRESETS[0]);
    diagnosticsService.getProfiles().then((p) => {
      if (p && p.length > 0) setProfiles(p);
    });
  }, []);

  const loadPreset = (preset: (typeof SIMULATOR_PRESETS)[0]) => {
    setSelectedPreset(preset.id);
    setDeviceId(preset.deviceId);
    setProfileId(preset.profileId);
    setWindowHours(preset.windowHours);
    setJsonTelemetry(JSON.stringify(preset.telemetry, null, 2));
    setJsonContext(JSON.stringify(preset.context || {}, null, 2));
  };

  const handlePresetSelect = (id: string) => {
    const found = SIMULATOR_PRESETS.find((p) => p.id === id);
    if (found) {
      loadPreset(found);
      toast({
        title: "Preset Loaded",
        description: `Loaded ${found.name}`,
      });
    }
  };

  const handleRunEvaluation = async () => {
    let parsedTelemetry: any[] = [];
    let parsedContext: Record<string, any> = {};

    try {
      parsedTelemetry = JSON.parse(jsonTelemetry);
      if (!Array.isArray(parsedTelemetry)) {
        throw new Error("Telemetry must be a JSON array of records.");
      }
    } catch (e: any) {
      toast({
        title: "Invalid Telemetry JSON",
        description: e.message || "Failed to parse telemetry JSON.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (jsonContext.trim()) {
        parsedContext = JSON.parse(jsonContext);
      }
    } catch (e: any) {
      toast({
        title: "Invalid Context JSON",
        description: e.message || "Failed to parse context JSON.",
        variant: "destructive",
      });
      return;
    }

    try {
      setEvaluating(true);
      const evalResult = await diagnosticsService.evaluatePayload({
        device_id: deviceId || "sim_bench_node",
        telemetry_window: parsedTelemetry,
        context: parsedContext,
        window_hours: windowHours,
        profile_id: profileId,
      });

      setResult(evalResult);
      toast({
        title: "Evaluation Completed",
        description: `Score: ${evalResult.overall_health_score}/100 • State: ${evalResult.lifecycle_state}`,
      });
    } catch (err: any) {
      toast({
        title: "Evaluation Error",
        description: err.message || "Failed to evaluate simulator payload.",
        variant: "destructive",
      });
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/diagnostics" className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" /> Fleet Triage
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Sliders className="w-7 h-7 text-primary" />
            Ad-hoc Diagnostic Simulator & Bench Tester
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            In-lab pre-deployment certification: test telemetry waveforms, simulate edge faults, and inspect evidential reasoning without backend database dependencies
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRunEvaluation}
            disabled={evaluating}
            className="h-9 text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-sm font-semibold px-4"
          >
            <Play className={`w-4 h-4 ${evaluating ? "animate-spin" : ""}`} />
            {evaluating ? "Running Engine..." : "Run Diagnostic Evaluation"}
          </Button>
        </div>
      </div>

      {/* Preset Selector Banner */}
      <Card className="border border-primary/20 bg-primary/10 shadow-2xs">
        <CardContent className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs font-bold text-primary uppercase tracking-wide">
              Pre-loaded Test Scenarios:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {SIMULATOR_PRESETS.map((preset) => {
              const isSel = selectedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                    isSel
                      ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {preset.name.split(":")[1] || preset.name}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 2-Column Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: JSON Payload Editor & Parameters */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-primary" />
                Payload Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              {/* Parameters */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-700">Device ID</Label>
                  <Input
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-700">Window (Hours)</Label>
                  <Input
                    type="number"
                    value={windowHours}
                    onChange={(e) => setWindowHours(Number(e.target.value))}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700">Hardware Profile</Label>
                <Select value={profileId} onValueChange={setProfileId}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Context JSON */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700">
                  Context Variables (JSON)
                </Label>
                <Textarea
                  rows={2}
                  value={jsonContext}
                  onChange={(e) => setJsonContext(e.target.value)}
                  className="font-mono text-[11px] bg-slate-900 text-slate-100 rounded-lg p-2.5"
                />
              </div>

              {/* Telemetry Series JSON */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-gray-700">
                    Telemetry Window Series (JSON Array)
                  </Label>
                </div>
                <Textarea
                  rows={12}
                  value={jsonTelemetry}
                  onChange={(e) => setJsonTelemetry(e.target.value)}
                  className="font-mono text-[11px] bg-slate-900 text-slate-100 rounded-lg p-2.5 leading-relaxed"
                />
              </div>

              <Button
                onClick={handleRunEvaluation}
                disabled={evaluating}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                Run In-Memory Bench Evaluation
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Diagnostic Output Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="space-y-6">
              {/* 1. Health Score Gauge */}
              <HealthScoreGauge
                score={result.overall_health_score}
                state={result.lifecycle_state}
                evaluatedWindowHours={result.evaluated_window_hours}
                lastEvaluated={new Date(result.timestamp).toLocaleTimeString()}
                onReevaluate={handleRunEvaluation}
                isEvaluating={evaluating}
              />

              {/* 2. Subsystem Breakdown */}
              <SubsystemScoreCard subsystemScores={result.subsystem_scores} />

              {/* 3. Evidences & Symptoms */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-2 border-b border-gray-100">
                  <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Extracted Evidential Facts & Symptoms
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  <EvidenceFactBadge
                    facts={result.active_evidences || []}
                    symptoms={result.detected_symptoms || []}
                  />
                </CardContent>
              </Card>

              {/* 4. Ranked Diagnoses */}
              <DiagnosisCard
                diagnoses={result.top_diagnoses || []}
                deviceId={result.device_id}
                onOpenFeedback={() => {
                  toast({
                    title: "Simulator Bench Note",
                    description: "Feedback simulated and recorded locally for test certification.",
                  });
                }}
              />
            </div>
          ) : (
            <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-white space-y-3">
              <Sliders className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="text-base font-bold text-gray-900">
                Ready for Live Bench Evaluation
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Select a test preset or edit the telemetry JSON payload on the left, then click &ldquo;Run Diagnostic Evaluation&rdquo; to inspect the engine&apos;s inference in real time.
              </p>
              <Button onClick={handleRunEvaluation} className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8">
                Run Default Evaluation
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
