"use client"

import { useState, useEffect, useMemo, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format, parseISO } from "date-fns"
import { AqRefreshCw01, AqWifiOff } from "@airqo/icons-react"
import { useGroup } from "@/lib/group-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/ui/loading-state"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  networkStatusService,
  NetworkStatusAlert,
  NetworkStatistics,
  HourlyTrend,
  UptimeSummaryItem,
  NetworkBreakdownItem,
  CohortBreakdownItem,
  DeviceSummaryCountResponse,
} from "@/services/network-status.service"
import { airQloudService, Cohort } from "@/services/airqloud.service"
import { beaconConfig, isSystemGroup } from "@/beacon.config"
import { formatNetworkLabel } from "@/lib/manufacturers"
import { trackEvent } from "@/lib/analytics"
import {
  OVERVIEW_VIEW_STORAGE_KEY,
  WARNING_OFFLINE_PERCENT,
  compareWithYesterday,
  countsFromCheck,
  countsFromSummary,
  dailyOnline,
  healthFor,
  isDeviceStatusKey,
  isOverviewView,
  mergeUptime,
  percentOf,
  rankFleets,
  recentIncidents,
  reportSummary,
  summarisePeriod,
  type DeviceStatusKey,
  type NetworkHealth,
  type OverviewView,
  type StatusCounts,
} from "@/lib/network-overview"
import { HealthBadge, RoleSwitch } from "@/components/overview/overview-parts"
import { OperationsView } from "@/components/overview/operations-view"
import { FieldView } from "@/components/overview/field-view"
import { ReportingView } from "@/components/overview/reporting-view"
import { HardwareView, type FleetKind } from "@/components/overview/hardware-view"

const PERIOD_DAYS = 14

const aggregateUptimeFromAlerts = (alerts: NetworkStatusAlert[]): UptimeSummaryItem[] => {
  const groups: Record<string, {
    percentages: number[];
    maxPercentage: number;
    minPercentage: number;
    totalChecks: number;
    alertsTriggered: number;
  }> = {}

  alerts.forEach(alert => {
    const dateStr = alert.checked_at.split('T')[0]
    if (!groups[dateStr]) {
      groups[dateStr] = {
        percentages: [],
        maxPercentage: 0,
        minPercentage: 100,
        totalChecks: 0,
        alertsTriggered: 0
      }
    }

    const pct = alert.not_transmitting_percentage
    groups[dateStr].percentages.push(pct)
    groups[dateStr].maxPercentage = Math.max(groups[dateStr].maxPercentage, pct)
    groups[dateStr].minPercentage = Math.min(groups[dateStr].minPercentage, pct)
    groups[dateStr].totalChecks += 1
    if (alert.threshold_exceeded) {
      groups[dateStr].alertsTriggered += 1
    }
  })

  return Object.entries(groups)
    .map(([date, data]) => {
      const avg = data.percentages.reduce((sum, val) => sum + val, 0) / data.percentages.length
      return {
        _id: date,
        avgOfflinePercentage: avg,
        maxOfflinePercentage: data.maxPercentage,
        minOfflinePercentage: data.minPercentage,
        totalChecks: data.totalChecks,
        alertsTriggered: data.alertsTriggered
      }
    })
    .sort((a, b) => a._id.localeCompare(b._id))
}

const getNetworkDisplayName = (networkVal: string): string => formatNetworkLabel(networkVal)

const newestCheck = (checks: NetworkStatusAlert[]): NetworkStatusAlert | undefined =>
  checks.reduce<NetworkStatusAlert | undefined>(
    (latest, check) => (!latest || Date.parse(check.checked_at) > Date.parse(latest.checked_at) ? check : latest),
    undefined
  )

