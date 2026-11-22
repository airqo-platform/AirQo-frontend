"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type CardVariant = "primary" | "blue" | "emerald" | "amber" | "rose" | "purple" | "slate"

interface SummaryCardProps {
  title: string
  value: string | number
  icon?: React.ComponentType<{ className?: string; size?: number | string; color?: string }>
  iconVariant?: CardVariant
  secondaryLabel?: string
  secondaryValue?: string | number
  progressPercentage?: number
  progressVariant?: CardVariant
  badge?: {
    text: string
    variant?: "default" | "secondary" | "destructive" | "outline"
    className?: string
  }
  subtext?: React.ReactNode
  isLoading?: boolean
  className?: string
  onClick?: () => void
}

const ICON_VARIANTS: Record<CardVariant, { bg: string; text: string }> = {
  primary: {
    bg: "bg-primary/10",
    text: "text-primary",
  },
  blue: {
    bg: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
    text: "text-blue-700 dark:text-blue-400",
  },
  emerald: {
    bg: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300",
    text: "text-green-700 dark:text-green-400",
  },
  amber: {
    bg: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    text: "text-amber-700 dark:text-amber-400",
  },
  rose: {
    bg: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
    text: "text-red-700 dark:text-red-400",
  },
  purple: {
    bg: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
    text: "text-purple-700 dark:text-purple-400",
  },
  slate: {
    bg: "bg-muted text-muted-foreground",
    text: "text-muted-foreground",
  },
}

const PROGRESS_VARIANTS: Record<CardVariant, string> = {
  primary: "bg-primary",
  blue: "bg-blue-600",
  emerald: "bg-green-600",
  amber: "bg-amber-500",
  rose: "bg-red-600",
  purple: "bg-purple-600",
  slate: "bg-muted-foreground",
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon: Icon,
  iconVariant = "primary",
  secondaryLabel,
  secondaryValue,
  progressPercentage,
  progressVariant = iconVariant,
  badge,
  subtext,
  isLoading = false,
  className,
  onClick,
}) => {
  const iconStyle = ICON_VARIANTS[iconVariant] || ICON_VARIANTS.primary
  const progressStyle = PROGRESS_VARIANTS[progressVariant] || PROGRESS_VARIANTS.primary

  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between",
        onClick && "cursor-pointer hover:border-primary/40",
        className
      )}
    >
      <div>
        {/* Top Section with Title, Value, and Icon Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
              {badge && (
                <Badge
                  variant={badge.variant || "outline"}
                  className={cn("text-[10px] px-2 py-0.5 font-semibold", badge.className)}
                >
                  {badge.text}
                </Badge>
              )}
            </div>
            <div className="text-2xl font-bold mt-1 tracking-tight text-foreground">
              {isLoading ? (
                <div className="h-7 w-16 bg-muted animate-pulse rounded mt-1" />
              ) : (
                value
              )}
            </div>
          </div>

          {Icon && (
            <div
              className={cn(
                "p-2.5 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200",
                iconStyle.bg
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Secondary Metric */}
        {(secondaryValue !== undefined || secondaryLabel) && (
          <div className="mt-1.5 flex items-center justify-between text-xs">
            {secondaryLabel && (
              <span className="text-muted-foreground font-medium">{secondaryLabel}</span>
            )}
            {secondaryValue !== undefined && (
              <span className={cn("font-semibold", iconStyle.text)}>
                {isLoading ? "..." : secondaryValue}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar & Subtext */}
      {(progressPercentage !== undefined || subtext) && (
        <div className="mt-2.5">
          {progressPercentage !== undefined && (
            <div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500 ease-out",
                    progressStyle
                  )}
                  style={{ width: `${Math.min(Math.max(progressPercentage, 0), 100)}%` }}
                />
              </div>
            </div>
          )}

          {subtext && (
            <div className="text-xs text-muted-foreground leading-relaxed mt-1.5">
              {subtext}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

export default SummaryCard
