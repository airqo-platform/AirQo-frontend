"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  AlertTriangle,
  CheckCircle2,
  Cloud,
  CloudOff,
  Database,
  DownloadCloud,
  ExternalLink,
  Factory,
  Radio,
  RefreshCw,
  Rss,
  Stethoscope,
  Wand2,
  XCircle,
} from "lucide-react"
import { AqCpuChip01, AqMarkerPin01, AqServer03, AqSignal01 } from "@airqo/icons-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SummaryCard } from "@/components/dashboard/summary-card"
import { ManufacturerBadge } from "@/components/devices/manufacturer-badge"
import { useToast } from "@/hooks/use-toast"
import { useNavigationAccess } from "@/hooks/use-navigation-access"
import { MANUFACTURER_PROFILES_QUERY_KEY, NETWORKS_QUERY_KEY, useManufacturerProfiles, useNetworks } from "@/hooks/use-networks"
import { networkService } from "@/services/network.service"
import { formatNetworkLabel, normalizeNetwork } from "@/lib/manufacturers"
import { formatCategoryLabel } from "@/lib/utils"
import { ROUTES } from "@/lib/navigation"
import type { NetworkProfileReadiness, NetworkSummary } from "@/types/network.types"

const NO_NETWORKS: NetworkSummary[] = []
const NO_PROFILES: NetworkProfileReadiness[] = []

const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? error.message : fallback

/** Devices beacon cannot read at all: neither a ThingSpeak channel nor a manufacturer API. */
const noDataPathCount = (network: NetworkSummary): number =>
  Math.max(0, (network.total_devices ?? 0) - (network.thingspeak_devices ?? 0) - (network.external_api_devices ?? 0))

