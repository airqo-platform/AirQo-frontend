import AirQloudsTable from "@/app/dashboard/analytics/airqlouds-table"
import { SitesSummaryCards } from "./sites-summary-cards"

// The summary cards and the table cover the same window
const PERFORMANCE_DAYS = 14

export default function SitesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sites</h1>
        <p className="text-sm text-muted-foreground">
          How the devices at your sites performed over the last {PERFORMANCE_DAYS} days
        </p>
      </div>

      <SitesSummaryCards performanceDays={PERFORMANCE_DAYS} />

      <AirQloudsTable entityType="sites" performanceDays={PERFORMANCE_DAYS} pageSize={10} />
    </div>
  )
}
