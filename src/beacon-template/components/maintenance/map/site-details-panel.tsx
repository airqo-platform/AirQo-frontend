"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft, X, Clock, MapPin, Route, Copy, Check, ExternalLink, ChevronRight, Stethoscope } from "lucide-react"
import { MaintenanceMapItem, MaintenanceMapSite } from "@/types/api.types"
import { GatewayCoverageDeviceMapItem } from "@/types/lorawan.types"
import type { DeviceDiagnostics, DiagnosticsSummary } from "@/types/diagnostics"
import { useToast } from "@/hooks/use-toast"
import { useGroup } from "@/lib/group-context"
import { formatCompactNumber } from "@/lib/utils"
import { ROUTES } from "@/lib/navigation"
import { ERROR_MARGIN_BADGE_CLASSES, formatSiteLocation, getItemErrorMarginBand } from "@/lib/maintenance-map"
import { airQloudService } from "@/services/airqloud.service"
import {
  LifecycleBadge,
  SeverityBadge,
  StreakBadge,
  formatDiagnosisDate,
  getScoreToneClass,
} from "@/components/diagnostics/DiagnosticBadges"
import { LoRaWANCoverageCard } from "./lorawan-coverage-card"
import { PerformanceHistory, usePerformanceHistory } from "./performance-history"

interface SiteDetailsPanelProps {
  /** The site's map item, used for routing and focusing the map */
  item: MaintenanceMapItem
  site: MaintenanceMapSite
  onBack: () => void
  coverageInfo?: GatewayCoverageDeviceMapItem
  showLoRaWAN?: boolean
  isInRoute?: boolean
  onToggleRoute?: (item: MaintenanceMapItem) => void
  onFocusMap?: (item: MaintenanceMapItem) => void
}

const toUptimePct = (value: number) => {
  const raw = Number(value)
  return Number.isFinite(raw) ? (raw <= 1 ? raw * 100 : raw) : 0
}

const uptimeTone = (pct: number, offline: boolean) =>
  offline
    ? "bg-gray-100 text-gray-600 border-gray-200"
    : pct >= 85
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : pct >= 50
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-red-50 text-red-700 border-red-200"

const errorTone = (em: number) =>
  em <= 10
    ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
    : em <= 20
    ? "bg-amber-50/70 border-amber-200 text-amber-800"
    : "bg-red-50/70 border-red-200 text-red-800"

interface SiteHealth {
  summary: DiagnosticsSummary | null
  /** Each device's latest daily diagnosis, by device id and by name */
  byDevice: Map<string, DeviceDiagnostics | null>
}

/** The site's health roll-up and its devices' latest diagnoses, from `GET /sites/{id}?includeDiagnostics=true`. */
function useSiteHealth(siteId: string): { health: SiteHealth | null; loading: boolean; failed: boolean } {
  const { activeGroup, loading: groupLoading } = useGroup()
  const [state, setState] = useState<{ health: SiteHealth | null; loading: boolean; failed: boolean }>({
    health: null,
    loading: true,
    failed: false,
  })

  useEffect(() => {
    if (groupLoading || !activeGroup) return
    let cancelled = false
    setState({ health: null, loading: true, failed: false })
    airQloudService
      .getSiteById(siteId, undefined, undefined, activeGroup)
      .then((site) => {
        if (cancelled) return
        const byDevice = new Map<string, DeviceDiagnostics | null>()
        for (const device of site.devices ?? []) {
          const diagnosis = (device as { diagnostics?: DeviceDiagnostics | null }).diagnostics ?? null
          if (device._id) byDevice.set(device._id, diagnosis)
          if (device.name) byDevice.set(device.name, diagnosis)
        }
        setState({ health: { summary: site.diagnostics_summary ?? null, byDevice }, loading: false, failed: false })
      })
      .catch(() => {
        if (!cancelled) setState({ health: null, loading: false, failed: true })
      })
    return () => {
      cancelled = true
    }
  }, [siteId, activeGroup, groupLoading])

  return state
}

