"use client"

import Link from "next/link"
import { format, parseISO } from "date-fns"
import { AqCopy01, AqFile06 } from "@airqo/icons-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ROUTES } from "@/lib/navigation"
import { trackEvent } from "@/lib/analytics"
import type { DailyOnline, PeriodSummary } from "@/lib/network-overview"
import { OnlineTrendChart, OverviewCard } from "./overview-parts"

function Figure({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-5 shadow-sm">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
      {note && <span className="text-xs text-muted-foreground">{note}</span>}
    </div>
  )
}

export function ReportingView({
  period,
  days,
  deployed,
  manufacturers,
  summary,
  warningAt,
}: {
  period: PeriodSummary
  days: DailyOnline[]
  deployed: number | null
  manufacturers: number
  summary: string
  warningAt: number
}) {
  const { toast } = useToast()
  const first = days[0]?.date
  const last = days[days.length - 1]?.date
  const range = first && last ? `${format(parseISO(first), "d MMM")} – ${format(parseISO(last), "d MMM yyyy")}` : undefined

  const copySummary = async () => {
    let copied = false
    try {
      await navigator.clipboard.writeText(summary)
      copied = true
    } catch {
      // The Clipboard API can be refused (browser policy, embedded frames); fall back to a selection copy
      const area = document.createElement("textarea")
      area.value = summary
      area.setAttribute("readonly", "")
      area.style.position = "fixed"
      area.style.opacity = "0"
      document.body.appendChild(area)
      area.select()
      try {
        copied = document.execCommand("copy")
      } finally {
        document.body.removeChild(area)
      }
    }
    if (copied) {
      toast({ title: "Summary copied", description: "Paste it into your report or email." })
      trackEvent("overview_summary_copied")
    } else {
      toast({ title: "Couldn't copy the summary", description: "Select the text and copy it instead.", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <Figure
          label="Average online rate"
          value={period.averageOnline === null ? "—" : `${period.averageOnline.toFixed(1)}%`}
          note={range}
        />
        <Figure
          label="Devices deployed"
          value={deployed === null ? "—" : deployed.toLocaleString()}
          note={manufacturers > 0 ? `Across ${manufacturers} manufacturer${manufacturers === 1 ? "" : "s"}` : undefined}
        />
        <Figure
          label="Days at the warning line"
          value={`${period.daysInWarning} of ${period.days}`}
          note={`Daily average ${warningAt}% or more offline`}
        />
        <Figure
          label="Days with a critical check"
          value={String(period.criticalDays.length)}
          note={
            period.criticalDays.length > 0
              ? period.criticalDays.map((d) => format(parseISO(d), "d MMM")).join(", ")
              : "No check reached 50% offline"
          }
        />
      </div>

      <OverviewCard
        title="Summary for reports"
        description="Written from the figures above; it updates with the fleet filter"
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={copySummary}>
              <AqCopy01 className="h-4 w-4" aria-hidden="true" />
              Copy text
            </Button>
            <Button size="sm" asChild>
              <Link href={ROUTES.REPORTS}>
                <AqFile06 className="h-4 w-4" aria-hidden="true" />
                Build a PDF report
              </Link>
            </Button>
          </div>
        }
      >
        <p className="max-w-[72ch] text-base leading-relaxed text-foreground">{summary}</p>
      </OverviewCard>

      <OverviewCard title="Online rate, day by day">
        <OnlineTrendChart days={days} warningAt={warningAt} showLowest={false} />
      </OverviewCard>
    </div>
  )
}
