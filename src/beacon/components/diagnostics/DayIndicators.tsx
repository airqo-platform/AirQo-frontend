"use client";

import React from "react";
import { BatteryCharging, GitCompare, Radio, Sun } from "lucide-react";
import {
  AgreementIndicator,
  ChargeCycleIndicator,
  CoverageIndicator,
  DeviceIndicators,
  GenerationIndicator,
  OutageWindow,
} from "@/types/diagnostics";

const n = (value: unknown, digits = 2): string =>
  typeof value === "number" && Number.isFinite(value) ? String(+value.toFixed(digits)) : "—";

const pct = (value: unknown): string => (typeof value === "number" ? `${(value * 100).toFixed(0)}%` : "—");

const utcTime = (iso?: string | null): string => {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : `${date.toISOString().slice(11, 16)} UTC`;
};

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-3 py-1 border-b border-gray-100 last:border-0">
    <span className="text-gray-500">{label}</span>
    <span className="font-semibold text-gray-900 text-right">{value}</span>
  </div>
);

const Block: React.FC<{ icon: React.ElementType; title: string; children: React.ReactNode }> = ({
  icon: Icon,
  title,
  children,
}) => (
  <div className="p-3 rounded-xl border border-gray-200 bg-white text-xs">
    <h5 className="font-bold text-gray-900 flex items-center gap-1.5 mb-1.5">
      <Icon className="w-3.5 h-3.5 text-blue-600" />
      {title}
    </h5>
    {children}
  </div>
);

const outageCause = (outage: OutageWindow) =>
  outage.after_low_charge === true ? (
    <span className="px-1.5 py-0.5 rounded border bg-amber-50 text-amber-800 border-amber-200 font-semibold">Low charge before</span>
  ) : outage.after_low_charge === false ? (
    <span className="px-1.5 py-0.5 rounded border bg-blue-50 text-blue-800 border-blue-200 font-semibold">Charge was healthy</span>
  ) : (
    <span className="px-1.5 py-0.5 rounded border bg-slate-50 text-slate-600 border-slate-200 font-semibold">Unknown</span>
  );

interface DayIndicatorsProps {
  indicators?: DeviceIndicators | null;
  className?: string;
}

/** One evaluation's indicators: charge cycle, generation, coverage with its outages, and sensor agreement. */
export const DayIndicators: React.FC<DayIndicatorsProps> = ({ indicators, className = "" }) => {
  const blocks: React.ReactNode[] = [];

  Object.entries(indicators || {}).forEach(([component, groups]) => {
    Object.entries(groups || {}).forEach(([group, values]) => {
      const key = `${component}:${group}`;

      if (group === "charge_cycle") {
        const v = values as ChargeCycleIndicator;
        const unit = v.unit ? ` ${v.unit}` : "";
        blocks.push(
          <Block key={key} icon={BatteryCharging} title={`${component} · charge cycle`}>
            <Row label="Minimum" value={`${n(v.min)}${unit} at ${utcTime(v.min_at)}`} />
            <Row label="Maximum" value={`${n(v.max)}${unit} at ${utcTime(v.max_at)}`} />
            <Row label="Swing / net change" value={`${n(v.swing)}${unit} / ${n(v.net_change)}${unit}`} />
            <Row label="Charging / discharging / flat" value={`${n(v.hours_charging, 1)} / ${n(v.hours_discharging, 1)} / ${n(v.hours_flat, 1)} h`} />
            <Row label="Longest discharge" value={`${n(v.longest_discharge_hours, 1)} h`} />
            <Row label="Discharge rate (typical / max)" value={`${n(v.discharge_rate_per_hour, 3)} / ${n(v.max_discharge_rate_per_hour, 3)}${unit}/h`} />
            <Row label={`Low charge (< ${n(v.low_charge_threshold)}${unit})`} value={`${n(v.hours_low_charge, 1)} h`} />
            <Row label="Below expected minimum" value={`${n(v.hours_below_min, 1)} h`} />
          </Block>
        );
      } else if (group === "generation") {
        const v = values as GenerationIndicator;
        const unit = v.unit ? ` ${v.unit}` : "";
        blocks.push(
          <Block key={key} icon={Sun} title={`${component} · generation`}>
            <Row label="Peak" value={`${n(v.peak)}${unit} at ${utcTime(v.peak_at)}`} />
            <Row label="Average" value={`${n(v.mean)}${unit}`} />
            <Row label="Hours active" value={`${n(v.hours_active, 1)} h`} />
          </Block>
        );
      } else if (group === "coverage") {
        const v = values as CoverageIndicator;
        const outages = v.outages || [];
        blocks.push(
          <Block key={key} icon={Radio} title={`${component} · data coverage`}>
            <Row label="Records" value={`${v.records}${v.expected_records ? ` of ~${v.expected_records}` : ""} (${pct(v.missing_rate)} missing)`} />
            <Row label="Hours with data / complete" value={`${v.hours_with_data ?? "—"} / ${v.hours_complete ?? "—"} of ${v.hours_total ?? "—"}`} />
            <Row label="Partial payloads" value={pct(v.partial_record_rate)} />
            <Row label="Offline" value={`${n(v.offline_hours, 1)} h in ${v.outage_count ?? 0} outage${v.outage_count === 1 ? "" : "s"}`} />
            {outages.length > 0 && (
              <ul className="mt-2 space-y-1">
                {outages.map((outage, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-mono text-gray-700">
                      {utcTime(outage.start)} → {utcTime(outage.end)} ({n(outage.hours, 1)} h)
                    </span>
                    {outageCause(outage)}
                  </li>
                ))}
              </ul>
            )}
          </Block>
        );
      } else if (group.startsWith("agreement:")) {
        const v = values as AgreementIndicator;
        const other = v.with || group.split(":", 2)[1];
        blocks.push(
          <Block key={key} icon={GitCompare} title={`${component} vs ${other}`}>
            <Row label="Paired readings" value={v.paired_count} />
            <Row label="Correlation" value={n(v.correlation)} />
            <Row label="Mean / p95 error" value={`${n(v.mean_abs_error)} / ${n(v.p95_abs_error)}`} />
            <Row
              label="Bias"
              value={`${n(v.bias)}${typeof v.bias === "number" && v.bias !== 0 ? ` (${v.bias > 0 ? component : other} reads higher)` : ""}`}
            />
            <Row label="Relative error" value={pct(v.relative_error)} />
            <Row
              label="Within tolerance"
              value={v.within_tolerance_rate === null || v.within_tolerance_rate === undefined ? "No tolerance set" : pct(v.within_tolerance_rate)}
            />
          </Block>
        );
      }
    });
  });

  if (blocks.length === 0) return null;
  return <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${className}`}>{blocks}</div>;
};
