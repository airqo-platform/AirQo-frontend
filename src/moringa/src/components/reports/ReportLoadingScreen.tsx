"use client"

import { LoaderCircle } from "lucide-react"

export default function ReportLoadingScreen() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Loading report data"
    >
      <div className="rounded-full bg-white/95 p-4 shadow-xl ring-1 ring-slate-200">
        <LoaderCircle className="h-10 w-10 animate-spin text-blue-600" aria-hidden="true" />
      </div>
      <span className="sr-only">Loading report data</span>
    </div>
  )
}
