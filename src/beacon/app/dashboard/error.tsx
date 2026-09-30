"use client"

import { RouteError } from "@/components/route-error"

// Keeps the dashboard navigation on screen when a page fails to render
export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} reset={reset} boundary="app/dashboard/error" />
}