function ProfileReadinessCard({ profile }: Readonly<{ profile: NetworkProfileReadiness }>) {
  const transmission = new Set(profile.transmission_components ?? [])
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="py-3 px-4 border-b bg-gray-50/60">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-sm font-semibold font-mono text-gray-900 truncate" title={profile.name}>
              {profile.name}
            </CardTitle>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <ManufacturerBadge network={profile.network} />
              <Badge variant="outline" className="text-[11px] font-medium">
                {formatCategoryLabel(profile.category)}
              </Badge>
            </div>
          </div>
          {profile.diagnosable ? (
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 gap-1 shrink-0">
              <CheckCircle2 className="h-3 w-3" /> Diagnosable
            </Badge>
          ) : (
            <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200 gap-1 shrink-0">
              <XCircle className="h-3 w-3" /> Not diagnosable
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3 text-xs">
        <div>
          <p className="font-semibold text-gray-600 uppercase tracking-wider text-[10px] mb-1.5">
            Components ({profile.components.length})
          </p>
          {profile.components.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {profile.components.map((component) => (
                <span
                  key={component}
                  className={
                    transmission.has(component)
                      ? "px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[11px] font-mono text-blue-800"
                      : "px-2 py-0.5 rounded-md bg-slate-100 border text-[11px] font-mono text-gray-700"
                  }
                  title={transmission.has(component) ? "Delivers the data; gaps are attributed to it" : undefined}
                >
                  {component}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">No component model yet. Seed the manufacturer profiles to attach one.</p>
          )}
        </div>
        {profile.errors.length > 0 && (
          <div>
            <p className="font-semibold text-rose-700 uppercase tracking-wider text-[10px] mb-1">Blocking errors</p>
            <ul className="list-disc pl-4 space-y-0.5 text-rose-700">
              {profile.errors.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
        )}
        {profile.warnings.length > 0 && (
          <div>
            <p className="font-semibold text-amber-700 uppercase tracking-wider text-[10px] mb-1">
              Warnings (checks that will be skipped)
            </p>
            <ul className="list-disc pl-4 space-y-0.5 text-amber-800">
              {profile.warnings.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
        )}
        {profile.profile_id && (
          <Link
            href={`${ROUTES.DEVICE_PROFILES}/${encodeURIComponent(profile.profile_id)}`}
            className="inline-flex items-center gap-1 text-blue-700 hover:underline font-medium"
          >
            Open profile <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </CardContent>
    </Card>
  )
}

export default function ManufacturersPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { canMaintainDevices, loading: accessLoading } = useNavigationAccess()
  const networksQuery = useNetworks()
  const profilesQuery = useManufacturerProfiles()
  const [backfillDays, setBackfillDays] = useState(14)

  const networks = networksQuery.data ?? NO_NETWORKS
  const profiles = profilesQuery.data ?? NO_PROFILES

  const totals = useMemo(
    () =>
      networks.reduce(
        (acc, network) => {
          acc.devices += network.total_devices ?? 0
          acc.deployed += network.deployed_devices ?? 0
          acc.online += network.online_devices ?? 0
          acc.thingspeak += network.thingspeak_devices ?? 0
          acc.external += network.external_api_devices ?? 0
          acc.none += noDataPathCount(network)
          if (network.enabled !== false) acc.enabled += 1
          return acc
        },
        { devices: 0, deployed: 0, online: 0, thingspeak: 0, external: 0, none: 0, enabled: 0 }
      ),
    [networks]
  )

  const profilesByNetwork = useMemo(() => {
    const map = new Map<string, NetworkProfileReadiness[]>()
    for (const profile of profiles) {
      const key = normalizeNetwork(profile.network)
      map.set(key, [...(map.get(key) ?? []), profile])
    }
    return map
  }, [profiles])

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: [...NETWORKS_QUERY_KEY] })
    queryClient.invalidateQueries({ queryKey: [...MANUFACTURER_PROFILES_QUERY_KEY] })
  }

  const syncNetworksMutation = useMutation({
    mutationFn: () => networkService.syncNetworks(),
    onSuccess: (result) => {
      const counts = [
        result.new_count != null ? `${result.new_count} new` : null,
        result.updates_count != null ? `${result.updates_count} updated` : null,
      ].filter(Boolean)
      toast({
        title: "Manufacturers synced",
        description: [result.message, counts.length ? `(${counts.join(", ")})` : null].filter(Boolean).join(" "),
      })
      refreshAll()
    },
    onError: (error) =>
      toast({ variant: "destructive", title: "Sync failed", description: errorMessage(error, "Could not sync manufacturers.") }),
  })

  const seedProfilesMutation = useMutation({
    mutationFn: () => networkService.seedManufacturerProfiles(),
    onSuccess: (result) => {
      const detail = [
        result.created?.length ? `Created: ${result.created.join(", ")}.` : null,
        result.diagnosable?.length ? `Diagnosable: ${result.diagnosable.join(", ")}.` : null,
      ]
        .filter(Boolean)
        .join(" ")
      toast({ title: "Manufacturer profiles seeded", description: [result.message, detail].filter(Boolean).join(" ") })
      refreshAll()
    },
    onError: (error) =>
      toast({ variant: "destructive", title: "Seeding failed", description: errorMessage(error, "Could not seed manufacturer profiles.") }),
  })

  const backfillMutation = useMutation({
    mutationFn: (days: number) => networkService.syncExternalReadings(days),
    onSuccess: (result) => toast({ title: "Backfill started", description: result.message }),
    onError: (error) =>
      toast({ variant: "destructive", title: "Backfill failed", description: errorMessage(error, "Could not start the backfill.") }),
  })

  const pollFeedsMutation = useMutation({
    mutationFn: () => networkService.pollExternalFeeds(),
    onSuccess: (result) => toast({ title: "Live feed poll started", description: result.message }),
    onError: (error) =>
      toast({ variant: "destructive", title: "Poll failed", description: errorMessage(error, "Could not poll the live feeds.") }),
  })

  const anyActionRunning =
    syncNetworksMutation.isPending || seedProfilesMutation.isPending || backfillMutation.isPending || pollFeedsMutation.isPending
  const isLoading = networksQuery.isLoading || profilesQuery.isLoading

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Factory className="w-7 h-7 text-primary" />
            Sensor Manufacturers
          </h1>
          <p className="text-xs text-gray-500 mt-1 max-w-3xl">
            Every manufacturer whose devices beacon mirrors from the platform, how many of their devices it can read
            (ThingSpeak for AirQo hardware, the manufacturer&apos;s API for the rest), and whether the diagnostic engine
            can assess each manufacturer&apos;s devices.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshAll}
          disabled={networksQuery.isFetching || profilesQuery.isFetching}
          className="h-9 text-xs bg-white gap-1.5 text-gray-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${networksQuery.isFetching || profilesQuery.isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Admin actions */}
      <Card className="border-blue-100 bg-blue-50/40">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-900">
            <Wand2 className="w-4 h-4 text-blue-600" /> Admin actions
          </CardTitle>
          <CardDescription className="text-xs">
            Mirror the platform&apos;s manufacturers, create their diagnostic profiles, and pull readings for devices read
            through manufacturer APIs. Backfill and polling run in the background on the server.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {accessLoading ? (
            <Skeleton className="h-9 w-full max-w-xl" />
          ) : canMaintainDevices ? (
            <div className="flex flex-wrap items-end gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-9 text-xs bg-white gap-1.5"
                onClick={() => syncNetworksMutation.mutate()}
                disabled={anyActionRunning}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncNetworksMutation.isPending ? "animate-spin" : ""}`} />
                Sync manufacturers
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 text-xs bg-white gap-1.5"
                onClick={() => seedProfilesMutation.mutate()}
                disabled={anyActionRunning}
              >
                <Stethoscope className={`w-3.5 h-3.5 ${seedProfilesMutation.isPending ? "animate-pulse" : ""}`} />
                Seed manufacturer profiles
              </Button>
              <div className="flex items-end gap-1.5">
                <div className="space-y-1">
                  <Label htmlFor="backfill-days" className="text-[11px] text-gray-500">
                    Days
                  </Label>
                  <Input
                    id="backfill-days"
                    type="number"
                    min={1}
                    max={90}
                    value={backfillDays}
                    onChange={(event) => setBackfillDays(Math.max(1, Math.min(90, Number(event.target.value) || 1)))}
                    className="h-9 w-20 text-xs bg-white"
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 text-xs bg-white gap-1.5"
                  onClick={() => backfillMutation.mutate(backfillDays)}
                  disabled={anyActionRunning}
                >
                  <DownloadCloud className={`w-3.5 h-3.5 ${backfillMutation.isPending ? "animate-pulse" : ""}`} />
                  Backfill external readings
                </Button>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-9 text-xs bg-white gap-1.5"
                onClick={() => pollFeedsMutation.mutate()}
                disabled={anyActionRunning}
              >
                <Rss className={`w-3.5 h-3.5 ${pollFeedsMutation.isPending ? "animate-pulse" : ""}`} />
                Poll live feeds
              </Button>
            </div>
          ) : (
            <p className="text-xs text-gray-500">These actions need device maintainer rights in the AirQo group.</p>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard
          title="Manufacturers"
          value={networks.length}
          icon={AqCpuChip01}
          iconVariant="primary"
          secondaryLabel="enabled on this server"
          secondaryValue={totals.enabled}
          isLoading={networksQuery.isLoading}
        />
        <SummaryCard
          title="Devices"
          value={totals.devices}
          icon={AqServer03}
          iconVariant="blue"
          secondaryLabel="deployed"
          secondaryValue={totals.deployed}
          isLoading={networksQuery.isLoading}
        />
        <SummaryCard
          title="Online"
          value={totals.online}
          icon={AqSignal01}
          iconVariant="emerald"
          secondaryLabel="of deployed devices"
          secondaryValue={totals.deployed > 0 ? `${Math.round((totals.online / totals.deployed) * 100)}%` : "0%"}
          isLoading={networksQuery.isLoading}
        />
        <SummaryCard
          title="Readable"
          value={totals.thingspeak + totals.external}
          icon={AqMarkerPin01}
          iconVariant="purple"
          secondaryLabel="ThingSpeak / manufacturer API"
          secondaryValue={`${totals.thingspeak} / ${totals.external}`}
          isLoading={networksQuery.isLoading}
        />
        <SummaryCard
          title="No data path"
          value={totals.none}
          icon={CloudOff}
          iconVariant="amber"
          secondaryLabel="show no readings, count as offline"
          isLoading={networksQuery.isLoading}
        />
      </div>

      {/* Networks table */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" /> Manufacturers
          </CardTitle>
          <CardDescription className="text-xs">
            Counts cover every mirrored device. A manufacturer seen on devices but not yet synced from the platform has
            no platform record.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {networksQuery.isLoading ? (
            <div className="p-6 space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : networksQuery.error ? (
            <div className="p-8 text-center">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-900">Manufacturers unavailable</p>
              <p className="text-xs text-gray-500 mt-1">{errorMessage(networksQuery.error, "Could not load the manufacturers.")}</p>
              <Button size="sm" variant="outline" className="mt-3 text-xs" onClick={() => networksQuery.refetch()}>
                Retry
              </Button>
            </div>
          ) : networks.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No manufacturers yet. Sync manufacturers, then sync devices, to mirror them from the platform.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Devices</TableHead>
                    <TableHead className="text-right">Deployed</TableHead>
                    <TableHead className="text-right">Online</TableHead>
                    <TableHead>Data sources</TableHead>
                    <TableHead>Diagnostics</TableHead>
                    <TableHead>Website</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {networks.map((network) => {
                    const key = normalizeNetwork(network.name)
                    const networkProfiles = profilesByNetwork.get(key) ?? []
                    const diagnosable = networkProfiles.filter((profile) => profile.diagnosable).length
                    const none = noDataPathCount(network)
                    return (
                      <TableRow key={`${key}-${network.network_id ?? "unsynced"}`}>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <ManufacturerBadge network={network.name} />
                              {network.acronym && network.acronym.toLowerCase() !== key && (
                                <span className="text-xs text-gray-500">{network.acronym}</span>
                              )}
                            </div>
                            {network.description && (
                              <span className="text-[11px] text-gray-500 max-w-xs truncate" title={network.description}>
                                {network.description}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {network.network_id ? (
                              <Badge variant="outline" className="text-[11px] capitalize">
                                {network.status || "unknown"}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[11px] bg-amber-50 text-amber-800 border-amber-200">
                                Not synced
                              </Badge>
                            )}
                            {network.enabled === false && (
                              <Badge variant="outline" className="text-[11px] bg-gray-100 text-gray-600">
                                Disabled
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium">{network.total_devices}</TableCell>
                        <TableCell className="text-right tabular-nums">{network.deployed_devices}</TableCell>
                        <TableCell className="text-right tabular-nums">{network.online_devices}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5 text-[11px]">
                            {network.thingspeak_devices > 0 && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200" title="Read from ThingSpeak">
                                <Radio className="h-3 w-3" /> {network.thingspeak_devices}
                              </span>
                            )}
                            {network.external_api_devices > 0 && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200" title="Read through the manufacturer API">
                                <Cloud className="h-3 w-3" /> {network.external_api_devices}
                              </span>
                            )}
                            {none > 0 && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border bg-gray-100 text-gray-600 border-gray-200" title="No data path: no readings, counted offline">
                                <CloudOff className="h-3 w-3" /> {none}
                              </span>
                            )}
                            {network.total_devices === 0 && <span className="text-gray-400">—</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {key === "airqo" ? (
                            <span className="text-xs text-gray-500">AirQo profiles</span>
                          ) : networkProfiles.length === 0 ? (
                            <span className="text-xs text-gray-400">No profile</span>
                          ) : (
                            <span
                              className={`text-xs font-medium ${diagnosable === networkProfiles.length ? "text-emerald-700" : diagnosable > 0 ? "text-amber-700" : "text-rose-700"}`}
                            >
                              {diagnosable}/{networkProfiles.length} diagnosable
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {network.website ? (
                            <a
                              href={/^https?:\/\//i.test(network.website) ? network.website : `https://${network.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-700 hover:underline"
                            >
                              {network.website.replace(/^https?:\/\//i, "").replace(/\/$/, "")}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manufacturer profiles */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-primary" /> Diagnostic readiness
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            One profile per manufacturer and equipment type, as the diagnostic engine sees it. Devices from a manufacturer
            are diagnosed once their profile is diagnosable and a full day of readings exists.
          </p>
        </div>
        {profilesQuery.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
          </div>
        ) : profilesQuery.error ? (
          <Card className="p-6 text-center border-dashed">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-900">Profiles unavailable</p>
            <p className="text-xs text-gray-500 mt-1">{errorMessage(profilesQuery.error, "Could not load the manufacturer profiles.")}</p>
            <Button size="sm" variant="outline" className="mt-3 text-xs" onClick={() => profilesQuery.refetch()}>
              Retry
            </Button>
          </Card>
        ) : profiles.length === 0 ? (
          <Card className="p-6 text-center border-dashed text-sm text-gray-500">
            No manufacturer profiles yet.{canMaintainDevices ? " Use “Seed manufacturer profiles” above to create them." : ""}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...profiles]
              .sort((a, b) => formatNetworkLabel(a.network).localeCompare(formatNetworkLabel(b.network)) || a.name.localeCompare(b.name))
              .map((profile) => (
                <ProfileReadinessCard key={profile.profile_id || profile.name} profile={profile} />
              ))}
          </div>
        )}
      </div>

      {isLoading ? null : (
        <p className="text-[11px] text-gray-400">
          Device lists filter by manufacturer on the{" "}
          <Link href={ROUTES.DEVICES} className="text-blue-700 hover:underline">
            Devices
          </Link>{" "}
          page.
        </p>
      )}
    </div>
  )
}
