"use client"

import React, { useState, useEffect } from "react"
import { 
  Activity, 
  Wifi, 
  BatteryCharging, 
  ShieldCheck, 
  Radio, 
  Cpu, 
  Sparkles,
  Wind,
  Layers,
  Flame,
  SunMedium
} from "lucide-react"

interface ManufacturerDevice {
  id: "airqo" | "airgradient" | "clarity"
  name: string
  model: string
  badge: string
  chip: string
  serial: string
  protocol: string
  connectivity: string
  battery: string
  batteryState: string
  primaryMetric: {
    label: string
    value: string
    unit: string
    status: string
    statusColor: string
    iconType: "pm" | "co2" | "tvoc"
  }
  secondaryMetric: {
    label: string
    value: string
    subValue: string
  }
  fleetStat: string
  description: string
  tags: [string, string, string]
  theme: {
    cardBg: string
    borderColor: string
    accentGlow: string
    ringColor: string
    badgeBg: string
    deviceSkin: string
    deviceBorder: string
    deviceDisplayBg: string
  }
}

const MANUFACTURER_DEVICES: ManufacturerDevice[] = [
  {
    id: "airqo",
    name: "AirQo",
    model: "AirQo Gen6 Beacon",
    badge: "Dual PM2.5 / PM10 Solar IoT",
    chip: "ESP32-S3 + Dual Plantower",
    serial: "AQ-G6-0482",
    protocol: "4G-LTE / NB-IoT Fleet",
    connectivity: "4G-LTE",
    battery: "98%",
    batteryState: "Solar Charging",
    primaryMetric: {
      label: "Real-Time PM2.5",
      value: "12.4",
      unit: "µg/m³",
      status: "Good",
      statusColor: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
      iconType: "pm"
    },
    secondaryMetric: {
      label: "Fleet Network Uptime",
      value: "99.85%",
      subValue: "Online"
    },
    fleetStat: "1,480+ AirQo Nodes Live",
    description: "Ruggedized solar-powered outdoor monitoring nodes designed for dense urban African deployments.",
    tags: ["Dual Optical PM Sensor", "Solar & Battery Management", "Automated Calibration"],
    theme: {
      cardBg: "from-slate-900/90 to-blue-950/90",
      borderColor: "border-blue-500/30",
      accentGlow: "bg-blue-400/20",
      ringColor: "border-blue-400/25",
      badgeBg: "bg-blue-500/20 text-blue-300 border-blue-400/30",
      deviceSkin: "from-slate-800/95 via-slate-900/95 to-slate-950/95",
      deviceBorder: "border-blue-400/30",
      deviceDisplayBg: "from-blue-950/90 to-slate-900/95"
    }
  },
  {
    id: "airgradient",
    name: "AirGradient",
    model: "AirGradient ONE (Open Air)",
    badge: "Multi-Pollutant ESP32 Node",
    chip: "ESP32-C3 + Sensirion SPS30",
    serial: "AG-ONE-8921",
    protocol: "WiFi / MQTT Direct",
    connectivity: "WiFi 6",
    battery: "100%",
    batteryState: "USB-C Constant",
    primaryMetric: {
      label: "Real-Time PM2.5 / CO2",
      value: "8.6",
      unit: "µg/m³",
      status: "Clean",
      statusColor: "text-cyan-300 bg-cyan-500/20 border-cyan-500/30",
      iconType: "pm"
    },
    secondaryMetric: {
      label: "CO2 / TVOC Index",
      value: "428 ppm",
      subValue: "Optimal"
    },
    fleetStat: "650+ AirGradient Nodes",
    description: "Open-hardware modular air quality monitors with high-precision Sensirion SPS30 & SGP41 sensors.",
    tags: ["Sensirion SPS30 Laser", "Senseair S8 CO2", "Open-Hardware Firmware"],
    theme: {
      cardBg: "from-slate-900/90 to-cyan-950/90",
      borderColor: "border-cyan-500/30",
      accentGlow: "bg-cyan-400/20",
      ringColor: "border-cyan-400/25",
      badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-400/30",
      deviceSkin: "from-slate-800/90 via-slate-850/90 to-slate-900/95",
      deviceBorder: "border-cyan-400/40",
      deviceDisplayBg: "from-cyan-950/80 to-slate-900/95"
    }
  },
  {
    id: "clarity",
    name: "Clarity",
    model: "Clarity Node-S",
    badge: "Industrial Reference Sensor",
    chip: "Industrial Cortex-M4",
    serial: "CL-NS-3310",
    protocol: "Global Cellular IoT",
    connectivity: "Cellular/Sat",
    battery: "95%",
    batteryState: "Solar Harvesting",
    primaryMetric: {
      label: "Real-Time PM10",
      value: "21.3",
      unit: "µg/m³",
      status: "Moderate",
      statusColor: "text-amber-300 bg-amber-500/20 border-amber-500/30",
      iconType: "pm"
    },
    secondaryMetric: {
      label: "Calibration Index",
      value: "0.98 R²",
      subValue: "Verified"
    },
    fleetStat: "420+ Clarity Nodes",
    description: "Commercial-grade solar air monitoring devices with continuous remote calibration against BAM standards.",
    tags: ["BAM Equivalent Correlation", "Global Satellite Geofencing", "Over-The-Air Updates"],
    theme: {
      cardBg: "from-slate-900/90 to-indigo-950/90",
      borderColor: "border-indigo-500/30",
      accentGlow: "bg-indigo-400/20",
      ringColor: "border-indigo-400/25",
      badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-400/30",
      deviceSkin: "from-slate-800/95 via-indigo-950/95 to-slate-950/95",
      deviceBorder: "border-indigo-400/30",
      deviceDisplayBg: "from-indigo-950/90 to-slate-900/95"
    }
  }
]

