"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
import { ExternalLink, Sparkles, Sliders, Stethoscope } from "lucide-react";

interface DiagnosticsTabProps {
  deviceId: string;
  deviceName?: string;
}

export default function DiagnosticsTab({ deviceId, deviceName }: DiagnosticsTabProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [snapshot, setSnapshot] = useState<DeviceHealthSnapshot | null>(null);
  const [history, setHistory] = useState<DeviceHealthSnapshot[]>([]);
  const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDiagnosticData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [healthData, histData] = await Promise.all([
        diagnosticsService.getDeviceHealth(deviceId),
        diagnosticsService.getDeviceHealthHistory(deviceId, 30),
      ]);
      setSnapshot(healthData);
      setHistory(histData);
    } catch (err: any) {
      console.error("Error fetching diagnostics tab data:", err);
      setError(err?.message || "Device health telemetry is currently unavailable.");
      setSnapshot(null);
      setHistory([]);
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
        window_hours: 24,
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
        description: `Health score: ${result.overall_health_score}/100.`,
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
      description: `Dispatched maintenance ticket for ${deviceId} (${diag.title}).`,
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-60 rounded-xl" />
          <Skeleton className="h-60 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error && !snapshot) {
    return (
      <Card className="border border-dashed border-gray-300 p-8 text-center bg-gray-50/50">
        <Stethoscope className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-gray-800">Telemetry Data Unavailable</h4>
        <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
          {error}
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button onClick={fetchDiagnosticData} variant="outline" size="sm">
            Retry Connection
          </Button>
          <Button onClick={handleReevaluate} size="sm" disabled={isEvaluating} className="gap-2">
            <Sparkles className={`w-3.5 h-3.5 ${isEvaluating ? "animate-spin" : ""}`} />
            Run On-Demand Evaluation
          </Button>
        </div>
      </Card>
    );
  }

  if (!snapshot) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner with Full Screen Inspector Link */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-gray-900">
            Real-Time Diagnostic Health & Inferred Hypotheses
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/devices/${deviceId}/diagnostics`}>
            <Button variant="outline" size="sm" className="h-8 text-xs bg-white gap-1.5 text-blue-700 border-blue-200 hover:bg-blue-50">
              <ExternalLink className="w-3.5 h-3.5" />
              Full-Screen Inspector
            </Button>
          </Link>
          <Link href={`/dashboard/diagnostics/simulator?device_id=${deviceId}`}>
            <Button variant="outline" size="sm" className="h-8 text-xs bg-white gap-1.5 text-gray-700">
              <Sliders className="w-3.5 h-3.5" />
              Bench Simulator
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. Health Score Gauge Banner */}
      <HealthScoreGauge
        score={snapshot.overall_health_score}
        state={snapshot.lifecycle_state}
        evaluatedWindowHours={snapshot.evaluated_window_hours || 24}
        lastEvaluated={new Date(snapshot.timestamp).toLocaleTimeString()}
        onReevaluate={handleReevaluate}
        isEvaluating={isEvaluating}
        isSimulated={snapshot.is_simulated}
      />

      {/* 2. Subsystem Breakdown & Active Evidences */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <SubsystemScoreCard
            subsystemScores={snapshot.subsystem_scores || {}}
            className="h-full"
          />
        </div>

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

      {/* 3. Ranked Root Causes Accordion */}
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

      {/* Feedback Modal */}
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
