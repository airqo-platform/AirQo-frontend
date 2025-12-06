import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { QueryProvider } from "@/components/providers/query-provider"
import { Toaster } from "@/components/ui/toaster"
import ChunkErrorHandler from "@/components/chunk-error-handler"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AirQo Dashboard",
  description: "Air quality monitoring dashboard for AirQo",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="shortcut icon" href="/icons/favicon.ico" />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <QueryProvider>
          <ChunkErrorHandler />
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  )
}

