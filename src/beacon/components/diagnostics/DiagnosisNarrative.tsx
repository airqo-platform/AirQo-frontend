"use client";

import React from "react";
import { FileText } from "lucide-react";

interface DiagnosisNarrativeProps {
  headline?: string | null;
  summary?: string | null;
  className?: string;
}

/** The engine's plain-language headline and summary. Built from stored numbers by fixed templates, not an LLM. */
export const DiagnosisNarrative: React.FC<DiagnosisNarrativeProps> = ({ headline, summary, className = "" }) => {
  if (!headline && !summary) return null;
  const paragraphs = (summary || "")
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className={`p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2 ${className}`}>
      {headline && (
        <h4 className="text-sm font-bold text-gray-900 flex items-start gap-2">
          <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          {headline}
        </h4>
      )}
      {paragraphs.map((paragraph, i) => (
        <p key={i} className="text-xs text-gray-700 leading-relaxed">
          {paragraph}
        </p>
      ))}
    </div>
  );
};