export default function AuthVisualHero() {
  const [activeIdx, setActiveIdx] = useState<number>(0)
  const [isPaused, setIsPaused] = useState<boolean>(false)

  // Auto-cycle through manufacturer devices every 5 seconds unless user hovers
  useEffect(() => {
    if (isPaused) return

    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % MANUFACTURER_DEVICES.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isPaused])

  const device = MANUFACTURER_DEVICES[activeIdx]

  return (
    <div 
      className="relative w-full h-full min-h-screen bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950 flex flex-col justify-between p-8 xl:p-12 overflow-hidden text-white select-none transition-colors duration-700"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Dynamic ambient lighting based on active device theme */}
      <div className={`absolute -top-24 -left-24 w-96 h-96 ${device.theme.accentGlow} rounded-full blur-3xl pointer-events-none transition-all duration-700`} />
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle background tech grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: "28px 28px"
        }}
      />

      {/* Top Header Section */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute" />
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-100">
            Multi-Device Telemetry
          </span>
        </div>

        {/* Manufacturer Switcher Tabs */}
        <div className="flex items-center space-x-1.5 bg-black/30 backdrop-blur-md p-1 rounded-2xl border border-white/15">
          {MANUFACTURER_DEVICES.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveIdx(idx)
                setIsPaused(true)
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 ${
                activeIdx === idx
                  ? "bg-white/20 text-white shadow-md font-semibold scale-105 border border-white/20"
                  : "text-blue-200/70 hover:text-white hover:bg-white/5"
              }`}
              title={`Switch to ${item.name} devices`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* Center Interactive/Visual Area */}
      <div className="relative z-10 my-auto py-6 flex flex-col items-center justify-center">
        {/* Device Node & Telemetry Visualization Container */}
        <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
          {/* Animated concentric signal waves */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`w-80 h-80 rounded-full border ${device.theme.ringColor} animate-[ping_4.5s_cubic-bezier(0,0,0.2,1)_infinite]`} />
            <div className={`w-64 h-64 rounded-full border ${device.theme.ringColor} animate-[ping_4.5s_cubic-bezier(0,0,0.2,1)_infinite_1.2s]`} />
            <div className={`w-48 h-48 rounded-full border ${device.theme.ringColor} animate-[ping_4.5s_cubic-bezier(0,0,0.2,1)_infinite_2.4s]`} />
          </div>

          {/* Central IoT Device Graphic */}
          <div 
            key={device.id}
            className={`relative z-20 w-52 h-60 bg-gradient-to-b ${device.theme.deviceSkin} rounded-3xl border ${device.theme.deviceBorder} shadow-2xl p-4 flex flex-col items-center justify-between backdrop-blur-xl group hover:scale-105 transition-all duration-500 ease-out animate-in fade-in zoom-in-95`}
          >
            {/* Top hardware status row */}
            <div className="w-full flex justify-between items-center px-1">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-[10px] text-blue-200/80 font-semibold tracking-wide ml-1">
                  {device.name}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-[10px] text-blue-200 font-mono bg-white/10 px-2 py-0.5 rounded-full">
                <Wifi className="w-3 h-3 text-cyan-300" />
                <span>{device.connectivity}</span>
              </div>
            </div>

            {/* Device sensor chamber / display */}
            <div className={`w-full bg-gradient-to-b ${device.theme.deviceDisplayBg} rounded-2xl p-3.5 border ${device.theme.borderColor} flex flex-col items-center text-center shadow-inner my-2`}>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-1 text-cyan-300 border border-white/20 shadow-sm">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">{device.model}</span>
              <span className="text-[9px] text-blue-300/80 font-mono mt-0.5">{device.chip}</span>
            </div>

            {/* Bottom Status bar */}
            <div className="w-full flex items-center justify-between text-[10px] text-gray-300 px-1 border-t border-white/10 pt-2">
              <div className="flex items-center space-x-1">
                {device.batteryState.includes("Solar") ? (
                  <SunMedium className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="font-mono">{device.battery}</span>
                <span className="text-[9px] text-blue-200/70 truncate">({device.batteryState})</span>
              </div>
              <div className="flex items-center space-x-1 text-emerald-300 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Active</span>
              </div>
            </div>
          </div>

          {/* Floating Metric Card 1: Real-time Telemetry (Top Right) */}
          <div 
            key={`metric-1-${device.id}`}
            className="absolute -top-3 right-0 xl:right-4 z-30 bg-slate-900/85 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 shadow-2xl flex items-center space-x-3.5 animate-[bounce_5s_ease-in-out_infinite]"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-blue-200/80 font-medium flex items-center space-x-1.5">
                <span>{device.primaryMetric.label}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${device.primaryMetric.statusColor}`}>
                  {device.primaryMetric.status}
                </span>
              </div>
              <div className="text-lg font-bold text-white font-mono">
                {device.primaryMetric.value} <span className="text-xs font-normal text-blue-200">{device.primaryMetric.unit}</span>
              </div>
            </div>
          </div>

          {/* Floating Metric Card 2: Secondary Metric / Health (Bottom Left) */}
          <div 
            key={`metric-2-${device.id}`}
            className="absolute -bottom-4 left-0 xl:left-2 z-30 bg-slate-900/85 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 shadow-2xl flex items-center space-x-3.5 animate-[bounce_6s_ease-in-out_infinite_1.5s]"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-blue-200/80 font-medium">{device.secondaryMetric.label}</div>
              <div className="text-lg font-bold text-white font-mono flex items-center space-x-1.5">
                <span>{device.secondaryMetric.value}</span>
                <span className="text-[10px] text-emerald-400 font-sans font-normal px-1.5 py-0.2 bg-emerald-500/10 rounded">
                  {device.secondaryMetric.subValue}
                </span>
              </div>
            </div>
          </div>

          {/* Floating Metric Card 3: Active Fleet Nodes (Bottom Right) */}
          <div 
            key={`metric-3-${device.id}`}
            className="absolute bottom-6 right-0 xl:right-2 z-20 bg-slate-900/80 backdrop-blur-md border border-white/15 rounded-xl px-3 py-2 shadow-lg flex items-center space-x-2 text-xs"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-blue-100 font-medium">{device.fleetStat}</span>
          </div>
        </div>

        {/* Value Proposition & Typography for active device */}
        <div className="text-center max-w-md mt-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-blue-200 mb-2">
            <Radio className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            <span>{device.badge}</span>
          </div>
          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white mb-2">
            AirQo Beacon
          </h2>
          <p className="text-sm xl:text-base text-blue-100/90 leading-relaxed min-h-[44px]">
            {device.description}
          </p>
        </div>
      </div>

      {/* Footer Feature Badges for the selected manufacturer */}
      <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-blue-100/80">
        {device.tags.map((tag, i) => (
          <div key={i} className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>{tag}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
