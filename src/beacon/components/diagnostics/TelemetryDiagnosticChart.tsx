"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Zap, GitCompare, History, TrendingUp, BarChart2 } from "lucide-react";
import { DeviceHealthSnapshot } from "@/types/diagnostics";

interface TelemetryPoint {
  datetime: string;
  timeLabel?: string;
  battery_voltage?: number;
  solar_voltage?: number;
  battery_current?: number;
  pm2_5?: number;
  pm2_5_sensor_2?: number;
  pm10?: number;
  pm10_sensor_2?: number;
  chamber_temp_c?: number;
  compressor_current_a?: number;
  vibration_rms?: number;
  flow_rate_lpm?: number;
  [key: string]: any;
}

interface TelemetryDiagnosticChartProps {
  telemetryData?: TelemetryPoint[];
  healthHistory?: DeviceHealthSnapshot[];
  category?: string;
  className?: string;
}

// Generate realistic default telemetry points if none passed
const generateDefaultTelemetry = (): TelemetryPoint[] => {
  const points: TelemetryPoint[] = [];
  const now = new Date();

  for (let i = 24; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3600 * 1000);
    const hour = d.getHours();
    const isDaylight = hour >= 6 && hour <= 18;

    // Solar PV curve
    const solarV = isDaylight ? Math.max(0, 18.2 * Math.sin(((hour - 6) / 12) * Math.PI) + (Math.random() - 0.5) * 1.5) : 0;
    // Battery voltage curve: drops sharply at night if degraded
    const batV = isDaylight ? 13.4 + (solarV / 18.2) * 0.8 : Math.max(11.2, 12.8 - (24 - hour) * 0.12);
    // Sensor 1 and Sensor 2
    const basePM = 22 + Math.sin(i / 3) * 12 + (Math.random() - 0.5) * 6;
    const pm1 = Math.max(2, basePM);
    const pm2 = Math.max(2, basePM * 1.38 + 4); // Divergent sensor 2

    points.push({
      datetime: d.toISOString(),
      timeLabel: `${String(hour).padStart(2, "0")}:00`,
      battery_voltage: parseFloat(batV.toFixed(2)),
      solar_voltage: parseFloat(solarV.toFixed(2)),
      battery_current: isDaylight ? parseFloat((solarV * 180).toFixed(0)) : -240,
      pm2_5: parseFloat(pm1.toFixed(1)),
      pm2_5_sensor_2: parseFloat(pm2.toFixed(1)),
      chamber_temp_c: parseFloat((-78.5 + (i > 18 ? (i - 18) * 1.4 : 0)).toFixed(1)),
      compressor_current_a: i > 18 ? 0.0 : 4.8,
    });
  }

  return points;
};

// Calculate Pearson Correlation Coefficient r
const calculatePearson = (x: number[], y: number[]) => {
  if (x.length === 0 || y.length === 0 || x.length !== y.length) return 0;
  const n = x.length;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const den = Math.sqrt(denX * denY);
  if (den === 0) return 0;
  return num / den;
};

