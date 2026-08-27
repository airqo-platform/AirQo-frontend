"use client";

import React, { useState } from "react";
import { DiagnosisResult } from "@/types/diagnostics";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Wrench,
  ChevronDown,
  ChevronUp,
  MessageSquarePlus,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

interface DiagnosisCardProps {
  diagnoses: DiagnosisResult[];
  deviceId: string;
  onOpenFeedback?: (diagnosis: DiagnosisResult) => void;
  onCreateTicket?: (diagnosis: DiagnosisResult) => void;
  className?: string;
}

const getCategoryBadgeColor = (category?: string) => {
  switch (category) {
    case "HARDWARE_FAILURE":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "RESOURCE_DEPLETION":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "ENVIRONMENTAL":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "CALIBRATION":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "CONNECTIVITY":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 85) return "text-rose-600 font-bold";
  if (confidence >= 65) return "text-amber-600 font-bold";
  return "text-blue-600 font-semibold";
};

export const DiagnosisCard: React.FC<DiagnosisCardProps> = ({
  diagnoses,
  deviceId,
  onOpenFeedback,
  onCreateTicket,
  className = "",
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!diagnoses || diagnoses.length === 0) {
    return (
      <div className={`p-6 rounded-2xl border border-emerald-200 bg-emerald-50/40 text-center ${className}`}>
        <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
        <h4 className="text-base font-bold text-emerald-900">No Active Root Causes Identified</h4>
        <p className="text-xs text-emerald-700 mt-1 max-w-md mx-auto">
          All subsystem telemetry values are operating inside calibrated nominal boundaries.
        </p>
      </div>
    );
  }

  const handleCopyAction = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast({
      title: "Prescription Copied",
      description: "Recommended technician action copied to clipboard.",
    });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Ranked Root Causes & Prescriptions
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Probabilistic diagnostic inference ordered by confidence with explainable evidential weighting
          </p>
        </div>
        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
          {diagnoses.length} {diagnoses.length === 1 ? "Hypothesis" : "Hypotheses"}
        </span>
      </div>

      <div className="space-y-3">
        {diagnoses.map((diag, index) => {
          const isExpanded = expandedIndex === index;
          const conf = Math.min(100, Math.max(0, diag.confidence_percentage));

          return (
            <div
              key={diag.cause_code || index}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                index === 0
                  ? "border-rose-200 bg-white shadow-sm ring-1 ring-rose-500/10"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {/* Header / Summary Bar */}
              <div
                onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 transition-colors select-none"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      index === 0 ? "bg-rose-100 text-rose-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    #{index + 1}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-gray-900 leading-tight">
                        {diag.title}
                      </h4>
                      {diag.category && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getCategoryBadgeColor(
                            diag.category
                          )}`}
                        >
                          {diag.category.replace(/_/g, " ")}
                        </span>
                      )}
                      {diag.severity && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                            diag.severity === "CRITICAL"
                              ? "bg-red-100 text-red-800 border-red-300"
                              : diag.severity === "HIGH"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {diag.severity}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 font-mono mt-1">
                      Code: {diag.cause_code}
                    </p>
                  </div>
                </div>

                {/* Right side confidence & accordion toggle */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pl-9 md:pl-0">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500 font-medium">Confidence:</span>
                      <span className={`text-base ${getConfidenceColor(conf)}`}>
                        {conf.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-28 bg-gray-100 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          conf >= 85 ? "bg-rose-500" : conf >= 65 ? "bg-amber-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${conf}%` }}
                      />
                    </div>
                  </div>

                  <button
                    className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    aria-label="Toggle details"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Collapsible Detail Section */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-slate-50/40 space-y-4">
                  {/* Prescriptive Action Box */}
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/10 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-primary uppercase tracking-wide">
                          Prescriptive Technician Action
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyAction(diag.recommended_action, index)}
                        className="h-7 text-xs bg-white border-primary/20 text-primary hover:bg-primary/10 gap-1"
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Action</span>
                          </>
                        )}
                      </Button>
                    </div>

                    <p className="text-sm text-foreground font-medium leading-relaxed bg-white/80 p-3 rounded-lg border border-primary/10">
                      &ldquo;{diag.recommended_action}&rdquo;
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {onCreateTicket && (
                        <Button
                          size="sm"
                          onClick={() => onCreateTicket(diag)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 gap-1.5 shadow-xs"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          Create Maintenance Ticket
                        </Button>
                      )}

                      {onOpenFeedback && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onOpenFeedback(diag)}
                          className="bg-white hover:bg-slate-100 text-gray-700 text-xs h-8 border-gray-300 gap-1.5"
                        >
                          <MessageSquarePlus className="w-3.5 h-3.5 text-primary" />
                          Confirm / Refute Diagnosis
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Explainable Evidence Breakdown (+ / -) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Supporting Evidence (+) */}
                    <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                      <div className="flex items-center justify-between pb-1 border-b border-emerald-200/60">
                        <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Supporting Evidence Facts
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                          (+) Contribution
                        </span>
                      </div>

                      {diag.supporting_evidence && diag.supporting_evidence.length > 0 ? (
                        <ul className="space-y-1.5 text-xs">
                          {diag.supporting_evidence.map((item, i) => (
                            <li
                              key={i}
                              className="flex items-start justify-between gap-2 p-1.5 rounded-md bg-white/70 border border-emerald-100 text-gray-800"
                            >
                              <span className="text-xs text-gray-700 leading-snug">
                                {item.evidence}
                              </span>
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 shrink-0">
                                <TrendingUp className="w-3 h-3 text-emerald-600" />
                                +{Math.abs(item.contribution).toFixed(1)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-500 italic py-1">
                          No direct positive evidence items listed.
                        </p>
                      )}
                    </div>

                    {/* Refuting Evidence (-) */}
                    <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 space-y-2">
                      <div className="flex items-center justify-between pb-1 border-b border-rose-200/60">
                        <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          Refuting Evidence Facts (Ruled Out)
                        </span>
                        <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                          (-) Contribution
                        </span>
                      </div>

                      {diag.refuting_evidence && diag.refuting_evidence.length > 0 ? (
                        <ul className="space-y-1.5 text-xs">
                          {diag.refuting_evidence.map((item, i) => (
                            <li
                              key={i}
                              className="flex items-start justify-between gap-2 p-1.5 rounded-md bg-white/70 border border-rose-100 text-gray-800"
                            >
                              <span className="text-xs text-gray-700 leading-snug">
                                {item.evidence}
                              </span>
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-100 text-rose-800 shrink-0">
                                <TrendingDown className="w-3 h-3 text-rose-600" />
                                -{Math.abs(item.contribution).toFixed(1)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-500 italic py-1">
                          No contradictory/refuting evidence found for this cause.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
