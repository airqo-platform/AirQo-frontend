"use client";

import React from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Edit2,
  GitCompare,
  Radio,
  RotateCcw,
  Settings2,
  Stethoscope,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileDiagnosticReadiness } from "@/types/diagnostics";

interface ProfileReadinessPanelProps {
  readiness: ProfileDiagnosticReadiness | null;
  loading: boolean;
  error?: string | null;
  onRetry: () => void;
  /** Current `meta_data.diagnostics` overrides on the profile, if any. */
  policyOverrides?: Record<string, any> | null;
  onEditOverrides?: () => void;
}

const Section: React.FC<{ title: string; icon: React.ElementType; count?: number; children: React.ReactNode }> = ({
  title,
  icon: Icon,
  count,
  children,
}) => (
  <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5 text-primary" />
      {title}
      {count !== undefined && <span className="text-gray-400 font-medium">({count})</span>}
    </h4>
    {children}
  </div>
);

const Empty: React.FC<{ text: string }> = ({ text }) => <p className="text-xs text-gray-400 italic">{text}</p>;

export const ProfileReadinessPanel: React.FC<ProfileReadinessPanelProps> = ({
  readiness,
  loading,
  error,
  onRetry,
  policyOverrides,
  onEditOverrides,
}) => {
  if (loading && !readiness) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !readiness) {
    return (
      <div className="p-6 text-center rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <p className="text-xs text-rose-700">{error || "Diagnostic readiness is unavailable."}</p>
        <Button size="sm" variant="outline" onClick={onRetry} className="text-xs bg-white gap-1.5">
          <RotateCcw className="w-3.5 h-3.5" /> Retry
        </Button>
      </div>
    );
  }

  const dependencies = Object.entries(readiness.dependencies || {});
  const hasOverrides = policyOverrides && Object.keys(policyOverrides).length > 0;

  return (
    <div className="space-y-4">
      {/* Status */}
      <div
        className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
          readiness.diagnosable ? "border-emerald-200 bg-emerald-50/60" : "border-rose-200 bg-rose-50/60"
        }`}
      >
        <div className="flex items-start gap-2.5">
          {readiness.diagnosable ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div>
            <h4 className={`text-sm font-bold ${readiness.diagnosable ? "text-emerald-900" : "text-rose-900"}`}>
              {readiness.diagnosable ? "Ready for diagnostics" : "Cannot be diagnosed yet"}
            </h4>
            <p className="text-xs text-gray-600 mt-0.5 max-w-2xl">
              The engine only uses what this profile defines: metrics mapped to telemetry with{" "}
              <code>expected_min</code>/<code>expected_max</code>/<code>max_rate_of_change</code>, component criticality,{" "}
              <code>POWERS</code>/<code>COOLS</code>/<code>COMMUNICATES_VIA</code>/<code>MEASURES_SAME_AS</code>{" "}
              relationships (with a tolerance on sensor pairs), metric roles and the <code>reporting_interval</code> config
              mapping.
            </p>
          </div>
        </div>
        <Button size="sm" variant="ghost" onClick={onRetry} disabled={loading} className="h-7 text-xs gap-1 shrink-0">
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Recheck
        </Button>
      </div>

      {readiness.errors.length > 0 && (
        <Section title="Blocking errors" icon={AlertCircle} count={readiness.errors.length}>
          <ul className="space-y-1 text-xs list-disc pl-5 text-rose-700">
            {readiness.errors.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </Section>
      )}

      {readiness.warnings.length > 0 && (
        <Section title="Warnings (checks that will be skipped)" icon={AlertTriangle} count={readiness.warnings.length}>
          <ul className="space-y-1 text-xs list-disc pl-5 text-amber-800">
            {readiness.warnings.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </Section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Evaluated metrics" icon={Stethoscope} count={readiness.evaluated_metrics.length}>
          {readiness.evaluated_metrics.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {readiness.evaluated_metrics.map((m) => (
                <span key={m} className="px-2 py-0.5 rounded-md bg-slate-100 border text-[11px] font-mono text-gray-700">
                  {m}
                </span>
              ))}
            </div>
          ) : (
            <Empty text="No component metric is mapped to a telemetry field." />
          )}
        </Section>

        <Section title="Data delivery components" icon={Radio} count={readiness.transmission_components.length}>
          {readiness.transmission_components.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {readiness.transmission_components.map((c) => (
                <span key={c} className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[11px] font-mono text-blue-800">
                  {c}
                </span>
              ))}
            </div>
          ) : (
            <Empty text="None. Data gaps are attributed to the device as a whole." />
          )}
        </Section>

        <Section title="Dependencies (root-cause graph)" icon={ArrowLeft} count={dependencies.length}>
          {dependencies.length > 0 ? (
            <ul className="space-y-1 text-xs">
              {dependencies.map(([component, upstream]) => (
                <li key={component} className="font-mono">
                  <span className="font-semibold text-gray-900">{component}</span>
                  <span className="text-gray-400"> depends on </span>
                  <span className="text-purple-700">{upstream.join(", ")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="No POWERS, COOLS or COMMUNICATES_VIA relationships, so every fault is reported on its own component." />
          )}
        </Section>

        <Section title="Metric roles" icon={Tag} count={Object.keys(readiness.metric_roles || {}).length}>
          {Object.keys(readiness.metric_roles || {}).length > 0 ? (
            <ul className="space-y-1 text-xs font-mono">
              {Object.entries(readiness.metric_roles || {}).map(([metric, role]) => (
                <li key={metric}>
                  <span className="text-gray-900">{metric}</span>
                  <span className="text-gray-400"> is the </span>
                  <span className="text-emerald-700 font-semibold">{role.replace(/_/g, " ")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="No metric has a role. Set a battery metric's role to charge level to get its daily charge cycle and outage attribution." />
          )}
        </Section>

        <Section title="Sensor agreement pairs" icon={GitCompare} count={readiness.redundant_pairs.length}>
          {readiness.redundant_pairs.length > 0 ? (
            <ul className="space-y-1 text-xs font-mono text-gray-700">
              {readiness.redundant_pairs.map((pair) => (
                <li key={pair}>{pair}</li>
              ))}
            </ul>
          ) : (
            <Empty text="No MEASURES_SAME_AS relationships with matchable metrics." />
          )}
        </Section>
      </div>

      <Section title="Effective policy" icon={Settings2}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-gray-600">
            Engine defaults merged with this profile&apos;s <code>meta_data.diagnostics</code> overrides
            {hasOverrides ? "" : " (none set)"}. Components can override further in their own{" "}
            <code>meta_data.diagnostics</code>, including <code>disabled_checks</code>.
          </p>
          {onEditOverrides && (
            <Button size="sm" variant="outline" onClick={onEditOverrides} className="h-7 text-xs bg-white gap-1">
              <Edit2 className="w-3 h-3" /> Edit Overrides
            </Button>
          )}
        </div>
        {hasOverrides && (
          <pre className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-[11px] font-mono overflow-x-auto">
            {JSON.stringify(policyOverrides, null, 2)}
          </pre>
        )}
        <details>
          <summary className="cursor-pointer text-xs font-semibold text-gray-600">Show full effective policy</summary>
          <pre className="mt-2 p-3 bg-slate-900 text-slate-100 rounded-lg text-[11px] font-mono overflow-x-auto max-h-80">
            {JSON.stringify(readiness.effective_policy, null, 2)}
          </pre>
        </details>
      </Section>
    </div>
  );
};
