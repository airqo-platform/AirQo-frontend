"use client"

import { useQuery } from "@tanstack/react-query"
import { diagnosticsService } from "@/services/diagnosticsService"
import type { FleetIssue } from "@/types/diagnostics"

// The issues endpoint returns at most 1000 rows a request.
const ISSUE_PAGE_SIZE = 1000
// A safety stop well above any real day (a large fleet sees a few thousand issues).
const MAX_ISSUE_PAGES = 20

export const fleetSummaryQueryKey = (group: string, date: string | null) =>
  ["diagnostics", "fleet-summary", { group, date }] as const

export const fleetDayIssuesQueryKey = (group: string, date: string) =>
  ["diagnostics", "fleet-day-issues", { group, date }] as const

/** The group's daily summary; `date` null means the latest diagnosed day. */
export function useFleetDailySummary(group: string, date: string | null) {
  return useQuery({
    queryKey: fleetSummaryQueryKey(group, date),
    queryFn: () =>
      diagnosticsService.getFleetDailySummary({ diagnosis_date: date || undefined, top_n: 10, group }),
    enabled: Boolean(group),
  })
}

export interface FleetDayIssues {
  issues: FleetIssue[]
  /** True when the safety stop was reached, so `issues` misses the rest of the day. */
  truncated: boolean
}

/** Every issue diagnosed on `date` for the group's devices, fetched page by page. */
export function useFleetDayIssues(group: string, date: string | null | undefined) {
  return useQuery({
    queryKey: fleetDayIssuesQueryKey(group, date || ""),
    queryFn: async (): Promise<FleetDayIssues> => {
      const issues: FleetIssue[] = []
      for (let page = 0; page < MAX_ISSUE_PAGES; page++) {
        const batch = await diagnosticsService.getFleetIssues({
          diagnosis_date: date || undefined,
          group,
          skip: page * ISSUE_PAGE_SIZE,
          limit: ISSUE_PAGE_SIZE,
        })
        issues.push(...batch)
        if (batch.length < ISSUE_PAGE_SIZE) return { issues, truncated: false }
      }
      return { issues, truncated: true }
    },
    enabled: Boolean(group && date),
  })
}
