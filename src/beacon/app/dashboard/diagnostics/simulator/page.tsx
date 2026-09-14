"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { diagnosticsService, DiagnosticsApiError } from "@/services/diagnosticsService";
import { DiagnosticEvaluationResult, DeviceProfile, ProfileDiagnosticReadiness } from "@/types/diagnostics";
import { HealthScoreGauge } from "@/components/diagnostics/HealthScoreGauge";
import { SubsystemScoreCard } from "@/components/diagnostics/SubsystemScoreCard";
import { DiagnosisCard } from "@/components/diagnostics/DiagnosisCard";
import { EvidenceFactBadge } from "@/components/diagnostics/EvidenceFactBadge";
import { EvaluationQualityNotice } from "@/components/diagnostics/EvaluationQualityNotice";
import { ProfileNotDiagnosableNotice } from "@/components/diagnostics/ProfileNotDiagnosableNotice";
import {
  SCENARIOS,
  ScenarioId,
  generateScenarioTelemetry,
  isNumericMetric,
  listSimMetrics,
  parseRedundantPair,
} from "@/components/diagnostics/simulatorScenarios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingState } from "@/components/ui/loading-state";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  FileCode,
  FlaskConical,
  Play,
  RotateCcw,
  ShieldAlert,
  Sliders,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useGroup } from "@/lib/group-context";

const formatRecords = (records: Record<string, any>[]) =>
  records.length === 0 ? "[]" : `[\n${records.map((r) => `  ${JSON.stringify(r)}`).join(",\n")}\n]`;

