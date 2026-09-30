"use client"

import { CheckCircle2, Loader2, WifiOff } from "lucide-react"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { cn } from "@/lib/utils"

const MESSAGES = {
  offline: {
    title: "You're offline.",
    detail: "Check your connection. Data will refresh when you're back online.",
  },
  reconnecting: {
    title: "Reconnecting…",
    detail: "Your network is back, but Beacon can't be reached yet.",
  },
  restored: {
    title: "Back online.",
    detail: "Refreshing data…",
  },
} as const

/**
 * Tells the user when the connection drops and when it comes back.
 * The live region stays mounted so screen readers announce each change.
 */
export function NetworkStatusBanner() {
  const { state } = useNetworkStatus()
  const message = state === "online" ? null : MESSAGES[state]

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex justify-center px-4"
    >
      {message && (
        <div
          className={cn(
            "pointer-events-auto flex max-w-lg items-start gap-3 rounded-lg border px-4 py-2.5 text-sm shadow-lg",
            state === "restored"
              ? "border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-100"
              : "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"
          )}
        >
          {state === "offline" && <WifiOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
          {state === "reconnecting" && <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />}
          {state === "restored" && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
          <p>
            <span className="font-medium">{message.title}</span> {message.detail}
          </p>
        </div>
      )}
    </div>
  )
}
