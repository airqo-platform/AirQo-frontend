import type React from "react"
import { Suspense } from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import "@/styles/globals.css"
import GoogleAnalytics from "@/components/GoogleAnalytics"
import AppDataWarmup from "@/components/AppDataWarmup"

const geistSans = localFont({
  src: "../../public/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})
const geistMono = localFont({
  src: "../../public/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export const metadata: Metadata = {
  title: "AirQo AI",
  description: "AI-powered platform for air quality monitoring, forecasting, and decision support across African cities",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppDataWarmup />
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        {children}
      </body>
    </html>
  )
}
