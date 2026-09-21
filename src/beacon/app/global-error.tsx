"use client"

import "./globals.css"
import { RouteError } from "@/components/route-error"

// Replaces the root layout when it fails, so it renders its own <html> and <body>
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <RouteError error={error} reset={reset} boundary="app/global-error" className="flex min-h-screen items-center justify-center p-4" />
      </body>
    </html>
  )
}
