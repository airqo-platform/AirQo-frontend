"use client";

import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { History } from "lucide-react";
import { DeviceDailyDiagnosticSummary, HealthTrendPoint } from "@/types/diagnostics";
import { formatDiagnosisDate } from "@/components/diagnostics/DiagnosticBadges";

const COMPONENT_COLORS = ["#f59e0b", "#9333ea", "#059669", "#e11d48", "#0891b2", "#64748b"];
const MAX_COMPONENT_SERIES = COMPONENT_COLORS.length;

interface DailyHealthTrendChartProps {
  trend: HealthTrendPoint[];
  /** When given, per-component scores (keyed by profile component name) can be overlaid. */
  dailyDiagnostics?: DeviceDailyDiagnosticSummary[];
  onSelectDate?: (diagnosisDate: string) => void;
  className?: string;
}

export const DailyHealthTrendChart: React.FC<DailyHealthTrendChartProps> = ({
  trend,
  dailyDiagnostics = [],
  onSelectDate,
  className = "",
}) => {
  const [showComponents, setShowComponents] = useState<boolean>(false);

  // Components with the lowest average score first, so the most relevant ones are plotted.
  const componentNames = useMemo(() => {
    const totals: Record<string, { sum: number; count: number }> = {};
    dailyDiagnostics.forEach((d) =>
      Object.entries(d.subsystem_scores || {}).forEach(([name, score]) => {
        totals[name] = totals[name] || { sum: 0, count: 0 };
        totals[name].sum += score;
        totals[name].count += 1;
      })
    );
    return Object.entries(totals)
      .sort(([, a], [, b]) => a.sum / a.count - b.sum / b.count)
      .slice(0, MAX_COMPONENT_SERIES)
      .map(([name]) => name);
  }, [dailyDiagnostics]);

  const data = useMemo(() => {
    const scoresByDate = new Map(dailyDiagnostics.map((d) => [d.diagnosis_date, d.subsystem_scores || {}]));
    return [...trend]
      .sort((a, b) => a.diagnosis_date.localeCompare(b.diagnosis_date))
      .map((point) => {
        const row: Record<string, any> = {
          ...point,
          label: formatDiagnosisDate(point.diagnosis_date, "d MMM"),
        };
        const componentScores = scoresByDate.get(point.diagnosis_date) || {};
        componentNames.forEach((name) => {
          row[`component:${name}`] = componentScores[name];
        });
        return row;
      });
  }, [trend, dailyDiagnostics, componentNames]);

  if (data.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-10 px-4 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 ${className}`}>
        <History className="w-8 h-8 text-slate-400 mb-2" />
        <p className="text-sm font-semibold text-gray-700">No Daily Diagnoses Yet</p>
        <p className="text-xs text-gray-500 mt-1 max-w-sm">
          Daily diagnoses are produced after the nightly data sync for every completed day with readings.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <span>
          {data.length} day{data.length === 1 ? "" : "s"} diagnosed
          {onSelectDate && <span className="text-gray-400"> · click a day to inspect it</span>}
        </span>
        {componentNames.length > 0 && (
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showComponents}
              onChange={(e) => setShowComponents(e.target.checked)}
              className="accent-primary"
            />
            Show component scores
          </label>
        )}
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            onClick={(state: any) => {
              const date = state?.activePayload?.[0]?.payload?.diagnosis_date;
              if (date && onSelectDate) onSelectDate(date);
            }}
            style={onSelectDate ? { cursor: "pointer" } : undefined}
          >
            <defs>
              <linearGradient id="dailyHealthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#64748b" }} stroke="#cbd5e1" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} stroke="#cbd5e1" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                borderRadius: "8px",
                border: "none",
                color: "#fff",
                fontSize: "12px",
              }}
              formatter={(value: any, name: any) => [typeof value === "number" ? value.toFixed(1) : value, name]}
              labelFormatter={(_label: any, payload: any) => {
                const p = payload?.[0]?.payload;
                return p ? `${formatDiagnosisDate(p.diagnosis_date)} · ${p.lifecycle_state} · ${p.issue_count} issues` : "";
              }}
            />
            {showComponents && <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />}
            {/* Default lifecycle bands; profiles may override them */}
            <ReferenceLine y={85} stroke="#10b981" strokeDasharray="3 3" />
            <ReferenceLine y={50} stroke="#f97316" strokeDasharray="3 3" />
            <ReferenceLine y={20} stroke="#e11d48" strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="overall_health_score"
              name="Overall"
              stroke="#2563eb"
              strokeWidth={2.5}
              fill="url(#dailyHealthGrad)"
              dot={{ r: 2.5 }}
              activeDot={{ r: 5 }}
            />
            {showComponents &&
              componentNames.map((name, i) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={`component:${name}`}
                  name={name}
                  stroke={COMPONENT_COLORS[i % COMPONENT_COLORS.length]}
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls
                />
              ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
