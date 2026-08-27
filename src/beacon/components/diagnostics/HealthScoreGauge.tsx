"use client";

import React from "react";
import { LifecycleState } from "@/types/diagnostics";
import { RefreshCw, Clock, CheckCircle2, AlertTriangle, AlertOctagon, XCircle, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HealthScoreGaugeProps {
  score: number;
  state: LifecycleState;
  evaluatedWindowHours?: number;
  lastEvaluated?: string;
  onReevaluate?: () => void;
  isEvaluating?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const getLifecycleConfig = (state: LifecycleState) => {
  switch (state) {
    case "HEALTHY":
      return {
        label: "HEALTHY",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-300 ring-emerald-600/20",
        strokeColor: "#10b981", // emerald-500
        gradientFrom: "#10b981",
        gradientTo: "#059669",
        textColor: "text-emerald-600",
        bgLight: "bg-emerald-50/60",
        icon: CheckCircle2,
        description: "Optimal operation. All subsystems conform to baseline envelope.",
      };
    case "DEGRADING":
      return {
        label: "DEGRADING",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-300 ring-amber-600/20",
        strokeColor: "#f59e0b", // amber-500
        gradientFrom: "#f59e0b",
        gradientTo: "#d97706",
        textColor: "text-amber-600",
        bgLight: "bg-amber-50/60",
        icon: AlertTriangle,
        description: "Early wear / baseline drift detected. Monitor closely.",
      };
    case "SUSPICIOUS":
      return {
        label: "SUSPICIOUS",
        badgeClass: "bg-orange-50 text-orange-700 border-orange-300 ring-orange-600/20",
        strokeColor: "#f97316", // orange-500
        gradientFrom: "#f97316",
        gradientTo: "#ea580c",
        textColor: "text-orange-600",
        bgLight: "bg-orange-50/60",
        icon: ShieldAlert,
        description: "Multiple anomalous symptoms or moderate-confidence diagnosis active.",
      };
    case "LIKELY_FAILURE":
      return {
        label: "LIKELY FAILURE",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-300 ring-rose-600/20",
        strokeColor: "#e11d48", // rose-600
        gradientFrom: "#e11d48",
        gradientTo: "#be123c",
        textColor: "text-rose-600",
        bgLight: "bg-rose-50/60",
        icon: AlertOctagon,
        description: "High-confidence root cause identified. Remediation required.",
      };
    case "FAILED":
      return {
        label: "FAILED",
        badgeClass: "bg-red-100 text-red-900 border-red-300 ring-red-700/20",
        strokeColor: "#b91c1c", // red-700
        gradientFrom: "#b91c1c",
        gradientTo: "#7f1d1d",
        textColor: "text-red-700",
        bgLight: "bg-red-50/80",
        icon: XCircle,
        description: "Critical hardware breakdown or total telemetry outage.",
      };
    case "RECOVERING":
      return {
        label: "RECOVERING",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-300 ring-blue-600/20",
        strokeColor: "#3b82f6", // blue-500
        gradientFrom: "#3b82f6",
        gradientTo: "#2563eb",
        textColor: "text-blue-600",
        bgLight: "bg-blue-50/60",
        icon: Sparkles,
        description: "Post-maintenance recovery period. Verifying baseline stability.",
      };
    default:
      return {
        label: "UNKNOWN",
        badgeClass: "bg-gray-50 text-gray-700 border-gray-300",
        strokeColor: "#6b7280",
        gradientFrom: "#6b7280",
        gradientTo: "#4b5563",
        textColor: "text-gray-600",
        bgLight: "bg-gray-50",
        icon: AlertTriangle,
        description: "Status pending evaluation.",
      };
  }
};

export const HealthScoreGauge: React.FC<HealthScoreGaugeProps> = ({
  score,
  state,
  evaluatedWindowHours = 24,
  lastEvaluated,
  onReevaluate,
  isEvaluating = false,
  size = "lg",
  className = "",
}) => {
  const cfg = getLifecycleConfig(state);
  const Icon = cfg.icon;

  // Gauge dimensions
  const dim = size === "lg" ? 170 : size === "md" ? 120 : 80;
  const strokeWidth = size === "lg" ? 14 : size === "md" ? 10 : 7;
  const radius = (dim - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className={`flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl border bg-white shadow-sm transition-all duration-200 ${className}`}>
      {/* Left / Center Radial Gauge */}
      <div className="flex items-center gap-6">
        <div className="relative flex items-center justify-center" style={{ width: dim, height: dim }}>
          <svg className="transform -rotate-90" width={dim} height={dim}>
            <defs>
              <linearGradient id={`gauge-grad-${state}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={cfg.gradientFrom} />
                <stop offset="100%" stopColor={cfg.gradientTo} />
              </linearGradient>
            </defs>
            {/* Background Track */}
            <circle
              cx={dim / 2}
              cy={dim / 2}
              r={radius}
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Value Progress Arc */}
            <circle
              cx={dim / 2}
              cy={dim / 2}
              r={radius}
              stroke={`url(#gauge-grad-${state})`}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          {/* Inner Score Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
            <span className={`font-bold tracking-tight ${size === "lg" ? "text-4xl" : size === "md" ? "text-2xl" : "text-lg"} ${cfg.textColor}`}>
              {clampedScore}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              / 100
            </span>
          </div>
        </div>

        {/* State Information */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ring-1 ${cfg.badgeClass}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cfg.label}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
              <Clock className="w-3 h-3 text-slate-400" />
              Window: {evaluatedWindowHours}h
            </span>
          </div>

          <h3 className="text-xl font-bold text-gray-900 tracking-tight">
            Overall Health Score
          </h3>
          <p className="text-xs text-gray-500 max-w-md leading-relaxed">
            {cfg.description}
          </p>
          {lastEvaluated && (
            <p className="text-[11px] text-gray-400">
              Last evaluated: <span className="font-medium text-gray-600">{lastEvaluated}</span>
            </p>
          )}
        </div>
      </div>

      {/* Action / Trigger Area */}
      {onReevaluate && (
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <Button
            onClick={onReevaluate}
            disabled={isEvaluating}
            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-all flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg"
          >
            <RefreshCw className={`w-4 h-4 ${isEvaluating ? "animate-spin" : ""}`} />
            {isEvaluating ? "Evaluating Engine..." : "Re-evaluate Now"}
          </Button>
        </div>
      )}
    </div>
  );
};
