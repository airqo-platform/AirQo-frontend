import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { QueryProvider } from "@/components/providers/query-provider"
import { Toaster } from "@/components/ui/toaster"
import ChunkErrorHandler from "@/components/chunk-error-handler"
import { AuthProvider } from "@/components/providers/auth-provider"
import { AnalyticsProvider } from "@/components/providers/analytics-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { getThemeScript } from "@/lib/theme-utils"
import { beaconConfig, brandTitle } from "@/beacon.config"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: brandTitle,
  description: beaconConfig.app.description,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href={beaconConfig.org.logo} />
        <script
          id="theme-script"
          dangerouslySetInnerHTML={{ __html: getThemeScript() }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <AuthProvider>
          <AnalyticsProvider />
          <ThemeProvider>
            <QueryProvider>
              <ChunkErrorHandler />
              {children}
              <Toaster />
            </QueryProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
