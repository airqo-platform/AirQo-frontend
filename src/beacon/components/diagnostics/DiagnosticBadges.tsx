"use client";

import React from "react";
import { format, parseISO } from "date-fns";
import { Flame, Sparkles } from "lucide-react";
import { CHECK_TYPE_LABELS, DiagnosticCheckType, LifecycleState } from "@/types/diagnostics";
import { getLifecycleConfig } from "@/components/diagnostics/HealthScoreGauge";

export const SEVERITY_STYLES: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-800 border-red-300",
  HIGH: "bg-rose-50 text-rose-700 border-rose-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  LOW: "bg-slate-50 text-slate-600 border-slate-200",
};

export const checkTypeLabel = (check?: string | null): string => {
  if (!check) return "Finding";
  return CHECK_TYPE_LABELS[check as DiagnosticCheckType] || check.replace(/_/g, " ").toLowerCase();
};

/** Formats a backend `YYYY-MM-DD` date without shifting it through the viewer's timezone. */
export const formatDiagnosisDate = (value?: string | null, pattern: string = "d MMM yyyy"): string => {
  if (!value) return "—";
  try {
    return format(parseISO(value), pattern);
  } catch {
    return value;
  }
};

export const formatFactValue = (value: unknown): string => {
  if (value === null || value === undefined) return "N/A";
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : value.toFixed(3);
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

export const getScoreToneClass = (score?: number | null): string => {
  if (score === null || score === undefined) return "bg-gray-50 text-gray-600";
  if (score >= 85) return "bg-emerald-50 text-emerald-700";
  if (score >= 70) return "bg-amber-50 text-amber-700";
  if (score >= 50) return "bg-orange-50 text-orange-700";
  return "bg-rose-50 text-rose-700";
};

export const SeverityBadge: React.FC<{ severity?: string | null; className?: string }> = ({
  severity,
  className = "",
}) => {
  if (!severity) return null;
  return (
    <span
      className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${
        SEVERITY_STYLES[severity] || SEVERITY_STYLES.LOW
      } ${className}`}
    >
      {severity}
    </span>
  );
};

export const LifecycleBadge: React.FC<{ state?: LifecycleState | string | null; className?: string }> = ({
  state,
  className = "",
}) => {
  if (!state) return null;
  const cfg = getLifecycleConfig(state as LifecycleState);
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border whitespace-nowrap ${cfg.badgeClass} ${className}`}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
};

/** "New" for an issue first seen that day, otherwise how many consecutive days it has persisted. */
export const StreakBadge: React.FC<{ streakDays: number; isNew?: boolean; className?: string }> = ({
  streakDays,
  isNew = false,
  className = "",
}) => {
  if (isNew || streakDays <= 1) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200 ${className}`}
      >
        <Sparkles className="w-3 h-3" />
        New
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border whitespace-nowrap ${
        streakDays >= 7 ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-orange-50 text-orange-700 border-orange-200"
      } ${className}`}
    >
      <Flame className="w-3 h-3" />
      {streakDays} days
    </span>
  );
};
