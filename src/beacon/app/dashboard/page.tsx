"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useGroup } from "@/lib/group-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/ui/loading-state"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Wifi, 
  WifiOff, 
  SlidersHorizontal,
  ServerCrash
} from "lucide-react"
import {
  AqSignal01,
  AqCheckCircle,
  AqAlertTriangle,
  AqServer03,
  AqLayersThree01,
  AqRefreshCw01,
} from "@airqo/icons-react"
import { SummaryCard } from "@/components/dashboard/summary-card"
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts"
import { format, parseISO } from "date-fns"
import { networkStatusService, NetworkStatusAlert, NetworkStatistics, HourlyTrend, UptimeSummaryItem, NetworkBreakdownItem, CohortBreakdownItem, DeviceSummaryCountResponse } from "@/services/network-status.service"
import { airQloudService, Cohort } from "@/services/airqloud.service"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

const getNetworkDisplayName = (networkVal: string): string => {
  const mapping: Record<string, string> = {
    airqo: "AirQo",
    airgradient: "AirGradient",
    kcca: "KCCA",
    metone: "MetOne",
    iqair: "IQAir"
  };
  return mapping[networkVal.toLowerCase()] || networkVal.charAt(0).toUpperCase() + networkVal.slice(1);
}

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedNetwork = searchParams ? searchParams.get("network") : null
  const selectedCohortId = searchParams ? searchParams.get("cohort_id") : null
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison'>('overview')
  const [comparisonMode, setComparisonMode] = useState<'network' | 'cohort'>('network')
  const { activeGroup, availableGroups, loading: groupsLoading } = useGroup()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [stats, setStats] = useState<NetworkStatistics | null>(null)
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

  useEffect(() => {
    if (!groupsLoading) {
      const hasAirqoAdmin = availableGroups.some(g => {
        if (g.grp_title?.toLowerCase() === 'airqo') {
          const roleName = g.role?.role_name?.toLowerCase() || ''
          return roleName.includes('admin') || roleName === 'super' || roleName === 'net admin'
        }
        return false
      })

      if (!hasAirqoAdmin) {
        router.replace('/dashboard/devices')
      } else {
        setIsAuthorized(true)
      }
    }
  }, [availableGroups, groupsLoading, router])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const currentEndDate = new Date().toISOString()
      const currentStartDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
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
        networkStatusService.getUptimeSummary(14, activeFilter).catch(e => { console.error(e); return { success: false, error: e }; }),
        networkStatusService.getRecentAlerts(48, activeFilter).catch(e => { console.error(e); return { success: false, error: e }; }),
        networkStatusService.getAlerts({ limit: 200, start_date: currentStartDate, end_date: currentEndDate, ...(activeFilter || {}) }).catch(e => { console.error(e); return { success: false, error: e }; }),
        networkStatusService.getNetworkBreakdown(baseParams).catch(e => { console.error(e); return { success: false, error: e }; }),
        networkStatusService.getCohortBreakdown(baseParams).catch(e => { console.error(e); return { success: false, error: e }; }),
        activeFilter ? networkStatusService.getDeviceSummaryCount(activeFilter).catch(e => { console.error(e); return { success: false, error: e }; }) : Promise.resolve(null),
        airQloudService.getCohorts({ limit: 100, group: activeGroup || 'airqo' }).catch(e => { console.error(e); return null; })
      ])

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
        const sortedTrends = [...trendsRes.trends].sort((a, b) => a._id.hour - b._id.hour)
        setTrends(sortedTrends)
      } else {
        setTrends([])
      }

      if (uptimeRes && 'summary' in uptimeRes && uptimeRes.summary) {
        const hasNulls = uptimeRes.summary.some(
          (item: any) => item.avgOfflinePercentage === null
        )

        if (hasNulls && rawAlerts.length > 0) {
          const aggregatedUptime = aggregateUptimeFromAlerts(rawAlerts)
          setUptime(aggregatedUptime)
        } else {
          setUptime(uptimeRes.summary.reverse())
        }
      } else {
        if (rawAlerts.length > 0) {
          setUptime(aggregateUptimeFromAlerts(rawAlerts))
        } else {
          setUptime([])
        }
      }

      if (recentRes && 'alerts' in recentRes && recentRes.alerts) {
        if (recentRes.alerts.length === 0 && rawAlerts.length > 0) {
          const localIncidents = rawAlerts.filter(alert => alert.threshold_exceeded).slice(0, 10)
          setRecentAlerts(localIncidents)
        } else {
          setRecentAlerts(recentRes.alerts)
        }
      } else {
        if (rawAlerts.length > 0) {
          setRecentAlerts(rawAlerts.filter(alert => alert.threshold_exceeded).slice(0, 10))
        } else {
          setRecentAlerts([])
        }
      }

      if (breakdownRes && 'data' in breakdownRes && breakdownRes.data) {
        setBreakdownData(breakdownRes.data)
        const networks = breakdownRes.data.map((item: any) => item._id)
        setAvailableNetworks(networks)
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
        throw new Error("Unable to retrieve network data. Please verify your connection to staging.");
      }

    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to load network status data. Please verify your connection to staging.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNetwork, selectedCohortId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-900'
      case 'WARNING':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900'
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OK':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'WARNING':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case 'CRITICAL':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-slate-500" />
    }
  }

  // Common color scheme for uptime:
  // >= 75%: Green
  // >= 50% && < 75%: Orange/Amber
  // < 50%: Red
  const getUptimeColorClass = (value: number) => {
    if (value >= 75) return "text-green-600 dark:text-green-400"
    if (value >= 50) return "text-orange-500 dark:text-orange-400"
    return "text-red-600 dark:text-red-400"
  }

  const getUptimeBorderClass = (value: number) => {
    if (value >= 75) return "border-l-green-500"
    if (value >= 50) return "border-l-orange-500"
    return "border-l-red-500"
  }

  const getUptimeHexColor = (value: number) => {
    if (value >= 75) return "#22C55E" // bg-green-500
    if (value >= 50) return "#F97316" // bg-orange-500
    return "#EF4444" // bg-red-500
  }

  // Format hour (e.g. 14 -> 2 PM)
  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const formattedHour = hour % 12 || 12
    return `${formattedHour} ${ampm}`
  }

  // Latest check info
  const latestCheck = allAlerts[0]

  const isFiltered = Boolean(selectedNetwork || selectedCohortId);

  const getSelectedFilterValue = (): string => {
    if (selectedCohortId) return `cohort:${selectedCohortId}`
    if (selectedNetwork) return `network:${selectedNetwork}`
    return "all"
  }

  const getCohortDisplayName = (cohortId: string): string => {
    const found = availableCohorts.find(c => c._id === cohortId) || cohortBreakdownData.find(c => c._id === cohortId);
    if (found?.name) return found.name;
    return `Cohort (${cohortId.slice(-6)})`;
  }

  const getItemName = (item: NetworkBreakdownItem | CohortBreakdownItem): string => {
    if (comparisonMode === 'network') {
      return getNetworkDisplayName(item._id);
    }
    const cohortItem = item as CohortBreakdownItem;
    return cohortItem.name || getCohortDisplayName(item._id);
  }

  const getActiveFilterName = (): string => {
    if (selectedCohortId) {
      return getCohortDisplayName(selectedCohortId);
    }
    if (selectedNetwork) {
      return getNetworkDisplayName(selectedNetwork);
    }
    return "All Fleets";
  }

  const getActiveStatusData = () => {
    if (isFiltered && summaryCount) {
      const pct = summaryCount.total_monitors > 0 
        ? (summaryCount.not_transmitting / summaryCount.total_monitors) * 100 
        : 0;
      const status = pct >= 35 ? 'CRITICAL' : pct >= 20 ? 'WARNING' : 'OK';
      return {
        status,
        onlinePercentage: 100 - pct,
        offlinePercentage: pct,
        message: `${getActiveFilterName()} status ${status}. Operational: ${summaryCount.operational}, Transmitting: ${summaryCount.transmitting}, Data Available: ${summaryCount.data_available}, Not Transmitting: ${summaryCount.not_transmitting}/${summaryCount.total_monitors} (${pct.toFixed(1)}%)`,
        total_deployed_devices: summaryCount.total_monitors,
        not_transmitting_devices_count: summaryCount.not_transmitting,
        operational_count: summaryCount.operational
      };
    } else if (latestCheck) {
      return {
        status: latestCheck.status,
        onlinePercentage: 100 - latestCheck.not_transmitting_percentage,
        offlinePercentage: latestCheck.not_transmitting_percentage,
        message: latestCheck.message,
        total_deployed_devices: latestCheck.total_deployed_devices,
        not_transmitting_devices_count: latestCheck.not_transmitting_devices_count,
        operational_count: latestCheck.operational_count
      };
    }
    return null;
  }

  const activeStatus = getActiveStatusData();

  const activeWarningCount = isFiltered 
    ? allAlerts.filter(a => a.status === 'WARNING').length 
    : (stats?.warningCount ?? 0)

  const activeCriticalCount = isFiltered 
    ? allAlerts.filter(a => a.status === 'CRITICAL').length 
    : (stats?.criticalCount ?? 0)

  const activeOperational = isFiltered && summaryCount
    ? summaryCount.operational
    : (stats ? Math.round(stats.avg_operational_count) : 0)

  const activeTransmitting = isFiltered && summaryCount
    ? summaryCount.transmitting
    : (stats ? Math.round(stats.avg_transmitting_count) : 0)

  const activeDataAvailable = isFiltered && summaryCount
    ? summaryCount.data_available
    : (stats ? Math.round(stats.avg_data_available_count) : 0)

  const isEmptyState = isFiltered && summaryCount?.total_monitors === 0;

  // Map uptime to online trends
  const uptimeChartData = uptime.map(item => ({
    ...item,
    avgOnlinePercentage: 100 - (item.avgOfflinePercentage ?? 0),
    minOnlinePercentage: 100 - (item.maxOfflinePercentage ?? 0),
  }))

  // Map trends to online hourly data
  const trendsChartData = trends.map(item => ({
    ...item,
    avgOnlinePercentage: 100 - (item.avg_not_transmitting_percentage ?? 0),
  }))

  if (groupsLoading || isAuthorized === null) {
    return <LoadingState text="Checking authorization..." className="min-h-[50vh]" />
  }

  const handleFilterChange = (filterVal: string) => {
    const params = new URLSearchParams(window.location.search)
    if (filterVal === "all") {
      params.delete("network")
      params.delete("cohort_id")
    } else if (filterVal.startsWith("cohort:")) {
      params.delete("network")
      params.set("cohort_id", filterVal.replace("cohort:", ""))
    } else if (filterVal.startsWith("network:")) {
      params.delete("cohort_id")
      params.set("network", filterVal.replace("network:", ""))
    } else {
      params.delete("cohort_id")
      params.set("network", filterVal)
    }
    const qs = params.toString()
    router.push(qs ? `${window.location.pathname}?${qs}` : window.location.pathname)
  }

  const handleViewDetails = (netId: string) => {
    handleFilterChange(`network:${netId}`);
    setActiveTab('overview');
  }

  const handleViewCohortDetails = (cohortId: string) => {
    handleFilterChange(`cohort:${cohortId}`);
    setActiveTab('overview');
  }

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {activeTab === 'overview' ? 'Network Status Monitor' : 'Manufacturer Status Comparison'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {activeTab === 'overview' 
              ? (selectedNetwork 
                  ? `Showing status and trends for ${getNetworkDisplayName(selectedNetwork)} manufacturer fleet` 
                  : "Real-time status tracking for the AirQo device transmission network")
              : "Compare real-time status and transmission rates across all sensor manufacturers and device fleets"}
          </p>
        </div>
        
        {/* Tab Selection */}
        <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800 flex gap-1 shadow-sm">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('overview')}
            className={`rounded-lg text-xs font-semibold px-4 py-2 transition-all ${
              activeTab === 'overview' 
                ? 'shadow-sm bg-white text-slate-800 hover:bg-white dark:bg-slate-800 dark:text-white font-bold' 
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Network Overview
          </Button>
          <Button
            variant={activeTab === 'comparison' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('comparison')}
            className={`rounded-lg text-xs font-semibold px-4 py-2 transition-all ${
              activeTab === 'comparison' 
                ? 'shadow-sm bg-white text-slate-800 hover:bg-white dark:bg-slate-800 dark:text-white font-bold' 
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Manufacturer Comparison
          </Button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Overview controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fleet Filter:</span>
              <Select value={getSelectedFilterValue()} onValueChange={(val) => handleFilterChange(val)}>
                <SelectTrigger className="w-[220px] bg-white dark:bg-slate-950 border-slate-200 text-xs font-semibold rounded-lg shadow-sm">
                  <SelectValue placeholder="All Fleets" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs rounded-lg max-h-[320px]">
                  <SelectItem value="all" className="font-semibold text-slate-700">All Fleets (Combined)</SelectItem>
                  
                  <SelectGroup>
                    <SelectLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">Manufacturers</SelectLabel>
                    {availableNetworks.map((net) => (
                      <SelectItem key={net} value={`network:${net}`} className="text-slate-600">
                        {getNetworkDisplayName(net)}
                      </SelectItem>
                    ))}
                  </SelectGroup>

                  {availableCohorts.length > 0 && (
                    <>
                      <SelectSeparator />
                      <SelectGroup>
                        <SelectLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">Cohorts</SelectLabel>
                        {availableCohorts.map((cohort) => {
                          const cid = cohort._id;
                          if (!cid) return null;
                          return (
                            <SelectItem key={cid} value={`cohort:${cid}`} className="text-slate-600">
                              {cohort.name || `Cohort (${cid.slice(-6)})`}
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    </>
                  )}
                </SelectContent>
              </Select>
              
              <TooltipProvider>
                <UiTooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                      <Clock className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-800 text-white border-0 text-[11px] p-2 max-w-[220px] rounded-lg">
                    Filters the entire dashboard by device manufacturer or cohort. Tooltips &amp; metrics adapt dynamically.
                  </TooltipContent>
                </UiTooltip>
              </TooltipProvider>

              {isFiltered && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {getActiveFilterName()} Selected
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 sm:flex-initial flex items-center gap-2 border-slate-200 shadow-sm hover:bg-slate-50 text-xs font-medium rounded-lg"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
                    Network Legend
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-white dark:bg-slate-950 border dark:border-slate-800 rounded-xl shadow-lg">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                      <Activity className="h-5 w-5 text-blue-500" /> Network Legend
                    </DialogTitle>
                    <DialogDescription>
                      Device classification parameters &amp; categories
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 pt-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Classification Criteria</h4>
                      <p className="text-[10px] text-muted-foreground mb-3 leading-relaxed">
                        Devices are classified by evaluating two distinct transmission conditions:
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-[10px]">isOnline (Feed)</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            Measures <strong>feed freshness</strong>. Fresh if last active timestamp is <strong>&le; 5 hours</strong>.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-xl">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Wifi className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-[10px]">rawOnlineStatus (Tx)</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            Measures <strong>active connection</strong>. Active if device transmitted data <strong>&le; 2 hours</strong> ago.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Category Mapping Matrix</h4>
                      <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800">
                        <table className="w-full text-left border-collapse text-[10px]">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-bold">
                              <th className="py-2 px-2.5">Category</th>
                              <th className="py-2 px-2 text-center">Feed (≤5h)</th>
                              <th className="py-2 px-2 text-center">Tx (≤2h)</th>
                              <th className="py-2 px-2.5">Time Criteria</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                              <td className="py-2 px-2.5 font-bold text-green-700 dark:text-green-400">Operational</td>
                              <td className="py-2 px-2 text-center"><CheckCircle2 className="h-3.5 w-3.5 text-green-500 mx-auto" /></td>
                              <td className="py-2 px-2 text-center"><CheckCircle2 className="h-3.5 w-3.5 text-green-500 mx-auto" /></td>
                              <td className="py-2 px-2.5 text-slate-600 dark:text-slate-400 leading-snug">Feed fresh &amp; Active Tx</td>
                            </tr>
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                              <td className="py-2 px-2.5 font-bold text-blue-700 dark:text-blue-400">Transmitting</td>
                              <td className="py-2 px-2 text-center"><XCircle className="h-3.5 w-3.5 text-red-400 mx-auto" /></td>
                              <td className="py-2 px-2 text-center"><CheckCircle2 className="h-3.5 w-3.5 text-green-500 mx-auto" /></td>
                              <td className="py-2 px-2.5 text-slate-600 dark:text-slate-400 leading-snug">Active Tx but feed is stale (&gt;5h)</td>
                            </tr>
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                              <td className="py-2 px-2.5 font-bold text-amber-700 dark:text-amber-400">Data Available</td>
                              <td className="py-2 px-2 text-center"><CheckCircle2 className="h-3.5 w-3.5 text-green-500 mx-auto" /></td>
                              <td className="py-2 px-2 text-center"><XCircle className="h-3.5 w-3.5 text-red-400 mx-auto" /></td>
                              <td className="py-2 px-2.5 text-slate-600 dark:text-slate-400 leading-snug">Feed fresh (≤5h) but no active Tx (&gt;2h)</td>
                            </tr>
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                              <td className="py-2 px-2.5 font-bold text-red-700 dark:text-red-400">Not Transmitting</td>
                              <td className="py-2 px-2 text-center"><XCircle className="h-3.5 w-3.5 text-red-500 mx-auto" /></td>
                              <td className="py-2 px-2 text-center"><XCircle className="h-3.5 w-3.5 text-red-500 mx-auto" /></td>
                              <td className="py-2 px-2.5 text-slate-600 dark:text-slate-400 leading-snug">Fully offline (stale feed &amp; no Tx)</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchData} 
                disabled={loading}
                className="flex-1 sm:flex-initial flex items-center gap-2 border-slate-200 shadow-sm hover:bg-slate-50 text-xs font-medium rounded-lg"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh Data'}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100 rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading && !activeStatus ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl border" />
              ))}
            </div>
          ) : (
            <>
              {/* KPI Dashboard Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status KPI Card */}
                <SummaryCard
                  title={`Current Status ${selectedNetwork ? `(${getNetworkDisplayName(selectedNetwork)})` : "(Combined)"}`}
                  value={activeStatus ? activeStatus.status : "No Data"}
                  icon={activeStatus?.status === "OK" ? AqCheckCircle : AqAlertTriangle}
                  iconVariant={
                    activeStatus?.status === "OK"
                      ? "emerald"
                      : activeStatus?.status === "WARNING"
                      ? "amber"
                      : "rose"
                  }
                  secondaryLabel="online rate"
                  secondaryValue={activeStatus ? `${activeStatus.onlinePercentage.toFixed(1)}%` : "--"}
                  progressPercentage={activeStatus ? activeStatus.onlinePercentage : 0}
                  progressVariant={
                    activeStatus?.status === "OK"
                      ? "emerald"
                      : activeStatus?.status === "WARNING"
                      ? "amber"
                      : "rose"
                  }
                  badge={
                    summaryError
                      ? {
                          text: "API Error",
                          variant: "destructive",
                          className: "animate-pulse",
                        }
                      : undefined
                  }
                  subtext={
                    activeStatus
                      ? `${activeStatus.offlinePercentage.toFixed(1)}% offline (${activeStatus.not_transmitting_devices_count || 0}/${activeStatus.total_deployed_devices || 0} devices)`
                      : "No data loaded"
                  }
                />

                {/* Average Uptime KPI Card */}
                <SummaryCard
                  title={`Average Online Rate ${selectedNetwork ? `(${getNetworkDisplayName(selectedNetwork)})` : "(Combined)"}`}
                  value={stats ? `${(100 - stats.avg_not_transmitting_percentage).toFixed(1)}%` : "--"}
                  icon={AqSignal01}
                  iconVariant="blue"
                  secondaryLabel="min online"
                  secondaryValue={
                    stats ? `${(100 - stats.max_not_transmitting_percentage).toFixed(1)}%` : undefined
                  }
                  progressPercentage={stats ? 100 - stats.avg_not_transmitting_percentage : 0}
                  progressVariant="blue"
                  subtext={
                    stats
                      ? `Based on last ${stats.totalAlerts} checks (${stats.avg_not_transmitting_percentage.toFixed(1)}% avg offline)`
                      : "No statistics available"
                  }
                />

                {/* Warnings and critical events KPI Card */}
                <SummaryCard
                  title={`Incidents (14d) ${selectedNetwork ? `(${getNetworkDisplayName(selectedNetwork)})` : "(Combined)"}`}
                  value={activeWarningCount + activeCriticalCount}
                  icon={AqAlertTriangle}
                  iconVariant={
                    activeCriticalCount > 0
                      ? "rose"
                      : activeWarningCount > 0
                      ? "amber"
                      : "emerald"
                  }
                  secondaryLabel="critical events"
                  secondaryValue={`${activeCriticalCount}`}
                  subtext={`${activeWarningCount} warnings & ${activeCriticalCount} critical events recorded`}
                />

                {/* Active devices counts KPI Card */}
                <SummaryCard
                  title={`Active Fleet Count ${selectedNetwork ? `(${getNetworkDisplayName(selectedNetwork)})` : "(Combined)"}`}
                  value={activeOperational}
                  icon={AqServer03}
                  iconVariant="primary"
                  secondaryLabel="tx feed"
                  secondaryValue={`${activeTransmitting}`}
                  subtext={`Feed Tx: ${activeTransmitting} · Stale Tx: ${activeDataAvailable}`}
                />
              </div>

              {isEmptyState ? (
                <Card className="p-8 text-center border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[350px] rounded-2xl bg-white dark:bg-slate-950">
                  <WifiOff className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-4 stroke-[1.5] animate-pulse" />
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No data available for this network</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-2 leading-relaxed">
                    There are currently no active or deployed devices registered under the <span className="font-bold text-slate-700 dark:text-slate-300">{getNetworkDisplayName(selectedNetwork || '')}</span> network.
                  </p>
                </Card>
              ) : (
                <>
                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Uptime Line Chart */}
                    <Card className="hover:shadow-md transition-all duration-200 rounded-xl">
                      <CardHeader>
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-500" /> Uptime Trend {selectedNetwork ? `(${getNetworkDisplayName(selectedNetwork)})` : '(Combined)'}
                        </CardTitle>
                        <CardDescription>Daily average and minimum device online rates over the last 14 days</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80 w-full min-w-0">
                          {uptimeChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                              <LineChart data={uptimeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <XAxis 
                                  dataKey="_id" 
                                  tickFormatter={(tick) => format(parseISO(tick), "MMM dd")}
                                  tick={{ fontSize: 10 }}
                                />
                                <YAxis tick={{ fontSize: 10 }} unit="%" domain={[0, 100]} />
                                <Tooltip 
                                  labelFormatter={(label) => format(parseISO(label), "MMMM dd, yyyy")}
                                  formatter={(value: any, name: any, props: any) => {
                                    const val = parseFloat(value).toFixed(1)
                                    const item = props.payload
                                    if (name === 'Average Online') {
                                      const offlineVal = parseFloat(item.avgOfflinePercentage).toFixed(1)
                                      return [`${val}% (${offlineVal}% offline)`, 'Average Online']
                                    }
                                    if (name === 'Min Online') {
                                      const maxOfflineVal = parseFloat(item.maxOfflinePercentage).toFixed(1)
                                      return [`${val}% (${maxOfflineVal}% offline)`, 'Min Online']
                                    }
                                    return [`${val}%`, name]
                                  }}
                                />
                                <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                                <Line 
                                  type="monotone" 
                                  dataKey="avgOnlinePercentage" 
                                  name="Average Online"
                                  stroke="#2563EB" 
                                  strokeWidth={2}
                                  dot={{ r: 3 }}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="minOnlinePercentage" 
                                  name="Min Online"
                                  stroke="#EF4444" 
                                  strokeWidth={1}
                                  strokeDasharray="4 4"
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                              No historical uptime data available
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Hourly Trends Bar Chart */}
                    <Card className="hover:shadow-md transition-all duration-200 rounded-xl">
                      <CardHeader>
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                          <Clock className="h-4 w-4 text-indigo-500" /> Hourly Pattern {selectedNetwork ? `(${getNetworkDisplayName(selectedNetwork)})` : '(Combined)'}
                        </CardTitle>
                        <CardDescription>Average online percentage by hour of day (EAT)</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80 w-full min-w-0">
                          {trendsChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                              <BarChart data={trendsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <XAxis 
                                  dataKey="_id.hour" 
                                  tickFormatter={formatHour}
                                  tick={{ fontSize: 10 }}
                                />
                                <YAxis tick={{ fontSize: 10 }} unit="%" domain={[0, 100]} />
                                <Tooltip 
                                  labelFormatter={(label) => `Hour: ${formatHour(Number(label))}`}
                                  formatter={(value: any, name: any, props: any) => {
                                    const val = parseFloat(value).toFixed(1)
                                    const item = props.payload
                                    const offlineVal = parseFloat(item.avg_not_transmitting_percentage).toFixed(1)
                                    return [`${val}% (${offlineVal}% offline)`, 'Average Online']
                                  }}
                                />
                                <Bar 
                                  dataKey="avgOnlinePercentage" 
                                  radius={[4, 4, 0, 0]}
                                >
                                  {trendsChartData.map((entry, index) => (
                                    <Cell 
                                      key={`cell-${index}`} 
                                      fill={getUptimeHexColor(entry.avgOnlinePercentage)} 
                                    />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                              No hourly trend data available
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Lower Grid: Alert Feeds */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* Recent Incidents (Threshold Exceeded) */}
                    <Card className="lg:col-span-1 hover:shadow-md transition-all duration-200 rounded-xl">
                      <CardHeader>
                        <CardTitle className="text-base font-bold text-red-650 flex items-center gap-1.5">
                          <AlertCircle className="h-4 w-4 text-red-500" /> Recent Incidents {selectedNetwork ? `(${getNetworkDisplayName(selectedNetwork)})` : ''}
                        </CardTitle>
                        <CardDescription>Checks exceeding the 35% offline threshold</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                          {recentAlerts.length > 0 ? (
                            recentAlerts.map((alert) => (
                              <div 
                                key={alert._id} 
                                className="p-3 rounded-lg border bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 flex flex-col gap-1 hover:shadow-sm transition-all"
                              >
                                <div className="flex justify-between items-start">
                                  <Badge className={`${getStatusColor(alert.status)} text-xs border font-semibold rounded-md`}>
                                    {alert.status}
                                  </Badge>
                                  <span className="text-[10px] text-muted-foreground">
                                    {format(parseISO(alert.checked_at), "MMM dd, HH:mm")}
                                  </span>
                                </div>
                                <p className="text-xs font-bold text-slate-850 dark:text-slate-200 mt-1">
                                  {(100 - alert.not_transmitting_percentage).toFixed(1)}% Online ({alert.total_deployed_devices - alert.not_transmitting_devices_count}/{alert.total_deployed_devices} devices)
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                                  {alert.message} <span className="opacity-70 block mt-0.5">({alert.not_transmitting_percentage.toFixed(1)}% offline)</span>
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="py-8 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                              <CheckCircle2 className="h-8 w-8 text-green-500" />
                              No outages or warnings in the last 48 hours.
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Detailed Checks Log */}
                    <Card className="lg:col-span-2 hover:shadow-md transition-all duration-200 rounded-xl">
                      <CardHeader>
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                          <SlidersHorizontal className="h-4 w-4 text-slate-500" /> Historical Checks Log {selectedNetwork ? `(${getNetworkDisplayName(selectedNetwork)})` : ''}
                        </CardTitle>
                        <CardDescription>Latest 10 network checks executed in staging</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <th className="py-3 px-2">Time Checked</th>
                                <th className="py-3 px-2 text-center">Status</th>
                                <th className="py-3 px-2 text-center">Online % (Offline %)</th>
                                <th className="py-3 px-2 text-center">Operational</th>
                                <th className="py-3 px-2 text-center">Total Devices</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {allAlerts.length > 0 ? (
                                allAlerts.slice(0, 10).map((alert) => (
                                  <tr key={alert._id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                    <td className="py-3 px-2 font-medium text-slate-700 dark:text-slate-300">
                                      {format(parseISO(alert.checked_at), "MMM dd, yyyy HH:mm")}
                                    </td>
                                    <td className="py-3 px-2 text-center">
                                      <Badge className={`${getStatusColor(alert.status)} text-[10px] font-bold rounded-md`}>
                                        {alert.status}
                                      </Badge>
                                    </td>
                                    <td className="py-3 px-2 text-center">
                                      <span className={`font-bold ${getUptimeColorClass(100 - alert.not_transmitting_percentage)}`}>
                                        {(100 - alert.not_transmitting_percentage).toFixed(1)}%
                                      </span>
                                      <span className="text-[10px] font-semibold ml-1.5 text-slate-400">
                                        ({alert.not_transmitting_percentage.toFixed(1)}%)
                                      </span>
                                    </td>
                                    <td className="py-3 px-2 text-center text-slate-600 dark:text-slate-400">
                                      {alert.operational_count || 0}
                                    </td>
                                    <td className="py-3 px-2 text-center text-slate-600 dark:text-slate-400">
                                      {alert.total_deployed_devices}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={5} className="py-8 text-center text-slate-400">
                                    No checks recorded yet
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>

                  </div>
                </>
              )}
            </>
          )}
        </>
      ) : (
        /* Comparison Tab */
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* Comparison View Mode Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Comparison Breakdown Mode</h3>
              <p className="text-xs text-muted-foreground">Switch between manufacturer network comparison and individual cohort breakdown comparison</p>
            </div>
            <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-xl flex gap-1 shadow-sm">
              <Button
                variant={comparisonMode === 'network' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setComparisonMode('network')}
                className={`rounded-lg text-xs font-semibold px-4 py-1.5 transition-all ${
                  comparisonMode === 'network' 
                    ? 'shadow-sm bg-white text-slate-800 hover:bg-white dark:bg-slate-950 dark:text-white font-bold' 
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                Manufacturer Breakdown
              </Button>
              <Button
                variant={comparisonMode === 'cohort' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setComparisonMode('cohort')}
                className={`rounded-lg text-xs font-semibold px-4 py-1.5 transition-all ${
                  comparisonMode === 'cohort' 
                    ? 'shadow-sm bg-white text-slate-800 hover:bg-white dark:bg-slate-950 dark:text-white font-bold' 
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                Cohort Breakdown
              </Button>
            </div>
          </div>

          {/* Comparison KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              title={comparisonMode === "network" ? "Monitored Fleets" : "Monitored Cohorts"}
              value={comparisonMode === "network" ? breakdownData.length : cohortBreakdownData.length}
              icon={AqLayersThree01}
              iconVariant="primary"
              subtext={
                comparisonMode === "network"
                  ? "Active manufacturer fleets"
                  : "Active device cohorts in staging"
              }
            />

            <SummaryCard
              title="Total Deployed"
              value={
                comparisonMode === "network"
                  ? Math.round(
                      breakdownData.reduce((sum, item) => sum + item.avg_total_monitors, 0)
                    )
                  : Math.round(
                      cohortBreakdownData.reduce((sum, item) => sum + item.avg_total_monitors, 0)
                    )
              }
              icon={AqServer03}
              iconVariant="blue"
              subtext="Total devices active across monitored groups"
            />

            {(() => {
              const data = comparisonMode === "network" ? breakdownData : cohortBreakdownData
              if (data.length > 0) {
                const sorted = [...data].sort(
                  (a, b) => a.avg_not_transmitting_percentage - b.avg_not_transmitting_percentage
                )
                const best = sorted[0]
                const name = getItemName(best)
                return (
                  <SummaryCard
                    title="Best Performing"
                    value={`${(100 - best.avg_not_transmitting_percentage).toFixed(1)}%`}
                    icon={AqCheckCircle}
                    iconVariant="emerald"
                    secondaryLabel="fleet"
                    secondaryValue={name}
                    progressPercentage={100 - best.avg_not_transmitting_percentage}
                    progressVariant="emerald"
                    subtext="Highest average online transmission rate"
                  />
                )
              }
              return (
                <SummaryCard
                  title="Best Performing"
                  value="N/A"
                  icon={AqCheckCircle}
                  iconVariant="emerald"
                  subtext="No comparison data available"
                />
              )
            })()}

            {(() => {
              const data = comparisonMode === "network" ? breakdownData : cohortBreakdownData
              if (data.length > 0) {
                const sorted = [...data].sort(
                  (a, b) => b.avg_not_transmitting_percentage - a.avg_not_transmitting_percentage
                )
                const worst = sorted[0]
                const name = getItemName(worst)
                return (
                  <SummaryCard
                    title="Needs Attention"
                    value={`${(100 - worst.avg_not_transmitting_percentage).toFixed(1)}%`}
                    icon={AqAlertTriangle}
                    iconVariant="rose"
                    secondaryLabel="fleet"
                    secondaryValue={name}
                    progressPercentage={100 - worst.avg_not_transmitting_percentage}
                    progressVariant="rose"
                    subtext="Lowest average online transmission rate"
                  />
                )
              }
              return (
                <SummaryCard
                  title="Needs Attention"
                  value="N/A"
                  icon={AqAlertTriangle}
                  iconVariant="rose"
                  subtext="No comparison data available"
                />
              )
            })()}
          </div>

          {/* Comparison Content Grid */}
          <div className="grid grid-cols-1 gap-6">
            
            {/* Offline percentage comparison bar chart */}
            <Card className="hover:shadow-md transition-all duration-200 rounded-xl border border-slate-200/50 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  {comparisonMode === 'network' ? 'Manufacturer Offline Rate Comparison' : 'Cohort Offline Rate Comparison'}
                </CardTitle>
                <CardDescription>
                  Average not-transmitting percentage over last 14 days (lower is better, threshold warning at 35%)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full min-w-0">
                  {((comparisonMode === 'network' ? breakdownData : cohortBreakdownData).length > 0) ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <BarChart 
                        data={(comparisonMode === 'network' ? breakdownData : cohortBreakdownData).map(item => ({
                          name: getItemName(item),
                          avgOfflinePercentage: item.avg_not_transmitting_percentage,
                          avgOnlinePercentage: 100 - item.avg_not_transmitting_percentage,
                          totalMonitors: item.avg_total_monitors
                        }))} 
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} unit="%" domain={[0, 100]} />
                        <Tooltip 
                          formatter={(value: any, name: any, props: any) => {
                            const item = props.payload;
                            return [
                              `${parseFloat(value).toFixed(1)}% (${item.avgOnlinePercentage.toFixed(1)}% online, ${Math.round(item.totalMonitors)} dev)`,
                              'Avg Offline'
                            ]
                          }}
                        />
                        <Bar dataKey="avgOfflinePercentage" radius={[4, 4, 0, 0]}>
                          {(comparisonMode === 'network' ? breakdownData : cohortBreakdownData).map((entry, index) => {
                            const val = entry.avg_not_transmitting_percentage;
                            const color = val >= 35 ? "#EF4444" : val >= 20 ? "#F97316" : "#22C55E";
                            return <Cell key={`cell-${index}`} fill={color} />
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                      No comparison data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Detailed side-by-side comparison table */}
            <Card className="hover:shadow-md transition-all duration-200 rounded-xl border border-slate-200/50 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-slate-500" /> Side-by-Side Fleet Metrics
                </CardTitle>
                <CardDescription>Comparative breakdown of average transmission parameters and historical ranges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-850 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-2">{comparisonMode === 'network' ? 'Manufacturer' : 'Cohort'}</th>
                        <th className="py-3 px-2 text-center">Avg Fleet Size</th>
                        <th className="py-3 px-2 text-center">Avg Online Rate</th>
                        <th className="py-3 px-2 text-center">Avg Offline Rate</th>
                        <th className="py-3 px-2 text-center">Uptime Range (Min-Max)</th>
                        <th className="py-3 px-2 text-center">Status</th>
                        <th className="py-3 px-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(comparisonMode === 'network' ? breakdownData : cohortBreakdownData).map((item) => {
                        const displayName = getItemName(item);
                        const onlineRate = 100 - item.avg_not_transmitting_percentage;
                        const minOnline = 100 - item.max_not_transmitting_percentage;
                        const maxOnline = 100 - item.min_not_transmitting_percentage;
                        const status = item.avg_not_transmitting_percentage >= 35 ? 'CRITICAL' : item.avg_not_transmitting_percentage >= 20 ? 'WARNING' : 'OK';
                        
                        return (
                          <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                            <td className="py-3 px-2 font-extrabold text-slate-700 dark:text-slate-200">
                              {displayName}
                            </td>
                            <td className="py-3 px-2 text-center text-slate-600 dark:text-slate-400">
                              {Math.round(item.avg_total_monitors)} devices
                            </td>
                            <td className="py-3 px-2 text-center font-bold text-slate-700 dark:text-slate-300">
                              {onlineRate.toFixed(1)}%
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className={`font-bold ${getUptimeColorClass(onlineRate)}`}>
                                {item.avg_not_transmitting_percentage.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-3 px-2 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                              {minOnline.toFixed(1)}% – {maxOnline.toFixed(1)}%
                            </td>
                            <td className="py-3 px-2 text-center">
                              <Badge className={`${getStatusColor(status)} text-[10px] font-bold rounded-md px-2 py-0.5`}>
                                {status}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50/50 hover:text-blue-700 dark:border-blue-900 dark:hover:bg-blue-950/20 rounded-md h-7 px-2.5"
                                onClick={() => comparisonMode === 'network' ? handleViewDetails(item._id) : handleViewCohortDetails(item._id)}
                              >
                                View Details
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingState text="Loading status dashboard..." className="min-h-[50vh]" />}>
      <DashboardContent />
    </Suspense>
  )
}