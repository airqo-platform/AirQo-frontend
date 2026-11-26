"use client"

import { format, parseISO } from "date-fns"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { cn } from "@/lib/utils"
import {
  CRITICAL_OFFLINE_PERCENT,
  DEVICE_STATUS_CATEGORIES,
  HEALTH_LABELS,
  OVERVIEW_VIEWS,
  percentOf,
  type DailyOnline,
  type DeviceStatusKey,
  type NetworkHealth,
  type OverviewView,
  type StatusCounts,
} from "@/lib/network-overview"
import type { HourlyTrend } from "@/services/network-status.service"

/** Fills for the four statuses: they differ in lightness as well as hue, and always sit beside a number. */
export const STATUS_SWATCH: Record<DeviceStatusKey, string> = {
  operational: "bg-green-500",
  transmitting: "bg-blue-500",
  data_available: "bg-yellow-500",
  not_transmitting: "bg-red-500",
}

const HEALTH_BADGE: Record<NetworkHealth, { chip: string; dot: string }> = {
  OK: {
    chip: "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300",
    dot: "bg-green-600",
  },
  WARNING: {
    chip: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  CRITICAL: {
    chip: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300",
    dot: "bg-red-600",
  },
}

export function HealthBadge({ health, className }: { health: NetworkHealth; className?: string }) {
  const style = HEALTH_BADGE[health]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        style.chip,
        className,
      )}
    >
      <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", style.dot)} />
      {HEALTH_LABELS[health]}
    </span>
  )
}

