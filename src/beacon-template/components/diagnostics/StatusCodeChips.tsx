"use client";

import React from "react";
import type { DecodedStatus, StatusCodeKind, StatusDecodeResult } from "@/types/diagnostics";
import { toStatusIssues, type StatusIssue } from "@/lib/status-codes";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const STATUS_KIND_STYLES: Record<StatusCodeKind | "unknown", string> = {
  fault: "bg-rose-50 text-rose-700 border-rose-200",
  unknown: "bg-amber-50 text-amber-700 border-amber-200",
  info: "bg-slate-50 text-slate-600 border-slate-200",
  ok: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export const STATUS_KIND_LABELS: Record<StatusCodeKind | "unknown", string> = {
  fault: "Fault",
  unknown: "Unknown",
  info: "Info",
  ok: "OK",
};

const DECODED_STATUS_STYLES: Record<DecodedStatus, string> = {
  ...STATUS_KIND_STYLES,
  invalid: "bg-gray-50 text-gray-500 border-gray-200",
};

/** A decoded value's overall status: its most serious part (fault > unknown > info > ok), or invalid. */
export const DecodedStatusBadge: React.FC<{ status: DecodedStatus; className?: string }> = ({ status, className = "" }) => (
  <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${DECODED_STATUS_STYLES[status]} ${className}`}>
    {status}
  </span>
);

/** One decoded status code, coloured by kind, with its description on hover unless `tooltip` is off. */
export const StatusCodeChip: React.FC<{ issue: StatusIssue; tooltip?: boolean; className?: string }> = ({
  issue,
  tooltip = true,
  className = "",
}) => {
  const chip = (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded border whitespace-nowrap ${STATUS_KIND_STYLES[issue.kind]} ${className}`}
    >
      <span className="font-mono opacity-70">{issue.code}</span>
      {issue.label}
    </span>
  );
  if (!tooltip || !issue.description) return chip;
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>{chip}</TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs">{issue.description}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/** Every part of a decoded value as chips, including OK codes and undefined parts. */
export const DecodedStatusChips: React.FC<{ result: StatusDecodeResult; setName: string }> = ({ result, setName }) => {
  if (result.status === "invalid") {
    return <span className="text-xs text-muted-foreground italic">Not a status value (must be a whole number of 0 or more)</span>;
  }
  const issues = toStatusIssues(result, setName, true);
  if (issues.length === 0) {
    return <span className="text-xs text-muted-foreground italic">No codes defined for this value</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {issues.map((issue) => (
        <StatusCodeChip key={`${issue.kind}-${issue.code}`} issue={issue} />
      ))}
    </div>
  );
};
