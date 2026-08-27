import type React from "react"
import "./globals.css"
import "xterm/css/xterm.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { QueryProvider } from "@/components/providers/query-provider"
import { Toaster } from "@/components/ui/toaster"
import ChunkErrorHandler from "@/components/chunk-error-handler"
import { AuthProvider } from "@/components/providers/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { getThemeScript } from "@/lib/theme-utils"

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
        <script
          id="theme-script"
          dangerouslySetInnerHTML={{ __html: getThemeScript() }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <AuthProvider>
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