function DiagnosticSimulatorContent() {
  const searchParams = useSearchParams();
  const queryDeviceId = searchParams?.get("device_id");
  const { activeGroup, loading: groupLoading } = useGroup();
  const isAirqoGroup = activeGroup?.toLowerCase() === "airqo";

  const [profiles, setProfiles] = useState<DeviceProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState<boolean>(false);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string>("");
  const [profile, setProfile] = useState<DeviceProfile | null>(null);
  const [readiness, setReadiness] = useState<ProfileDiagnosticReadiness | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);

  const [scenario, setScenario] = useState<ScenarioId>("nominal");
  const [target, setTarget] = useState<string>("");
  const [deviceId, setDeviceId] = useState<string>(queryDeviceId || "sim_bench_node");
  const [windowHours, setWindowHours] = useState<number>(24);
  const [jsonTelemetry, setJsonTelemetry] = useState<string>("[]");
  const [jsonContext, setJsonContext] = useState<string>("{}");
  const [generatedCount, setGeneratedCount] = useState<number>(0);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [result, setResult] = useState<DiagnosticEvaluationResult | null>(null);
  const [evalError, setEvalError] = useState<DiagnosticsApiError | null>(null);

  const loadProfiles = useCallback(() => {
    setProfilesLoading(true);
    setProfilesError(null);
    return diagnosticsService
      .getProfiles({ limit: 100 })
      .then((p) => {
        setProfiles(p);
        setProfileId((current) => current || p[0]?.id || "");
      })
      .catch((err: any) => {
        const errMsg = err?.message || "Failed to load hardware profiles.";
        setProfilesError(errMsg);
        toast({ title: "Error Loading Profiles", description: errMsg, variant: "destructive" });
      })
      .finally(() => setProfilesLoading(false));
  }, []);

  useEffect(() => {
    if (isAirqoGroup) loadProfiles();
  }, [isAirqoGroup, loadProfiles]);

  useEffect(() => {
    if (queryDeviceId) setDeviceId(queryDeviceId);
  }, [queryDeviceId]);

  // Full profile (components and metrics) plus what the engine can evaluate on it
  useEffect(() => {
    // Output from a previous profile would be shown against the new one
    setEvalError(null);
    setResult(null);
    if (!profileId) {
      setProfile(null);
      setReadiness(null);
      return;
    }
    let cancelled = false;
    setProfileLoading(true);
    Promise.all([
      diagnosticsService.getProfile(profileId),
      diagnosticsService.getProfileReadiness(profileId).catch(() => null),
    ])
      .then(([p, r]) => {
        if (cancelled) return;
        setProfile(p);
        setReadiness(r);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setProfile(null);
        setReadiness(null);
        toast({ title: "Error Loading Profile", description: err?.message, variant: "destructive" });
      })
      .finally(() => !cancelled && setProfileLoading(false));
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  const simMetrics = useMemo(() => (profile ? listSimMetrics(profile) : []), [profile]);
  const scenarioDef = SCENARIOS.find((s) => s.id === scenario) || SCENARIOS[0];

  const targetOptions = useMemo(() => {
    if (scenarioDef.target === "metric") {
      return simMetrics
        .filter((m) => !scenarioDef.supports || scenarioDef.supports(m))
        .map((m) => ({ value: m.ref, label: m.metric.unit ? `${m.ref} (${m.metric.unit})` : m.ref }));
    }
    if (scenarioDef.target === "pair") {
      const numericRefs = new Set(simMetrics.filter((m) => isNumericMetric(m.metric)).map((m) => m.ref));
      return (readiness?.redundant_pairs || [])
        .filter((p) => parseRedundantPair(p)?.every((ref) => numericRefs.has(ref)))
        .map((p) => ({ value: p, label: p }));
    }
    return [];
  }, [scenarioDef, simMetrics, readiness]);

  // Keep the target valid for the selected scenario
  useEffect(() => {
    if (scenarioDef.target === "none") {
      if (target) setTarget("");
      return;
    }
    if (!targetOptions.some((o) => o.value === target)) {
      setTarget(targetOptions[0]?.value || "");
    }
  }, [scenarioDef, targetOptions, target]);

  const regenerate = useCallback(() => {
    if (!profile) return;
    const { records, intervalSeconds } = generateScenarioTelemetry({
      profile,
      scenario,
      target: target || null,
      windowHours,
    });
    setJsonTelemetry(formatRecords(records));
    setJsonContext(JSON.stringify({ expected_interval_seconds: intervalSeconds }, null, 2));
    setGeneratedCount(records.length);
  }, [profile, scenario, target, windowHours]);

  // Regenerate when the scenario inputs change; manual JSON edits last until then.
  useEffect(() => {
    regenerate();
  }, [regenerate]);

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
              Diagnostic Simulator & Bench Tester is exclusively available when the active organization is set to <span className="font-semibold text-primary">AirQo</span>.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleRunEvaluation = async () => {
    if (!profileId) {
      toast({ title: "Select a Profile", description: "Diagnostics are driven by a device profile.", variant: "destructive" });
      return;
    }

    let parsedTelemetry: any[] = [];
    let parsedContext: Record<string, any> = {};

    try {
      parsedTelemetry = JSON.parse(jsonTelemetry);
      if (!Array.isArray(parsedTelemetry)) {
        throw new Error("Telemetry must be a JSON array of records.");
      }
    } catch (e: any) {
      toast({ title: "Invalid Telemetry JSON", description: e.message || "Failed to parse telemetry JSON.", variant: "destructive" });
      return;
    }

    try {
      if (jsonContext.trim()) {
        parsedContext = JSON.parse(jsonContext);
      }
    } catch (e: any) {
      toast({ title: "Invalid Context JSON", description: e.message || "Failed to parse context JSON.", variant: "destructive" });
      return;
    }

    try {
      setEvaluating(true);
      setEvalError(null);
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
      if (err instanceof DiagnosticsApiError && err.isProfileNotDiagnosable) {
        setEvalError(err);
        setResult(null);
      } else {
        toast({ title: "Evaluation Error", description: err?.message || "Failed to evaluate simulator payload.", variant: "destructive" });
      }
    } finally {
      setEvaluating(false);
    }
  };

  const scenarioUnavailable = scenarioDef.target !== "none" && targetOptions.length === 0;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/diagnostics" className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" /> Fleet Diagnostics
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Sliders className="w-7 h-7 text-primary" />
            Diagnostic Simulator & Bench Tester
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Generate telemetry from a device profile&apos;s own metric limits, inject a fault and inspect how the engine diagnoses it. Nothing is saved.
          </p>
        </div>

        <Button
          onClick={handleRunEvaluation}
          disabled={evaluating || !profileId}
          className="h-9 text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-sm font-semibold px-4"
        >
          <Play className={`w-4 h-4 ${evaluating ? "animate-spin" : ""}`} />
          {evaluating ? "Running Engine..." : "Run Diagnostic Evaluation"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scenario & Payload */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-primary" />
                Scenario
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              {/* Profile */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-gray-700">Device Profile</Label>
                  {profilesError && (
                    <button
                      type="button"
                      onClick={() => loadProfiles()}
                      className="text-[11px] text-red-600 hover:text-red-700 underline font-medium flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Retry
                    </button>
                  )}
                </div>
                <Select value={profileId} onValueChange={setProfileId} disabled={profilesLoading}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder={profilesLoading ? "Loading profiles..." : "Select profile"} />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {profilesError && <p className="text-[11px] text-red-600 mt-0.5">{profilesError}</p>}
                {!profilesLoading && !profilesError && profiles.length === 0 && (
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    No device profiles yet.{" "}
                    <Link href="/dashboard/settings/device-profiles" className="underline">
                      Create one
                    </Link>{" "}
                    to run the simulator.
                  </p>
                )}

                {profileLoading ? (
                  <Skeleton className="h-8 w-full rounded-lg mt-1.5" />
                ) : readiness ? (
                  <div
                    className={`mt-1.5 p-2 rounded-lg border flex items-start justify-between gap-2 ${
                      readiness.diagnosable ? "bg-emerald-50/60 border-emerald-200 text-emerald-800" : "bg-rose-50/60 border-rose-200 text-rose-800"
                    }`}
                  >
                    <div className="flex items-start gap-1.5">
                      {readiness.diagnosable ? (
                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      )}
                      <span>
                        {readiness.diagnosable
                          ? `Diagnosable · ${readiness.evaluated_metrics.length} metrics evaluated${
                              readiness.warnings.length ? ` · ${readiness.warnings.length} warnings` : ""
                            }`
                          : readiness.errors[0] || "This profile cannot be diagnosed."}
                      </span>
                    </div>
                    <Link href={`/dashboard/settings/device-profiles/${profileId}`} className="underline shrink-0 font-medium">
                      Profile
                    </Link>
                  </div>
                ) : null}
              </div>

              {/* Scenario picker */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Fault to Inject</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {SCENARIOS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setScenario(s.id)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium text-left transition-all ${
                        scenario === s.id
                          ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-500">{scenarioDef.description}</p>
              </div>

              {scenarioDef.target !== "none" && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-700">
                    {scenarioDef.target === "pair" ? "Sensor Pair" : "Target Metric"}
                  </Label>
                  {scenarioUnavailable ? (
                    <p className="text-[11px] text-amber-700">
                      {scenarioDef.target === "pair"
                        ? "This profile has no MEASURES_SAME_AS pair with matchable metrics."
                        : "No telemetry-mapped metric on this profile has the limit this scenario needs."}
                    </p>
                  ) : (
                    <Select value={target} onValueChange={setTarget}>
                      <SelectTrigger className="h-8 text-xs font-mono">
                        <SelectValue placeholder="Select target" />
                      </SelectTrigger>
                      <SelectContent>
                        {targetOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value} className="font-mono text-xs">
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-700">Device ID</Label>
                  <Input value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="h-8 text-xs font-mono" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-700">Window (Hours)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={168}
                    value={windowHours}
                    onChange={(e) => setWindowHours(Math.min(168, Math.max(1, Number(e.target.value) || 1)))}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-primary" />
                  Payload
                </CardTitle>
                <Button variant="outline" size="sm" onClick={regenerate} disabled={!profile} className="h-7 text-xs bg-white gap-1">
                  <Wand2 className="w-3 h-3" /> Regenerate
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700">Context (JSON)</Label>
                <Textarea
                  rows={3}
                  value={jsonContext}
                  onChange={(e) => setJsonContext(e.target.value)}
                  className="font-mono text-[11px] bg-slate-900 text-slate-100 rounded-lg p-2.5"
                />
                <p className="text-[11px] text-gray-500">
                  Supports <code>expected_interval_seconds</code> and <code>policy</code> overrides, e.g.{" "}
                  <code>{`{"policy": {"completeness": {"max_missing_rate": 0.2}}}`}</code>.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-gray-700">Telemetry Records (JSON Array)</Label>
                  <span className="text-[11px] text-gray-400">{generatedCount} generated</span>
                </div>
                <Textarea
                  rows={14}
                  value={jsonTelemetry}
                  onChange={(e) => setJsonTelemetry(e.target.value)}
                  className="font-mono text-[11px] bg-slate-900 text-slate-100 rounded-lg p-2.5 leading-relaxed"
                  spellCheck={false}
                />
                <p className="text-[11px] text-gray-500">
                  Fields use the profile&apos;s telemetry slots, as a device would send them.
                </p>
              </div>

              <Button
                onClick={handleRunEvaluation}
                disabled={evaluating || !profileId}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                Run In-Memory Bench Evaluation
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Diagnostic Output */}
        <div className="lg:col-span-7 space-y-4">
          {evalError && <ProfileNotDiagnosableNotice error={evalError} profileId={profileId} />}

          {result ? (
            <div className="space-y-6">
              <HealthScoreGauge
                score={result.overall_health_score}
                state={result.lifecycle_state}
                evaluatedWindowHours={result.evaluated_window_hours}
                lastEvaluated={new Date(result.timestamp).toLocaleTimeString()}
                onReevaluate={handleRunEvaluation}
                isEvaluating={evaluating}
                isSimulated
              />

              <EvaluationQualityNotice
                profileId={result.profile_id}
                profileName={result.profile_name}
                dataCompleteness={result.data_completeness}
                profileWarnings={result.profile_warnings}
              />

              <SubsystemScoreCard subsystemScores={result.subsystem_scores} />

              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-2 border-b border-gray-100">
                  <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Evidence
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  <EvidenceFactBadge facts={result.active_evidences || []} symptoms={result.detected_symptoms || []} />
                </CardContent>
              </Card>

              <DiagnosisCard diagnoses={result.top_diagnoses || []} deviceId={result.device_id} />
            </div>
          ) : !evalError ? (
            <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-white space-y-3">
              <Sliders className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="text-base font-bold text-gray-900">Ready for Bench Evaluation</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Pick a profile and a fault to inject, adjust the generated telemetry if needed, then click &ldquo;Run Diagnostic
                Evaluation&rdquo; to see the engine&apos;s findings and root causes.
              </p>
              <Button
                onClick={handleRunEvaluation}
                disabled={!profileId}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8"
              >
                Run Evaluation
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function DiagnosticSimulatorPage() {
  return (
    <Suspense
      fallback={
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <LoadingState text="Loading diagnostic simulator..." className="min-h-[50vh]" />
        </div>
      }
    >
      <DiagnosticSimulatorContent />
    </Suspense>
  );
}
