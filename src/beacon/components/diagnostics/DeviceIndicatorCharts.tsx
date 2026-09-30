"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { BatteryCharging, GitCompare, Radio, Sun } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AgreementIndicator,
  ChargeCycleIndicator,
  CoverageIndicator,
  DeviceIndicatorSeries,
  GenerationIndicator,
  IndicatorSeriesPoint,
} from "@/types/diagnostics";
import { formatDiagnosisDate } from "@/components/diagnostics/DiagnosticBadges";

// Categorical slots in fixed order (blue, orange, aqua); reference lines use status colors.
const SERIES = ["#2a78d6", "#eb6834", "#1baf7a"];
const LIMIT_COLOR = "#e11d48";
const WARNING_COLOR = "#f59e0b";

const TOOLTIP_STYLE = {
  backgroundColor: "rgba(15, 23, 42, 0.95)",
  borderRadius: "8px",
  border: "none",
  color: "#fff",
  fontSize: "12px",
};

type Point = Record<string, any> & { diagnosis_date: string; label: string };

const withLabels = <T,>(points: IndicatorSeriesPoint<T>[] | undefined): Point[] =>
  (points || []).map((p) => ({ ...(p as any), label: formatDiagnosisDate(p.diagnosis_date, "d MMM") }));

const latestOf = (points: Point[]) => (points.length > 0 ? points[points.length - 1] : undefined);

const sum = (points: Point[], field: string) =>
  points.reduce((total, p) => total + (typeof p[field] === "number" ? p[field] : 0), 0);

const fmt = (value: unknown, digits = 2) =>
  typeof value === "number" && Number.isFinite(value) ? +value.toFixed(digits) : "—";

interface SeriesDef {
  key: string;
  name: string;
  kind: "line" | "bar" | "band";
  color: string;
  stackId?: string;
}

interface RefLine {
  y: number;
  label: string;
  color: string;
}

/** One measure per chart (never two y-scales): several small charts instead of a dual axis. */
const MiniChart: React.FC<{
  title: string;
  data: Point[];
  series: SeriesDef[];
  unit?: string;
  domain?: [number | string, number | string];
  refLines?: RefLine[];
  onSelectDate?: (date: string) => void;
}> = ({ title, data, series, unit = "", domain, refLines = [], onSelectDate }) => (
  <div className="space-y-1">
    <div className="text-[11px] font-semibold text-gray-600">{title}</div>
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 12, left: -14, bottom: 0 }}
          onClick={(state: any) => {
            const date = state?.activePayload?.[0]?.payload?.diagnosis_date;
            if (date && onSelectDate) onSelectDate(date);
          }}
          style={onSelectDate ? { cursor: "pointer" } : undefined}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#64748b" }} stroke="#cbd5e1" minTickGap={16} />
          <YAxis domain={domain || ["auto", "auto"]} tick={{ fontSize: 10, fill: "#64748b" }} stroke="#cbd5e1" />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelFormatter={(_l: any, payload: any) => formatDiagnosisDate(payload?.[0]?.payload?.diagnosis_date)}
            formatter={(value: any, name: any) => [
              Array.isArray(value) ? `${fmt(value[0])} – ${fmt(value[1])}${unit}` : `${fmt(value)}${unit}`,
              name,
            ]}
          />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }} iconSize={8} />}
          {refLines.map((ref) => (
            <ReferenceLine
              key={ref.label}
              y={ref.y}
              stroke={ref.color}
              strokeDasharray="4 3"
              label={{ value: ref.label, fill: ref.color, fontSize: 10, position: "insideTopRight" }}
            />
          ))}
          {series.map((s) =>
            s.kind === "band" ? (
              <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke="none" fill={s.color} fillOpacity={0.18} connectNulls />
            ) : s.kind === "bar" ? (
              <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} stackId={s.stackId} radius={s.stackId ? 0 : [4, 4, 0, 0]} maxBarSize={18} />
            ) : (
              <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} connectNulls />
            )
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const Stat: React.FC<{ label: string; value: React.ReactNode; hint?: string }> = ({ label, value, hint }) => (
  <div className="p-2.5 rounded-lg border border-gray-200 bg-slate-50/60">
    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{label}</div>
    <div className="text-base font-bold text-gray-900 mt-0.5">{value}</div>
    {hint && <div className="text-[10px] text-gray-500">{hint}</div>}
  </div>
);

const IndicatorCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ icon: Icon, title, description, children }) => (
  <Card className="border border-gray-200 shadow-sm">
    <CardHeader className="pb-2 border-b border-gray-100">
      <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-600" />
        {title}
      </CardTitle>
      <CardDescription className="text-xs">{description}</CardDescription>
    </CardHeader>
    <CardContent className="pt-4 space-y-4">{children}</CardContent>
  </Card>
);

interface DeviceIndicatorChartsProps {
  series: DeviceIndicatorSeries;
  onSelectDate?: (diagnosisDate: string) => void;
}

/** Daily indicator charts per component: charge cycle, generation, coverage and sensor agreement. */
export const DeviceIndicatorCharts: React.FC<DeviceIndicatorChartsProps> = ({ series, onSelectDate }) => {
  const cards = useMemo(() => {
    const out: React.ReactNode[] = [];

    Object.entries(series.components || {}).forEach(([component, groups]) => {
      Object.entries(groups).forEach(([group, rawPoints]) => {
        const key = `${component}:${group}`;

        if (group === "charge_cycle") {
          const points = withLabels<ChargeCycleIndicator>(rawPoints).map((p) => ({ ...p, range: [p.min, p.max] }));
          const latest = latestOf(points);
          const unit = latest?.unit ? ` ${latest.unit}` : "";
          const refLines: RefLine[] = [];
          if (typeof latest?.low_charge_threshold === "number") {
            refLines.push({ y: latest.low_charge_threshold, label: "Low charge", color: WARNING_COLOR });
          }
          if (typeof latest?.expected_min === "number") {
            refLines.push({ y: latest.expected_min, label: "Minimum", color: LIMIT_COLOR });
          }
          out.push(
            <IndicatorCard
              key={key}
              icon={BatteryCharging}
              title={`${component} · charge cycle`}
              description={`Daily range and charging behaviour of ${latest?.metric || "the charge level"}`}
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Stat label="Latest minimum" value={`${fmt(latest?.min)}${unit}`} hint={latest?.min_at ? `at ${new Date(latest.min_at).toISOString().slice(11, 16)} UTC` : undefined} />
                <Stat label="Latest swing" value={`${fmt(latest?.swing)}${unit}`} />
                <Stat label="Low charge (latest)" value={`${fmt(latest?.hours_low_charge, 1)} h`} />
                <Stat label="Below minimum (period)" value={`${fmt(sum(points, "hours_below_min"), 1)} h`} />
              </div>
              <MiniChart
                title={`Daily range and average${unit ? ` (${unit.trim()})` : ""}`}
                data={points}
                unit={unit}
                refLines={refLines}
                onSelectDate={onSelectDate}
                series={[
                  { key: "range", name: "Min – max", kind: "band", color: SERIES[0] },
                  { key: "mean", name: "Average", kind: "line", color: SERIES[0] },
                ]}
              />
              <MiniChart
                title="Hours per day"
                data={points}
                unit=" h"
                domain={[0, 24]}
                onSelectDate={onSelectDate}
                series={[
                  { key: "hours_charging", name: "Charging", kind: "bar", color: SERIES[2], stackId: "h" },
                  { key: "hours_discharging", name: "Discharging", kind: "bar", color: SERIES[1], stackId: "h" },
                  { key: "hours_flat", name: "Flat", kind: "bar", color: "#cbd5e1", stackId: "h" },
                ]}
              />
            </IndicatorCard>
          );
        } else if (group === "generation") {
          const points = withLabels<GenerationIndicator>(rawPoints);
          const latest = latestOf(points);
          const unit = latest?.unit ? ` ${latest.unit}` : "";
          out.push(
            <IndicatorCard key={key} icon={Sun} title={`${component} · generation`} description={`Daily output of ${latest?.metric || "the charge source"}`}>
              <MiniChart title={`Daily peak${unit ? ` (${unit.trim()})` : ""}`} data={points} unit={unit} onSelectDate={onSelectDate}
                series={[{ key: "peak", name: "Peak", kind: "line", color: SERIES[0] }]} />
              <MiniChart title="Hours active per day" data={points} unit=" h" domain={[0, 24]} onSelectDate={onSelectDate}
                series={[{ key: "hours_active", name: "Hours active", kind: "bar", color: SERIES[0] }]} />
            </IndicatorCard>
          );
        } else if (group === "coverage") {
          const points = withLabels<CoverageIndicator>(rawPoints).map((p) => ({
            ...p,
            missing_pct: typeof p.missing_rate === "number" ? p.missing_rate * 100 : null,
          }));
          const lowCharge = sum(points, "outages_after_low_charge");
          const healthyCharge = sum(points, "outages_with_healthy_charge");
          const unattributed = sum(points, "outages_unattributed");
          out.push(
            <IndicatorCard
              key={key}
              icon={Radio}
              title={`${component} · data coverage`}
              description="Offline time and missing readings per day. Outages are attributed to power when the charge level was low just before them."
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Stat label="Offline (period)" value={`${fmt(sum(points, "offline_hours"), 1)} h`} hint={`${sum(points, "outage_count")} outages`} />
                <Stat label="After low charge" value={lowCharge} hint="Power-related" />
                <Stat label="With healthy charge" value={healthyCharge} hint="Link-related" />
                <Stat label="Unattributed" value={unattributed} />
              </div>
              <MiniChart title="Offline hours per day" data={points} unit=" h" domain={[0, 24]} onSelectDate={onSelectDate}
                series={[{ key: "offline_hours", name: "Offline", kind: "bar", color: SERIES[1] }]} />
              <MiniChart title="Missing readings (%)" data={points} unit="%" domain={[0, 100]} onSelectDate={onSelectDate}
                series={[{ key: "missing_pct", name: "Missing", kind: "line", color: SERIES[0] }]} />
            </IndicatorCard>
          );
        } else if (group.startsWith("agreement:")) {
          const other = group.split(":", 2)[1];
          const points = withLabels<AgreementIndicator>(rawPoints).map((p) => ({
            ...p,
            relative_error_pct: typeof p.relative_error === "number" ? p.relative_error * 100 : null,
            within_pct: typeof p.within_tolerance_rate === "number" ? p.within_tolerance_rate * 100 : null,
          }));
          const latest = latestOf(points);
          const hasTolerance = points.some((p) => p.within_pct !== null);
          const bias = latest?.bias;
          const refLines: RefLine[] =
            typeof latest?.tolerance_rel === "number"
              ? [{ y: latest.tolerance_rel * 100, label: "Tolerance", color: WARNING_COLOR }]
              : [];
          out.push(
            <IndicatorCard
              key={key}
              icon={GitCompare}
              title={`${component} vs ${other}`}
              description={`Agreement between ${latest?.metric || component} and ${latest?.other_metric || other}`}
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Stat label="Correlation" value={fmt(latest?.correlation)} />
                <Stat label="Mean error" value={fmt(latest?.mean_abs_error)} hint={`p95 ${fmt(latest?.p95_abs_error)}`} />
                <Stat
                  label="Bias"
                  value={fmt(bias)}
                  hint={typeof bias === "number" && bias !== 0 ? `${bias > 0 ? component : other} reads higher` : undefined}
                />
                <Stat label="Within tolerance" value={hasTolerance ? `${fmt(latest?.within_pct, 0)}%` : "—"} hint={hasTolerance ? undefined : "No tolerance set on the pair"} />
              </div>
              <MiniChart title="Error relative to the measured level (%)" data={points} unit="%" refLines={refLines} onSelectDate={onSelectDate}
                series={[{ key: "relative_error_pct", name: "Relative error", kind: "line", color: SERIES[0] }]} />
              {hasTolerance && (
                <MiniChart title="Paired readings within tolerance (%)" data={points} unit="%" domain={[0, 100]} onSelectDate={onSelectDate}
                  series={[{ key: "within_pct", name: "Within tolerance", kind: "line", color: SERIES[0] }]} />
              )}
            </IndicatorCard>
          );
        }
      });
    });
    return out;
  }, [series, onSelectDate]);

  if (cards.length === 0) {
    return (
      <div className="py-8 px-4 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
        <p className="text-sm font-semibold text-gray-700">No Indicators Yet</p>
        <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
          Indicators are stored with each daily diagnosis. The charge cycle needs a metric with the charge level role, and
          sensor agreement needs a MEASURES_SAME_AS relationship on the device profile.
        </p>
      </div>
    );
  }

  return <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">{cards}</div>;
};
