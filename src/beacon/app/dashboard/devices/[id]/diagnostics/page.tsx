"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { diagnosticsService } from "@/services/diagnosticsService";
import { DeviceHealthSnapshot, DiagnosticEvaluationResult, DiagnosisResult } from "@/types/diagnostics";
import { HealthScoreGauge } from "@/components/diagnostics/HealthScoreGauge";
import { SubsystemScoreCard } from "@/components/diagnostics/SubsystemScoreCard";
import { DiagnosisCard } from "@/components/diagnostics/DiagnosisCard";
import { EvidenceFactBadge } from "@/components/diagnostics/EvidenceFactBadge";
import { TelemetryDiagnosticChart } from "@/components/diagnostics/TelemetryDiagnosticChart";
import { TechnicianFeedbackModal } from "@/components/diagnostics/TechnicianFeedbackModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import {
  ChevronLeft,
  Activity,
  Layers,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Wrench,
  Stethoscope,
} from "lucide-react";

export default function DeviceDiagnosticInspectorPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id || params?.deviceId || "AQ_TEST_01";
  const deviceId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [loading, setLoading] = useState<boolean>(true);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [snapshot, setSnapshot] = useState<DeviceHealthSnapshot | null>(null);
  const [history, setHistory] = useState<DeviceHealthSnapshot[]>([]);
  const [windowHours, setWindowHours] = useState<number>(24);
  const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<DiagnosisResult | null>(null);

  const fetchDiagnosticData = async () => {
    try {
      setLoading(true);
      const [healthData, histData] = await Promise.all([
        diagnosticsService.getDeviceHealth(deviceId),
        diagnosticsService.getDeviceHealthHistory(deviceId, 30),
      ]);
      setSnapshot(healthData);
      setHistory(histData);
    } catch (err: any) {
      console.error("Error fetching diagnostics:", err);
      toast({
        title: "Diagnostic Load Warning",
        description: "Failed to connect to backend diagnostics engine. Running simulation fallback.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (deviceId) {
      fetchDiagnosticData();
    }
  }, [deviceId]);

  const handleReevaluate = async () => {
    try {
      setIsEvaluating(true);
      const result: DiagnosticEvaluationResult = await diagnosticsService.evaluateDevice(deviceId, {
        window_hours: windowHours,
        context: { cloud_cover_percentage: 15.0 },
      });

      setSnapshot((prev) => ({
        ...prev,
        id: `snap_${Date.now()}`,
        device_id: deviceId,
        timestamp: result.timestamp,
        overall_health_score: result.overall_health_score,
        lifecycle_state: result.lifecycle_state,
        subsystem_scores: result.subsystem_scores,
        active_evidences: result.active_evidences,
        detected_symptoms: result.detected_symptoms,
        top_diagnoses: result.top_diagnoses,
        evaluated_window_hours: result.evaluated_window_hours,
      }));

      toast({
        title: "Diagnostic Re-evaluation Complete",
        description: `Evaluated ${result.evaluated_window_hours}h telemetry window. Health score: ${result.overall_health_score}/100.`,
      });
    } catch (err: any) {
      toast({
        title: "Evaluation Failed",
        description: err.message || "Failed to trigger on-demand evaluation.",
        variant: "destructive",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleOpenFeedback = (diag: DiagnosisResult) => {
    setSelectedDiagnosis(diag);
    setFeedbackOpen(true);
  };

  const handleCreateTicket = (diag: DiagnosisResult) => {
    toast({
      title: "Maintenance Ticket Dispatched",
      description: `Dispatched maintenance ticket for ${deviceId} (${diag.title}). Assigned to field crew.`,
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/devices/${deviceId}`)}
            className="h-8 text-xs bg-white gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            Device Details
          </Button>
          <div className="h-4 w-px bg-gray-300 hidden sm:block" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              Device Diagnostic Inspector
            </h1>
            <p className="text-xs text-gray-500 font-mono">
              Target Device: <strong className="text-gray-900">{deviceId}</strong>
            </p>
          </div>
        </div>

        {/* Evaluation Controls */}
        <div className="flex items-center gap-2">
          <select
            value={windowHours}
            onChange={(e) => setWindowHours(Number(e.target.value))}
            className="h-8 text-xs px-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value={12}>12 Hours Horizon</option>
            <option value={24}>24 Hours Horizon</option>
            <option value={48}>48 Hours Horizon</option>
            <option value={168}>7 Days Horizon</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/diagnostics/simulator?device_id=${deviceId}`)}
            className="h-8 text-xs bg-white text-blue-700 border-blue-200 hover:bg-blue-50 gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            Bench Simulator
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      ) : snapshot ? (
        <div className="space-y-6">
          {/* 1. Health Score Gauge Banner */}
          <HealthScoreGauge
            score={snapshot.overall_health_score}
            state={snapshot.lifecycle_state}
            evaluatedWindowHours={snapshot.evaluated_window_hours || windowHours}
            lastEvaluated={new Date(snapshot.timestamp).toLocaleTimeString()}
            onReevaluate={handleReevaluate}
            isEvaluating={isEvaluating}
          />

          {/* 2. Subsystem Breakdown & Active Evidences Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Subsystem Health Cards */}
            <div className="lg:col-span-6">
              <SubsystemScoreCard
                subsystemScores={snapshot.subsystem_scores || {}}
                className="h-full"
              />
            </div>

            {/* Active Evidence Facts & Symptoms Card */}
            <div className="lg:col-span-6">
              <Card className="border border-gray-200 shadow-sm h-full flex flex-col">
                <CardHeader className="pb-3 border-b border-gray-100">
                  <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Active Evidential Facts & Symptoms
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex-1">
                  <EvidenceFactBadge
                    facts={snapshot.active_evidences || []}
                    symptoms={snapshot.detected_symptoms || []}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 3. Ranked Root Causes & Prescriptions Accordion */}
          <DiagnosisCard
            diagnoses={snapshot.top_diagnoses || []}
            deviceId={deviceId}
            onOpenFeedback={handleOpenFeedback}
            onCreateTicket={handleCreateTicket}
          />

          {/* 4. Interactive Diagnostic Charts */}
          <TelemetryDiagnosticChart
            healthHistory={history}
            category={snapshot.category}
          />
        </div>
      ) : (
        <Card className="p-10 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-gray-900">No Diagnostic Data Found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Telemetry data for device {deviceId} could not be evaluated.
          </p>
          <Button onClick={handleReevaluate} className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground text-xs">
            Run Initial Diagnostic Evaluation
          </Button>
        </Card>
      )}

      {/* Technician Feedback Modal */}
      <TechnicianFeedbackModal
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        deviceId={deviceId}
        snapshotId={snapshot?.id}
        diagnosis={selectedDiagnosis}
        onFeedbackSubmitted={fetchDiagnosticData}
      />
    </div>
  );
}
