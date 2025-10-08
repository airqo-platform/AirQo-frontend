import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import ClientLayout from "./client-layout"
import { Inter } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    template: "%s | AirQo Vertex",
    default: "AirQo Vertex",
  },
  description:
    "AirQo is Africa's leading air quality monitoring, research and analytics network. We use low cost technologies and AI to close the gaps in air quality data across the continent.",
  keywords: ["air quality", "monitoring", "Africa", "analytics", "pollution", "environment", "data", "management", "device"],
  authors: [{ name: "Vertex Team" }],
  creator: "Vertex",
  publisher: "Vertex",
  openGraph: {
    title: "AirQo Vertex",
    description: "Africa's leading air quality monitoring network using low-cost technologies and AI.",
    type: "website",
    url: "https://vertex.airqo.net",
    images: [
      {
        url: "/images/airqo-logo.svg",
        width: 1200,
        height: 630,
        alt: "Vertex",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AirQo Vertex",
    description: "Africa's leading air quality device management platform",
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
  return (
    <html lang="en" className={inter.className}>
      <ClientLayout>{children}</ClientLayout>
    </html>
  )
}
