"use client"

import type React from "react"

import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import Providers from "./providers"
import { Toaster } from "@/components/ui/sonner"
import { usePathname } from "next/navigation"
import type { Metadata } from "next"

const inter = Inter({ subsets: ["latin"] })

// Define metadata using Next.js Metadata API
export const metadata: Metadata = {
  title: {
    template: "%s | AirQo Analytics",
    default: "AirQo Analytics | Africa's Leading Air Quality Monitoring Network",
  },
  description:
    "AirQo is Africa's leading air quality monitoring, research and analytics network. We use low cost technologies and AI to close the gaps in air quality data across the continent.",
  keywords: ["air quality", "monitoring", "Africa", "analytics", "pollution", "environment", "data"],
  authors: [{ name: "AirQo Team" }],
  creator: "AirQo",
  publisher: "AirQo",
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: "AirQo Analytics | Air Quality Monitoring",
    description: "Africa's leading air quality monitoring network using low-cost technologies and AI.",
    type: "website",
    url: "https://airqo.net",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AirQo Analytics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AirQo Analytics",
    description: "Africa's leading air quality monitoring network.",
    images: ["/twitter-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isNetworkMap = pathname === "/network-map"

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(inter.className, "min-h-screen bg-background antialiased", isNetworkMap && "overflow-hidden")}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  )
}
