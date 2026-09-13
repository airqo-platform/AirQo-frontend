"use client";

import React, { useState } from "react";
import { EvidenceFact } from "@/types/diagnostics";
import { AlertCircle, Tag, Layers, GitBranch } from "lucide-react";
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
import {
  SEVERITY_STYLES,
  SeverityBadge,
  checkTypeLabel,
  formatFactValue,
} from "@/components/diagnostics/DiagnosticBadges";

interface EvidenceFactBadgeProps {
  facts: EvidenceFact[];
  symptoms?: string[];
  className?: string;
}

const factLocation = (fact: EvidenceFact): string =>
  fact.metric ? `${fact.component_name}.${fact.metric}` : fact.component_name;

export const EvidenceFactBadge: React.FC<EvidenceFactBadgeProps> = ({
  facts,
  symptoms = [],
  className = "",
}) => {
  const [selectedFact, setSelectedFact] = useState<EvidenceFact | null>(null);

  if (facts.length === 0 && symptoms.length === 0) {
    return (
      <div className="text-xs text-gray-400 italic py-2">
        No findings in this evaluation window. Every evaluated metric stayed within its profile limits.
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
              Findings ({facts.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {facts.map((fact, idx) => {
                const tone = SEVERITY_STYLES[fact.severity || "LOW"] || SEVERITY_STYLES.LOW;
                return (
                  <Tooltip key={`${fact.code}-${idx}`}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setSelectedFact(fact)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all shadow-2xs cursor-pointer hover:brightness-95 ${tone}`}
                      >
                        <span className="font-semibold">{fact.title || checkTypeLabel(fact.check)}</span>
                        <span className="font-mono text-[10px] opacity-80">{factLocation(fact)}</span>
                        <span className="font-bold ml-1 px-1.5 rounded bg-white/80 border text-[11px]">
                          {(fact.confidence * 100).toFixed(0)}%
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs p-2.5 bg-gray-900 text-white border-0 shadow-lg">
                      <div className="font-bold text-slate-200 mb-1">
                        {fact.component_name}
                        {fact.component_type && <span className="font-normal text-slate-400"> · {fact.component_type}</span>}
                      </div>
                      <p className="text-slate-300">{fact.description}</p>
                      {fact.value !== undefined && fact.value !== null && (
                        <div className="mt-1 text-[11px] font-mono text-emerald-400">
                          Value: {formatFactValue(fact.value)}
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
                {selectedFact?.title || "Finding Details"}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 font-mono break-all">
                {selectedFact?.code}
              </DialogDescription>
            </DialogHeader>

            {selectedFact && (
              <div className="space-y-3 text-sm py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-xs text-gray-500 font-medium">Component</div>
                    <div className="font-semibold text-gray-900 break-all">{selectedFact.component_name}</div>
                    {selectedFact.component_type && (
                      <div className="text-[11px] text-gray-500">{selectedFact.component_type}</div>
                    )}
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-xs text-gray-500 font-medium">Check</div>
                    <div className="font-semibold text-gray-900">{checkTypeLabel(selectedFact.check)}</div>
                    {selectedFact.metric && (
                      <div className="text-[11px] font-mono text-gray-500 break-all">{selectedFact.metric}</div>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="text-xs text-gray-500 font-medium">Description</div>
                  <div className="text-gray-800 leading-relaxed text-xs">{selectedFact.description}</div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-xs text-gray-500 font-medium">Severity</div>
                    <div className="mt-1">
                      <SeverityBadge severity={selectedFact.severity} />
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-xs text-gray-500 font-medium">Confidence</div>
                    <div className="font-bold text-gray-900 mt-0.5">
                      {(selectedFact.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-xs text-gray-500 font-medium">Value</div>
                    <div className="font-mono text-xs font-bold text-blue-700 mt-0.5 break-all">
                      {formatFactValue(selectedFact.value)}
                    </div>
                  </div>
                </div>

                {selectedFact.related_components && selectedFact.related_components.length > 0 && (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <GitBranch className="w-3.5 h-3.5" /> Related Components
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedFact.related_components.map((name) => (
                        <span key={name} className="px-2 py-0.5 rounded-md bg-white border text-[11px] font-mono text-gray-700">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};
