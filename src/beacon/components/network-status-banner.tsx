"use client"

import { useEffect, useState, type ReactNode } from "react"
import { AqCheckCircle, AqLoading01, AqXClose } from "@airqo/icons-react"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { checkConnectionNow, type ConnectionState } from "@/lib/network-status"
import { cn } from "@/lib/utils"

type Tone = "amber" | "blue" | "green"

// The amber pill matches Nexus's offline status (src/nexus AppNetworkGate); blue and green follow its shape
const TONES: Record<Tone, { pill: string; strong: string }> = {
  amber: {
    pill: "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200",
    strong: "text-amber-900 dark:text-amber-100",
  },
  blue: {
    pill: "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-200",
    strong: "text-blue-900 dark:text-blue-100",
  },
  green: {
    pill: "border-green-200 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-950/60 dark:text-green-200",
    strong: "text-green-900 dark:text-green-100",
  },
}

const ICON_CLASS = "h-3.5 w-3.5 shrink-0"

const MESSAGES: Record<Exclude<ConnectionState, "online">, { text: string; tone: Tone; icon: ReactNode; retry: boolean; dismiss: boolean }> = {
  offline: {
    text: "You're offline",
    tone: "amber",
    icon: <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 motion-safe:animate-pulse dark:bg-amber-400" />,
    retry: true,
    dismiss: true,
  },
  reconnecting: {
    text: "Reconnecting…",
    tone: "blue",
    icon: <AqLoading01 className={cn(ICON_CLASS, "motion-safe:animate-spin")} aria-hidden="true" />,
    retry: false,
    dismiss: true,
  },
  restored: {
    text: "Back online",
    tone: "green",
    icon: <AqCheckCircle className={ICON_CLASS} aria-hidden="true" />,
    retry: false,
    dismiss: false,
  },
}

/**
 * Tells the user when the connection drops and when it comes back, as a small pill at the top.
 * The live region stays mounted so screen readers announce each change.
 */
export function NetworkStatusBanner() {
  const { state } = useNetworkStatus()
  const [dismissed, setDismissed] = useState(false)
  const [checking, setChecking] = useState(false)

  // A closed notice comes back when the state changes again
  useEffect(() => setDismissed(false), [state])

  const message = state === "online" || dismissed ? null : MESSAGES[state]
  const tone = message ? TONES[message.tone] : null
  const control = cn("rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current", tone?.strong)

  const retry = () => {
    setChecking(true)
    void checkConnectionNow().finally(() => setChecking(false))
  }

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 top-0 z-[2000] flex justify-center px-4 pt-2">
      {message && tone && (
        <div
          className={cn(
            "pointer-events-auto flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium shadow-md backdrop-blur-sm",
            tone.pill
          )}
        >
          {message.icon}
          <span>{message.text}</span>
          {message.retry && (
            <button
              type="button"
              onClick={retry}
              disabled={checking}
              className={cn("font-semibold underline-offset-2 hover:underline disabled:no-underline disabled:opacity-80", control)}
            >
              {checking ? "Checking…" : "Retry"}
            </button>
          )}
          {message.dismiss && (
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss connection notice"
              className={cn(
                "-my-1 -mr-2 inline-flex h-6 w-6 shrink-0 items-center justify-center opacity-70 hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10",
                control
              )}
            >
              <AqXClose className={ICON_CLASS} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
