"use client"
import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import Script from "next/script"

declare global {
  interface Window {
    dataLayer?: Record<string, any>[]
    gtag?: (...args: any[]) => void
  }
}

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const measurementId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

  useEffect(() => {
    if (typeof window === "undefined" || !measurementId || typeof window.gtag === "undefined") {
      return
    }

    // Construct page path with query strings (if any)
    const pagePath = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname

    window.gtag("config", measurementId, {
      page_path: pagePath,
    })
  }, [measurementId, pathname, searchParams])

  if (!measurementId) {
    console.warn("Google Analytics measurement ID is not set.")
    return null
  }

  return (
    <>
      {/* Load the gtag script AFTER the page is interactive */}
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){ dataLayer.push(arguments); }
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  )
}

export function trackEvent({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label: string
  value?: number
}) {
  if (typeof window !== "undefined" && typeof window.gtag !== "undefined") {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value,
    })
  }
}
