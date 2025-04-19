import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import ClientLayout from "./client-layout"

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
  openGraph: {
    title: "AirQo Analytics | Air Quality Monitoring",
    description: "Africa's leading air quality monitoring network using low-cost technologies and AI.",
    type: "website",
    url: "https://airqo.net",
    images: [
      {
        url: "/images/airqo-logo.svg",
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
    images: ["/favicon.ico"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}