export const TelemetryDiagnosticChart: React.FC<TelemetryDiagnosticChartProps> = ({
  telemetryData,
  healthHistory = [],
  category = "air_quality",
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<string>("timeseries");
  const data = useMemo(() => {
    return telemetryData && telemetryData.length > 0 ? telemetryData : generateDefaultTelemetry();
  }, [telemetryData]);

  // Compute Dual-Sensor statistics
  const dualSensorStats = useMemo(() => {
    const s1 = data.map((d) => d.pm2_5).filter((v) => typeof v === "number") as number[];
    const s2 = data.map((d) => d.pm2_5_sensor_2).filter((v) => typeof v === "number") as number[];

    if (s1.length >= 2 && s2.length >= 2 && s1.length === s2.length) {
      const r = calculatePearson(s1, s2);
      let divergenceSum = 0;
      for (let i = 0; i < s1.length; i++) {
        const avg = (s1[i] + s2[i]) / 2 || 1;
        divergenceSum += Math.abs(s1[i] - s2[i]) / avg;
      }
      const divergenceRatio = (divergenceSum / s1.length) * 100;
      return { r, divergenceRatio, available: true };
    }

    return { r: 0.96, divergenceRatio: 8.4, available: false };
  }, [data]);

  // Format Health History for Area Chart
  const historyData = useMemo(() => {
    if (healthHistory.length > 0) {
      return healthHistory.map((h, i) => ({
        timestamp: h.timestamp ? new Date(h.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : `Day ${i + 1}`,
        score: h.overall_health_score,
        powerScore: h.subsystem_scores?.["Power System"] ?? h.overall_health_score,
        sensorScore: h.subsystem_scores?.["Sensors"] ?? h.overall_health_score,
      }));
    }

    // Default 30-day trajectory mock
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(Date.now() - (29 - i) * 24 * 3600 * 1000);
      const score = Math.max(30, Math.min(98, 92 - (29 - i) * 1.8 + Math.sin(i) * 3));
      return {
        timestamp: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        score: Math.round(score),
        powerScore: Math.max(25, Math.round(score * 0.9)),
        sensorScore: Math.min(100, Math.round(score * 1.05)),
      };
    });
  }, [healthHistory]);

  return (
    <Card className={`border border-gray-200 shadow-sm ${className}`}>
      <CardHeader className="pb-2 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Interactive Diagnostic Telemetry & Correlation
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 mt-0.5">
              Inspect multi-metric physical time series, inter-sensor divergence ratios, and health score trajectory
            </CardDescription>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList className="grid grid-cols-3 h-8 text-xs bg-slate-100 p-0.5">
              <TabsTrigger value="timeseries" className="text-xs px-2.5 py-1 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Time Series</span> Overlay
              </TabsTrigger>
              <TabsTrigger value="divergence" className="text-xs px-2.5 py-1 flex items-center gap-1.5">
                <GitCompare className="w-3.5 h-3.5 text-blue-500" />
                Dual-Sensor
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs px-2.5 py-1 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-emerald-500" />
                30-Day Trend
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* TAB 1: Time Series Multi-Metric Overlay */}
        {activeTab === "timeseries" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-xs">
              <div className="flex items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                  Battery Voltage (V)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  Solar PV Voltage (V)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  PM 2.5 (µg/m³)
                </span>
              </div>
              <span className="text-[11px] text-gray-400 font-mono">
                {data.length} Sample Points in Window
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="timeLabel"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    stroke="#cbd5e1"
                  />
                  <YAxis
                    yAxisId="left"
                    domain={[10, 22]}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    stroke="#cbd5e1"
                    unit="V"
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    stroke="#cbd5e1"
                    unit="µg"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      borderRadius: "8px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
                    }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="battery_voltage"
                    name="Battery Voltage"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="solar_voltage"
                    name="Solar PV Voltage"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="pm2_5"
                    name="PM 2.5 Primary"
                    stroke="#e11d48"
                    strokeWidth={1.8}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TAB 2: Dual Sensor Divergence & Correlation */}
        {activeTab === "divergence" && (
          <div className="space-y-4">
            {/* Divergence Metrics Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-gray-500 font-medium">Pearson Correlation (r)</div>
                <div className="text-xl font-bold text-gray-900 mt-0.5">
                  r = {dualSensorStats.r.toFixed(3)}
                </div>
                <span
                  className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    dualSensorStats.r >= 0.85
                      ? "bg-emerald-100 text-emerald-800"
                      : dualSensorStats.r >= 0.65
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {dualSensorStats.r >= 0.85 ? "High Coherence" : dualSensorStats.r >= 0.65 ? "Moderate Drift" : "Severe Divergence"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-gray-500 font-medium">Inter-Channel Divergence Ratio</div>
                <div className="text-xl font-bold text-gray-900 mt-0.5">
                  {dualSensorStats.divergenceRatio.toFixed(1)}%
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Threshold limit: &lt; 35%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-gray-500 font-medium">Calibration Status</div>
                <div className="text-sm font-bold text-gray-900 mt-1">
                  {dualSensorStats.divergenceRatio > 35 ? "Sensor 2 Contamination Suspected" : "Synchronized & Calibrated"}
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Dual-laser optical scattering
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="timeLabel" tick={{ fontSize: 11, fill: "#64748b" }} stroke="#cbd5e1" />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} stroke="#cbd5e1" unit="µg" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      borderRadius: "8px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                  <Line
                    type="monotone"
                    dataKey="pm2_5"
                    name="PM 2.5 (Sensor 1 - Primary)"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pm2_5_sensor_2"
                    name="PM 2.5 (Sensor 2 - Secondary)"
                    stroke="#e11d48"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={{ r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TAB 3: 30-Day Historical Health Trajectory */}
        {activeTab === "history" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs px-1 text-gray-500">
              <span className="font-semibold text-gray-700">
                30-Day Health Degradation Trajectory
              </span>
              <span className="text-[11px] text-gray-400">
                Baseline Decay Rate: -1.2 pts / day
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: "#64748b" }} stroke="#cbd5e1" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} stroke="#cbd5e1" unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      borderRadius: "8px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <ReferenceLine y={85} stroke="#10b981" strokeDasharray="3 3" label={{ value: "Healthy", fill: "#10b981", fontSize: 10 }} />
                  <ReferenceLine y={50} stroke="#f97316" strokeDasharray="3 3" label={{ value: "Warning", fill: "#f97316", fontSize: 10 }} />
                  <ReferenceLine y={20} stroke="#e11d48" strokeDasharray="3 3" label={{ value: "Failure", fill: "#e11d48", fontSize: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    name="Overall Health Score"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#healthGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
