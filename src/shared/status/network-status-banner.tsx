"use client"

import { CheckCircle2, Loader2, WifiOff } from "lucide-react"
import { cn } from "../lib/utils"

/*
 * Floating notice at the top of the page when the connection drops, while it
 * reconnects, and briefly when it's back. Copied from
 * beacon/components/network-status-banner.tsx.
 *
 * All three apps show one, in three designs:
 * - Beacon: this card, amber while offline or reconnecting, green when restored.
 * - Vertex features/network-status-banner: a solid red (offline) or amber
 *   ("Connection is unstable") pill with a dismiss button, then a green "back online"
 *   pill for 5 seconds. Fixed at z-[2000], top or bottom.
 * - Nexus AppNetworkGate.tsx: a small amber "You're offline · Retry" pill at the top,
 *   plus a full-screen "We're having trouble reaching our servers" overlay when the
 *   API is down.
 *
 * Change from Beacon's file: the state came from Beacon's useNetworkStatus hook
 * (lib/network-status, which pings Beacon's /api/ping). It is now the `state` prop,
 * so each app keeps its own monitor. "Beacon can't be reached yet" now uses `appName`.
 */
export type ConnectionState = "online" | "offline" | "reconnecting" | "restored"

const messagesFor = (appName: string) => ({
  offline: {
    title: "You're offline.",
    detail: "Check your connection. Data will refresh when you're back online.",
  },
  reconnecting: {
    title: "Reconnecting…",
    detail: `Your network is back, but ${appName} can't be reached yet.`,
  },
  restored: {
    title: "Back online.",
    detail: "Refreshing data…",
  },
})

interface NetworkStatusBannerProps {
  /**
   * online: hidden. offline: the browser has no network. reconnecting: the network is
   * back but the app's server isn't answering yet. restored: show "Back online" for a
   * few seconds while data reloads.
   */
  state: ConnectionState
  /** Product name for the reconnecting message, e.g. "Beacon". */
  appName: string
}

/**
 * Tells the user when the connection drops and when it comes back.
 * The live region stays mounted so screen readers announce each change.
 */
export function NetworkStatusBanner({ state, appName }: NetworkStatusBannerProps) {
  const message = state === "online" ? null : messagesFor(appName)[state]

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

export default NetworkStatusBanner
