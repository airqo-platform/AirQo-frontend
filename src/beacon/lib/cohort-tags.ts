import { beaconConfig, isSystemGroup } from "@/beacon.config"

/**
 * Cohort tags offered in the analytics filters. Every organisation starts on its organisational
 * cohorts; hardware cohorts are the operator's own test groupings, so only the system group sees them.
 */
export const DEFAULT_COHORT_TAG = "organizational"

const COHORT_TAGS = ["organizational", "hardware", "duplicate", "inlab", "misc"]

export function cohortTagsFor(activeGroup: string | null | undefined): string[] {
  return isSystemGroup(activeGroup) ? COHORT_TAGS : COHORT_TAGS.filter((tag) => tag !== "hardware")
}

const DEFAULT_COHORT_NAME = beaconConfig.auth.systemGroupSlug.toLowerCase()

/** The default cohort holds every device, so it isn't a cluster anyone works with or selects. */
export const isDefaultCohort = (name: string | null | undefined): boolean =>
  name?.trim().toLowerCase() === DEFAULT_COHORT_NAME

/** Takes the default cohort out of one page of cluster results, keeping the count in step. */
export function withoutDefaultCohort<T extends { airqlouds?: Array<{ name?: string }>; meta?: any }>(response: T): T {
  const clusters = response.airqlouds ?? []
  const listed = clusters.filter((cluster) => !isDefaultCohort(cluster.name))
  const hidden = clusters.length - listed.length
  if (hidden === 0) return response
  return {
    ...response,
    airqlouds: listed,
    meta: Number.isFinite(response.meta?.total) ? { ...response.meta, total: response.meta.total - hidden } : response.meta,
  }
}
