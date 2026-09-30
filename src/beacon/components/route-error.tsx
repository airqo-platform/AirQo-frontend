"use client"

import { useEffect } from "react"
import { AlertCircle, RefreshCw, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { sendToSlack } from "@/lib/logger"
import { isLikelyOffline } from "@/lib/network-status"
import { isConnectivityError } from "@/lib/retry"

interface RouteErrorProps {
  error: Error & { digest?: string }
  reset: () => void
  /** Where the error was caught, for the Slack alert. */
  boundary: string
  className?: string
}

/** Plain-language fallback for Next.js error boundaries (error.tsx / global-error.tsx). */
export function RouteError({ error, reset, boundary, className }: RouteErrorProps) {
  const offline = isLikelyOffline() || isConnectivityError(error)

  useEffect(() => {
    console.error(`Uncaught error (${boundary}):`, error)
    if (!offline) {
      sendToSlack("Unhandled React error", error, { errorType: boundary, digest: error.digest })
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
