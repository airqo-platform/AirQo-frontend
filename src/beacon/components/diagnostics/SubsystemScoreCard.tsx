"use client";

import React from "react";
import { Zap, Activity, Wifi, Snowflake, Cog, Cpu, Database, Layers, ShieldCheck, AlertTriangle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SubsystemScoreCardProps {
  subsystemScores: Record<string, number>;
  criticalities?: Record<string, number>;
  className?: string;
}

const getSubsystemIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("power") || lower.includes("battery") || lower.includes("solar") || lower.includes("pv")) {
    return Zap;
  }
  if (lower.includes("sensor") || lower.includes("pm") || lower.includes("gas") || lower.includes("hydraulic") || lower.includes("temp")) {
    return Activity;
  }
  if (lower.includes("connect") || lower.includes("modem") || lower.includes("telemetry") || lower.includes("gsm") || lower.includes("wifi")) {
    return Wifi;
  }
  if (lower.includes("cool") || lower.includes("cryo") || lower.includes("freeze") || lower.includes("fan")) {
    return Snowflake;
  }
  if (lower.includes("motor") || lower.includes("pump") || lower.includes("mechanical") || lower.includes("actuator")) {
    return Cog;
  }
  if (lower.includes("compute") || lower.includes("mcu") || lower.includes("cpu") || lower.includes("motherboard")) {
    return Cpu;
  }
  if (lower.includes("storage") || lower.includes("flash") || lower.includes("sd")) {
    return Database;
  }
  return Layers;
};

const getScoreColor = (score: number) => {
  if (score >= 85) {
    return {
      barClass: "bg-emerald-500",
      textClass: "text-emerald-700",
      bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      statusText: "Optimal",
      icon: ShieldCheck,
    };
  }
  if (score >= 70) {
    return {
      barClass: "bg-amber-500",
      textClass: "text-amber-700",
      bgClass: "bg-amber-50 text-amber-700 border-amber-200",
      statusText: "Degrading",
      icon: AlertTriangle,
    };
  }
  if (score >= 50) {
    return {
      barClass: "bg-orange-500",
      textClass: "text-orange-700",
      bgClass: "bg-orange-50 text-orange-700 border-orange-200",
      statusText: "Warning",
      icon: AlertCircle,
    };
  }
  return {
    barClass: "bg-rose-500",
    textClass: "text-rose-700",
    bgClass: "bg-rose-50 text-rose-700 border-rose-200",
    statusText: "Critical",
    icon: AlertCircle,
  };
};

export const SubsystemScoreCard: React.FC<SubsystemScoreCardProps> = ({
  subsystemScores,
  criticalities = {},
  className = "",
}) => {
  const subsystems = Object.entries(subsystemScores);

  if (subsystems.length === 0) {
    return null;
  }

  return (
    <Card className={`border border-gray-200 shadow-sm ${className}`}>
      <CardHeader className="pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            Subsystem Health Breakdown
          </CardTitle>
          <span className="text-xs text-gray-400 font-medium">
            {subsystems.length} Subsystems Monitored
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subsystems.map(([name, score]) => {
            const Icon = getSubsystemIcon(name);
            const scoreColor = getScoreColor(score);
            const StatusIcon = scoreColor.icon;
            const criticality = criticalities[name];

            return (
              <div
                key={name}
                className="p-3.5 rounded-xl border border-gray-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-white shadow-2xs border border-gray-200/60 text-gray-700">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 leading-tight">
                        {name}
                      </h4>
                      {criticality !== undefined && (
                        <span className="text-[11px] text-gray-400">
                          Criticality: <strong className="text-gray-600">{(criticality * 100).toFixed(0)}%</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${scoreColor.bgClass}`}>
                      <StatusIcon className="w-3 h-3" />
                      {scoreColor.statusText}
                    </span>
                    <span className={`text-sm font-bold ${scoreColor.textClass}`}>
                      {score}%
                    </span>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="w-full bg-gray-200/80 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${scoreColor.barClass}`}
                    style={{ width: `${Math.max(4, Math.min(100, score))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
