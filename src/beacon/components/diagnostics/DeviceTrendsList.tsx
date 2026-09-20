"use client";

import React from "react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { IndicatorTrend, TrendStatus } from "@/types/diagnostics";
import { formatDiagnosisDate } from "@/components/diagnostics/DiagnosticBadges";

const STATUS_STYLES: Record<TrendStatus, { badge: string; label: string }> = {
  degrading: { badge: "bg-rose-50 text-rose-700 border-rose-200", label: "Degrading" },
  improving: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Improving" },
  stable: { badge: "bg-slate-50 text-slate-600 border-slate-200", label: "Stable" },
};

const num = (value: number) => (Number.isFinite(value) ? +value.toPrecision(4) : "—");

const capitalise = (text: string) => (text ? text[0].toUpperCase() + text.slice(1) : text);

interface DeviceTrendsListProps {
  trends: IndicatorTrend[];
  /** Hide stable trends (e.g. in a compact per-day view). */
  hideStable?: boolean;
  emptyText?: string;
  className?: string;
}

/** Multi-day trends of stored indicators: a device can pass every daily check while sliding towards failure. */
export const DeviceTrendsList: React.FC<DeviceTrendsListProps> = ({
  trends,
  hideStable = false,
  emptyText = "No trends yet. A trend needs several diagnosed days inside the trend window.",
  className = "",
}) => {
  const shown = hideStable ? trends.filter((t) => t.status !== "stable") : trends;

  if (shown.length === 0) {
    return <p className={`text-xs text-gray-400 italic ${className}`}>{emptyText}</p>;
  }

  return (
    <ul className={`divide-y divide-gray-100 ${className}`}>
      {shown.map((trend) => {
        const style = STATUS_STYLES[trend.status] || STATUS_STYLES.stable;
        const Icon = trend.direction === "up" ? TrendingUp : trend.direction === "down" ? TrendingDown : Minus;
        const unit = trend.unit ? ` ${trend.unit}` : "";
        return (
          <li key={`${trend.component}.${trend.group}.${trend.field}`} className="py-2.5 flex items-start justify-between gap-3 text-xs">
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                {trend.status === "degrading" ? trend.title : capitalise(trend.subject)}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                {num(trend.first_value)} → <strong className="text-gray-800">{num(trend.latest)}</strong>
                {unit} over {trend.points} days ({formatDiagnosisDate(trend.first_date, "d MMM")} –{" "}
                {formatDiagnosisDate(trend.last_date, "d MMM")}), {trend.slope_per_day > 0 ? "+" : ""}
                {num(trend.slope_per_day)}
                {unit}/day
              </div>
              {trend.days_to_limit !== null && trend.days_to_limit !== undefined && (
                <div className="text-[11px] font-semibold text-rose-700 mt-0.5">
                  At this rate it reaches the {num(trend.limit as number)}
                  {unit} limit in about {num(trend.days_to_limit)} days
                </div>
              )}
              <div className="text-[10px] font-mono text-gray-400 mt-0.5">{trend.component}</div>
            </div>
            <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${style.badge}`}>
              {style.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
};