function readStoredView(): OverviewView | null {
  try {
    const stored = window.localStorage.getItem(OVERVIEW_VIEW_STORAGE_KEY)
    return isOverviewView(stored) ? stored : null
  } catch {
    return null
  }
}

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedNetwork = searchParams ? searchParams.get("network") : null
  const selectedCohortId = searchParams ? searchParams.get("cohort_id") : null
  const urlView = searchParams ? searchParams.get("view") : null
  const urlStatus = searchParams ? searchParams.get("status") : null
  const [storedView, setStoredView] = useState<OverviewView | null>(null)
  const view: OverviewView = isOverviewView(urlView) ? urlView : storedView ?? "operations"
  const [fieldStatus, setFieldStatus] = useState<DeviceStatusKey>(
    isDeviceStatusKey(urlStatus) && urlStatus !== "operational" ? urlStatus : "not_transmitting"
  )
  const [comparisonMode, setComparisonMode] = useState<FleetKind>('network')
  const { activeGroup, availableGroups, loading: groupsLoading } = useGroup()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [, setStats] = useState<NetworkStatistics | null>(null)
  const [trends, setTrends] = useState<HourlyTrend[]>([])
  const [uptime, setUptime] = useState<UptimeSummaryItem[]>([])
  const [recentAlerts, setRecentAlerts] = useState<NetworkStatusAlert[]>([])
  const [allAlerts, setAllAlerts] = useState<NetworkStatusAlert[]>([])
  const [breakdownData, setBreakdownData] = useState<NetworkBreakdownItem[]>([])
  const [cohortBreakdownData, setCohortBreakdownData] = useState<CohortBreakdownItem[]>([])
  const [availableNetworks, setAvailableNetworks] = useState<string[]>([])
  const [availableCohorts, setAvailableCohorts] = useState<Cohort[]>([])
  const [summaryCount, setSummaryCount] = useState<DeviceSummaryCountResponse['data'] | null>(null)
  const [summaryError, setSummaryError] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // The fleet the figures on screen were loaded for, and the newest load; a slower, older load is dropped
  const [loadedScope, setLoadedScope] = useState<string | null>(null)
  const latestRequest = useRef(0)
  // Bumped by Refresh so the Field view reloads its device list too
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    setStoredView(readStoredView())
  }, [])

  useEffect(() => {
    if (!groupsLoading) {
      const hasSystemAdmin = availableGroups.some(g => {
        if (isSystemGroup(g.grp_title)) {
          const roleName = g.role?.role_name?.toLowerCase() || ''
          return roleName.includes('admin') || roleName === 'super' || roleName === 'net admin'
        }
        return false
      })

      if (!hasSystemAdmin) {
        router.replace('/dashboard/home')
      } else {
        setIsAuthorized(true)
      }
    }
  }, [availableGroups, groupsLoading, router])

  const fetchData = async () => {
    const request = ++latestRequest.current
    const isLatest = () => request === latestRequest.current
    const scopeKey = selectedCohortId ? `cohort:${selectedCohortId}` : selectedNetwork ? `network:${selectedNetwork}` : "all"
    setLoading(true)
    setError(null)
    try {
      const currentEndDate = new Date().toISOString()
      const currentStartDate = new Date(Date.now() - PERIOD_DAYS * 24 * 60 * 60 * 1000).toISOString()
      const baseParams = { start_date: currentStartDate, end_date: currentEndDate }

      const activeFilter = selectedCohortId
        ? { cohort_id: selectedCohortId }
        : selectedNetwork
        ? { network: selectedNetwork }
        : undefined

      const filterParams = selectedCohortId
        ? { ...baseParams, cohort_id: selectedCohortId }
        : selectedNetwork
        ? { ...baseParams, network: selectedNetwork }
        : baseParams

      const [
        statsRes,
        trendsRes,
        uptimeRes,
        recentRes,
        allRes,
        breakdownRes,
        cohortBreakdownRes,
        summaryCountRes,
        cohortsListRes
      ] = await Promise.all([
        networkStatusService.getStatistics(filterParams).catch(e => { console.error(e); return { success: false, error: e }; }),
        networkStatusService.getHourlyTrends(filterParams).catch(e => { console.error(e); return { success: false, error: e }; }),
        networkStatusService.getUptimeSummary(PERIOD_DAYS, activeFilter).catch(e => { console.error(e); return { success: false, error: e }; }),
        networkStatusService.getRecentAlerts(48, activeFilter).catch(e => { console.error(e); return { success: false, error: e }; }),
        networkStatusService.getAlerts({ limit: 200, start_date: currentStartDate, end_date: currentEndDate, ...(activeFilter || {}) }).catch(e => { console.error(e); return { success: false, error: e }; }),
        networkStatusService.getNetworkBreakdown(baseParams).catch(e => { console.error(e); return { success: false, error: e }; }),
        networkStatusService.getCohortBreakdown(baseParams).catch(e => { console.error(e); return { success: false, error: e }; }),
        activeFilter ? networkStatusService.getDeviceSummaryCount(activeFilter).catch(e => { console.error(e); return { success: false, error: e }; }) : Promise.resolve(null),
        airQloudService.getCohorts({ limit: 100, group: activeGroup || beaconConfig.auth.systemGroupSlug }).catch(e => { console.error(e); return null; })
      ])
      if (!isLatest()) return
      setLoadedScope(scopeKey)

      let rawAlerts: NetworkStatusAlert[] = []
      if (allRes && 'alerts' in allRes && allRes.alerts) {
        rawAlerts = allRes.alerts
        setAllAlerts(rawAlerts)
      } else {
        setAllAlerts([])
      }

      if (statsRes && 'statistics' in statsRes && statsRes.statistics.length > 0) {
        setStats(statsRes.statistics[0])
      } else {
        setStats(null)
      }

      if (trendsRes && 'trends' in trendsRes && trendsRes.trends) {
        setTrends([...trendsRes.trends].sort((a, b) => a._id.hour - b._id.hour))
      } else {
        setTrends([])
      }

      // Days without a recorded average take the figure from that day's checks, or are left out
      const daysFromChecks = aggregateUptimeFromAlerts(rawAlerts)
      const summaryDays = uptimeRes && 'summary' in uptimeRes && uptimeRes.summary ? uptimeRes.summary : []
      setUptime(summaryDays.length > 0 ? mergeUptime(summaryDays, daysFromChecks) : daysFromChecks)

      // The period's checks are the fallback; they reach back 14 days, so keep only the last 48 hours
      const recent = recentRes && 'alerts' in recentRes && recentRes.alerts ? recentRes.alerts : []
      setRecentAlerts(recent.length > 0 ? recent : recentIncidents(rawAlerts, { hours: 48, limit: 10 }))

      if (breakdownRes && 'data' in breakdownRes && breakdownRes.data) {
        setBreakdownData(breakdownRes.data)
        setAvailableNetworks(breakdownRes.data.map((item: any) => item._id))
      }

      if (cohortBreakdownRes && 'data' in cohortBreakdownRes && cohortBreakdownRes.data) {
        setCohortBreakdownData(cohortBreakdownRes.data)
      }

      if (cohortsListRes && cohortsListRes.airqlouds) {
        setAvailableCohorts(cohortsListRes.airqlouds)
      }

      if (activeFilter) {
        if (summaryCountRes && 'data' in summaryCountRes && summaryCountRes.data) {
          setSummaryCount(summaryCountRes.data)
          setSummaryError(false)
        } else {
          setSummaryError(true)
          setSummaryCount(null)
        }
      } else {
        setSummaryCount(null)
        setSummaryError(false)
      }

      const anySuccess = (statsRes && 'success' in statsRes && statsRes.success) ||
                         (trendsRes && 'success' in trendsRes && trendsRes.success) ||
                         (uptimeRes && 'success' in uptimeRes && uptimeRes.success) ||
                         (breakdownRes && 'success' in breakdownRes && breakdownRes.success) ||
                         (cohortBreakdownRes && 'success' in cohortBreakdownRes && cohortBreakdownRes.success);
      if (!anySuccess && !activeFilter) {
        throw new Error("Network status didn't load. Check your connection and try Refresh.");
      }

    } catch (err: any) {
      if (!isLatest()) return
      console.error(err)
      setError(err.message || "Network status didn't load. Check your connection and try Refresh.")
    } finally {
      if (isLatest()) setLoading(false)
    }
  }

  const refresh = () => {
    setRefreshToken((token) => token + 1)
    void fetchData()
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNetwork, selectedCohortId])

  const isFiltered = Boolean(selectedNetwork || selectedCohortId)
  const latestCheck = useMemo(() => newestCheck(allAlerts), [allAlerts])
  const warningAt = latestCheck?.threshold_value || WARNING_OFFLINE_PERCENT

  const getCohortDisplayName = (cohortId: string): string => {
    const found = availableCohorts.find(c => c._id === cohortId) || cohortBreakdownData.find(c => c._id === cohortId)
    if (found?.name) return found.name
    return `Cohort (${cohortId.slice(-6)})`
  }

  const scopeName = selectedCohortId
    ? getCohortDisplayName(selectedCohortId)
    : selectedNetwork
    ? getNetworkDisplayName(selectedNetwork)
    : "All fleets"

  const selectedFilterValue = selectedCohortId
    ? `cohort:${selectedCohortId}`
    : selectedNetwork
    ? `network:${selectedNetwork}`
    : "all"
  // Until the selected fleet's figures arrive, nothing from the previous fleet is shown or reported
  const isCurrentScope = loadedScope === selectedFilterValue

  // Current counts: the device summary for one fleet, the newest check for the whole network
  const counts: StatusCounts | null = !isCurrentScope
    ? null
    : isFiltered
    ? summaryCount ? countsFromSummary(summaryCount) : null
    : latestCheck ? countsFromCheck(latestCheck) : null

  const offlinePct = counts ? percentOf(counts.not_transmitting, counts.total) : 0
  const health: NetworkHealth | null = counts
    ? !isFiltered && latestCheck?.status
      ? latestCheck.status
      : healthFor(offlinePct, warningAt)
    : null

  const days = useMemo(() => dailyOnline(uptime), [uptime])
  const period = useMemo(() => summarisePeriod(uptime, warningAt), [uptime, warningAt])
  const dayOverDay = useMemo(() => compareWithYesterday(allAlerts), [allAlerts])
  const manufacturerFleets = useMemo(
    () => rankFleets(breakdownData, (item) => getNetworkDisplayName(item._id), warningAt),
    [breakdownData, warningAt]
  )
  const cohortFleets = useMemo(
    () =>
      rankFleets(
        cohortBreakdownData,
        (item) => (item as CohortBreakdownItem).name || getCohortDisplayName(item._id),
        warningAt
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cohortBreakdownData, availableCohorts, warningAt]
  )
  const summaryText = reportSummary({
    scopeName: isFiltered ? scopeName : "the network",
    period,
    firstDay: days[0]?.date ?? null,
    lastDay: days[days.length - 1]?.date ?? null,
    deployed: counts?.total ?? null,
    fleets: isFiltered ? [] : manufacturerFleets,
  })

  if (groupsLoading || isAuthorized === null) {
    return <LoadingState text="Checking authorization..." className="min-h-[50vh]" />
  }

  const replaceParams = (update: (params: URLSearchParams) => void, method: "push" | "replace" = "replace") => {
    const params = new URLSearchParams(window.location.search)
    update(params)
    const qs = params.toString()
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname
    if (method === "push") router.push(url, { scroll: false })
    else router.replace(url, { scroll: false })
  }

  const changeView = (next: OverviewView) => {
    if (next === view) return
    setStoredView(next)
    try {
      window.localStorage.setItem(OVERVIEW_VIEW_STORAGE_KEY, next)
    } catch {
      // Private browsing: the view just won't be remembered
    }
    replaceParams((params) => params.set("view", next))
    trackEvent("overview_view_changed", { view: next, from: view })
  }

  const openStatus = (status: DeviceStatusKey) => {
    if (status === "operational") return
    setFieldStatus(status)
    changeView("field")
  }

  const handleFilterChange = (filterVal: string) => {
    replaceParams((params) => {
      params.delete("network")
      params.delete("cohort_id")
      if (filterVal.startsWith("cohort:")) params.set("cohort_id", filterVal.replace("cohort:", ""))
      else if (filterVal.startsWith("network:")) params.set("network", filterVal.replace("network:", ""))
    }, "push")
  }

  const focusFleet = (kind: FleetKind, id: string) => {
    handleFilterChange(`${kind === "network" ? "network" : "cohort"}:${id}`)
  }

  const isEmptyState = isCurrentScope && isFiltered && summaryCount?.total_monitors === 0
  const showSkeleton = (loading && !counts) || !isCurrentScope

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto">
      {/* One status line every view shares */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Network status</h1>
            {health && <HealthBadge health={health} />}
          </div>
          {counts ? (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {counts.not_transmitting.toLocaleString()} of {counts.total.toLocaleString()} deployed devices are not transmitting (
                {offlinePct.toFixed(1)}%)
              </span>
              {isFiltered && <> in {scopeName}</>}
              {latestCheck && <> · Last check {format(parseISO(latestCheck.checked_at), "d MMM yyyy, HH:mm")}</>}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading the latest check…" : summaryError ? `Device counts for ${scopeName} didn't load.` : "No status checks yet."}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Warning from {warningAt}% of deployed devices not transmitting · Critical from 50%
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedFilterValue} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[220px] bg-card" aria-label="Fleet">
              <SelectValue placeholder="All fleets" />
            </SelectTrigger>
            <SelectContent className="max-h-[320px]">
              <SelectItem value="all">All fleets</SelectItem>
              {availableNetworks.length > 0 && (
                <SelectGroup>
                  <SelectLabel className="text-xs text-muted-foreground">Manufacturers</SelectLabel>
                  {availableNetworks.map((net) => (
                    <SelectItem key={net} value={`network:${net}`}>
                      {getNetworkDisplayName(net)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
              {availableCohorts.length > 0 && (
                <>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel className="text-xs text-muted-foreground">Cohorts</SelectLabel>
                    {availableCohorts.map((cohort) => {
                      const cid = cohort._id
                      if (!cid) return null
                      return (
                        <SelectItem key={cid} value={`cohort:${cid}`}>
                          {cohort.name || `Cohort (${cid.slice(-6)})`}
                        </SelectItem>
                      )
                    })}
                  </SelectGroup>
                </>
              )}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={refresh} disabled={loading}>
            <AqRefreshCw01 className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </div>

      <RoleSwitch value={view} onChange={changeView} />

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Network status didn&apos;t load</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showSkeleton ? (
        <div className="space-y-6" aria-busy="true" aria-label="Loading network status">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-xl bg-muted" />
        </div>
      ) : isEmptyState ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <AqWifiOff className="mb-4 h-12 w-12 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-foreground">No deployed devices in {scopeName}</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Pick another fleet, or All fleets, to see the network&apos;s status.
          </p>
        </div>
      ) : (
        <>
          {view === "operations" && counts && (
            <OperationsView
              counts={counts}
              dayOverDay={dayOverDay}
              fleets={isFiltered ? [] : manufacturerFleets}
              recentIncidents={recentAlerts}
              days={days}
              period={period}
              warningAt={warningAt}
              onOpenStatus={openStatus}
              onOpenView={changeView}
            />
          )}
          {view === "field" && counts && (
            <FieldView
              counts={counts}
              status={fieldStatus}
              onStatusChange={setFieldStatus}
              filter={selectedCohortId ? { cohort_id: selectedCohortId } : selectedNetwork ? { network: selectedNetwork } : undefined}
              scopeName={scopeName}
              networkName={getNetworkDisplayName}
              refreshToken={refreshToken}
            />
          )}
          {view === "reporting" && (
            <ReportingView
              period={period}
              days={days}
              deployed={counts?.total ?? null}
              manufacturers={isFiltered ? 0 : breakdownData.length}
              summary={summaryText}
              warningAt={warningAt}
            />
          )}
          {view === "hardware" && (
            <HardwareView
              kind={comparisonMode}
              onKindChange={setComparisonMode}
              fleets={comparisonMode === "network" ? manufacturerFleets : cohortFleets}
              trends={trends}
              warningAt={warningAt}
              onFocus={focusFleet}
            />
          )}
          {!counts && (view === "operations" || view === "field") && !loading && (
            <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
              There&apos;s no status check to show yet. Try Refresh in a few minutes.
            </p>
          )}
        </>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingState text="Loading network status..." className="min-h-[50vh]" />}>
      <DashboardContent />
    </Suspense>
  )
}
