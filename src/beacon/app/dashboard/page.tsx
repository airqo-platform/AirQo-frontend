"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { networkStatusService, NetworkStatusAlert, NetworkStatistics, HourlyTrend, UptimeSummaryItem } from "@/services/network-status.service"

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

export default function DashboardPage() {
  const [stats, setStats] = useState<NetworkStatistics | null>(null)
  const [trends, setTrends] = useState<HourlyTrend[]>([])
  const [uptime, setUptime] = useState<UptimeSummaryItem[]>([])
  const [recentAlerts, setRecentAlerts] = useState<NetworkStatusAlert[]>([])
  const [allAlerts, setAllAlerts] = useState<NetworkStatusAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Compute date range (last 14 days)
  const endDate = new Date().toISOString()
  const startDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { start_date: startDate, end_date: endDate }
      const [statsRes, trendsRes, uptimeRes, recentRes, allRes] = await Promise.all([
        networkStatusService.getStatistics(params),
        networkStatusService.getHourlyTrends(params),
        networkStatusService.getUptimeSummary(14),
        networkStatusService.getRecentAlerts(48), // Past 48 hours for critical list
        networkStatusService.getAlerts({ limit: 200 }) // Load more alerts for client-side aggregation fallback
      ])

      let rawAlerts: NetworkStatusAlert[] = []
      if (allRes.success) {
        rawAlerts = allRes.alerts
        setAllAlerts(rawAlerts)
      }

      if (statsRes.success && statsRes.statistics.length > 0) {
        setStats(statsRes.statistics[0])
      }
      if (trendsRes.success) {
        const sortedTrends = [...trendsRes.trends].sort((a, b) => a._id.hour - b._id.hour)
        setTrends(sortedTrends)
      }
      if (uptimeRes.success) {
        // Fallback: If staging database aggregation returns null values for average rates,
        // compute daily uptime statistics client-side from the raw alerts list.
        const hasNulls = uptimeRes.summary.some(
          (item: any) => item.avgOfflinePercentage === null
        )

        if (hasNulls && rawAlerts.length > 0) {
          const aggregatedUptime = aggregateUptimeFromAlerts(rawAlerts)
          setUptime(aggregatedUptime)
        } else {
          setUptime(uptimeRes.summary.reverse()) // Order from oldest to newest for chart
        }
      }
      if (recentRes.success) {
        if (recentRes.alerts.length === 0 && rawAlerts.length > 0) {
          // Fallback: If no recent alerts returned by staging (due to lack of recent checks in past 48h),
          // filter the loaded raw alerts list client-side to show recent threshold-exceeded incidents.
          const localIncidents = rawAlerts.filter(alert => alert.threshold_exceeded).slice(0, 10)
          setRecentAlerts(localIncidents)
        } else {
          setRecentAlerts(recentRes.alerts)
        }
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
  }, [])

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

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Network Status Monitor
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time status tracking for the AirQo device transmission network
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 border-slate-200 shadow-sm hover:bg-slate-50"
              >
                <SlidersHorizontal className="h-4 w-4 text-slate-500" />
                Network Legend
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white dark:bg-slate-950 border dark:border-slate-800">
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
                  <p className="text-xxs text-muted-foreground mb-3 leading-relaxed">
                    Devices are classified by evaluating two distinct transmission conditions:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xxs">isOnline (Feed)</span>
                      </div>
                      <p className="text-xxs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Measures <strong>feed freshness</strong>. Fresh if last active timestamp is <strong>&le; 5 hours</strong>.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-xl">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Wifi className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xxs">rawOnlineStatus (Tx)</span>
                      </div>
                      <p className="text-xxs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Measures <strong>active connection</strong>. Active if device transmitted data <strong>&le; 2 hours</strong> ago.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Category Mapping Matrix</h4>
                  <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800">
                    <table className="w-full text-left border-collapse text-xxs">
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
            className="flex items-center gap-2 border-slate-200 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && !latestCheck ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl border" />
          ))}
        </div>
      ) : (
        <>
          {/* KPI Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Status KPI Card */}
            <Card className={`hover:shadow-md transition-shadow duration-200 border-l-4 ${latestCheck ? getUptimeBorderClass(100 - latestCheck.not_transmitting_percentage) : 'border-l-blue-500'}`}>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Current Status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {latestCheck ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(latestCheck.status)}
                      <span className="text-xl font-bold">{latestCheck.status}</span>
                    </div>
                    <div className={`text-2xl font-black ${getUptimeColorClass(100 - latestCheck.not_transmitting_percentage)}`}>
                      {(100 - latestCheck.not_transmitting_percentage).toFixed(1)}% <span className="text-xs font-normal text-muted-foreground text-slate-500">online</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {latestCheck.message} <span className="text-xxs opacity-70 block mt-1">({latestCheck.not_transmitting_percentage.toFixed(1)}% offline)</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No data loaded</p>
                )}
              </CardContent>
            </Card>

            {/* Average Online KPI Card */}
            <Card className={`hover:shadow-md transition-shadow duration-200 border-l-4 ${stats ? getUptimeBorderClass(100 - stats.avg_not_transmitting_percentage) : ''}`}>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Average Online Rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats ? (
                  <div className="space-y-1">
                    <div className={`text-3xl font-black flex items-baseline gap-1 ${getUptimeColorClass(100 - stats.avg_not_transmitting_percentage)}`}>
                      {(100 - stats.avg_not_transmitting_percentage).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      Min Online: <span className="font-semibold text-slate-700 dark:text-slate-300">{(100 - stats.max_not_transmitting_percentage).toFixed(1)}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Based on last {stats.totalAlerts} checks <span className="text-xxs opacity-70 block mt-0.5">({stats.avg_not_transmitting_percentage.toFixed(1)}% avg offline)</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No statistics available</p>
                )}
              </CardContent>
            </Card>

            {/* Warning & Critical Counts */}
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Incidents (14d)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 text-amber-500" /> Warnings
                      </span>
                      <Badge variant="outline" className="font-bold border-amber-200 text-amber-700 bg-amber-50">
                        {stats.warningCount}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <ServerCrash className="h-4 w-4 text-red-500" /> Critical Events
                      </span>
                      <Badge variant="outline" className="font-bold border-red-200 text-red-700 bg-red-50">
                        {stats.criticalCount}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No statistics available</p>
                )}
              </CardContent>
            </Card>

            {/* Avg Devices Counts */}
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Active Network Count
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats ? (
                  <div className="space-y-2">
                    <div className="text-3xl font-black text-slate-800 dark:text-slate-100 flex items-baseline gap-1">
                      {Math.round(stats.avg_operational_count)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Average operational devices transmitting live data
                    </div>
                    <div className="flex gap-2 text-xxs text-muted-foreground mt-2">
                      <span>Tx Feed: {Math.round(stats.avg_transmitting_count)}</span>
                      <span>·</span>
                      <span>Stale Tx: {Math.round(stats.avg_data_available_count)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No statistics available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Uptime Line Chart */}
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" /> Historical Uptime Trend (14 Days)
                </CardTitle>
                <CardDescription>Daily average and minimum device online rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  {uptimeChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
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
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-500" /> Hourly Uptime Pattern
                </CardTitle>
                <CardDescription>Average online percentage by hour of day (EAT)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  {trendsChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
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
            <Card className="lg:col-span-1 hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-base font-bold text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" /> Recent Incidents
                </CardTitle>
                <CardDescription>Checks exceeding the 35% offline threshold</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  {recentAlerts.length > 0 ? (
                    recentAlerts.map((alert) => (
                      <div 
                        key={alert._id} 
                        className="p-3 rounded-lg border bg-slate-50 dark:bg-slate-900 border-slate-100 flex flex-col gap-1"
                      >
                        <div className="flex justify-between items-start">
                          <Badge className={`${getStatusColor(alert.status)} text-xs border font-semibold`}>
                            {alert.status}
                          </Badge>
                          <span className="text-xxs text-muted-foreground">
                            {format(parseISO(alert.checked_at), "MMM dd, HH:mm")}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                          {(100 - alert.not_transmitting_percentage).toFixed(1)}% Online ({alert.total_deployed_devices - alert.not_transmitting_devices_count}/{alert.total_deployed_devices} devices)
                        </p>
                        <p className="text-xxs text-muted-foreground leading-relaxed mt-0.5">
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
            <Card className="lg:col-span-2 hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-slate-500" /> Historical Checks Log
                </CardTitle>
                <CardDescription>Latest 10 network checks executed in staging</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-2">Time Checked</th>
                        <th className="py-3 px-2 text-center">Status</th>
                        <th className="py-3 px-2 text-center">Online % (Offline %)</th>
                        <th className="py-3 px-2 text-center">Operational</th>
                        <th className="py-3 px-2 text-center">Total Devices</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allAlerts.length > 0 ? (
                        allAlerts.slice(0, 10).map((alert) => (
                          <tr key={alert._id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                            <td className="py-3 px-2 font-medium text-slate-700 dark:text-slate-300">
                              {format(parseISO(alert.checked_at), "MMM dd, yyyy HH:mm")}
                            </td>
                            <td className="py-3 px-2 text-center">
                              <Badge className={`${getStatusColor(alert.status)} text-xxs font-bold`}>
                                {alert.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className={`font-bold ${getUptimeColorClass(100 - alert.not_transmitting_percentage)}`}>
                                {(100 - alert.not_transmitting_percentage).toFixed(1)}%
                              </span>
                              <span className="text-xxs font-semibold ml-1.5 text-muted-foreground">
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
    </div>
  )
}