export function OverviewCard({
  title,
  description,
  action,
  className,
  children,
  id,
}: {
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
  id?: string
}) {
  const headingId = id ? `${id}-title` : undefined
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4 min-w-0", className)}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <h3 id={headingId} className="text-base font-semibold text-card-foreground">
            {title}
          </h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

// ─── Role switch ─────────────────────────────────────────────────────────────

export function RoleSwitch({ value, onChange }: { value: OverviewView; onChange: (view: OverviewView) => void }) {
  return (
    <div className="space-y-2">
      <div role="group" aria-label="View for" className="grid gap-2 grid-cols-2 sm:gap-3 xl:grid-cols-4">
        {OVERVIEW_VIEWS.map((view) => {
          const selected = view.id === value
          return (
            <button
              key={view.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(view.id)}
              title={view.audience}
              className={cn(
                "flex min-h-11 flex-col items-start justify-center gap-0.5 rounded-lg border-2 px-3 py-2 text-left transition-colors sm:min-h-16 sm:px-4 sm:py-3",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                selected ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted",
              )}
            >
              <span className={cn("text-[15px] font-semibold", selected ? "text-primary" : "text-foreground")}>
                {view.label}
              </span>
              <span className="hidden text-xs text-muted-foreground sm:block">{view.audience}</span>
            </button>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Beacon remembers the view you used last. Every view uses the same data and fleet filter.
      </p>
    </div>
  )
}

// ─── Status tiles ────────────────────────────────────────────────────────────

/**
 * The four statuses with their counts. Tiles for the three statuses that need a visit open the
 * Field view filtered to that status.
 */
export function StatusTiles({
  counts,
  onOpen,
}: {
  counts: StatusCounts
  onOpen?: (status: DeviceStatusKey) => void
}) {
  return (
    <div className="space-y-3">
      <div
        role="img"
        aria-label={DEVICE_STATUS_CATEGORIES.map((c) => `${counts[c.key]} ${c.label}`).join(", ")}
        className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-muted"
      >
        {DEVICE_STATUS_CATEGORIES.map((category) => (
          <span
            key={category.key}
            className={STATUS_SWATCH[category.key]}
            style={{ width: `${percentOf(counts[category.key], counts.total)}%` }}
          />
        ))}
      </div>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {DEVICE_STATUS_CATEGORIES.map((category) => {
          const value = counts[category.key]
          const isProblem = category.key === "not_transmitting"
          const content = (
            <>
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <span aria-hidden="true" className={cn("h-2.5 w-2.5 rounded-full", STATUS_SWATCH[category.key])} />
                {category.label}
              </span>
              <span className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-foreground">{value.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">{percentOf(value, counts.total).toFixed(1)}%</span>
              </span>
              <span className="text-xs text-muted-foreground">{category.description}</span>
            </>
          )
          const tileClass = cn(
            "flex flex-col gap-1.5 rounded-lg border p-4 text-left",
            isProblem && value > 0 ? "border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/30" : "border-border bg-card",
          )
          if (category.key === "operational" || !onOpen) {
            return (
              <div key={category.key} className={tileClass}>
                {content}
              </div>
            )
          }
          return (
            <button
              key={category.key}
              type="button"
              onClick={() => onOpen(category.key)}
              aria-label={`${category.label}: ${value} devices. Show them in the Field view`}
              className={cn(
                tileClass,
                "transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              )}
            >
              {content}
              <span className="text-xs font-medium text-primary">Show devices</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Charts ──────────────────────────────────────────────────────────────────

const axisTick = { fontSize: 11, fill: "rgb(var(--muted-foreground))" }

/** Daily online rate against the warning and critical lines (drawn as online rates). */
export function OnlineTrendChart({
  days,
  warningAt,
  showLowest = true,
  height = 280,
}: {
  days: DailyOnline[]
  warningAt: number
  showLowest?: boolean
  height?: number
}) {
  if (days.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-muted-foreground" style={{ height }}>
        No daily figures for this period yet
      </div>
    )
  }
  const lowest = Math.min(...days.map((d) => (showLowest ? d.lowestOnline : d.averageOnline)))
  const floor = Math.max(0, Math.min(100 - CRITICAL_OFFLINE_PERCENT - 5, Math.floor(lowest / 10) * 10))
  return (
    <div className="space-y-2">
      <div className="w-full min-w-0" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <LineChart data={days} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border))" />
            <XAxis dataKey="date" tickFormatter={(d) => format(parseISO(d), "d MMM")} tick={axisTick} />
            <YAxis tick={axisTick} unit="%" domain={[floor, 100]} />
            <ReferenceLine
              y={100 - warningAt}
              stroke="#d97706"
              strokeDasharray="6 4"
              label={{ value: `Warning, ${100 - warningAt}% online`, position: "insideTopLeft", fontSize: 11, fill: "#92400e" }}
            />
            <ReferenceLine
              y={100 - CRITICAL_OFFLINE_PERCENT}
              stroke="#dc2626"
              strokeDasharray="6 4"
              label={{ value: `Critical, ${100 - CRITICAL_OFFLINE_PERCENT}% online`, position: "insideTopLeft", fontSize: 11, fill: "#991b1b" }}
            />
            <Tooltip
              labelFormatter={(d) => format(parseISO(String(d)), "d MMMM yyyy")}
              formatter={(value, name) => [`${Number(value).toFixed(1)}%`, String(name)]}
            />
            {showLowest && (
              <Line
                type="monotone"
                dataKey="lowestOnline"
                name="Lowest check"
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
              />
            )}
            <Line
              type="monotone"
              dataKey="averageOnline"
              name="Daily average"
              stroke="rgb(var(--primary))"
              strokeWidth={2.5}
              dot={{ r: 2.5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-[3px] w-4 rounded bg-primary" />
          Daily average
        </span>
        {showLowest && (
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="w-4 border-t-2 border-dashed border-slate-400" />
            Lowest check of the day
          </span>
        )}
      </div>
    </div>
  )
}

/** Average online rate for each hour of the day; hours below the warning line in orange. */
export function HourlyChart({ trends, warningAt, height = 260 }: { trends: HourlyTrend[]; warningAt: number; height?: number }) {
  const byHour = new Map<number, number[]>()
  for (const trend of trends) {
    const hour = trend._id?.hour
    if (typeof hour !== "number") continue
    byHour.set(hour, [...(byHour.get(hour) ?? []), 100 - (trend.avg_not_transmitting_percentage ?? 0)])
  }
  const data = [...byHour.entries()]
    .sort(([a], [b]) => a - b)
    .map(([hour, values]) => ({
      hour,
      online: values.reduce((sum, v) => sum + v, 0) / values.length,
    }))

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-muted-foreground" style={{ height }}>
        No hourly figures for this period yet
      </div>
    )
  }
  const warningLine = 100 - warningAt
  const lowest = Math.min(...data.map((d) => d.online))
  const floor = Math.max(0, Math.min(warningLine - 10, Math.floor(lowest / 10) * 10))
  const label = (hour: number) => String(hour).padStart(2, "0")
  return (
    <div className="space-y-2">
      <div className="w-full min-w-0" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border))" />
            <XAxis dataKey="hour" tickFormatter={label} tick={axisTick} interval={2} />
            <YAxis tick={axisTick} unit="%" domain={[floor, 100]} />
            <ReferenceLine y={warningLine} stroke="#92400e" strokeDasharray="6 4" />
            <Tooltip
              labelFormatter={(hour) => `${label(Number(hour))}:00 UTC`}
              formatter={(value) => [`${Number(value).toFixed(1)}%`, "Average online"]}
            />
            <Bar dataKey="online" radius={[3, 3, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.hour} fill={entry.online < warningLine ? "#f97316" : "rgb(var(--primary))"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-primary" />
          At or above the warning line
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-orange-500" />
          Below it
        </span>
      </div>
    </div>
  )
}
