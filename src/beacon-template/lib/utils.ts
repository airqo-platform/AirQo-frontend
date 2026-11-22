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

const COMPACT_UNITS: Array<[suffix: string, size: number]> = [
  ["k", 1e3],
  ["M", 1e6],
  ["B", 1e9],
  ["T", 1e12],
]

/**
 * Shortens a number for display in tight spaces. Values under 1,000 keep `decimals`
 * places; larger ones become 1.2k, 3.4M, 5.6B or 38.5T, and anything past trillions
 * uses scientific notation (7.6e16). Broken sensors can report error margins in the
 * trillions, which would otherwise stretch tables and cards. Exports should keep the
 * full value.
 */
export function formatCompactNumber(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return String(value)
  const abs = Math.abs(value)
  if (abs < 1000) return value.toFixed(decimals)

  const sign = value < 0 ? "-" : ""
  for (const [suffix, size] of COMPACT_UNITS) {
    const scaled = Math.round((abs / size) * 10) / 10
    // 999.96k rounds to 1000k; the next unit shows it as 1M
    if (scaled < 1000) return `${sign}${scaled.toFixed(1).replace(/\.0$/, "")}${suffix}`
  }
  return value.toExponential(1).replace("e+", "e")
}

/** Chart tick formatter: shortens values of 1,000 or more and leaves smaller ticks unchanged. */
export const formatCompactTick = (value: number): string =>
  Math.abs(value) >= 1000 ? formatCompactNumber(value) : String(value)
