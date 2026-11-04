/**
 * Cohort tags offered in the analytics filters. Every organisation starts on its organisational
 * cohorts; hardware cohorts are AirQo's own test groupings, so only the AirQo organisation sees them.
 */
export const DEFAULT_COHORT_TAG = "organizational"

const COHORT_TAGS = ["organizational", "hardware", "duplicate", "inlab", "misc"]

export function cohortTagsFor(activeGroup: string | null | undefined): string[] {
  return activeGroup?.toLowerCase() === "airqo" ? COHORT_TAGS : COHORT_TAGS.filter((tag) => tag !== "hardware")
}
