import { Suspense } from "react"
import AnalyticsPageClient from "./analytics-page-client"

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading analytics...</div>}>
      <AnalyticsPageClient />
    </Suspense>
  )
}
