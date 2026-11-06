"use client"

import { AqAlertCircle, AqRefreshCw01 } from "@airqo/icons-react"
import { Button } from "@/components/ui/button"

interface GroupLinkErrorProps {
  onRetry: () => void
  onContinue: () => void
}

/** Shown in place of a page when a `?group=` link can't be confirmed, so nothing loads under the wrong organisation. */
export function GroupLinkError({ onRetry, onContinue }: GroupLinkErrorProps) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <div role="alert" className="w-full max-w-md rounded-lg border bg-card p-6 text-center shadow-sm">
        <AqAlertCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Couldn&apos;t open this link&apos;s organisation</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Beacon couldn&apos;t check that you belong to the organisation in this link. Try again, or continue with your
          current organisation.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button onClick={onRetry}>
            <AqRefreshCw01 className="mr-2 h-4 w-4" aria-hidden="true" />
            Try again
          </Button>
          <Button variant="outline" onClick={onContinue}>
            Continue without it
          </Button>
        </div>
      </div>
    </div>
  )
}
