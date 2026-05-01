import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a device/site category for display.
 * Always renders the legacy "bam" identifier (case-insensitive) as
 * "Reference Monitor", regardless of where the value comes from
 * (backend, mocks, hard-coded). Other categories are returned with
 * sensible casing.
 */
export function formatCategoryLabel(category: string | null | undefined): string {
  if (category === null || category === undefined) return "-"
  const value = String(category).trim()
  if (!value) return "-"
  const lower = value.toLowerCase()
  if (lower === "bam") return "Reference Monitor"
  if (lower === "lowcost" || lower === "low cost" || lower === "low-cost") return "Low Cost"
  // Fallback: capitalize first letter
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/** Label used for BAM/Reference Monitor across the UI. */
export const REFERENCE_MONITOR_LABEL = "Reference Monitor"