/** A site on the maintenance map: its figures, where it is, and the devices deployed there. */
export const SiteDetailsPanel: React.FC<SiteDetailsPanelProps> = ({
  item,
  site,
  onBack,
  coverageInfo,
  showLoRaWAN = false,
  isInRoute = false,
  onToggleRoute,
  onFocusMap,
}) => {
  const { toast } = useToast()
  const pathname = usePathname()
  const [copied, setCopied] = useState(false)
  const history = usePerformanceHistory(site.devices.map((d) => d.device_name))
  const { health, loading: healthLoading, failed: healthFailed } = useSiteHealth(site.site_id)
  const summary = health?.summary ?? null

  const uptimePct = toUptimePct(site.uptime)
  const isOffline = uptimePct === 0 || !site.last_active
  const hasErrorMargin = site.error_margin_devices > 0
  const location = formatSiteLocation(site)
  const returnTo = encodeURIComponent(pathname || ROUTES.MAINTENANCE)
  const lat = Number(site.latitude)
  const lng = Number(site.longitude)
  const hasCoords = site.latitude != null && site.longitude != null && Number.isFinite(lat) && Number.isFinite(lng)

  const handleCopyCoords = () => {
    if (!hasCoords) return
    navigator.clipboard.writeText(`${lat}, ${lng}`)
    setCopied(true)
    toast({ title: "Coordinates Copied", description: `${lat}, ${lng}` })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex-none p-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
            title="Back to site list"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate" title={site.site_name}>
              {site.site_name}
            </h2>
            <div className="flex items-center gap-1 text-[10px] text-gray-400 min-w-0">
              {site.generated_name && <span className="font-mono flex-shrink-0">{site.generated_name}</span>}
              {site.generated_name && location && <span>•</span>}
              {location && (
                <span className="truncate" title={location}>
                  {location}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onBack}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3.5">
        {/* Site figures: averages of its devices */}
        <div className="grid grid-cols-2 gap-2">
          <div className={`p-3 rounded-lg border flex flex-col justify-between ${uptimeTone(uptimePct, isOffline)}`}>
            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Uptime</span>
            <span className="text-xl font-black my-1">{uptimePct.toFixed(0)}%</span>
            <span className="text-[10px] font-medium">
              Average of {site.number_of_devices} {site.number_of_devices === 1 ? "device" : "devices"}
            </span>
          </div>

          <div
            className={`p-3 rounded-lg border flex flex-col justify-between ${
              hasErrorMargin ? errorTone(site.error_margin) : "bg-gray-50 border-gray-200 text-gray-600"
            }`}
          >
            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Error Margin</span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-xl font-black">
                {hasErrorMargin ? `±${formatCompactNumber(site.error_margin, 2)}` : "N/A"}
              </span>
              {hasErrorMargin && <span className="text-[10px] font-normal text-gray-400">µg/m³</span>}
            </div>
            <span className="text-[10px] font-medium">
              {hasErrorMargin
                ? `Across ${site.error_margin_devices} of ${site.number_of_devices} with both sensors`
                : "No paired PM2.5 sensor data"}
            </span>
          </div>
        </div>

        {/* Cohorts, last data and coordinates */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-100 dark:border-gray-800 text-xs space-y-2">
          {site.cohorts.length > 0 && (
            <div>
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Cohorts:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {site.cohorts.map((c) => (
                  <span key={c} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              Last Data Post:
            </span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {site.last_active ? new Date(site.last_active).toLocaleString() : "Never / No data"}
            </span>
          </div>

          {hasCoords && (
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-gray-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                Coordinates:
              </span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[10px] text-gray-600 dark:text-gray-300">
                  {lat.toFixed(4)}, {lng.toFixed(4)}
                </span>
                <button
                  onClick={handleCopyCoords}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-gray-600"
                  title="Copy coordinates"
                >
                  {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {showLoRaWAN && <LoRaWANCoverageCard coverageInfo={coverageInfo} />}

        {/* 14-Day Historical Mini-Trends, combined over the site's devices */}
        <PerformanceHistory
          history={history}
          subject="site"
          note={site.devices.length > 1 ? `Combined over the site's ${site.devices.length} devices` : undefined}
        />

        {/* Health & Issues: the roll-up, then each device with its figures and latest diagnosis */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
              Health &amp; Issues
            </span>
            {summary && summary.devices_diagnosed > 0 && (
              <span
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${getScoreToneClass(summary.average_health_score)}`}
                title="Average health score of the diagnosed devices"
              >
                {summary.average_health_score ?? "—"}
              </span>
            )}
          </div>

          {healthLoading ? (
            <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          ) : healthFailed ? (
            <p className="text-[11px] text-gray-400">Couldn&apos;t load this site&apos;s health.</p>
          ) : summary && summary.devices_diagnosed > 0 ? (
            <div className="text-[10px] text-gray-500 space-y-1">
              <div>
                {summary.devices_diagnosed} of {summary.devices_total} {summary.devices_total === 1 ? "device" : "devices"} diagnosed
                {" · "}
                <span className={summary.devices_with_issues > 0 ? "text-red-600 font-semibold" : "text-emerald-600 font-semibold"}>
                  {summary.devices_with_issues} with issues
                </span>
                {summary.latest_diagnosis_date && <> · as of {formatDiagnosisDate(summary.latest_diagnosis_date)}</>}
              </div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(summary.lifecycle_state_counts).map(([state, count]) => (
                  <span key={state} className="inline-flex items-center gap-1">
                    <LifecycleBadge state={state} />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-gray-500">
              No device here has a daily diagnosis from the last 7 days (offline, or no diagnosable device profile).
            </p>
          )}

          <div className="space-y-1.5">
            {site.devices.map((device) => {
              const pct = toUptimePct(device.uptime)
              const offline = pct === 0 || !device.last_active
              const em = Number(device.error_margin)
              const errorBand = getItemErrorMarginBand(device, offline)
              const diagnosis = health?.byDevice.get(device.device_id) ?? health?.byDevice.get(device.device_name) ?? null
              // NO_DATA carries a placeholder score of 0; showing it would read as a failed device
              const score = diagnosis && diagnosis.lifecycle_state !== "NO_DATA" ? diagnosis.overall_health_score : null
              return (
                <div key={device.device_id} className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <Link
                    href={`/dashboard/devices/${encodeURIComponent(device.device_id)}?tab=diagnostics&returnTo=${returnTo}`}
                    className="flex items-center justify-between gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    title={`Open ${device.device_name}`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {device.device_name || device.device_id}
                      </div>
                      {device.device_number != null && (
                        <div className="text-[10px] font-mono text-gray-400">#{device.device_number}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 text-[10px]">
                      <span className={`px-1.5 py-0.5 rounded-md border font-semibold ${uptimeTone(pct, offline)}`}>
                        {offline ? "Offline" : `${pct.toFixed(0)}%`}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded-md border font-semibold ${ERROR_MARGIN_BADGE_CLASSES[errorBand]}`}
                        title={errorBand === "none" ? "No paired PM2.5 sensor readings" : "PM2.5 sensor 1 vs 2 error margin, µg/m³"}
                      >
                        {errorBand === "none" ? "–" : `±${formatCompactNumber(em, 1)}`}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </Link>

                  {health && (
                    <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-2 py-1.5 text-[11px] space-y-1">
                      {diagnosis ? (
                        <>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getScoreToneClass(score)}`}>
                              {score ?? "—"}
                            </span>
                            <LifecycleBadge state={diagnosis.lifecycle_state} />
                          </div>
                          {diagnosis.headline && (
                            <div className="font-semibold text-gray-800 dark:text-gray-200">{diagnosis.headline}</div>
                          )}
                          {diagnosis.issues.length > 0 && (
                            <ul className="space-y-1">
                              {diagnosis.issues.map((issue) => (
                                <li key={issue.issue_code} className="flex items-start justify-between gap-2">
                                  <span className="text-gray-700 dark:text-gray-300">{issue.title}</span>
                                  <span className="flex items-center gap-1 shrink-0">
                                    <SeverityBadge severity={issue.severity} />
                                    <StreakBadge streakDays={issue.streak_days} isNew={issue.is_new} />
                                  </span>
                                </li>
                              ))}
                              {diagnosis.issue_count > diagnosis.issues.length && (
                                <li className="text-[10px] text-gray-400">
                                  +{diagnosis.issue_count - diagnosis.issues.length} more in full diagnostics
                                </li>
                              )}
                            </ul>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-500">Not diagnosed in the last 7 days.</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 space-y-2">
          {onToggleRoute && (
            <button
              onClick={() => onToggleRoute(item)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                isInRoute
                  ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              }`}
            >
              <Route className="w-3.5 h-3.5" />
              {isInRoute ? "Remove from Route" : "Add to Route Itinerary"}
            </button>
          )}

          {onFocusMap && (
            <button
              onClick={() => onFocusMap(item)}
              className="w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Center on Map
            </button>
          )}

          <Link
            href={`${ROUTES.SITES}/${encodeURIComponent(site.site_id)}`}
            className="w-full py-2 px-3 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Open Site Performance</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </Link>
        </div>
      </div>
    </div>
  )
}
