"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { identifyUser, resetAnalytics, trackPageview } from "@/lib/analytics"

type SessionUser = { _id?: string; id?: string; privilege?: string }

/**
 * Sends a pageview on every route change and ties events to the signed-in user.
 * Renders nothing; does nothing when NEXT_PUBLIC_POSTHOG_KEY isn't set.
 */
export function AnalyticsProvider() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const identifiedId = useRef<string | null>(null)
  const viewedPathname = useRef<string | null>(null)

  useEffect(() => {
    if (status === "loading") return

    const user = session?.user as SessionUser | undefined
    const id = (user?._id || user?.id || "").trim()

    if (status === "authenticated" && id) {
      if (identifiedId.current !== id) {
        identifyUser({ id, role: user?.privilege })
        identifiedId.current = id
      }
      return
    }

    // Signed out in this tab (the session expired or was ended elsewhere)
    if (identifiedId.current) {
      resetAnalytics()
      identifiedId.current = null
    }
  }, [session, status])

  useEffect(() => {
    // Once per page: effects can run twice for one render (React StrictMode in development)
    if (!pathname || viewedPathname.current === pathname) return
    viewedPathname.current = pathname
    trackPageview(pathname)
  }, [pathname])

  return null
}
