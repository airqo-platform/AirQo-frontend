"use client";

import React, { useState } from "react";
import { EvidenceFact } from "@/types/diagnostics";
import { CheckCircle2, XCircle, AlertCircle, Info, Tag, Layers } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface EvidenceFactBadgeProps {
  facts: EvidenceFact[];
  symptoms?: string[];
  className?: string;
}

export const EvidenceFactBadge: React.FC<EvidenceFactBadgeProps> = ({
  facts,
  symptoms = [],
  className = "",
}) => {
  const [selectedFact, setSelectedFact] = useState<EvidenceFact | null>(null);

  if (facts.length === 0 && symptoms.length === 0) {
    return (
      <div className="text-xs text-gray-400 italic py-2">
        No anomalous symptoms or evidence facts detected in this evaluation window.
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className={`space-y-3 ${className}`}>
        {/* Detected Symptoms */}
        {symptoms.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              Detected Symptoms ({symptoms.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {symptoms.map((sym, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs"
                >
                  <Tag className="w-3 h-3 text-amber-600" />
                  {sym}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Active Evidences */}
        {facts.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              Active Evidential Facts ({facts.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {facts.map((fact, idx) => {
                const isSupporting = fact.polarity === "SUPPORTING";
                const isRefuting = fact.polarity === "REFUTING";

                const badgeBg = isSupporting
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100/70"
                  : isRefuting
                  ? "bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100/70"
                  : "bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100";

                const Icon = isSupporting ? CheckCircle2 : isRefuting ? XCircle : Info;

                return (
                  <Tooltip key={idx}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setSelectedFact(fact)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-all shadow-2xs cursor-pointer ${badgeBg}`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{fact.code}</span>
                        <span className="font-bold ml-1 px-1.5 py-0.2 rounded bg-white/80 border text-[11px]">
                          {(fact.confidence * 100).toFixed(0)}%
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs p-2.5 bg-gray-900 text-white border-0 shadow-lg">
                      <div className="font-bold text-slate-200 mb-1">{fact.component_name}</div>
                      <p className="text-slate-300">{fact.description}</p>
                      {fact.value !== undefined && (
                        <div className="mt-1 text-[11px] font-mono text-emerald-400">
                          Extracted Value: {String(fact.value)}
                        </div>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal on Click */}
        <Dialog open={!!selectedFact} onOpenChange={(open) => !open && setSelectedFact(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                Evidence Fact Details
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 font-mono">
                {selectedFact?.code}
              </DialogDescription>
            </DialogHeader>

            {selectedFact && (
              <div className="space-y-3 text-sm py-2">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="text-xs text-gray-500 font-medium">Subsystem Component</div>
                  <div className="font-semibold text-gray-900">{selectedFact.component_name}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="text-xs text-gray-500 font-medium">Fact Description & Rationale</div>
                  <div className="text-gray-800 leading-relaxed text-xs">{selectedFact.description}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-xs text-gray-500 font-medium">Confidence</div>
                    <div className="font-bold text-gray-900 mt-0.5">
                      {(selectedFact.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-xs text-gray-500 font-medium">Extracted Value</div>
                    <div className="font-mono text-xs font-bold text-blue-700 mt-0.5">
                      {String(selectedFact.value || "N/A")}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};
