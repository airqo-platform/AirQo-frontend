"use client"

import { useEffect, useRef } from "react"
import { AlertCircle, RefreshCw, WifiOff } from "lucide-react"
import { Button } from "../ui/button"
import { isBrowserOffline, isConnectivityError } from "./connectivity"

/*
 * Fallback for Next.js error boundaries (app/error.tsx and app/global-error.tsx).
 * Copied from beacon/components/route-error.tsx.
 *
 * The other apps' versions:
 * - Nexus app/error.tsx: the same bordered card ("Something went wrong", Try again)
 *   with the Oops icon and "Go to Home" instead of "Reload page". Its global-error.tsx
 *   repeats the card with inline styles, because the root layout's CSS is gone.
 * - Vertex app/error.tsx: a plain centred block, "Go to Login" + "Try again", no card.
 *   Its global-error.tsx is the big "Oops!" page used by its 403 screen
 *   (see ./forbidden-page).
 *
 * Changes from Beacon's file:
 * - Beacon's own offline check (lib/network-status, which pings /api/ping) is now
 *   the `offline` prop. Without it, the page falls back to navigator.onLine and the
 *   error type.
 * - The Slack alert (lib/logger sendToSlack) is now `onReport`, called when the page
 *   isn't offline.
 *
 * global-error.tsx replaces the root layout, so it still has to render <html> and
 * <body> and import the app's globals.css itself, e.g. Beacon's:
 *
 *   <html lang="en"><body className="bg-background text-foreground">
 *     <RouteError ... className="flex min-h-screen items-center justify-center p-4" />
 *   </body></html>
 */
export interface RouteErrorProps {
  error: Error & { digest?: string }
  reset: () => void
  /** Where the error was caught, passed to `onReport` (e.g. "app/error"). */
  boundary: string
  className?: string
  /** The app's own connectivity state. Defaults to navigator.onLine plus the error type. */
  offline?: boolean
  /** Send the error to the app's error reporting (Beacon: Slack). Not called while offline. */
  onReport?: (error: Error & { digest?: string }, context: { boundary: string; digest?: string }) => void
}

/** Plain-language fallback for Next.js error boundaries (error.tsx / global-error.tsx). */
export function RouteError({ error, reset, boundary, className, offline: offlineProp, onReport }: RouteErrorProps) {
  const offline = offlineProp ?? (isBrowserOffline() || isConnectivityError(error))

  // Held in a ref so an inline `onReport` doesn't send the same error again on every render
  const onReportRef = useRef(onReport)
  onReportRef.current = onReport

  useEffect(() => {
    console.error(`Uncaught error (${boundary}):`, error)
    if (!offline) {
      onReportRef.current?.(error, { boundary, digest: error.digest })
    }
  }, [error, boundary, offline])

  const Icon = offline ? WifiOff : AlertCircle

  return (
    <div className={className ?? "flex min-h-[50vh] items-center justify-center p-4"}>
      <div role="alert" className="w-full max-w-md rounded-lg border bg-card p-6 text-center shadow-sm">
        <Icon className="mx-auto mb-3 h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-lg font-semibold">
          {offline ? "You're offline" : "Something went wrong"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {offline
            ? "This page couldn't load because your connection dropped. Reconnect, then try again."
            : "This page hit an unexpected problem. Trying again usually fixes it. If it keeps happening, reload the page or contact support."}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Try again
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </div>
        {error.digest && (
          <p className="mt-4 text-xs text-muted-foreground">Error reference: {error.digest}</p>
        )}
      </div>
    </div>
  )
}

export default RouteError
