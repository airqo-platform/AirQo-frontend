"use client"

import { Fragment, useState } from "react"
import Link from "next/link"
import { CheckCircle2, ChevronDown, ChevronRight, ExternalLink, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ManufacturerBadge } from "@/components/devices/manufacturer-badge"
import { formatNetworkLabel } from "@/lib/manufacturers"
import { formatCategoryLabel } from "@/lib/utils"
import { ROUTES } from "@/lib/navigation"
import { cn } from "@/lib/utils"
import type { NetworkProfileReadiness } from "@/types/network.types"

/** Manufacturer profiles ordered by manufacturer, then profile name. */
export const sortProfiles = (profiles: readonly NetworkProfileReadiness[]): NetworkProfileReadiness[] =>
  [...profiles].sort(
    (a, b) => formatNetworkLabel(a.network).localeCompare(formatNetworkLabel(b.network)) || a.name.localeCompare(b.name)
  )

const profileKey = (profile: NetworkProfileReadiness) => profile.profile_id || profile.name

interface ManufacturerProfilesTableProps {
  profiles: readonly NetworkProfileReadiness[]
  className?: string
}

/**
 * One row per manufacturer profile as the diagnostic engine sees it. Rows with warnings or
 * errors expand to list them; the component chips highlight the ones that deliver the data.
 */
export function ManufacturerProfilesTable({ profiles, className }: Readonly<ManufacturerProfilesTableProps>) {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set())

  const toggle = (key: string) =>
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  return (
    <div className={cn("overflow-x-auto rounded-xl border border-gray-200 bg-white", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8 px-2" />
            <TableHead>Profile</TableHead>
            <TableHead>Manufacturer</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Diagnosable</TableHead>
            <TableHead>Components</TableHead>
            <TableHead className="text-right">Warnings</TableHead>
            <TableHead className="text-right">Errors</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortProfiles(profiles).map((profile) => {
            const key = profileKey(profile)
            const warnings = profile.warnings ?? []
            const errors = profile.errors ?? []
            const hasDetails = warnings.length + errors.length > 0
            const isOpen = hasDetails && expanded.has(key)
            const transmission = new Set(profile.transmission_components ?? [])
            const components = profile.components ?? []

            return (
              <Fragment key={key}>
                <TableRow
                  data-profile={profile.name}
                  className={cn(hasDetails && "cursor-pointer")}
                  onClick={() => hasDetails && toggle(key)}
                >
                  <TableCell className="w-8 px-2">
                    {hasDetails && (
                      <button
                        type="button"
                        className="rounded p-0.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        aria-expanded={isOpen}
                        aria-label={isOpen ? `Hide ${profile.name} details` : `Show ${profile.name} details`}
                        onClick={(event) => {
                          event.stopPropagation()
                          toggle(key)
                        }}
                      >
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-gray-900 whitespace-nowrap">{profile.name}</TableCell>
                  <TableCell>
                    <ManufacturerBadge network={profile.network} />
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{formatCategoryLabel(profile.category)}</TableCell>
                  <TableCell>
                    {profile.diagnosable ? (
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 gap-1 whitespace-nowrap">
                        <CheckCircle2 className="h-3 w-3" /> Diagnosable
                      </Badge>
                    ) : (
                      <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200 gap-1 whitespace-nowrap">
                        <XCircle className="h-3 w-3" /> Not diagnosable
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {components.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {components.map((component) => (
                          <span
                            key={component}
                            className={
                              transmission.has(component)
                                ? "px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-[11px] font-mono text-blue-800"
                                : "px-1.5 py-0.5 rounded bg-slate-100 border text-[11px] font-mono text-gray-700"
                            }
                            title={transmission.has(component) ? "Delivers the data; gaps are attributed to it" : undefined}
                          >
                            {component}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No component model</span>
                    )}
                  </TableCell>
                  <TableCell className={cn("text-right tabular-nums text-xs", warnings.length > 0 ? "text-amber-700 font-semibold" : "text-gray-400")}>
                    {warnings.length > 0 ? warnings.length : "—"}
                  </TableCell>
                  <TableCell className={cn("text-right tabular-nums text-xs", errors.length > 0 ? "text-rose-700 font-semibold" : "text-gray-400")}>
                    {errors.length > 0 ? errors.length : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {profile.profile_id && (
                      <Link
                        href={`${ROUTES.DEVICE_PROFILES}/${encodeURIComponent(profile.profile_id)}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs text-blue-700 hover:underline whitespace-nowrap"
                      >
                        Open profile <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
                {isOpen && (
                  <TableRow className="bg-gray-50/70 hover:bg-gray-50/70" data-profile-details={profile.name}>
                    <TableCell className="w-8 px-2" />
                    <TableCell colSpan={8} className="py-3">
                      <div className="grid gap-3 md:grid-cols-2 text-xs">
                        {errors.length > 0 && (
                          <div>
                            <p className="font-semibold text-rose-700 uppercase tracking-wider text-[10px] mb-1">Blocking errors</p>
                            <ul className="list-disc pl-4 space-y-0.5 text-rose-700">
                              {errors.map((message, index) => (
                                <li key={index}>{message}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {warnings.length > 0 && (
                          <div>
                            <p className="font-semibold text-amber-700 uppercase tracking-wider text-[10px] mb-1">
                              Warnings (checks that will be skipped)
                            </p>
                            <ul className="list-disc pl-4 space-y-0.5 text-amber-800">
                              {warnings.map((message, index) => (
                                <li key={index}>{message}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export default ManufacturerProfilesTable
